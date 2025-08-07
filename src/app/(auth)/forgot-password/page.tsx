import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="text-4xl mb-4">🔑</div>
        <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
        <CardDescription>
          Digite seu email para receber um link de recuperação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Lembrou da senha?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Fazer login
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