'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { CATEGORIAS_PRODUTOS } from '@/lib/constants'

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPage, setIsLoadingPage] = useState(true)

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    tempo_preparacao: '',
    imagem_url: '',
    disponivel: true
  })



  // Carregar produtos ao inicializar
  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    try {
      setIsLoadingPage(true)
      const response = await fetch('/api/produtos')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }

      const data = await response.json()
      setProdutos(data.produtos || data || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingPage(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      categoria: '',
      tempo_preparacao: '',
      imagem_url: '',
      disponivel: true
    })
    setEditingProduct(null)
  }

  const openModal = (produto?: any) => {
    if (produto) {
      setEditingProduct(produto)
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco.toString(),
        categoria: produto.categoria,
        tempo_preparacao: produto.tempo_preparacao.toString(),
        imagem_url: produto.imagem_url || '',
        disponivel: produto.disponivel
      })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validações
      if (!formData.nome.trim()) {
        toast({
          title: 'Erro',
          description: 'Nome do produto é obrigatório',
          variant: 'destructive'
        })
        return
      }

      if (!formData.preco || parseFloat(formData.preco) <= 0) {
        toast({
          title: 'Erro', 
          description: 'Preço deve ser maior que zero',
          variant: 'destructive'
        })
        return
      }

      if (!formData.categoria) {
        toast({
          title: 'Erro',
          description: 'Categoria é obrigatória',
          variant: 'destructive'
        })
        return
      }

      const produtoData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        preco: parseFloat(formData.preco),
        categoria: formData.categoria,
        tempo_preparacao: parseInt(formData.tempo_preparacao) || 30,
        imagem_url: formData.imagem_url || null,
        disponivel: formData.disponivel
      }

      if (editingProduct) {
        // Editar produto existente
        const response = await fetch(`/api/produtos/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(produtoData)
        })

        if (!response.ok) {
          throw new Error('Erro ao atualizar produto')
        }

        const produtoAtualizado = await response.json()
        
        setProdutos(produtos.map(p => 
          p.id === editingProduct.id ? produtoAtualizado : p
        ))
        
        toast({
          title: 'Sucesso',
          description: 'Produto atualizado com sucesso!'
        })
      } else {
        // Adicionar novo produto
        const response = await fetch('/api/produtos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(produtoData)
        })

        const result = await response.json()
        console.log('Debug result:', result)

        if (!response.ok) {
          console.error('Erro detalhado:', result)
          toast({
            title: 'Erro',
            description: `${result.error} - ${JSON.stringify(result.debug)}`,
            variant: 'destructive'
          })
          throw new Error(result.error)
        }

        const novoProduto = result
        setProdutos([novoProduto, ...produtos])
        
        toast({
          title: 'Sucesso',
          description: 'Produto adicionado com sucesso!'
        })
      }

      closeModal()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar produto',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDisponibilidade = async (id: string) => {
    try {
      const produto = produtos.find(p => p.id === id)
      if (!produto) return

      const response = await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disponivel: !produto.disponivel
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar disponibilidade')
      }

      const produtoAtualizado = await response.json()
      
      setProdutos(produtos.map(p => 
        p.id === id ? produtoAtualizado : p
      ))
      
      toast({
        title: 'Sucesso',
        description: `Produto ${produto.disponivel ? 'desabilitado' : 'habilitado'} com sucesso!`
      })
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao alterar disponibilidade do produto',
        variant: 'destructive'
      })
    }
  }

  const excluirProduto = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return
    }

    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir produto')
      }

      setProdutos(produtos.filter(p => p.id !== id))
      
      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso!'
      })
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao excluir produto',
        variant: 'destructive'
      })
    }
  }

  if (isLoadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-gray-600">Gerencie o cardápio da sua empresa</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={carregarProdutos}
            disabled={isLoadingPage}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Pizza Margherita"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => setFormData({...formData, categoria: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PRODUTOS.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descreva o produto..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preco">Preço (R$) *</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tempo_preparacao">Tempo de Preparo (min)</Label>
                  <Input
                    id="tempo_preparacao"
                    type="number"
                    min="1"
                    value={formData.tempo_preparacao}
                    onChange={(e) => setFormData({...formData, tempo_preparacao: e.target.value})}
                    placeholder="30"
                  />
                </div>
              </div>

              <ImageUpload
                value={formData.imagem_url}
                onChange={(value) => setFormData({...formData, imagem_url: value})}
                disabled={isLoading}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {produtos.map((produto) => (
          <Card key={produto.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                {produto.imagem_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{produto.nome}</h3>
                    <Badge variant={produto.disponivel ? 'default' : 'secondary'}>
                      {produto.disponivel ? 'Disponível' : 'Indisponível'}
                    </Badge>
                    <Badge variant="outline">{produto.categoria}</Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{produto.descricao}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Preço: <strong className="text-green-600">R$ {produto.preco.toFixed(2)}</strong></span>
                    <span>Preparo: <strong>{produto.tempo_preparacao} min</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDisponibilidade(produto.id)}
                  >
                    {produto.disponivel ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(produto)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => excluirProduto(produto.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {produtos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando produtos ao seu cardápio
            </p>
            <Button onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}