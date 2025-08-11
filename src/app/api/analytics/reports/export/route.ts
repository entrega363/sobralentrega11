import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { results, format } = await request.json()

    if (!results || !format) {
      return NextResponse.json({ error: 'Dados ou formato não especificados' }, { status: 400 })
    }

    let content: string
    let mimeType: string
    let filename: string

    switch (format) {
      case 'csv':
        content = generateReportCSV(results)
        mimeType = 'text/csv'
        filename = `relatorio-personalizado.csv`
        break
      
      case 'pdf':
        content = generateReportPDF(results)
        mimeType = 'application/pdf'
        filename = `relatorio-personalizado.pdf`
        break
      
      default:
        return NextResponse.json({ error: 'Formato não suportado' }, { status: 400 })
    }

    const response = new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

    return response
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

function generateReportCSV(results: any): string {
  const { data, config } = results
  const hasGrouping = data.length > 0 && typeof data[0] === 'object' && 'group' in data[0]
  
  let csv = `Relatório: ${config.name}\n`
  csv += `Executado em: ${new Date(results.executedAt).toLocaleString('pt-BR')}\n`
  csv += `Registros processados: ${results.recordCount}\n\n`

  if (hasGrouping) {
    // Relatório agrupado
    const metrics = config.metrics || []
    const headers = ['Grupo', ...metrics.map((m: any) => m.name)]
    csv += headers.join(',') + '\n'

    data.forEach((row: any) => {
      const values = [
        `"${row.group}"`,
        ...metrics.map((m: any) => row[m.name] || 0)
      ]
      csv += values.join(',') + '\n'
    })
  } else {
    // Relatório simples
    csv += 'Métrica,Valor\n'
    data.forEach((item: any) => {
      csv += `"${item.metric}",${item.value}\n`
    })
  }

  // Adicionar filtros aplicados
  if (config.filters && config.filters.length > 0) {
    csv += '\nFiltros Aplicados:\n'
    config.filters.forEach((filter: any) => {
      csv += `${filter.field},${filter.operator},${filter.value}\n`
    })
  }

  return csv
}

function generateReportPDF(results: any): string {
  const { data, config } = results
  const hasGrouping = data.length > 0 && typeof data[0] === 'object' && 'group' in data[0]
  
  let content = `
RELATÓRIO PERSONALIZADO
=======================

Nome: ${config.name}
${config.description ? `Descrição: ${config.description}` : ''}
Executado em: ${new Date(results.executedAt).toLocaleString('pt-BR')}
Registros processados: ${results.recordCount}
Período: ${config.dateRange}

CONFIGURAÇÃO
------------
Métricas: ${config.metrics?.map((m: any) => m.name).join(', ') || 'Nenhuma'}
${config.groupBy ? `Agrupado por: ${config.groupBy}` : ''}
${config.filters?.length > 0 ? `Filtros: ${config.filters.length} aplicados` : ''}

RESULTADOS
----------
`

  if (hasGrouping) {
    const metrics = config.metrics || []
    
    // Cabeçalho da tabela
    content += `${'Grupo'.padEnd(30)} | ${metrics.map((m: any) => m.name.padEnd(15)).join(' | ')}\n`
    content += '-'.repeat(30 + (metrics.length * 18)) + '\n'
    
    // Dados
    data.forEach((row: any) => {
      const groupName = String(row.group).padEnd(30)
      const metricValues = metrics.map((m: any) => {
        const value = row[m.name] || 0
        return String(typeof value === 'number' ? value.toFixed(2) : value).padEnd(15)
      }).join(' | ')
      
      content += `${groupName} | ${metricValues}\n`
    })
    
    // Resumo
    content += '\nRESUMO\n------\n'
    content += `Total de grupos: ${data.length}\n`
    
    metrics.forEach((metric: any) => {
      const values = data.map((d: any) => d[metric.name]).filter((v: any) => typeof v === 'number')
      if (values.length > 0) {
        const total = values.reduce((sum: number, val: number) => sum + val, 0)
        const avg = total / values.length
        content += `${metric.name} - Total: ${total.toFixed(2)}, Média: ${avg.toFixed(2)}\n`
      }
    })
  } else {
    data.forEach((item: any) => {
      content += `${item.metric}: ${item.value}\n`
    })
  }

  if (config.filters && config.filters.length > 0) {
    content += '\nFILTROS APLICADOS\n-----------------\n'
    config.filters.forEach((filter: any) => {
      content += `${filter.field} ${filter.operator} ${filter.value}\n`
    })
  }

  content += `\n---\nRelatório gerado automaticamente\n${new Date().toLocaleString('pt-BR')}`

  return content
}