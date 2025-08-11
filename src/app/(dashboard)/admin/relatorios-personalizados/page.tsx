'use client'

import { useState } from 'react'
import { CustomReportBuilder } from '@/components/analytics/custom-report-builder'
import { CustomReportResults } from '@/components/analytics/custom-report-results'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomReports } from '@/hooks/use-custom-reports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Play, Copy, Trash2, FileText } from 'lucide-react'

export default function AdminRelatoriosPersonalizadosPage() {
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
    <AdminPageLayout
      title="Relatórios Personalizados"
      description="Crie e gerencie relatórios customizados com suas métricas específicas"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Construtor</TabsTrigger>
          <TabsTrigger value="saved">
            Salvos ({savedReports.length})
          </TabsTrigger>
          <TabsTrigger value="results">
            Resultados
            {currentResults && <Badge className="ml-2" variant="secondary">1</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <CustomReportBuilder
            userType="admin"
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
                  description="Crie seu primeiro relatório personalizado usando o construtor."
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
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    {report.description && (
                      <CardDescription>{report.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <div>Criado em: {new Date(report.created_at).toLocaleDateString('pt-BR')}</div>
                      <div className="mt-2">
                        <Badge variant="outline">
                          {report.report_config.metrics?.length || 0} métricas
                        </Badge>
                        {report.report_config.filters?.length > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {report.report_config.filters.length} filtros
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleExecuteSavedReport(report)}
                        size="sm"
                        disabled={isExecuting}
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

                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver configuração
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {getReportPreview(report.report_config)}
                      </pre>
                    </details>
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
    </AdminPageLayout>
  )
}