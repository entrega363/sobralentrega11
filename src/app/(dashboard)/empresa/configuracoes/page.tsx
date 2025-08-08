'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign,
  Bell,
  Shield,
  Save
} from 'lucide-react'

export default function ConfiguracoesPage() {
  const [dadosEmpresa, setDadosEmpresa] = useState({
    nome: 'Matutaria',
    cnpj: '00.000.000/0001-00',
    categoria: 'restaurante',
    descricao: 'Restaurante especializado em comida caseira e pizzas artesanais.',
    telefone: '(85) 99999-9999',
    email: 'matutaria@gmail.com',
    endereco: {
      rua: 'Rua Principal',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Sobral',
      cep: '62000-000',
      estado: 'CE'
    }
  })

  const [horarioFuncionamento, setHorarioFuncionamento] = useState({
    segunda: { ativo: true, abertura: '08:00', fechamento: '22:00' },
    terca: { ativo: true, abertura: '08:00', fechamento: '22:00' },
    quarta: { ativo: true, abertura: '08:00', fechamento: '22:00' },
    quinta: { ativo: true, abertura: '08:00', fechamento: '22:00' },
    sexta: { ativo: true, abertura: '08:00', fechamento: '23:00' },
    sabado: { ativo: true, abertura: '08:00', fechamento: '23:00' },
    domingo: { ativo: false, abertura: '08:00', fechamento: '22:00' }
  })

  const [configuracoes, setConfiguracoes] = useState({
    taxa_entrega: 5.00,
    pedido_minimo: 20.00,
    tempo_preparo_padrao: 30,
    aceita_dinheiro: true,
    aceita_cartao: true,
    aceita_pix: true,
    notificacoes_email: true,
    notificacoes_push: true,
    empresa_ativa: true
  })

  const diasSemana = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  }

  const salvarConfiguracoes = () => {
    console.log('Salvando configurações...', {
      dadosEmpresa,
      horarioFuncionamento,
      configuracoes
    })
    // Aqui implementaria a lógica para salvar
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações da sua empresa</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
          <TabsTrigger value="horarios">Horários</TabsTrigger>
          <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>

        {/* Dados da Empresa */}
        <TabsContent value="empresa">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome da Empresa</Label>
                    <Input
                      id="nome"
                      value={dadosEmpresa.nome}
                      onChange={(e) => setDadosEmpresa({...dadosEmpresa, nome: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={dadosEmpresa.cnpj}
                      onChange={(e) => setDadosEmpresa({...dadosEmpresa, cnpj: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={dadosEmpresa.descricao}
                    onChange={(e) => setDadosEmpresa({...dadosEmpresa, descricao: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={dadosEmpresa.telefone}
                      onChange={(e) => setDadosEmpresa({...dadosEmpresa, telefone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={dadosEmpresa.email}
                      onChange={(e) => setDadosEmpresa({...dadosEmpresa, email: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="rua">Rua</Label>
                    <Input
                      id="rua"
                      value={dadosEmpresa.endereco.rua}
                      onChange={(e) => setDadosEmpresa({
                        ...dadosEmpresa, 
                        endereco: {...dadosEmpresa.endereco, rua: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={dadosEmpresa.endereco.numero}
                      onChange={(e) => setDadosEmpresa({
                        ...dadosEmpresa, 
                        endereco: {...dadosEmpresa.endereco, numero: e.target.value}
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={dadosEmpresa.endereco.bairro}
                      onChange={(e) => setDadosEmpresa({
                        ...dadosEmpresa, 
                        endereco: {...dadosEmpresa.endereco, bairro: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={dadosEmpresa.endereco.cidade}
                      onChange={(e) => setDadosEmpresa({
                        ...dadosEmpresa, 
                        endereco: {...dadosEmpresa.endereco, cidade: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={dadosEmpresa.endereco.cep}
                      onChange={(e) => setDadosEmpresa({
                        ...dadosEmpresa, 
                        endereco: {...dadosEmpresa.endereco, cep: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Horários de Funcionamento */}
        <TabsContent value="horarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(horarioFuncionamento).map(([dia, horario]) => (
                <div key={dia} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-32">
                    <span className="font-medium">{diasSemana[dia as keyof typeof diasSemana]}</span>
                  </div>
                  
                  <Switch
                    checked={horario.ativo}
                    onCheckedChange={(checked) => 
                      setHorarioFuncionamento({
                        ...horarioFuncionamento,
                        [dia]: { ...horario, ativo: checked }
                      })
                    }
                  />

                  {horario.ativo ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={horario.abertura}
                        onChange={(e) => 
                          setHorarioFuncionamento({
                            ...horarioFuncionamento,
                            [dia]: { ...horario, abertura: e.target.value }
                          })
                        }
                        className="w-32"
                      />
                      <span>às</span>
                      <Input
                        type="time"
                        value={horario.fechamento}
                        onChange={(e) => 
                          setHorarioFuncionamento({
                            ...horarioFuncionamento,
                            [dia]: { ...horario, fechamento: e.target.value }
                          })
                        }
                        className="w-32"
                      />
                    </div>
                  ) : (
                    <Badge variant="secondary">Fechado</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Pagamento */}
        <TabsContent value="pagamento">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Valores e Taxas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="taxa_entrega">Taxa de Entrega (R$)</Label>
                    <Input
                      id="taxa_entrega"
                      type="number"
                      step="0.01"
                      value={configuracoes.taxa_entrega}
                      onChange={(e) => setConfiguracoes({
                        ...configuracoes, 
                        taxa_entrega: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pedido_minimo">Pedido Mínimo (R$)</Label>
                    <Input
                      id="pedido_minimo"
                      type="number"
                      step="0.01"
                      value={configuracoes.pedido_minimo}
                      onChange={(e) => setConfiguracoes({
                        ...configuracoes, 
                        pedido_minimo: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tempo_preparo">Tempo Preparo Padrão (min)</Label>
                    <Input
                      id="tempo_preparo"
                      type="number"
                      value={configuracoes.tempo_preparo_padrao}
                      onChange={(e) => setConfiguracoes({
                        ...configuracoes, 
                        tempo_preparo_padrao: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento Aceitas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dinheiro">Dinheiro</Label>
                  <Switch
                    id="dinheiro"
                    checked={configuracoes.aceita_dinheiro}
                    onCheckedChange={(checked) => 
                      setConfiguracoes({...configuracoes, aceita_dinheiro: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cartao">Cartão</Label>
                  <Switch
                    id="cartao"
                    checked={configuracoes.aceita_cartao}
                    onCheckedChange={(checked) => 
                      setConfiguracoes({...configuracoes, aceita_cartao: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pix">PIX</Label>
                  <Switch
                    id="pix"
                    checked={configuracoes.aceita_pix}
                    onCheckedChange={(checked) => 
                      setConfiguracoes({...configuracoes, aceita_pix: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notif">Notificações por E-mail</Label>
                  <p className="text-sm text-gray-600">Receba notificações de novos pedidos por e-mail</p>
                </div>
                <Switch
                  id="email_notif"
                  checked={configuracoes.notificacoes_email}
                  onCheckedChange={(checked) => 
                    setConfiguracoes({...configuracoes, notificacoes_email: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push_notif">Notificações Push</Label>
                  <p className="text-sm text-gray-600">Receba notificações push no navegador</p>
                </div>
                <Switch
                  id="push_notif"
                  checked={configuracoes.notificacoes_push}
                  onCheckedChange={(checked) => 
                    setConfiguracoes({...configuracoes, notificacoes_push: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="empresa_ativa">Empresa Ativa</Label>
                  <p className="text-sm text-gray-600">Sua empresa está visível para clientes</p>
                </div>
                <Switch
                  id="empresa_ativa"
                  checked={configuracoes.empresa_ativa}
                  onCheckedChange={(checked) => 
                    setConfiguracoes({...configuracoes, empresa_ativa: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={salvarConfiguracoes} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}