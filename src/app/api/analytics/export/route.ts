import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { data, format, periodo, userType } = await request.json()

    if (!data || !format) {
      return NextResponse.json({ error: 'Dados ou formato não especificados' }, { status: 400 })
    }

    let content: string
    let mimeType: string
    let filename: string

    switch (format) {
      case 'csv':
        content = generateCSV(data, userType)
        mimeType = 'text/csv'
        filename = `analytics-${periodo}.csv`
        break
      
      case 'excel':
        // Para Excel, retornaríamos um buffer do arquivo
        content = generateCSV(data, userType) // Simplificado como CSV
        mimeType = 'application/vnd.ms-excel'
        filename = `analytics-${periodo}.xls`
        break
      
      case 'pdf':
        content = generatePDFContent(data, userType)
        mimeType = 'application/pdf'
        filename = `analytics-${periodo}.pdf`
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
    console.error('Erro ao exportar dados:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

function generateCSV(data: any, userType: string): string {
  const headers = getCSVHeaders(userType)
  const rows = getCSVRows(data, userType)
  
  return [headers, ...rows].join('\n')
}

function getCSVHeaders(userType: string): string {
  switch (userType) {
    case 'empresa':
      return 'Métrica,Valor,Período'
    case 'entregador':
      return 'Métrica,Valor,Período'
    case 'consumidor':
      return 'Métrica,Valor,Período'
    case 'admin':
      return 'Métrica,Valor,Período'
    default:
      return 'Métrica,Valor,Período'
  }
}

function getCSVRows(data: any, userType: string): string[] {
  const rows: string[] = []
  
  // Métricas básicas
  rows.push(`Total de Pedidos,${data.totalPedidos},Período Selecionado`)
  rows.push(`Total de Vendas,R$ ${data.totalVendas.toFixed(2)},Período Selecionado`)
  rows.push(`Ticket Médio,R$ ${data.ticketMedio.toFixed(2)},Período Selecionado`)
  rows.push(`Pedidos Hoje,${data.pedidosHoje},Hoje`)
  rows.push(`Vendas Hoje,R$ ${data.vendasHoje.toFixed(2)},Hoje`)
  
  // Métricas específicas por tipo de usuário
  if (userType === 'empresa' && data.empresaMetrics) {
    rows.push(`Avaliação Média,${data.avaliacaoMedia.toFixed(1)},Período Selecionado`)
    
    // Top produtos
    data.topProdutos.forEach((produto: any, index: number) => {
      rows.push(`Top Produto ${index + 1},${produto.nome} (${produto.vendas} vendas),Período Selecionado`)
    })
  }
  
  if (userType === 'entregador' && data.entregadorMetrics) {
    rows.push(`Entregas Realizadas,${data.entregadorMetrics.entregasRealizadas},Período Selecionado`)
    rows.push(`Tempo Médio Entrega,${data.entregadorMetrics.tempoMedioEntrega} min,Período Selecionado`)
    rows.push(`Distância Percorrida,${data.entregadorMetrics.distanciaPercorrida.toFixed(1)} km,Período Selecionado`)
    rows.push(`Avaliação Entregador,${data.entregadorMetrics.avaliacaoEntregador.toFixed(1)},Período Selecionado`)
  }
  
  if (userType === 'consumidor' && data.consumidorMetrics) {
    rows.push(`Gasto Total,R$ ${data.consumidorMetrics.gastoTotal.toFixed(2)},Período Selecionado`)
    rows.push(`Restaurante Favorito,${data.consumidorMetrics.restauranteFavorito},Período Selecionado`)
    rows.push(`Categoria Preferida,${data.consumidorMetrics.categoriaPreferida},Período Selecionado`)
    rows.push(`Economia com Promoções,R$ ${data.consumidorMetrics.economiaComPromocoes.toFixed(2)},Período Selecionado`)
  }
  
  if (userType === 'admin' && data.adminMetrics) {
    rows.push(`Usuários Ativos,${data.adminMetrics.usuariosAtivos},Período Selecionado`)
    rows.push(`Novas Empresas,${data.adminMetrics.novasEmpresas},Período Selecionado`)
    rows.push(`Novos Entregadores,${data.adminMetrics.novosEntregadores},Período Selecionado`)
    rows.push(`Taxa de Conversão,${data.adminMetrics.taxaConversao}%,Período Selecionado`)
    rows.push(`Receita da Plataforma,R$ ${data.adminMetrics.receitaPlataforma.toFixed(2)},Período Selecionado`)
  }
  
  // Vendas por dia
  if (data.vendasPorDia && data.vendasPorDia.length > 0) {
    rows.push('') // Linha em branco
    rows.push('Data,Vendas,Pedidos')
    data.vendasPorDia.forEach((item: any) => {
      const date = new Date(item.data).toLocaleDateString('pt-BR')
      rows.push(`${date},R$ ${item.valor.toFixed(2)},${item.pedidos}`)
    })
  }
  
  return rows
}

function generatePDFContent(data: any, userType: string): string {
  // Para um PDF real, usaríamos uma biblioteca como jsPDF ou Puppeteer
  // Por simplicidade, retornamos um conteúdo de texto que simula um PDF
  
  const content = `
RELATÓRIO DE ANALYTICS
======================

Período: ${new Date().toLocaleDateString('pt-BR')}
Tipo de Usuário: ${userType.toUpperCase()}

MÉTRICAS PRINCIPAIS
-------------------
Total de Pedidos: ${data.totalPedidos}
Total de Vendas: R$ ${data.totalVendas.toFixed(2)}
Ticket Médio: R$ ${data.ticketMedio.toFixed(2)}
Crescimento Mensal: ${data.crescimentoMensal}%

MÉTRICAS DIÁRIAS
----------------
Pedidos Hoje: ${data.pedidosHoje}
Vendas Hoje: R$ ${data.vendasHoje.toFixed(2)}

MÉTRICAS SEMANAIS
-----------------
Pedidos Esta Semana: ${data.pedidosSemana}
Vendas Esta Semana: R$ ${data.vendasSemana.toFixed(2)}

MÉTRICAS MENSAIS
----------------
Pedidos Este Mês: ${data.pedidosMes}
Vendas Este Mês: R$ ${data.vendasMes.toFixed(2)}

${getUserSpecificContent(data, userType)}

---
Relatório gerado automaticamente pelo sistema
Data: ${new Date().toLocaleString('pt-BR')}
`

  return content
}

function getUserSpecificContent(data: any, userType: string): string {
  switch (userType) {
    case 'empresa':
      return `
MÉTRICAS DA EMPRESA
-------------------
Avaliação Média: ${data.avaliacaoMedia?.toFixed(1) || 'N/A'}

TOP PRODUTOS
------------
${data.topProdutos?.map((p: any, i: number) => 
  `${i + 1}. ${p.nome} - ${p.vendas} vendas (R$ ${p.receita.toFixed(2)})`
).join('\n') || 'Nenhum produto encontrado'}
`

    case 'entregador':
      return `
MÉTRICAS DO ENTREGADOR
----------------------
Entregas Realizadas: ${data.entregadorMetrics?.entregasRealizadas || 0}
Tempo Médio de Entrega: ${data.entregadorMetrics?.tempoMedioEntrega || 0} min
Distância Percorrida: ${data.entregadorMetrics?.distanciaPercorrida?.toFixed(1) || 0} km
Avaliação: ${data.entregadorMetrics?.avaliacaoEntregador?.toFixed(1) || 'N/A'}
`

    case 'consumidor':
      return `
MÉTRICAS DO CONSUMIDOR
----------------------
Pedidos Realizados: ${data.consumidorMetrics?.pedidosRealizados || 0}
Gasto Total: R$ ${data.consumidorMetrics?.gastoTotal?.toFixed(2) || '0.00'}
Restaurante Favorito: ${data.consumidorMetrics?.restauranteFavorito || 'N/A'}
Categoria Preferida: ${data.consumidorMetrics?.categoriaPreferida || 'N/A'}
Economia com Promoções: R$ ${data.consumidorMetrics?.economiaComPromocoes?.toFixed(2) || '0.00'}
`

    case 'admin':
      return `
MÉTRICAS ADMINISTRATIVAS
------------------------
Usuários Ativos: ${data.adminMetrics?.usuariosAtivos || 0}
Novas Empresas: ${data.adminMetrics?.novasEmpresas || 0}
Novos Entregadores: ${data.adminMetrics?.novosEntregadores || 0}
Taxa de Conversão: ${data.adminMetrics?.taxaConversao || 0}%
Receita da Plataforma: R$ ${data.adminMetrics?.receitaPlataforma?.toFixed(2) || '0.00'}
`

    default:
      return ''
  }
}