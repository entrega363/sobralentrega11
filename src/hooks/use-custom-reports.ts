'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthSelectors } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'

export interface SavedReport {
  id: string
  name: string
  description?: string
  report_config: any
  created_at: string
  updated_at: string
}

export function useCustomReports() {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [currentResults, setCurrentResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const { user } = useAuthSelectors()
  const { toast } = useToast()

  const fetchSavedReports = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/analytics/reports')
      if (!response.ok) throw new Error('Erro ao carregar relatórios')
      
      const reports = await response.json()
      setSavedReports(reports)
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
      toast({
        title: 'Erro ao carregar relatórios',
        description: 'Não foi possível carregar seus relatórios salvos.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const saveReport = useCallback(async (reportConfig: any) => {
    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportConfig)
      })

      if (!response.ok) throw new Error('Erro ao salvar relatório')

      const savedReport = await response.json()
      setSavedReports(prev => [savedReport, ...prev])
      
      toast({
        title: 'Relatório salvo',
        description: 'Seu relatório foi salvo com sucesso.'
      })

      return savedReport
    } catch (error) {
      console.error('Erro ao salvar relatório:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o relatório.',
        variant: 'destructive'
      })
      throw error
    }
  }, [toast])

  const executeReport = useCallback(async (reportConfig: any) => {
    setIsExecuting(true)
    try {
      const response = await fetch('/api/analytics/reports/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportConfig)
      })

      if (!response.ok) throw new Error('Erro ao executar relatório')

      const results = await response.json()
      setCurrentResults(results)
      
      return results
    } catch (error) {
      console.error('Erro ao executar relatório:', error)
      toast({
        title: 'Erro ao executar relatório',
        description: 'Não foi possível executar o relatório.',
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsExecuting(false)
    }
  }, [toast])

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      const response = await fetch(`/api/analytics/reports/${reportId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir relatório')

      setSavedReports(prev => prev.filter(report => report.id !== reportId))
      
      toast({
        title: 'Relatório excluído',
        description: 'O relatório foi excluído com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao excluir relatório:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o relatório.',
        variant: 'destructive'
      })
    }
  }, [toast])

  const exportResults = useCallback(async (format: 'csv' | 'pdf') => {
    if (!currentResults) return

    try {
      const response = await fetch('/api/analytics/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          results: currentResults,
          format
        })
      })

      if (!response.ok) throw new Error('Erro ao exportar dados')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-personalizado.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Exportação concluída',
        description: 'O arquivo foi baixado com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive'
      })
    }
  }, [currentResults, toast])

  const duplicateReport = useCallback(async (report: SavedReport) => {
    const duplicatedConfig = {
      ...report.report_config,
      name: `${report.name} (Cópia)`,
      description: report.description
    }

    return await saveReport(duplicatedConfig)
  }, [saveReport])

  const getReportPreview = useCallback((reportConfig: any) => {
    const { metrics, filters, groupBy, dateRange } = reportConfig
    
    let preview = `Relatório: ${reportConfig.name || 'Sem nome'}\n`
    preview += `Período: ${dateRange}\n`
    
    if (metrics && metrics.length > 0) {
      preview += `Métricas: ${metrics.map((m: any) => m.name).join(', ')}\n`
    }
    
    if (groupBy) {
      preview += `Agrupado por: ${groupBy}\n`
    }
    
    if (filters && filters.length > 0) {
      preview += `Filtros: ${filters.length} aplicados\n`
    }
    
    return preview
  }, [])

  useEffect(() => {
    fetchSavedReports()
  }, [fetchSavedReports])

  return {
    savedReports,
    currentResults,
    isLoading,
    isExecuting,
    fetchSavedReports,
    saveReport,
    executeReport,
    deleteReport,
    exportResults,
    duplicateReport,
    getReportPreview,
    clearResults: () => setCurrentResults(null)
  }
}