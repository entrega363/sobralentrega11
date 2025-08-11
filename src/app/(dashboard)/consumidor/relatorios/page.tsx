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
import { Play, Copy, Trash2, FileText, ShoppingCart } from 'lucide-react'

export default function ConsumidorRelatoriosPage() {
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
    duplicateReport
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
          <h1 className="text-3xl font-bold">Meus Hábitos de Consumo</h1>
          <p className="text-muted-foreground">
            Analise seus pedidos e descubra padrões nos seus hábitos alimentares
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-8 w-8 text-primary" />
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
              <CardTitle>Insights sobre seus Pedidos</CardTitle>
              <CardDescription>
                Descubra padrões interessantes sobre seus hábitos alimentares:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">💰 Gastos por Período</h4>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe seus gastos mensais com delivery
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🍕 Restaurantes Favoritos</h4>
                  <p className="text-sm text-muted-foreground">
                    Veja onde você mais pede comida
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🕐 Horários de Pedido</h4>
                  <p className="text-sm text-muted-foreground">
                    Descubra seus horários preferidos para pedir
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🏷️ Categorias Preferidas</h4>
                  <p className="text-sm text-muted-foreground">
                    Analise suas preferências culinárias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <CustomReportBuilder
            userType="consumidor"
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
                  icon="📊"
                  title="Nenhum relatório salvo"
                  description="Crie relatórios para entender melhor seus hábitos de consumo."
                  action={{
                    label: "Criar Relatório",
                    onClick: () => setActiveTab('builder')
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
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