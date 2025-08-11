'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GarcomFormModal } from '@/components/empresa/garcom-form-modal'
import { useGarcons } from '@/hooks/use-garcons'
import { Plus, UserCheck, Clock, TrendingUp, Edit, Power, RefreshCw } from 'lucide-react'

interface Garcom {
  id: string
  nome: string
  usuario: string
  ativo: boolean
  ultimoLogin: string
  totalPedidosHoje: number
  vendaTotal: number
  permissoes: {
    criar_pedidos: boolean
    editar_pedidos: boolean
    cancelar_pedidos: boolean
  }
}

interface GarcomFormData {
  nome: string
  usuario: string
  senha?: string
  permissoes: {
    criar_pedidos: boolean
    editar_pedidos: boolean
    cancelar_pedidos: boolean
  }
}

export default function GarconsPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingGarcom, setEditingGarcom] = useState<Garcom | null>(null)
  
  const {
    garcons,
    loading,
    error,
    loadGarcons,
    criarGarcom,
    atualizarGarcom,
    toggleStatusGarcom,
    totalGarcons,
    garconsAtivos,
    totalPedidosHoje,
    totalVendasHoje
  } = useGarcons()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSaveGarcom = async (garcomData: GarcomFormData) => {
    let success = false
    
    if (editingGarcom) {
      // Atualizar garçom existente
      success = await atualizarGarcom(editingGarcom.id, garcomData)
      setEditingGarcom(null)
    } else {
      // Adicionar novo garçom
      success = await criarGarcom(garcomData)
    }
    
    if (success) {
      setShowModal(false)
    }
  }

  const handleEditGarcom = (garcom: Garcom | any) => {
    setEditingGarcom(garcom)
    setShowModal(true)
  }

  const handleToggleStatus = async (garcomId: string) => {
    await toggleStatusGarcom(garcomId)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingGarcom(null)
  }

  const handleRefresh = async () => {
    await loadGarcons()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Garçons</h1>
          <p className="text-gray-600">Gerencie os garçons do seu estabelecimento</p>
          {error && (
            <p className="text-red-600 text-sm mt-1">
              Erro: {error}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-sobral-red-600 hover:bg-sobral-red-700"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Garçom
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Garçons</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGarcons}</div>
            <p className="text-xs text-muted-foreground">
              {garconsAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPedidosHoje}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os garçons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalVendasHoje)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total do dia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sobral-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando garçons...</p>
          </div>
        </div>
      )}

      {/* Garçons List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garcons.map((garcom) => (
          <Card key={garcom.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{garcom.nome}</CardTitle>
                  <CardDescription>@{garcom.usuario}</CardDescription>
                </div>
                <Badge variant={garcom.ativo ? "default" : "secondary"}>
                  {garcom.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {garcom.ultimo_login && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Último login:</span>
                  <span className="font-medium">
                    {formatLastLogin(garcom.ultimo_login)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pedidos hoje:</span>
                <span className="font-medium">{garcom.totalPedidosHoje || 0}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vendas hoje:</span>
                <span className="font-medium">{formatCurrency(garcom.vendaTotal || 0)}</span>
              </div>

              {/* Permissões */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex flex-wrap gap-1">
                  {garcom.permissoes.criar_pedidos && (
                    <Badge variant="outline" className="text-xs">Criar</Badge>
                  )}
                  {garcom.permissoes.editar_pedidos && (
                    <Badge variant="outline" className="text-xs">Editar</Badge>
                  )}
                  {garcom.permissoes.cancelar_pedidos && (
                    <Badge variant="outline" className="text-xs">Cancelar</Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditGarcom(garcom)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant={garcom.ativo ? "destructive" : "default"} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleToggleStatus(garcom.id)}
                >
                  <Power className="h-3 w-3 mr-1" />
                  {garcom.ativo ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && garcons.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum garçom cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando seu primeiro garçom para gerenciar pedidos locais.
            </p>
            <Button 
              onClick={() => setShowModal(true)}
              className="bg-sobral-red-600 hover:bg-sobral-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Garçom
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Cadastro/Edição */}
      <GarcomFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        garcom={editingGarcom}
        onSave={handleSaveGarcom}
      />
    </div>
  )
}