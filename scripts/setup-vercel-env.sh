#!/bin/bash

# Script para configurar variáveis de ambiente no Vercel
# Requer Vercel CLI instalado: npm i -g vercel

echo "🚀 Configurando variáveis de ambiente no Vercel..."

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instale com: npm i -g vercel"
    exit 1
fi

# Fazer login no Vercel (se necessário)
echo "📝 Fazendo login no Vercel..."
vercel login

# Configurar variáveis de ambiente
echo "🔧 Configurando variáveis de ambiente..."

# NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://twijaxnjazanojbaegxs.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "https://twijaxnjazanojbaegxs.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "https://twijaxnjazanojbaegxs.supabase.co"

# NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aWpheG5qYXphbm9qYmFlZ3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzcwMjQsImV4cCI6MjA3MDE1MzAyNH0.SM6Xv6dX7N31pbnNUNvh_jb1ZPOJfcemEkQaQU6TLSM"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aWpheG5qYXphbm9qYmFlZ3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzcwMjQsImV4cCI6MjA3MDE1MzAyNH0.SM6Xv6dX7N31pbnNUNvh_jb1ZPOJfcemEkQaQU6TLSM"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aWpheG5qYXphbm9qYmFlZ3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzcwMjQsImV4cCI6MjA3MDE1MzAyNH0.SM6Xv6dX7N31pbnNUNvh_jb1ZPOJfcemEkQaQU6TLSM"

# SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aWpheG5qYXphbm9qYmFlZ3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU3NzAyNCwiZXhwIjoyMDcwMTUzMDI0fQ.i6nv9rHjMTdXZqCNnTkaUFW0FEewcMc6ea8HkXFEDWQ"
vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aWpheG5qYXphbm9qYmFlZ3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU3NzAyNCwiZXhwIjoyMDcwMTUzMDI0fQ.i6nv9rHjMTdXZqCNnTkaUFW0FEewcMc6ea8HkXFEDWQ"
vercel env add SUPABASE_SERVICE_ROLE_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aWpheG5qYXphbm9qYmFlZ3hzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU3NzAyNCwiZXhwIjoyMDcwMTUzMDI0fQ.i6nv9rHjMTdXZqCNnTkaUFW0FEewcMc6ea8HkXFEDWQ"

echo "✅ Variáveis de ambiente configuradas com sucesso!"

# Fazer redeploy
echo "🔄 Fazendo redeploy..."
vercel --prod

echo "🎉 Deploy concluído! Verifique o site em: https://delivery2-hidizya34-entregasobrals-projects.vercel.app"