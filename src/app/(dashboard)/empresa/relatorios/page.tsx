'use client'

import { useState } from 'react'
import { CustomReportBuilder } from '@/components/analytics/custom-report-builder'
import { CustomReportResults } from '@/components/analytics/custom-report-results'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomReports } from '@/hooks/use-custom-reports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Play, Copy, Trash2, FileText, TrendingUp } from 'lucide-react'

export default function EmpresaRelatoriosPage() {
  const [activeTab, setActiveTab] = useState('builder')
  const {
    savedReports,
    currentResults,
    isLoading,
    isExecuting,
    saveReport,
    executeReport,
    deleteReport,
    exportResults,
    duplicateReport,
    getReportPreview
  } = useCustomReports()

  const handleSaveReport = async (reportConfig: any) => {
    await saveReport(reportConfig)
    setActiveTab('saved')
  }

  const handleRunReport = async (reportConfig: any) => {
    await executeReport(reportConfig)
    setActiveTab('results')
  }

  const handleExecuteSavedReport = async (report: any) => {
    await executeReport(report.report_config)
    setActiveTab('results')
  }

  const handleRefreshResults = () => {
    if (currentResults?.config) {
      executeReport(currentResults.config)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Personalizados</h1>
          <p className="text-muted-foreground">
            Crie relatórios customizados para analisar o desempenho do seu negócio
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">
            <FileText className="h-4 w-4 mr-2" />
            Construtor
          </TabsTrigger>
          <TabsTrigger value="saved">
            Salvos ({savedReports.length})
          </TabsTrigger>
          <TabsTrigger value="results">
            Resultados
            {currentResults && <Badge className="ml-2" variant="secondary">1</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dicas para Empresas</CardTitle>
              <CardDescription>
                Algumas sugestões de relatórios úteis para seu negócio:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📊 Vendas por Categoria</h4>
                  <p className="text-sm text-muted-foreground">
                    Analise quais categorias de produtos vendem mais
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">⏰ Horários de Pico</h4>
                  <p className="text-sm text-muted-foreground">
                    Identifique os melhores horários para seu negócio
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">⭐ Performance por Avaliação</h4>
                  <p className="text-sm text-muted-foreground">
                    Correlacione vendas com suas avaliações
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📈 Crescimento Mensal</h4>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe a evolução das suas vendas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <CustomReportBuilder
            userType="empresa"
            onSave={handleSaveReport}
            onRun={handleRunReport}
          />
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </CardContent>
            </Card>
          ) : savedReports.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  title="Nenhum relatório salvo"
                  description="Crie seu primeiro relatório personalizado para analisar seu negócio."
                  action={
                    <Button onClick={() => setActiveTab('builder')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Criar Primeiro Relatório
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      {report.name}
                    </CardTitle>
                    {report.description && (
                      <CardDescription>{report.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <div>Criado: {new Date(report.created_at).toLocaleDateString('pt-BR')}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {report.report_config.metrics?.length || 0} métricas
                        </Badge>
                        {report.report_config.filters?.length > 0 && (
                          <Badge variant="outline">
                            {report.report_config.filters.length} filtros
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {report.report_config.dateRange}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleExecuteSavedReport(report)}
                        size="sm"
                        disabled={isExecuting}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Executar
                      </Button>
                      
                      <Button
                        onClick={() => duplicateReport(report)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={() => deleteReport(report.id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <CustomReportResults
            results={currentResults}
            isLoading={isExecuting}
            onRefresh={handleRefreshResults}
            onExport={exportResults}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}