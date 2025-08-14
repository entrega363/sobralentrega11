'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TesteLogin() {
  const [resultado, setResultado] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const testarConexao = async () => {
    setLoading(true);
    setResultado('Testando conexão...');
    
    try {
      // Testar conexão básica
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        setResultado(`❌ Erro de conexão: ${error.message}`);
        return;
      }
      
      setResultado('✅ Conexão com Supabase funcionando!');
    } catch (error) {
      setResultado(`❌ Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testarLogin = async () => {
    setLoading(true);
    setResultado('Testando login...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'matutaria@gmail.com',
        password: '123456'
      });
      
      if (error) {
        setResultado(`❌ Erro de login: ${error.message}`);
        return;
      }
      
      if (data.user) {
        setResultado(`✅ Login realizado com sucesso! 
        User ID: ${data.user.id}
        Email: ${data.user.email}
        Role: ${data.user.user_metadata?.role || 'não definido'}`);
      }
    } catch (error) {
      setResultado(`❌ Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const verificarUsuario = async () => {
    setLoading(true);
    setResultado('Verificando usuário...');
    
    try {
      // Verificar se usuário existe
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          empresas (
            id,
            nome,
            status
          )
        `)
        .limit(10);
      
      if (error) {
        setResultado(`❌ Erro ao verificar: ${error.message}`);
        return;
      }
      
      setResultado(`✅ Dados encontrados: ${JSON.stringify(users, null, 2)}`);
    } catch (error) {
      setResultado(`❌ Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const criarUsuarioTeste = async () => {
    setLoading(true);
    setResultado('Criando usuário de teste...');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'matutaria@gmail.com',
        password: '123456',
        options: {
          data: {
            role: 'empresa'
          }
        }
      });
      
      if (error) {
        setResultado(`❌ Erro ao criar usuário: ${error.message}`);
        return;
      }
      
      setResultado(`✅ Usuário criado: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResultado(`❌ Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Teste de Login - Matutaria</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Informações de Login</h2>
          <div className="bg-blue-50 p-4 rounded">
            <p><strong>Email:</strong> matutaria@gmail.com</p>
            <p><strong>Senha:</strong> 123456</p>
            <p><strong>Role:</strong> empresa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={testarConexao}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : '🔗 Testar Conexão'}
          </button>

          <button
            onClick={verificarUsuario}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : '👤 Verificar Usuários'}
          </button>

          <button
            onClick={testarLogin}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : '🔐 Testar Login'}
          </button>

          <button
            onClick={criarUsuarioTeste}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Criando...' : '➕ Criar Usuário'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">📋 Resultado dos Testes</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
            {resultado || 'Clique em um botão acima para testar...'}
          </pre>
        </div>

        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📝 Instruções:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Primeiro, execute o script <code>CORRIGIR_LOGIN_DEFINITIVO.sql</code> no Supabase</li>
            <li>Depois, teste a conexão clicando em "Testar Conexão"</li>
            <li>Verifique se existem usuários clicando em "Verificar Usuários"</li>
            <li>Teste o login com as credenciais acima</li>
            <li>Se não funcionar, crie um novo usuário clicando em "Criar Usuário"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}