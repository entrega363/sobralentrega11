'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ShoppingCart, Plus, Minus, Search, Filter, User, MapPin, MessageSquare } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  categoria: string
  disponivel: boolean
  imagem_url?: string
  tempo_preparo?: number
}

interface ItemCarrinho {
  produto: Produto
  quantidade: number
  observacoes?: string
}

interface NovoPedidoLocalProps {
  isOpen: boolean
  onClose: () => void
  onPedidoCriado: (pedido: any) => void
}

export function NovoPedidoLocal({ isOpen, onClose, onPedidoCriado }: NovoPedidoLocalProps) {
  const { toast } = useToast()
  
  // Estados
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtosPorCategoria, setProdutosPorCategoria] = useState<{ [key: string]: Produto[] }>({})
  const [categorias, setCategorias] = useState<string[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')
  
  // Dados do pedido
  const [mesa, setMesa] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [observacoesGarcom, setObservacoesGarcom] = useState('')
  
  // Estados de UI
  const [step, setStep] = useState<'produtos' | 'carrinho' | 'finalizar'>('produtos')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carregar produtos ao abrir modal
  useEffect(() => {
    if (isOpen) {
      carregarProdutos()
    }
  }, [isOpen])

  const carregarProdutos = async () => {
    try {
      setLoadingProdutos(true)
      
      const token = localStorage.getItem('garcom_token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch('/api/comanda/produtos?disponivel=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }

      const data = await response.json()
      setProdutos(data.produtos || [])
      setProdutosPorCategoria(data.produtosPorCategoria || {})
      setCategorias(Object.keys(data.produtosPorCategoria || {}))

    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos',
        variant: 'destructive'
      })
    } finally {
      setLoadingProdutos(false)
    }
  }

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const matchSearch = !searchTerm || 
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchCategoria = !categoriaFiltro || produto.categoria === categoriaFiltro
    
    return matchSearch && matchCategoria && produto.disponivel
  })

  // Funções do carrinho
  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho(prev => {
      const itemExistente = prev.find(item => item.produto.id === produto.id)
      
      if (itemExistente) {
        return prev.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      } else {
        return [...prev, { produto, quantidade: 1 }]
      }
    })
  }

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(prev => {
      const item = prev.find(item => item.produto.id === produtoId)
      if (!item) return prev
      
      if (item.quantidade > 1) {
        return prev.map(item =>
          item.produto.id === produtoId
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
      } else {
        return prev.filter(item => item.produto.id !== produtoId)
      }
    })
  }

  const atualizarObservacoes = (produtoId: string, observacoes: string) => {
    setCarrinho(prev =>
      prev.map(item =>
        item.produto.id === produtoId
          ? { ...item, observacoes }
          : item
      )
    )
  }

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0)
  }

  const validarPedido = () => {
    const newErrors: Record<string, string> = {}

    if (!mesa.trim()) {
      newErrors.mesa = 'Número da mesa é obrigatório'
    }

    if (carrinho.length === 0) {
      newErrors.carrinho = 'Adicione pelo menos um produto ao pedido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const finalizarPedido = async () => {
    if (!validarPedido()) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('garcom_token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const dadosPedido = {
        produtos: carrinho.map(item => ({
          produto_id: item.produto.id,
          quantidade: item.quantidade,
          observacoes: item.observacoes
        })),
        mesa: mesa.trim(),
        cliente_nome: clienteNome.trim() || undefined,
        observacoes_garcom: observacoesGarcom.trim() || undefined
      }

      const response = await fetch('/api/comanda/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosPedido)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar pedido')
      }

      const data = await response.json()

      toast({
        title: 'Pedido criado com sucesso!',
        description: `Pedido ${data.pedido.numero} para mesa ${mesa}`,
      })

      onPedidoCriado(data.pedido)
      handleClose()

    } catch (error: any) {
      console.error('Erro ao criar pedido:', error)
      toast({
        title: 'Erro ao criar pedido',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset estados
    setStep('produtos')
    setCarrinho([])
    setMesa('')
    setClienteNome('')
    setObservacoesGarcom('')
    setSearchTerm('')
    setCategoriaFiltro('')
    setErrors({})
  }

  const renderStepProdutos = () => (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Todas categorias</option>
          {categorias.map(categoria => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>
      </div>

      {/* Lista de produtos */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {loadingProdutos ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sobral-red-600 mx-auto" />
            <p className="mt-2 text-gray-500">Carregando produtos...</p>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        ) : (
          produtosFiltrados.map(produto => {
            const itemCarrinho = carrinho.find(item => item.produto.id === produto.id)
            const quantidade = itemCarrinho?.quantidade || 0

            return (
              <Card key={produto.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{produto.nome}</h4>
                    {produto.descricao && (
                      <p className="text-sm text-gray-500">{produto.descricao}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sobral-red-600">
                        R$ {produto.preco.toFixed(2)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {produto.categoria}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {quantidade > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removerDoCarrinho(produto.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {quantidade > 0 && (
                      <span className="w-8 text-center font-medium">{quantidade}</span>
                    )}
                    
                    <Button
                      size="sm"
                      onClick={() => adicionarAoCarrinho(produto)}
                      className="bg-sobral-red-600 hover:bg-sobral-red-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {errors.carrinho && (
        <p className="text-sm text-red-500">{errors.carrinho}</p>
      )}
    </div>
  )

  const renderStepCarrinho = () => (
    <div className="space-y-4">
      <div className="max-h-64 overflow-y-auto space-y-3">
        {carrinho.map(item => (
          <Card key={item.produto.id} className="p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{item.produto.nome}</h4>
                  <p className="text-sm text-gray-500">
                    R$ {item.produto.preco.toFixed(2)} x {item.quantidade} = 
                    R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removerDoCarrinho(item.produto.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantidade}</span>
                  <Button
                    size="sm"
                    onClick={() => adicionarAoCarrinho(item.produto)}
                    className="bg-sobral-red-600 hover:bg-sobral-red-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Textarea
                placeholder="Observações para este item..."
                value={item.observacoes || ''}
                onChange={(e) => atualizarObservacoes(item.produto.id, e.target.value)}
                className="text-sm"
                rows={2}
              />
            </div>
          </Card>
        ))}
      </div>
      
      <div className="border-t pt-3">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total:</span>
          <span className="text-sobral-red-600">R$ {calcularTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  )

  const renderStepFinalizar = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="mesa" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Mesa *
          </Label>
          <Input
            id="mesa"
            placeholder="Ex: 15"
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
            className={errors.mesa ? 'border-red-500' : ''}
          />
          {errors.mesa && (
            <p className="text-sm text-red-500">{errors.mesa}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome do cliente (opcional)
          </Label>
          <Input
            id="cliente"
            placeholder="Ex: João Silva"
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Observações do garçom (opcional)
          </Label>
          <Textarea
            id="observacoes"
            placeholder="Observações gerais do pedido..."
            value={observacoesGarcom}
            onChange={(e) => setObservacoesGarcom(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Itens:</span>
            <span>{carrinho.length}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-sobral-red-600">R$ {calcularTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Novo Pedido Local
          </DialogTitle>
          <DialogDescription>
            {step === 'produtos' && 'Selecione os produtos para o pedido'}
            {step === 'carrinho' && 'Revise os itens e adicione observações'}
            {step === 'finalizar' && 'Finalize o pedido com os dados da mesa'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'produtos' && renderStepProdutos()}
          {step === 'carrinho' && renderStepCarrinho()}
          {step === 'finalizar' && renderStepFinalizar()}
        </div>

        <DialogFooter className="gap-2">
          {step === 'produtos' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => setStep('carrinho')}
                disabled={carrinho.length === 0}
                className="bg-sobral-red-600 hover:bg-sobral-red-700"
              >
                Revisar Carrinho ({carrinho.length})
              </Button>
            </>
          )}
          
          {step === 'carrinho' && (
            <>
              <Button variant="outline" onClick={() => setStep('produtos')}>
                Voltar
              </Button>
              <Button
                onClick={() => setStep('finalizar')}
                className="bg-sobral-red-600 hover:bg-sobral-red-700"
              >
                Finalizar Pedido
              </Button>
            </>
          )}
          
          {step === 'finalizar' && (
            <>
              <Button variant="outline" onClick={() => setStep('carrinho')}>
                Voltar
              </Button>
              <Button
                onClick={finalizarPedido}
                disabled={loading}
                className="bg-sobral-red-600 hover:bg-sobral-red-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Criando...
                  </>
                ) : (
                  `Criar Pedido - R$ ${calcularTotal().toFixed(2)}`
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}