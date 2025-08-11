'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, User, Lock, Settings } from 'lucide-react'

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

interface Garcom {
  id: string
  nome: string
  usuario: string
  ativo: boolean
  permissoes: {
    criar_pedidos: boolean
    editar_pedidos: boolean
    cancelar_pedidos: boolean
  }
}

interface GarcomFormModalProps {
  isOpen: boolean
  onClose: () => void
  garcom?: Garcom | null
  onSave: (garcom: GarcomFormData) => void
}

export function GarcomFormModal({ isOpen, onClose, garcom, onSave }: GarcomFormModalProps) {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<GarcomFormData>({
    nome: garcom?.nome || '',
    usuario: garcom?.usuario || '',
    senha: '',
    permissoes: {
      criar_pedidos: garcom?.permissoes?.criar_pedidos ?? true,
      editar_pedidos: garcom?.permissoes?.editar_pedidos ?? true,
      cancelar_pedidos: garcom?.permissoes?.cancelar_pedidos ?? false
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Validar usuário
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'Usuário é obrigatório'
    } else if (formData.usuario.trim().length < 3) {
      newErrors.usuario = 'Usuário deve ter pelo menos 3 caracteres'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.usuario)) {
      newErrors.usuario = 'Usuário deve conter apenas letras, números e underscore'
    }

    // Validar senha (obrigatória apenas para novo garçom)
    if (!garcom && !formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres'
    } else if (formData.senha && !/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.senha)) {
      newErrors.senha = 'Senha deve conter pelo menos uma letra e um número'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSave(formData)
      
      toast({
        title: garcom ? 'Garçom atualizado' : 'Garçom cadastrado',
        description: garcom 
          ? `${formData.nome} foi atualizado com sucesso.`
          : `${formData.nome} foi cadastrado com sucesso.`,
      })
      
      onClose()
      
      // Reset form
      setFormData({
        nome: '',
        usuario: '',
        senha: '',
        permissoes: {
          criar_pedidos: true,
          editar_pedidos: true,
          cancelar_pedidos: false
        }
      })
      setErrors({})
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o garçom. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setErrors({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {garcom ? 'Editar Garçom' : 'Adicionar Garçom'}
          </DialogTitle>
          <DialogDescription>
            {garcom 
              ? 'Atualize as informações do garçom.'
              : 'Preencha os dados para cadastrar um novo garçom.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Ex: Maria Silva"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className={errors.nome ? 'border-red-500' : ''}
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome}</p>
            )}
          </div>

          {/* Usuário */}
          <div className="space-y-2">
            <Label htmlFor="usuario">Nome de usuário</Label>
            <Input
              id="usuario"
              type="text"
              placeholder="Ex: maria.silva"
              value={formData.usuario}
              onChange={(e) => setFormData(prev => ({ ...prev, usuario: e.target.value.toLowerCase() }))}
              className={errors.usuario ? 'border-red-500' : ''}
            />
            {errors.usuario && (
              <p className="text-sm text-red-500">{errors.usuario}</p>
            )}
            <p className="text-xs text-gray-500">
              Apenas letras, números e underscore. Será usado para login.
            </p>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="senha">
              {garcom ? 'Nova senha (deixe vazio para manter atual)' : 'Senha'}
            </Label>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={formData.senha}
                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                className={errors.senha ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.senha && (
              <p className="text-sm text-red-500">{errors.senha}</p>
            )}
            <p className="text-xs text-gray-500">
              Deve conter pelo menos uma letra e um número.
            </p>
          </div>

          {/* Permissões */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label className="text-sm font-medium">Permissões</Label>
            </div>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Criar pedidos</Label>
                  <p className="text-xs text-gray-500">
                    Permite criar novos pedidos no sistema
                  </p>
                </div>
                <Switch
                  checked={formData.permissoes.criar_pedidos}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      permissoes: { ...prev.permissoes, criar_pedidos: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Editar pedidos</Label>
                  <p className="text-xs text-gray-500">
                    Permite modificar pedidos existentes
                  </p>
                </div>
                <Switch
                  checked={formData.permissoes.editar_pedidos}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      permissoes: { ...prev.permissoes, editar_pedidos: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Cancelar pedidos</Label>
                  <p className="text-xs text-gray-500">
                    Permite cancelar pedidos (requer mais cuidado)
                  </p>
                </div>
                <Switch
                  checked={formData.permissoes.cancelar_pedidos}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      permissoes: { ...prev.permissoes, cancelar_pedidos: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-sobral-red-600 hover:bg-sobral-red-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                garcom ? 'Atualizar' : 'Cadastrar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}