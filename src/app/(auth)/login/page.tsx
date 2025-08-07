import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="text-4xl mb-4">🍕</div>
        <CardTitle className="text-2xl">Entrar no Sistema</CardTitle>
        <CardDescription>
          Faça login para acessar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Esqueceu sua senha?
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