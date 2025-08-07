import { RegisterForm } from '@/components/auth/register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="text-4xl mb-4">🍕</div>
        <CardTitle className="text-2xl">Criar Conta</CardTitle>
        <CardDescription>
          Escolha o tipo de conta que deseja criar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              ← Voltar ao início
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}