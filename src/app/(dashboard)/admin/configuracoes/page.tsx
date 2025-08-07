'use client'

import { useState, useEffect } from 'react'
import { AdminPageLayout } from '@/components/admin/admin-page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Save, Settings } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ConfiguracaoSistema {
  taxaEntregaPadrao: number
  comissaoEmpresa: number
  comissaoEntregador: number
  tempoMaximoEntrega: number
  notificacoesEmail: boolean
  notificacoesSMS: boolean
  manutencaoAtiva: boolean
  horarioFuncionamento: {
    inicio: string
    fim: string
  }
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfiguracaoSistema | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Mock data
  useEffect(() => {
    const mockConfig: ConfiguracaoSistema = {
      taxaEntregaPadrao: 5.00,
      comissaoEmpresa: 15.0,
      comissaoEntregador: 10.0,
      tempoMaximoEntrega: 60,
      notificacoesEmail: true,
      notificacoesSMS: false,
      manutencaoAtiva: false,
      horarioFuncionamento: {
        inicio: '08:00',
        fim: '23:00'
      }
    }

    setTimeout(() => {
      setConfig(mockConfig)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSave = async () => {
    if (!config) return

    setSaving(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Configurações salvas',
        description: 'As configurações do sistema foram atualizadas com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (key: keyof ConfiguracaoSistema, value: any) => {
    if (!config) return
    setConfig({ ...config, [key]: value })
  }

  const updateHorario = (tipo: 'inicio' | 'fim', value: string) => {
    if (!config) return
    setConfig({
      ...config,
      horarioFuncionamento: {
        ...config.horarioFuncionamento,
        [tipo]: value
      }
    })
  }

  const actions = (
    <Button onClick={handleSave} disabled={saving || !config}>
      {saving ? (
        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Save className="h-4 w-4 mr-2" />
      )}
      Salvar Configurações
    </Button>
  )

  if (loading || !config) {
    return (
      <AdminPageLayout
        title="Configurações do Sistema"
        description="Gerencie configurações globais do sistema"
        actions={actions}
      >
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout
      title="Configurações do Sistema"
      description="Gerencie configurações globais do sistema"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Configurações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configurações Financeiras</span>
            </CardTitle>
            <CardDescription>
              Configure taxas e comissões do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="taxaEntrega">Taxa de Entrega Padrão (R$)</Label>
                <Input
                  id="taxaEntrega"
                  type="number"
                  step="0.01"
                  value={config.taxaEntregaPadrao}
                  onChange={(e) => updateConfig('taxaEntregaPadrao', parseFloat(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Taxa padrão cobrada para entregas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempoMaximo">Tempo Máximo de Entrega (min)</Label>
                <Input
                  id="tempoMaximo"
                  type="number"
                  value={config.tempoMaximoEntrega}
                  onChange={(e) => updateConfig('tempoMaximoEntrega', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Tempo máximo estimado para entregas
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="comissaoEmpresa">Comissão da Empresa (%)</Label>
                <Input
                  id="comissaoEmpresa"
                  type="number"
                  step="0.1"
                  value={config.comissaoEmpresa}
                  onChange={(e) => updateConfig('comissaoEmpresa', parseFloat(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Percentual cobrado das empresas por pedido
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comissaoEntregador">Comissão do Entregador (%)</Label>
                <Input
                  id="comissaoEntregador"
                  type="number"
                  step="0.1"
                  value={config.comissaoEntregador}
                  onChange={(e) => updateConfig('comissaoEntregador', parseFloat(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Percentual pago aos entregadores por entrega
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle>Horário de Funcionamento</CardTitle>
            <CardDescription>
              Configure o horário de funcionamento do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="horarioInicio">Horário de Início</Label>
                <Input
                  id="horarioInicio"
                  type="time"
                  value={config.horarioFuncionamento.inicio}
                  onChange={(e) => updateHorario('inicio', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horarioFim">Horário de Término</Label>
                <Input
                  id="horarioFim"
                  type="time"
                  value={config.horarioFuncionamento.fim}
                  onChange={(e) => updateHorario('fim', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configure as notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-sm text-gray-500">
                  Enviar notificações importantes por email
                </p>
              </div>
              <Switch
                checked={config.notificacoesEmail}
                onCheckedChange={(checked) => updateConfig('notificacoesEmail', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por SMS</Label>
                <p className="text-sm text-gray-500">
                  Enviar notificações urgentes por SMS
                </p>
              </div>
              <Switch
                checked={config.notificacoesSMS}
                onCheckedChange={(checked) => updateConfig('notificacoesSMS', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Sistema</CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Manutenção</Label>
                <p className="text-sm text-gray-500">
                  Ativar modo manutenção para bloquear novos pedidos
                </p>
              </div>
              <Switch
                checked={config.manutencaoAtiva}
                onCheckedChange={(checked) => updateConfig('manutencaoAtiva', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  )
}