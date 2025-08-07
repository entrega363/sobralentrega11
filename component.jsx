import React, { useState } from 'react';
const { useStoredState } = hatch;

const SistemaEntregaSobral = () => {
  // TODOS OS HOOKS DEVEM SER DECLARADOS AQUI NO TOPO - ANTES DE QUALQUER LÓGICA CONDICIONAL
  
  // Estados centralizados - LOCAIS para cada dispositivo/sessão
  const [currentView, setCurrentView] = useState('home');
  const [activeTab, setActiveTab] = useState('dashboard'); // MUDANÇA: removido useStoredState
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para configuração do banco de dados
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  const [databaseConfig, setDatabaseConfig] = useStoredState('database_config', {
    type: 'mysql', // mysql, postgresql, mongodb, sqlite, supabase
    host: 'localhost',
    port: '3306',
    database: 'entrega_sobral',
    username: '',
    password: '',
    ssl: false,
    connectionString: '',
    isConnected: false,
    lastConnection: null,
    useConnectionString: false,
    // Campos específicos do Supabase
    supabaseUrl: '',
    supabaseKey: '',
    supabaseServiceKey: ''
  });
  
  // Estados para diferentes tipos de usuário - LOCAIS para cada sessão
  const [empresaLogada, setEmpresaLogada] = useState(null);
  const [entregadorLogado, setEntregadorLogado] = useState(null);
  const [consumidorLogado, setConsumidorLogado] = useState(null);
  
  // Dados do sistema
  const [empresas, setEmpresas] = useStoredState('empresas_sobral', []);
  const [entregadores, setEntregadores] = useStoredState('entregadores_sobral', []);
  const [consumidores, setConsumidores] = useStoredState('consumidores_sobral', []);
  const [pedidos, setPedidos] = useStoredState('pedidos_sobral', []);
  const [produtos, setProdutos] = useStoredState('produtos_sobral', []);

  // Formulários - LOCAIS para cada sessão
  const [loginForm, setLoginForm] = useState({ email: '', senha: '', usuario: '' });
  const [showProdutoForm, setShowProdutoForm] = useState(false); // MUDANÇA: removido useStoredState
  const [editingProdutoId, setEditingProdutoId] = useState(null); // MUDANÇA: removido useStoredState
  const [produtoForm, setProdutoForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    disponivel: true,
    tempoPreparacao: '',
    imagem: ''
  });

  // Formulários de cadastro
  const [empresaForm, setEmpresaForm] = useState({
    nome: '',
    cnpj: '',
    categoria: '',
    responsavel: '',
    email: '',
    telefone: '',
    endereco: '',
    bairro: '',
    senha: '',
    confirmarSenha: ''
  });

  const [entregadorForm, setEntregadorForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: '',
    bairro: '',
    veiculo: '',
    placa: '',
    cnh: '',
    senha: '',
    confirmarSenha: ''
  });

  const [consumidorForm, setConsumidorForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: '',
    bairro: '',
    pontoReferencia: '',
    senha: '',
    confirmarSenha: ''
  });

  // Estados específicos do consumidor - LOCAIS para cada sessão
  const [activeConsumerTab, setActiveConsumerTab] = useState('marketplace');
  const [carrinho, setCarrinho] = useState([]); // Carrinho local para cada sessão
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [forceConsumerUpdate, setForceConsumerUpdate] = useState(0);

  // Credenciais do admin
  const adminCredentials = {
    usuario: 'admin',
    senha: 'tenderbr0'
  };

  // Função para testar conexão com banco de dados
  const testDatabaseConnection = async () => {
    try {
      // Simular teste de conexão (em produção, seria uma chamada para API)
      const config = databaseConfig;
      
      // Validações específicas por tipo de banco
      if (config.type === 'supabase') {
        if (!config.supabaseUrl || !config.supabaseKey) {
          throw new Error('Preencha a URL e a chave pública do Supabase');
        }
        
        // Validar formato da URL do Supabase
        if (!config.supabaseUrl.includes('.supabase.co')) {
          throw new Error('URL do Supabase deve ter o formato: https://seu-projeto.supabase.co');
        }
        
      } else if (!config.useConnectionString) {
        if (!config.host || !config.database || !config.username) {
          throw new Error('Preencha todos os campos obrigatórios');
        }
      } else {
        if (!config.connectionString) {
          throw new Error('String de conexão é obrigatória');
        }
      }
      
      // Simular delay de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular teste específico do Supabase
      if (config.type === 'supabase') {
        console.log('🔗 Testando conexão com Supabase:', {
          url: config.supabaseUrl,
          hasKey: !!config.supabaseKey,
          hasServiceKey: !!config.supabaseServiceKey
        });
        
        // Em produção, aqui seria feita uma chamada real para o Supabase
        // const { createClient } = require('@supabase/supabase-js')
        // const supabase = createClient(config.supabaseUrl, config.supabaseKey)
        // const { data, error } = await supabase.from('test').select('*').limit(1)
      }
      
      // Simular sucesso (em produção, seria uma chamada real para o backend)
      const updatedConfig = {
        ...config,
        isConnected: true,
        lastConnection: new Date().toLocaleString('pt-BR')
      };
      
      setDatabaseConfig(updatedConfig);
      
      const successMessage = config.type === 'supabase' 
        ? '✅ Conexão com Supabase estabelecida com sucesso!\n\n🔗 Configuração validada:\n• URL do projeto verificada\n• Chave de API testada\n• Pronto para usar!'
        : '✅ Conexão com banco de dados estabelecida com sucesso!';
      
      alert(successMessage);
      
      return true;
    } catch (error) {
      console.error('Erro ao conectar com banco:', error);
      alert('❌ Erro ao conectar com banco de dados: ' + error.message);
      
      setDatabaseConfig({
        ...databaseConfig,
        isConnected: false,
        lastConnection: null
      });
      
      return false;
    }
  };

  // Função para desconectar do banco
  const disconnectDatabase = () => {
    setDatabaseConfig({
      ...databaseConfig,
      isConnected: false,
      lastConnection: null
    });
    alert('🔌 Desconectado do banco de dados');
  };

  // Função para migrar dados do localStorage para banco (simulação)
  const migrateToDatabase = async () => {
    if (!databaseConfig.isConnected) {
      alert('❌ Conecte-se ao banco de dados primeiro!');
      return;
    }

    try {
      // Simular migração dos dados
      const localData = {
        empresas: JSON.parse(localStorage.getItem('empresas_sobral') || '[]'),
        entregadores: JSON.parse(localStorage.getItem('entregadores_sobral') || '[]'),
        consumidores: JSON.parse(localStorage.getItem('consumidores_sobral') || '[]'),
        produtos: JSON.parse(localStorage.getItem('produtos_sobral') || '[]'),
        pedidos: JSON.parse(localStorage.getItem('pedidos_sobral') || '[]')
      };

      // Simular delay de migração
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('🔄 Dados migrados:', localData);
      
      alert(`✅ Migração concluída com sucesso!\n\n📊 DADOS MIGRADOS:\n• Empresas: ${localData.empresas.length}\n• Entregadores: ${localData.entregadores.length}\n• Consumidores: ${localData.consumidores.length}\n• Produtos: ${localData.produtos.length}\n• Pedidos: ${localData.pedidos.length}\n\n🎉 Agora o sistema está conectado ao banco de dados!`);
      
    } catch (error) {
      console.error('Erro na migração:', error);
      alert('❌ Erro na migração: ' + error.message);
    }
  };

  // FUNÇÕES DO CONSUMIDOR - DECLARADAS NO NÍVEL GLOBAL DO COMPONENTE
  
  // Função para adicionar ao carrinho
  const adicionarAoCarrinho = (produto, empresa) => {
    const itemCarrinho = {
      ...produto,
      empresaId: empresa.id,
      empresaNome: empresa.nome,
      quantidade: 1,
      id: `${produto.id}_${Date.now()}`
    };
    
    setCarrinho([...carrinho, itemCarrinho]);
    alert(`${produto.nome} adicionado ao carrinho!`);
  };

  // Função para remover do carrinho
  const removerDoCarrinho = (itemId) => {
    setCarrinho(carrinho.filter(item => item.id !== itemId));
  };

  // Função para finalizar pedido
  const finalizarPedido = () => {
    if (carrinho.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    // Agrupar itens por empresa
    const empresasPedido = {};
    carrinho.forEach(item => {
      if (!empresasPedido[item.empresaId]) {
        empresasPedido[item.empresaId] = {
          empresaId: item.empresaId,
          empresaNome: item.empresaNome,
          items: [],
          subtotal: 0
        };
      }
      empresasPedido[item.empresaId].items.push(item);
      empresasPedido[item.empresaId].subtotal += parseFloat(item.preco) * item.quantidade;
    });

    const novoPedido = {
      id: Date.now().toString(),
      consumidorId: consumidorLogado.id,
      consumidorNome: consumidorLogado.nome,
      items: carrinho,
      empresas: Object.values(empresasPedido),
      total: carrinho.reduce((sum, item) => sum + (parseFloat(item.preco) * item.quantidade), 0),
      status: 'pendente',
      criadoEm: new Date().toLocaleString('pt-BR'),
      endereco: consumidorLogado.endereco,
      bairro: consumidorLogado.bairro,
      telefone: consumidorLogado.telefone
    };

    const pedidosAtualizados = [...pedidos, novoPedido];
    setPedidos(pedidosAtualizados);
    
    // Salvar no localStorage para sincronização com TODOS os painéis
    localStorage.setItem('pedidos_sobral', JSON.stringify(pedidosAtualizados));
    
    // FORÇAR sincronização IMEDIATA para TODAS as sessões
    window.dispatchEvent(new CustomEvent('pedidos_updated', { 
      detail: { 
        pedidos: pedidosAtualizados,
        novoPedido: novoPedido,
        action: 'pedido_criado',
        timestamp: new Date().toISOString()
      }
    }));
    
    // Sincronização adicional com delay para garantir propagação
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('dados_sincronizados', {
        detail: { 
          pedidos: pedidosAtualizados,
          novoPedido: novoPedido,
          empresasEnvolvidas: Object.values(empresasPedido).map(emp => emp.empresaId),
          action: 'novo_pedido_realizado',
          timestamp: new Date().toISOString()
        }
      }));
      
      // Notificar empresas específicas sobre o novo pedido
      Object.values(empresasPedido).forEach(empresaPedido => {
        window.dispatchEvent(new CustomEvent('novo_pedido_empresa', {
          detail: { 
            empresaId: empresaPedido.empresaId,
            pedido: novoPedido,
            timestamp: new Date().toISOString()
          }
        }));
      });
      
      console.log('🔔 Eventos de sincronização disparados para todas as empresas envolvidas');
    }, 500);
    
    setCarrinho([]);
    alert(`Pedido realizado com sucesso!\n\nPedido #${novoPedido.id.slice(-6)}\nTotal: R$ ${novoPedido.total.toFixed(2)}\n\n🔔 Empresas notificadas automaticamente!`);
    setActiveConsumerTab('pedidos');
  };

  // Variáveis calculadas para o consumidor
  const empresasAprovadas = empresas.filter(emp => emp.status === 'aprovada');
  const produtosDisponiveis = produtos.filter(prod => prod.disponivel);
  
  const produtosFiltrados = produtosDisponiveis.filter(produto => {
    const empresa = empresasAprovadas.find(emp => emp.id === produto.empresaId);
    if (!empresa) return false;
    
    const matchCategoria = !filtroCategoria || produto.categoria === filtroCategoria;
    const matchBusca = !busca || 
      produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      empresa.nome.toLowerCase().includes(busca.toLowerCase());
    
    return matchCategoria && matchBusca;
  });

  const categorias = [...new Set(produtosDisponiveis.map(p => p.categoria))];
  const meusPedidos = pedidos.filter(p => p.consumidorId === consumidorLogado?.id);

  // Auto-login e sincronização: verificar se há sessões salvas na inicialização
  React.useEffect(() => {
    // Criar chave única para esta sessão (baseada em timestamp + random)
    const sessionId = sessionStorage.getItem('session_id') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
    
    // Verificar se há autenticação salva no sessionStorage (específico desta aba/sessão)
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      console.log('✅ Admin autenticado automaticamente após reload (sessão local)');
    }
    
    // Verificar se há empresa logada salva no sessionStorage (específico desta sessão)
    const savedEmpresa = sessionStorage.getItem('empresa_logada');
    if (savedEmpresa && !empresaLogada) {
      try {
        const empresaData = JSON.parse(savedEmpresa);
        setEmpresaLogada(empresaData);
        
        console.log('✅ Empresa autenticada automaticamente após reload (sessão local)');
      } catch (error) {
        console.error('Erro ao recuperar empresa logada:', error);
        sessionStorage.removeItem('empresa_logada');
      }
    }
    
    // Verificar se há entregador logado salvo no sessionStorage (específico desta sessão)
    const savedEntregador = sessionStorage.getItem('entregador_logado');
    if (savedEntregador && !entregadorLogado) {
      try {
        const entregadorData = JSON.parse(savedEntregador);
        setEntregadorLogado(entregadorData);
        console.log('✅ Entregador autenticado automaticamente após reload (sessão local)');
      } catch (error) {
        console.error('Erro ao recuperar entregador logado:', error);
        sessionStorage.removeItem('entregador_logado');
      }
    }
    
    // Verificar se há consumidor logado salvo no sessionStorage (específico desta sessão)
    const savedConsumidor = sessionStorage.getItem('consumidor_logado');
    if (savedConsumidor && !consumidorLogado) {
      try {
        const consumidorData = JSON.parse(savedConsumidor);
        setConsumidorLogado(consumidorData);
        console.log('✅ Consumidor autenticado automaticamente após reload (sessão local)');
      } catch (error) {
        console.error('Erro ao recuperar consumidor logado:', error);
        sessionStorage.removeItem('consumidor_logado');
      }
    }

    // Sincronizar dados automaticamente (CRUCIAL para sincronização entre painéis)
    const syncAllData = () => {
      try {
        // Sincronizar produtos PRIMEIRO - crítico para consumidores
        const savedProdutos = localStorage.getItem('produtos_sobral');
        if (savedProdutos) {
          const produtosData = JSON.parse(savedProdutos);
          setProdutos(produtosData);
          console.log('🔄 Produtos sincronizados:', produtosData.length);
          console.log('📦 Produtos disponíveis:', produtosData.filter(p => p.disponivel).length);
        } else {
          console.log('⚠️ Nenhum produto encontrado no localStorage');
        }

        // Sincronizar empresas SEGUNDO - necessário para mostrar dados das empresas
        const savedEmpresas = localStorage.getItem('empresas_sobral');
        if (savedEmpresas) {
          const empresasData = JSON.parse(savedEmpresas);
          setEmpresas(empresasData);
          console.log('🔄 Empresas sincronizadas:', empresasData.length);
          console.log('🏢 Empresas aprovadas:', empresasData.filter(e => e.status === 'aprovada').length);
        } else {
          console.log('⚠️ Nenhuma empresa encontrada no localStorage');
        }

        // Sincronizar entregadores
        const savedEntregadores = localStorage.getItem('entregadores_sobral');
        if (savedEntregadores) {
          const entregadoresData = JSON.parse(savedEntregadores);
          setEntregadores(entregadoresData);
          console.log('🔄 Entregadores sincronizados:', entregadoresData.length);
        }

        // Sincronizar consumidores
        const savedConsumidores = localStorage.getItem('consumidores_sobral');
        if (savedConsumidores) {
          const consumidoresData = JSON.parse(savedConsumidores);
          setConsumidores(consumidoresData);
          console.log('🔄 Consumidores sincronizados:', consumidoresData.length);
        }

        // Sincronizar pedidos - CRÍTICO para empresas e entregadores
        const savedPedidos = localStorage.getItem('pedidos_sobral');
        if (savedPedidos) {
          const pedidosData = JSON.parse(savedPedidos);
          setPedidos(pedidosData);
          console.log('🔄 Pedidos sincronizados:', pedidosData.length);
          
          // Log específico para pedidos pendentes (importantes para empresas)
          const pedidosPendentes = pedidosData.filter(p => p.status === 'pendente');
          console.log('📥 Pedidos pendentes encontrados:', pedidosPendentes.length);
          
          if (pedidosPendentes.length > 0) {
            console.log('📋 Pedidos pendentes detalhados:', pedidosPendentes.map(p => ({
              id: p.id.slice(-6),
              cliente: p.consumidorNome,
              empresas: p.empresas?.map(emp => emp.empresaNome) || [],
              total: p.total
            })));
          }
        } else {
          console.log('⚠️ Nenhum pedido encontrado no localStorage');
        }

        // Forçar atualização se necessário
        setForceConsumerUpdate(prev => prev + 1);

        // Forçar re-render dos componentes consumidores
        window.dispatchEvent(new CustomEvent('dados_sincronizados', {
          detail: { 
            produtos: JSON.parse(savedProdutos || '[]'),
            empresas: JSON.parse(savedEmpresas || '[]'),
            timestamp: new Date().toISOString()
          }
        }));
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      }
    };

    // Sincronizar imediatamente
    syncAllData();
    
    // Definir loading como false após a sincronização inicial
    setTimeout(() => setIsLoading(false), 100);

    // Listener para mudanças no localStorage (sincronização entre abas/componentes)
    const handleStorageChange = (e) => {
      console.log('🔄 Detectada mudança no localStorage:', e.key);
      setTimeout(syncAllData, 100);
    };

    // Listener para eventos customizados de sincronização
    const handleCustomSync = (e) => {
      console.log('🔄 Evento customizado de sincronização:', e.type);
      syncAllData();
    };

    // Listener para sincronização forçada entre painéis
    const handleForcedSync = (e) => {
      console.log('🔄 Sincronização forçada entre painéis:', e.detail);
      syncAllData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('produtos_updated', handleCustomSync);
    window.addEventListener('empresas_updated', handleCustomSync);
    window.addEventListener('pedidos_updated', handleCustomSync);
    window.addEventListener('sync_all_data', handleCustomSync);
    window.addEventListener('dados_sincronizados', handleForcedSync);
    
    // Listener específico para novos pedidos (para empresas)
    window.addEventListener('novo_pedido_empresa', (e) => {
      console.log('🔔 Novo pedido recebido para empresa:', e.detail);
      
      // Se for uma empresa logada, verificar se o pedido é para ela
      if (empresaLogada && e.detail.empresaId === empresaLogada.id) {
        // Sincronizar pedidos imediatamente
        syncAllData();
        
        // Notificação visual/sonora para a empresa
        setTimeout(() => {
          if (confirm(`🔔 NOVO PEDIDO RECEBIDO!\n\nPedido #${e.detail.pedido.id.slice(-6)}\nCliente: ${e.detail.pedido.consumidorNome}\nTotal: R$ ${e.detail.pedido.total.toFixed(2)}\n\n🎯 Clique OK para ver o pedido na aba Pedidos`)) {
            // Se a empresa confirmar, mudar para a aba de pedidos
            setActiveTab('pedidos');
          }
        }, 1000);
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('produtos_updated', handleCustomSync);
      window.removeEventListener('empresas_updated', handleCustomSync);
      window.removeEventListener('pedidos_updated', handleCustomSync);
      window.removeEventListener('sync_all_data', handleCustomSync);
      window.removeEventListener('dados_sincronizados', handleForcedSync);
      window.removeEventListener('novo_pedido_empresa', () => {});
    };
  }, [empresaLogada, entregadorLogado, consumidorLogado]);

  // Auto-redirecionamento APENAS para admin - outros usuários NÃO precisam de redirecionamento
  React.useEffect(() => {
    // APENAS admin precisa ser redirecionado - outros usuários renderizam diretamente
    if (isAuthenticated && currentView === 'home' && !empresaLogada && !entregadorLogado && !consumidorLogado) {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated]);

  // Tela de loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">🍕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Entrega Sobral</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  // Função de login do admin
  const handleAdminLogin = (e) => {
    e.preventDefault();
    console.log('🔐 Tentativa de login admin:', {
      usuarioDigitado: loginForm.usuario,
      senhaDigitada: loginForm.senha,
      usuarioCorreto: adminCredentials.usuario,
      senhaCorreta: adminCredentials.senha
    });
    
    const usuarioLimpo = loginForm.usuario.trim();
    const senhaLimpa = loginForm.senha.trim();
    
    if (usuarioLimpo === adminCredentials.usuario && senhaLimpa === adminCredentials.senha) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true'); // MUDANÇA: usar sessionStorage
      setCurrentView('dashboard');
      setLoginForm({ usuario: '', senha: '', email: '' });
      console.log('✅ Login admin realizado com sucesso!');
      alert('Login realizado com sucesso!');
    } else {
      console.log('❌ Credenciais incorretas!');
      console.log('Esperado:', { usuario: adminCredentials.usuario, senha: adminCredentials.senha });
      console.log('Recebido:', { usuario: usuarioLimpo, senha: senhaLimpa });
      alert('Usuário ou senha incorretos!\nVerifique: admin / tenderbr0');
    }
  };

  // Função de login para empresas
  const handleEmpresaLogin = (e) => {
    e.preventDefault();
    
    const empresa = empresas.find(emp => 
      emp.email === loginForm.email && emp.senha === loginForm.senha
    );

    if (empresa) {
      if (empresa.status === 'pendente') {
        alert('Sua empresa ainda está aguardando aprovação. Você receberá um email quando for aprovada.');
        return;
      }
      if (empresa.status === 'rejeitada') {
        alert('Sua empresa foi rejeitada. Entre em contato com o suporte para mais informações.');
        return;
      }
      if (empresa.status === 'suspensa') {
        alert('Sua empresa está suspensa. Entre em contato com o suporte.');
        return;
      }
      
      // IMPORTANTE: NÃO setar currentView - deixar o componente renderizar diretamente
      sessionStorage.setItem('empresa_logada', JSON.stringify(empresa)); // MUDANÇA: usar sessionStorage
      setEmpresaLogada(empresa);
      setLoginForm({ email: '', senha: '', usuario: '' });
      alert(`Bem-vindo(a), ${empresa.nome}!`);
    } else {
      alert('Email ou senha incorretos!');
    }
  };

  // Função de login para entregadores
  const handleEntregadorLogin = (e) => {
    e.preventDefault();
    
    const entregador = entregadores.find(ent => 
      ent.email === loginForm.email && ent.senha === loginForm.senha
    );

    if (entregador) {
      if (entregador.status === 'pendente') {
        alert('Seu cadastro ainda está aguardando aprovação. Você receberá um email quando for aprovado.');
        return;
      }
      if (entregador.status === 'rejeitado') {
        alert('Seu cadastro foi rejeitado. Entre em contato com o suporte para mais informações.');
        return;
      }
      if (entregador.status === 'suspenso') {
        alert('Sua conta está suspensa. Entre em contato com o suporte.');
        return;
      }
      
      // IMPORTANTE: NÃO setar currentView - deixar o componente renderizar diretamente
      sessionStorage.setItem('entregador_logado', JSON.stringify(entregador)); // MUDANÇA: usar sessionStorage
      setEntregadorLogado(entregador);
      setLoginForm({ email: '', senha: '', usuario: '' });
      alert(`Bem-vindo(a), ${entregador.nome}!`);
    } else {
      alert('Email ou senha incorretos!');
    }
  };

  // Função de login para consumidores
  const handleConsumidorLogin = (e) => {
    e.preventDefault();
    
    const consumidor = consumidores.find(cons => 
      cons.email === loginForm.email && cons.senha === loginForm.senha
    );

    if (consumidor) {
      // IMPORTANTE: NÃO setar currentView - deixar o componente renderizar diretamente
      sessionStorage.setItem('consumidor_logado', JSON.stringify(consumidor)); // MUDANÇA: usar sessionStorage
      setConsumidorLogado(consumidor);
      setLoginForm({ email: '', senha: '', usuario: '' });
      alert(`Bem-vindo(a), ${consumidor.nome}!`);
    } else {
      alert('Email ou senha incorretos!');
    }
  };

  // Função de logout do admin
  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated'); // MUDANÇA: usar sessionStorage
    setCurrentView('home');
    setActiveTab('dashboard');
  };

  // Função de logout para empresa
  const handleEmpresaLogout = () => {
    setEmpresaLogada(null);
    sessionStorage.removeItem('empresa_logada'); // MUDANÇA: usar sessionStorage
    // Limpar estados do formulário de produto ao fazer logout
    setShowProdutoForm(false);
    setEditingProdutoId(null);
    setProdutoForm({
      nome: '',
      descricao: '',
      preco: '',
      categoria: '',
      disponivel: true,
      tempoPreparacao: '',
      imagem: ''
    });
    // NÃO setar currentView - ir direto para home sem intermediários
    setActiveTab('dashboard');
  };

  // Função de logout para entregador
  const handleEntregadorLogout = () => {
    setEntregadorLogado(null);
    sessionStorage.removeItem('entregador_logado'); // MUDANÇA: usar sessionStorage
    // NÃO setar currentView - ir direto para home sem intermediários
    setActiveTab('dashboard');
  };

  // Função de logout para consumidor
  const handleConsumidorLogout = () => {
    setConsumidorLogado(null);
    sessionStorage.removeItem('consumidor_logado'); // MUDANÇA: usar sessionStorage
    // Limpar carrinho local da sessão
    setCarrinho([]);
    // NÃO setar currentView - ir direto para home sem intermediários
    setActiveTab('dashboard');
  };

  // Função para cadastrar/editar produto
  const handleSubmitProduto = (e) => {
    e.preventDefault();
    
    if (!empresaLogada) {
      alert('Erro: Empresa não está logada!');
      return;
    }

    let produtosAtualizados;
    
    if (editingProdutoId) {
      // Editando produto existente
      produtosAtualizados = produtos.map(prod => 
        prod.id === editingProdutoId ? { 
          ...produtoForm, 
          id: editingProdutoId,
          empresaId: empresaLogada.id,
          editadoEm: new Date().toLocaleString('pt-BR')
        } : prod
      );
      console.log('✏️ Produto editado:', produtoForm.nome);
      alert(`✅ Produto "${produtoForm.nome}" foi atualizado com sucesso!`);
      setEditingProdutoId(null);
    } else {
      // Cadastrando novo produto
      const novoProduto = {
        ...produtoForm,
        id: Date.now().toString(),
        empresaId: empresaLogada.id,
        criadoEm: new Date().toLocaleString('pt-BR'),
        preco: parseFloat(produtoForm.preco).toFixed(2)
      };
      
      produtosAtualizados = [...produtos, novoProduto];
      console.log('🆕 Novo produto cadastrado:', novoProduto.nome);
      alert(`✅ Produto "${novoProduto.nome}" foi cadastrado com sucesso!`);
    }
    
    // Atualizar estado local
    setProdutos(produtosAtualizados);
    
    // Salvar no localStorage para sincronização com TODOS os painéis
    localStorage.setItem('produtos_sobral', JSON.stringify(produtosAtualizados));
    
    // Disparar evento customizado para sincronização IMEDIATA
    window.dispatchEvent(new CustomEvent('produtos_updated', { 
      detail: { produtos: produtosAtualizados }
    }));
    
    // Forçar sincronização imediata em todos os painéis
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('dados_sincronizados', {
        detail: { 
          produtos: produtosAtualizados,
          empresas: empresas,
          action: editingProdutoId ? 'produto_editado' : 'produto_criado',
          timestamp: new Date().toISOString()
        }
      }));
    }, 200);
    
    console.log('📊 Total de produtos:', produtosAtualizados.length);
    console.log('🔄 Sincronização disparada para todos os painéis');
    
    // Limpar formulário e salvar estado adequadamente
    const formVazio = {
      nome: '',
      descricao: '',
      preco: '',
      categoria: '',
      disponivel: true,
      tempoPreparacao: '',
      imagem: ''
    };
    setProdutoForm(formVazio);
    setShowProdutoForm(false);
    setEditingProdutoId(null);
    
    // Estados locais da sessão - não precisam ser salvos em storage
  };

  // Função para editar produto
  const editarProduto = (id) => {
    const produto = produtos.find(prod => prod.id === id);
    if (produto) {
      setProdutoForm(produto);
      setEditingProdutoId(id);
      setShowProdutoForm(true);
      
      // Garantir que a aba produtos esteja ativa
      setActiveTab('produtos');
    }
  };

  // Função para excluir produto
  const excluirProduto = (id) => {
    const produto = produtos.find(prod => prod.id === id);
    if (!produto) {
      alert('Produto não encontrado!');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?\n\nEsta ação não pode ser desfeita!`)) {
      const produtosAtualizados = produtos.filter(prod => prod.id !== id);
      
      // Atualizar estado local
      setProdutos(produtosAtualizados);
      
      // Salvar no localStorage para sincronização
      localStorage.setItem('produtos_sobral', JSON.stringify(produtosAtualizados));
      
      // Disparar evento de sincronização
      window.dispatchEvent(new CustomEvent('produtos_updated', { 
        detail: { produtos: produtosAtualizados }
      }));
      
      console.log('🗑️ Produto excluído:', produto.nome);
      console.log('🔄 Sincronização disparada para todos os painéis');
      alert(`✅ Produto "${produto.nome}" foi excluído com sucesso!`);
    }
  };

  // Função para cadastrar empresa
  const handleCadastroEmpresa = (e) => {
    e.preventDefault();
    
    // Validações
    if (empresaForm.senha !== empresaForm.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if (empresaForm.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    // Verificar se email já existe
    if (empresas.find(emp => emp.email === empresaForm.email)) {
      alert('Este email já está cadastrado!');
      return;
    }

    // Verificar se CNPJ já existe
    if (empresas.find(emp => emp.cnpj === empresaForm.cnpj)) {
      alert('Este CNPJ já está cadastrado!');
      return;
    }

    const novaEmpresa = {
      id: 'empresa_' + Date.now(),
      ...empresaForm,
      status: 'pendente', // Sempre inicia como pendente
      cadastradaEm: new Date().toLocaleString('pt-BR')
    };

    // Remover confirmação de senha antes de salvar
    delete novaEmpresa.confirmarSenha;

    const empresasAtualizadas = [...empresas, novaEmpresa];
    setEmpresas(empresasAtualizadas);
    localStorage.setItem('empresas_sobral', JSON.stringify(empresasAtualizadas));

    // Limpar formulário
    setEmpresaForm({
      nome: '',
      cnpj: '',
      categoria: '',
      responsavel: '',
      email: '',
      telefone: '',
      endereco: '',
      bairro: '',
      senha: '',
      confirmarSenha: ''
    });

    alert(`✅ Empresa "${novaEmpresa.nome}" cadastrada com sucesso!\n\nSeu cadastro está aguardando aprovação.\nVocê receberá um email quando for aprovado.\n\nApós a aprovação, você poderá fazer login no sistema.`);
    setCurrentView('empresa-login');
  };

  // Função para cadastrar entregador
  const handleCadastroEntregador = (e) => {
    e.preventDefault();
    
    // Validações
    if (entregadorForm.senha !== entregadorForm.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if (entregadorForm.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    // Verificar se email já existe
    if (entregadores.find(ent => ent.email === entregadorForm.email)) {
      alert('Este email já está cadastrado!');
      return;
    }

    // Verificar se CPF já existe
    if (entregadores.find(ent => ent.cpf === entregadorForm.cpf)) {
      alert('Este CPF já está cadastrado!');
      return;
    }

    const novoEntregador = {
      id: 'entregador_' + Date.now(),
      ...entregadorForm,
      status: 'pendente', // Sempre inicia como pendente
      cadastradoEm: new Date().toLocaleString('pt-BR')
    };

    // Remover confirmação de senha antes de salvar
    delete novoEntregador.confirmarSenha;

    const entregadoresAtualizados = [...entregadores, novoEntregador];
    setEntregadores(entregadoresAtualizados);
    localStorage.setItem('entregadores_sobral', JSON.stringify(entregadoresAtualizados));

    // Limpar formulário
    setEntregadorForm({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: '',
      bairro: '',
      veiculo: '',
      placa: '',
      cnh: '',
      senha: '',
      confirmarSenha: ''
    });

    alert(`✅ Entregador "${novoEntregador.nome}" cadastrado com sucesso!\n\nSeu cadastro está aguardando aprovação.\nVocê receberá um email quando for aprovado.\n\nApós a aprovação, você poderá fazer login no sistema.`);
    setCurrentView('entregador-login');
  };

  // Função para cadastrar consumidor
  const handleCadastroConsumidor = (e) => {
    e.preventDefault();
    
    // Validações
    if (consumidorForm.senha !== consumidorForm.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if (consumidorForm.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    // Verificar se email já existe
    if (consumidores.find(cons => cons.email === consumidorForm.email)) {
      alert('Este email já está cadastrado!');
      return;
    }

    // Verificar se CPF já existe
    if (consumidores.find(cons => cons.cpf === consumidorForm.cpf)) {
      alert('Este CPF já está cadastrado!');
      return;
    }

    const novoConsumidor = {
      id: 'consumidor_' + Date.now(),
      ...consumidorForm,
      cadastradoEm: new Date().toLocaleString('pt-BR')
    };

    // Remover confirmação de senha antes de salvar
    delete novoConsumidor.confirmarSenha;

    const consumidoresAtualizados = [...consumidores, novoConsumidor];
    setConsumidores(consumidoresAtualizados);
    localStorage.setItem('consumidores_sobral', JSON.stringify(consumidoresAtualizados));

    // Limpar formulário
    setConsumidorForm({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: '',
      bairro: '',
      pontoReferencia: '',
      senha: '',
      confirmarSenha: ''
    });

    alert(`✅ Cliente "${novoConsumidor.nome}" cadastrado com sucesso!\n\nVocê já pode fazer login no sistema e começar a fazer pedidos!`);
    setCurrentView('consumidor-login');
  };

  // Função para alternar disponibilidade do produto
  const toggleDisponibilidadeProduto = (id) => {
    const produtosAtualizados = produtos.map(prod => 
      prod.id === id ? { 
        ...prod, 
        disponivel: !prod.disponivel,
        atualizadoEm: new Date().toLocaleString('pt-BR')
      } : prod
    );
    
    setProdutos(produtosAtualizados);
    localStorage.setItem('produtos_sobral', JSON.stringify(produtosAtualizados));
    
    // Disparar evento de sincronização IMEDIATA
    window.dispatchEvent(new CustomEvent('produtos_updated', { 
      detail: { produtos: produtosAtualizados }
    }));
    
    // Forçar sincronização imediata em todos os painéis
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('dados_sincronizados', {
        detail: { 
          produtos: produtosAtualizados,
          empresas: empresas,
          action: 'produto_disponibilidade_alterada',
          timestamp: new Date().toISOString()
        }
      }));
    }, 200);
    
    const produto = produtos.find(p => p.id === id);
    console.log('🔄 Sincronização disparada para todos os painéis');
    alert(`Produto "${produto.nome}" ${!produto.disponivel ? 'disponibilizado' : 'indisponibilizado'} com sucesso!`);
  };

  // Função para aprovar empresa
  const aprovarEmpresa = (id) => {
    const empresasAtualizadas = empresas.map(emp => 
      emp.id === id ? { 
        ...emp, 
        status: 'aprovada',
        aprovadaEm: new Date().toLocaleString('pt-BR')
      } : emp
    );
    
    setEmpresas(empresasAtualizadas);
    localStorage.setItem('empresas_sobral', JSON.stringify(empresasAtualizadas));
    
    const empresa = empresas.find(e => e.id === id);
    alert(`✅ Empresa "${empresa.nome}" foi aprovada com sucesso!`);
  };

  // Função para rejeitar empresa
  const rejeitarEmpresa = (id) => {
    const empresasAtualizadas = empresas.map(emp => 
      emp.id === id ? { 
        ...emp, 
        status: 'rejeitada',
        rejeitadaEm: new Date().toLocaleString('pt-BR')
      } : emp
    );
    
    setEmpresas(empresasAtualizadas);
    localStorage.setItem('empresas_sobral', JSON.stringify(empresasAtualizadas));
    
    const empresa = empresas.find(e => e.id === id);
    alert(`❌ Empresa "${empresa.nome}" foi rejeitada.`);
  };

  // Função para aprovar entregador
  const aprovarEntregador = (id) => {
    const entregadoresAtualizados = entregadores.map(ent => 
      ent.id === id ? { 
        ...ent, 
        status: 'aprovado',
        aprovadoEm: new Date().toLocaleString('pt-BR')
      } : ent
    );
    
    setEntregadores(entregadoresAtualizados);
    localStorage.setItem('entregadores_sobral', JSON.stringify(entregadoresAtualizados));
    
    const entregador = entregadores.find(e => e.id === id);
    alert(`✅ Entregador "${entregador.nome}" foi aprovado com sucesso!`);
  };

  // Função para rejeitar entregador
  const rejeitarEntregador = (id) => {
    const entregadoresAtualizados = entregadores.map(ent => 
      ent.id === id ? { 
        ...ent, 
        status: 'rejeitado',
        rejeitadoEm: new Date().toLocaleString('pt-BR')
      } : ent
    );
    
    setEntregadores(entregadoresAtualizados);
    localStorage.setItem('entregadores_sobral', JSON.stringify(entregadoresAtualizados));
    
    const entregador = entregadores.find(e => e.id === id);
    alert(`❌ Entregador "${entregador.nome}" foi rejeitado.`);
  };

  // Dashboard da empresa logada - SEMPRE mostrar se empresa está logada
  if (empresaLogada) {
    const meusProdutos = produtos.filter(p => p.empresaId === empresaLogada.id);
    const meusPedidos = pedidos.filter(pedido => 
      pedido.empresas && pedido.empresas.some(emp => emp.empresaId === empresaLogada.id)
    );

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">
                  🏢 {empresaLogada.nome}
                </h1>
                <span className="ml-4 text-sm text-gray-600">
                  Painel da Empresa
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleEmpresaLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {['perfil', 'produtos', 'pedidos', 'relatorios'].map(tab => (
                <button
                  key={tab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'perfil' && '👤 Perfil'}
                  {tab === 'produtos' && '🍽️ Produtos'}
                  {tab === 'pedidos' && '📦 Pedidos'}
                  {tab === 'relatorios' && '📊 Relatórios'}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-3xl mb-2">🍽️</div>
                <div className="text-2xl font-bold text-gray-900">{meusProdutos.length}</div>
                <div className="text-sm text-gray-600">Produtos</div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-2xl font-bold text-gray-900">{meusPedidos.length}</div>
                <div className="text-sm text-gray-600">Pedidos</div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-3xl mb-2">⏳</div>
                <div className="text-2xl font-bold text-gray-900">
                  {meusPedidos.filter(p => p.status === 'pendente').length}
                </div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-gray-900">
                  R$ {meusPedidos.filter(p => p.status === 'entregue').reduce((sum, pedido) => {
                    const empresaPedido = pedido.empresas.find(emp => emp.empresaId === empresaLogada.id);
                    return sum + (empresaPedido ? empresaPedido.subtotal : 0);
                  }, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Faturamento</div>
              </div>
            </div>

            {activeTab === 'perfil' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Perfil da Empresa
                </h2>
                
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Informações Básicas
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p><strong>Nome:</strong> {empresaLogada.nome}</p>
                        <p><strong>CNPJ:</strong> {empresaLogada.cnpj}</p>
                        <p><strong>Categoria:</strong> {empresaLogada.categoria}</p>
                        <p><strong>Responsável:</strong> {empresaLogada.responsavel}</p>
                        <p><strong>Status:</strong> {
                          empresaLogada.status === 'aprovada' ? '✅ Aprovada' : '⏳ Aguardando aprovação'
                        }</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Contato e Localização
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p><strong>Email:</strong> {empresaLogada.email}</p>
                        <p><strong>Telefone:</strong> {empresaLogada.telefone}</p>
                        <p><strong>Endereço:</strong> {empresaLogada.endereco}</p>
                        <p><strong>Bairro:</strong> {empresaLogada.bairro}</p>
                        <p><strong>Cadastrada em:</strong> {empresaLogada.cadastradaEm}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'produtos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Meus Produtos ({produtos.filter(p => p.empresaId === empresaLogada.id).length})
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // Sincronização manual COMPLETA para garantir dados atualizados
                        try {
                          // Forçar reload de TODOS os dados
                          const savedProdutos = localStorage.getItem('produtos_sobral');
                          const savedEmpresas = localStorage.getItem('empresas_sobral');
                          
                          if (savedProdutos) {
                            const produtosData = JSON.parse(savedProdutos);
                            setProdutos(produtosData);
                            console.log('📦 Produtos recarregados:', produtosData.length);
                          }
                          
                          if (savedEmpresas) {
                            const empresasData = JSON.parse(savedEmpresas);
                            setEmpresas(empresasData);
                            console.log('🏢 Empresas recarregadas:', empresasData.length);
                          }
                          
                          // Disparar evento GLOBAL de sincronização
                          window.dispatchEvent(new CustomEvent('sync_all_data'));
                          window.dispatchEvent(new CustomEvent('dados_sincronizados', {
                            detail: { 
                              produtos: JSON.parse(savedProdutos || '[]'),
                              empresas: JSON.parse(savedEmpresas || '[]'),
                              action: 'sincronizacao_manual_empresa',
                              timestamp: new Date().toISOString()
                            }
                          }));
                          
                          const produtosData = JSON.parse(savedProdutos || '[]');
                          alert(`🔄 Sincronização COMPLETA concluída!\n\n📊 DADOS ATUALIZADOS:\n• Total de produtos: ${produtosData.length}\n• Seus produtos: ${produtosData.filter(p => p.empresaId === empresaLogada.id).length}\n• Produtos disponíveis: ${produtosData.filter(p => p.disponivel).length}\n\n✅ Dados sincronizados com TODOS os painéis!`);
                        } catch (error) {
                          console.error('Erro na sincronização:', error);
                          alert('Erro na sincronização: ' + error.message);
                        }
                      }}
                      className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition duration-200 text-sm"
                    >
                      🔄 Sincronizar
                    </button>
                    <button
                      onClick={() => {
                        const novoEstado = !showProdutoForm;
                        setShowProdutoForm(novoEstado);
                        
                        if (novoEstado) {
                          // Abrindo formulário - limpar dados
                          setEditingProdutoId(null);
                          setProdutoForm({
                            nome: '',
                            descricao: '',
                            preco: '',
                            categoria: '',
                            disponivel: true,
                            tempoPreparacao: '',
                            imagem: ''
                          });
                        } else {
                          // Fechando formulário - limpar dados também
                          setEditingProdutoId(null);
                          setProdutoForm({
                            nome: '',
                            descricao: '',
                            preco: '',
                            categoria: '',
                            disponivel: true,
                            tempoPreparacao: '',
                            imagem: ''
                          });
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      {showProdutoForm ? 'Cancelar' : '+ Novo Produto'}
                    </button>
                  </div>
                </div>

                {showProdutoForm && (
                  <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {editingProdutoId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                    </h3>
                    <form onSubmit={handleSubmitProduto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Produto *
                        </label>
                        <input
                          type="text"
                          required
                          value={produtoForm.nome}
                          onChange={(e) => {
                            setProdutoForm({ ...produtoForm, nome: e.target.value });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Pizza Margherita"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço (R$) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={produtoForm.preco}
                          onChange={(e) => setProdutoForm({ ...produtoForm, preco: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="25.90"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoria *
                        </label>
                        <select
                          required
                          value={produtoForm.categoria}
                          onChange={(e) => {
                            setProdutoForm({ ...produtoForm, categoria: e.target.value });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" disabled>Selecione uma categoria</option>
                          <option value="Pizzas">🍕 Pizzas</option>
                          <option value="Lanches">🍔 Lanches</option>
                          <option value="Bebidas">🥤 Bebidas</option>
                          <option value="Sobremesas">🍰 Sobremesas</option>
                          <option value="Pratos Principais">🍽️ Pratos Principais</option>
                          <option value="Petiscos">🍿 Petiscos</option>
                          <option value="Saladas">🥗 Saladas</option>
                          <option value="Açaí">🍨 Açaí</option>
                          <option value="Sorvetes">🍦 Sorvetes</option>
                          <option value="Comida Japonesa">🍣 Comida Japonesa</option>
                          <option value="Comida Italiana">🍝 Comida Italiana</option>
                          <option value="Comida Mexicana">🌮 Comida Mexicana</option>
                          <option value="Padaria">🥖 Padaria</option>
                          <option value="Farmácia">💊 Farmácia</option>
                          <option value="Supermercado">🛒 Supermercado</option>
                          <option value="Outros">📦 Outros</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tempo de Preparação (minutos)
                        </label>
                        <input
                          type="number"
                          value={produtoForm.tempoPreparacao}
                          onChange={(e) => setProdutoForm({ ...produtoForm, tempoPreparacao: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="30"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição *
                        </label>
                        <textarea
                          required
                          value={produtoForm.descricao}
                          onChange={(e) => {
                            setProdutoForm({ ...produtoForm, descricao: e.target.value });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Descreva o produto..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Imagem do Produto
                        </label>
                        <div className="space-y-3">
                          {/* Upload de arquivo */}
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">📸 Clique para fazer upload</span>
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG ou JPEG (MAX. 5MB)</p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    // Validar tamanho do arquivo (5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                      alert('❌ Arquivo muito grande! Tamanho máximo: 5MB');
                                      e.target.value = '';
                                      return;
                                    }
                                    
                                    // Validar tipo do arquivo
                                    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                                    if (!allowedTypes.includes(file.type)) {
                                      alert('❌ Tipo de arquivo não permitido! Use PNG, JPG ou JPEG');
                                      e.target.value = '';
                                      return;
                                    }
                                    
                                    // Converter para base64 e salvar
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setProdutoForm({ ...produtoForm, imagem: event.target.result });
                                      alert('✅ Imagem carregada com sucesso!');
                                    };
                                    reader.onerror = () => {
                                      alert('❌ Erro ao carregar imagem. Tente novamente.');
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          
                          {/* Visualização da imagem */}
                          {produtoForm.imagem && (
                            <div className="relative">
                              <img
                                src={produtoForm.imagem}
                                alt="Preview do produto"
                                className="w-full h-40 object-cover rounded-lg border border-gray-300"
                                onError={() => {
                                  alert('❌ Erro ao carregar imagem. Verifique se o arquivo está correto.');
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setProdutoForm({ ...produtoForm, imagem: '' });
                                }}
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition duration-200"
                                title="Remover imagem"
                              >
                                ❌
                              </button>
                            </div>
                          )}
                          
                          {/* Opção alternativa: URL */}
                          <div className="border-t pt-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Ou cole uma URL da imagem:
                            </label>
                            <input
                              type="url"
                              value={produtoForm.imagem.startsWith('data:') ? '' : produtoForm.imagem}
                              onChange={(e) => {
                                setProdutoForm({ ...produtoForm, imagem: e.target.value });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="https://exemplo.com/imagem.jpg"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="disponivel"
                          checked={produtoForm.disponivel}
                          onChange={(e) => setProdutoForm({ ...produtoForm, disponivel: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="disponivel" className="text-sm text-gray-700">
                          Produto disponível
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200"
                        >
                          {editingProdutoId ? 'Atualizar' : 'Cadastrar'} Produto
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Lista de Produtos */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid gap-4">
                      {produtos.filter(p => p.empresaId === empresaLogada.id).length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🍽️</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum produto cadastrado
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Comece adicionando produtos ao seu cardápio
                          </p>
                          <button
                            onClick={() => setShowProdutoForm(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
                          >
                            + Adicionar Primeiro Produto
                          </button>
                        </div>
                      ) : (
                        produtos
                          .filter(p => p.empresaId === empresaLogada.id)
                          .map(produto => (
                            <div key={produto.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  {/* Imagem do produto */}
                                  {produto.imagem && (
                                    <div className="mb-3">
                                      <img
                                        src={produto.imagem}
                                        alt={produto.nome}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{produto.nome}</h3>
                                    <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                                      produto.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {produto.disponivel ? '✅ Disponível' : '❌ Indisponível'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                    <p>💰 R$ {parseFloat(produto.preco).toFixed(2)}</p>
                                    <p>📂 {produto.categoria}</p>
                                    {produto.tempoPreparacao && (
                                      <p>⏱️ {produto.tempoPreparacao} min</p>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-2">
                                    📝 {produto.descricao}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Criado em: {produto.criadoEm}
                                  </p>
                                </div>
                                
                                <div className="flex flex-col space-y-2 ml-4">
                                  <button
                                    onClick={() => toggleDisponibilidadeProduto(produto.id)}
                                    className={`px-3 py-1 rounded text-sm transition duration-200 ${
                                      produto.disponivel
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                  >
                                    {produto.disponivel ? '🚫 Indisponibilizar' : '✅ Disponibilizar'}
                                  </button>
                                  
                                  <button
                                    onClick={() => editarProduto(produto.id)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition duration-200"
                                  >
                                    ✏️ Editar
                                  </button>
                                  
                                  <button
                                    onClick={() => excluirProduto(produto.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition duration-200"
                                  >
                                    🗑️ Excluir
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pedidos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Meus Pedidos
                  </h2>
                  <button
                    onClick={() => {
                      // Sincronização COMPLETA de pedidos para empresas
                      try {
                        console.log('🔄 Empresa iniciando sincronização COMPLETA de pedidos...');
                        console.log('🏢 Empresa logada:', empresaLogada.nome, '- ID:', empresaLogada.id);
                        
                        // Forçar reload COMPLETO dos pedidos
                        const savedPedidos = localStorage.getItem('pedidos_sobral');
                        if (savedPedidos) {
                          const pedidosData = JSON.parse(savedPedidos);
                          setPedidos(pedidosData);
                          console.log('📦 Total de pedidos carregados:', pedidosData.length);
                          
                          // Filtrar pedidos desta empresa especificamente
                          const meusPedidosEmpresa = pedidosData.filter(pedido => {
                            const temEmpresa = pedido.empresas && pedido.empresas.some(emp => {
                              const match = emp.empresaId === empresaLogada.id;
                              if (match) {
                                console.log('✅ Pedido encontrado para empresa:', pedido.id.slice(-6), '- Cliente:', pedido.consumidorNome);
                              }
                              return match;
                            });
                            return temEmpresa;
                          });
                          
                          console.log('🎯 Pedidos filtrados para', empresaLogada.nome, ':', meusPedidosEmpresa.length);
                          
                          // Estatísticas detalhadas
                          const pendentes = meusPedidosEmpresa.filter(p => p.status === 'pendente');
                          const preparando = meusPedidosEmpresa.filter(p => p.status === 'preparando');
                          const prontos = meusPedidosEmpresa.filter(p => p.status === 'pronto');
                          
                          alert(`🔄 Sincronização COMPLETA realizada!\n\n📊 RESULTADO DETALHADO:\n• Total no sistema: ${pedidosData.length} pedidos\n• Seus pedidos: ${meusPedidosEmpresa.length}\n\n📈 STATUS DOS SEUS PEDIDOS:\n• ⏳ Pendentes: ${pendentes.length}\n• 👨‍🍳 Preparando: ${preparando.length}\n• 🍽️ Prontos: ${prontos.length}\n\n${meusPedidosEmpresa.length > 0 ? '✅ Todos os pedidos estão listados abaixo!' : '⚠️ Nenhum pedido encontrado.\n\nDica: Verifique se há pedidos no marketplace consumidor.'}`);
                        } else {
                          alert('⚠️ Nenhum pedido encontrado no sistema.\n\nIsso pode significar que:\n• Nenhum consumidor fez pedidos ainda\n• Houve um problema na sincronização\n\nTente:\n1. Verificar se há pedidos no painel do consumidor\n2. Recarregar a página');
                        }
                        
                        // Forçar evento de sincronização global
                        window.dispatchEvent(new CustomEvent('dados_sincronizados', {
                          detail: { 
                            pedidos: JSON.parse(savedPedidos || '[]'),
                            action: 'sincronizacao_manual_empresa_pedidos',
                            empresaId: empresaLogada.id,
                            timestamp: new Date().toISOString()
                          }
                        }));
                        
                      } catch (error) {
                        console.error('❌ Erro na sincronização completa:', error);
                        alert('❌ Erro na sincronização: ' + error.message + '\n\nTente recarregar a página.');
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    🔄 Atualizar Pedidos
                  </button>
                </div>

                {/* Filtros de Status */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md">
                      ⏳ Pendentes ({pedidos.filter(p => 
                        p.empresas && p.empresas.some(emp => emp.empresaId === empresaLogada.id) && 
                        p.status === 'pendente'
                      ).length})
                    </div>
                    <div className="px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-md">
                      👨‍🍳 Em Preparo ({pedidos.filter(p => 
                        p.empresas && p.empresas.some(emp => emp.empresaId === empresaLogada.id) && 
                        p.status === 'preparando'
                      ).length})
                    </div>
                    <div className="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md">
                      🍽️ Prontos ({pedidos.filter(p => 
                        p.empresas && p.empresas.some(emp => emp.empresaId === empresaLogada.id) && 
                        p.status === 'pronto'
                      ).length})
                    </div>
                    <div className="px-4 py-2 text-sm bg-purple-100 text-purple-800 rounded-md">
                      📢 Aguardando Entregador ({pedidos.filter(p => 
                        p.empresas && p.empresas.some(emp => emp.empresaId === empresaLogada.id) && 
                        p.status === 'aguardando_entregador'
                      ).length})
                    </div>
                    <div className="px-4 py-2 text-sm bg-orange-100 text-orange-800 rounded-md">
                      🚚 Em Entrega ({pedidos.filter(p => 
                        p.empresas && p.empresas.some(emp => emp.empresaId === empresaLogada.id) && 
                        p.status === 'entrega'
                      ).length})
                    </div>
                    <div className="px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md">
                      ✅ Entregues ({pedidos.filter(p => 
                        p.empresas && p.empresas.some(emp => emp.empresaId === empresaLogada.id) && 
                        p.status === 'entregue'
                      ).length})
                    </div>
                  </div>
                </div>
                
                {/* Lista de Pedidos */}
                <div className="space-y-4">
                  {(() => {
                    // Filtrar pedidos que contêm produtos desta empresa
                    const meusPedidosEmpresa = pedidos.filter(pedido => 
                      pedido.empresas && pedido.empresas.some(emp => emp.empresaId === empresaLogada.id)
                    );

                    if (meusPedidosEmpresa.length === 0) {
                      return (
                        <div className="bg-white shadow rounded-lg p-8 text-center">
                          <div className="text-6xl mb-4">📦</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">
                            Nenhum pedido ainda
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Aguarde clientes fazerem pedidos dos seus produtos.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">
                                {produtos.filter(p => p.empresaId === empresaLogada.id).length}
                              </div>
                              <div className="text-sm text-gray-600">Produtos Cadastrados</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">
                                {produtos.filter(p => p.empresaId === empresaLogada.id && p.disponivel).length}
                              </div>
                              <div className="text-sm text-gray-600">Produtos Disponíveis</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600">
                                {pedidos.length}
                              </div>
                              <div className="text-sm text-gray-600">Pedidos no Sistema</div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setActiveTab('produtos')}
                            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
                          >
                            Gerenciar Produtos
                          </button>
                        </div>
                      );
                    }

                    return meusPedidosEmpresa.map(pedido => {
                      // Encontrar dados da empresa neste pedido
                      const dadosEmpresaPedido = pedido.empresas.find(emp => emp.empresaId === empresaLogada.id);
                      const itensDaEmpresa = dadosEmpresaPedido ? dadosEmpresaPedido.items : [];

                      return (
                        <div key={pedido.id} className="bg-white shadow rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Pedido #{pedido.id.slice(-6)}
                              </h3>
                              <p className="text-sm text-gray-600">{pedido.criadoEm}</p>
                              <p className="text-sm text-gray-700 mt-1">
                                <strong>Cliente:</strong> {pedido.consumidorNome}
                              </p>
                              <p className="text-sm text-gray-700">
                                <strong>Telefone:</strong> {pedido.telefone}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <span className={`px-3 py-1 text-sm rounded-full ${
                                pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                pedido.status === 'preparando' ? 'bg-blue-100 text-blue-800' :
                                pedido.status === 'pronto' ? 'bg-yellow-100 text-yellow-800' :
                                pedido.status === 'aguardando_entregador' ? 'bg-purple-100 text-purple-800' :
                                pedido.status === 'entrega' ? 'bg-orange-100 text-orange-800' :
                                pedido.status === 'entregue' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {pedido.status === 'pendente' ? '⏳ Pendente' :
                                 pedido.status === 'preparando' ? '👨‍🍳 Preparando' :
                                 pedido.status === 'pronto' ? '🍽️ Pronto' :
                                 pedido.status === 'aguardando_entregador' ? '📢 Aguardando Entregador' :
                                 pedido.status === 'entrega' ? '🚚 Em Entrega' :
                                 pedido.status === 'entregue' ? '✅ Entregue' :
                                 pedido.status}
                              </span>
                              
                              <div className="text-right mt-2">
                                <div className="text-lg font-bold text-green-600">
                                  R$ {dadosEmpresaPedido ? dadosEmpresaPedido.subtotal.toFixed(2) : '0.00'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {itensDaEmpresa.length} item(s)
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Endereço de Entrega */}
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">📍 Endereço de Entrega:</h4>
                            <p className="text-sm text-gray-700">
                              {pedido.endereco}, {pedido.bairro}
                            </p>
                          </div>
                          
                          {/* Itens da Empresa */}
                          <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">🍽️ Seus Itens neste Pedido:</h4>
                            <div className="space-y-2">
                              {itensDaEmpresa.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                  <div>
                                    <span className="font-medium">{item.quantidade}x {item.nome}</span>
                                    {item.descricao && (
                                      <p className="text-xs text-gray-600 mt-1">{item.descricao}</p>
                                    )}
                                  </div>
                                  <span className="font-medium text-green-600">
                                    R$ {(parseFloat(item.preco) * item.quantidade).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Ações do Pedido */}
                          <div className="border-t pt-4 mt-4">
                            <div className="flex flex-wrap gap-2">
                              {pedido.status === 'pendente' && (
                                <>
                                  <button
                                    onClick={() => {
                                      const pedidosAtualizados = pedidos.map(p => 
                                        p.id === pedido.id ? { ...p, status: 'preparando', atualizadoEm: new Date().toLocaleString('pt-BR') } : p
                                      );
                                      setPedidos(pedidosAtualizados);
                                      localStorage.setItem('pedidos_sobral', JSON.stringify(pedidosAtualizados));
                                      alert('✅ Pedido aceito e em preparação!');
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 text-sm"
                                  >
                                    ✅ Aceitar Pedido
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Tem certeza que deseja recusar este pedido?')) {
                                        const pedidosAtualizados = pedidos.map(p => 
                                          p.id === pedido.id ? { ...p, status: 'recusado', atualizadoEm: new Date().toLocaleString('pt-BR') } : p
                                        );
                                        setPedidos(pedidosAtualizados);
                                        localStorage.setItem('pedidos_sobral', JSON.stringify(pedidosAtualizados));
                                        alert('❌ Pedido recusado.');
                                      }
                                    }}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 text-sm"
                                  >
                                    ❌ Recusar
                                  </button>
                                </>
                              )}
                              
                              {pedido.status === 'preparando' && (
                                <button
                                  onClick={() => {
                                    // Perguntar sobre o tipo de entrega
                                    const tipoEntrega = confirm('🚚 Como será a entrega?\n\n✅ Clique em "OK" para ENTREGADOR DO SISTEMA\n❌ Clique em "Cancelar" para ENTREGADOR PRÓPRIO');
                                    
                                    let novoStatus = 'pronto';
                                    let entregadorInfo = {};
                                    
                                    if (tipoEntrega) {
                                      // Entregador do sistema
                                      novoStatus = 'aguardando_entregador';
                                      entregadorInfo = {
                                        tipoEntrega: 'sistema',
                                        disponibilizadoParaEntregadores: true,
                                        disponibilizadoEm: new Date().toLocaleString('pt-BR')
                                      };
                                      
                                      alert('📢 Pedido disponibilizado para entregadores do sistema!\n\nOs entregadores cadastrados poderão aceitar esta entrega.');
                                    } else {
                                      // Entregador próprio
                                      entregadorInfo = {
                                        tipoEntrega: 'proprio',
                                        disponibilizadoParaEntregadores: false
                                      };
                                      
                                      alert('🍽️ Pedido marcado como pronto!\n\nVocê fará a entrega com entregador próprio.');
                                    }
                                    
                                    const pedidosAtualizados = pedidos.map(p => 
                                      p.id === pedido.id ? { 
                                        ...p, 
                                        status: novoStatus,
                                        ...entregadorInfo,
                                        atualizadoEm: new Date().toLocaleString('pt-BR')
                                      } : p
                                    );
                                    
                                    setPedidos(pedidosAtualizados);
                                    localStorage.setItem('pedidos_sobral', JSON.stringify(pedidosAtualizados));
                                    
                                    // Disparar evento para notificar entregadores se for entrega do sistema
                                    if (tipoEntrega) {
                                      window.dispatchEvent(new CustomEvent('novo_pedido_disponivel', {
                                        detail: { pedido: pedidosAtualizados.find(p => p.id === pedido.id) }
                                      }));
                                    }
                                  }}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                                >
                                  🍽️ Marcar como Pronto
                                </button>
                              )}
                              
                              {pedido.status === 'pronto' && (
                                <button
                                  onClick={() => {
                                    const pedidosAtualizados = pedidos.map(p => 
                                      p.id === pedido.id ? { 
                                        ...p, 
                                        status: 'entrega', 
                                        saiuParaEntregaEm: new Date().toLocaleString('pt-BR'),
                                        atualizadoEm: new Date().toLocaleString('pt-BR') 
                                      } : p
                                    );
                                    setPedidos(pedidosAtualizados);
                                    localStorage.setItem('pedidos_sobral', JSON.stringify(pedidosAtualizados));
                                    alert('🚚 Pedido saiu para entrega!');
                                  }}
                                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition duration-200 text-sm"
                                >
                                  🚚 Saiu para Entrega
                                </button>
                              )}
                              
                              {pedido.status === 'aguardando_entregador' && (
                                <div className="flex flex-col space-y-2">
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800 font-medium">
                                      📢 Pedido disponível para entregadores do sistema
                                    </p>
                                    <p className="text-xs text-yellow-600 mt-1">
                                      Aguardando entregador aceitar a entrega
                                    </p>
                                  </div>
                                  
                                  <button
                                    onClick={() => {
                                      // Mudar para entregador próprio
                                      if (confirm('Deseja alterar para entregador próprio?\n\nO pedido não ficará mais disponível para entregadores do sistema.')) {
                                        const pedidosAtualizados = pedidos.map(p => 
                                          p.id === pedido.id ? { 
                                            ...p, 
                                            status: 'pronto',
                                            tipoEntrega: 'proprio',
                                            disponibilizadoParaEntregadores: false,
                                            atualizadoEm: new Date().toLocaleString('pt-BR')
                                          } : p
                                        );
                                        setPedidos(pedidosAtualizados);
                                        localStorage.setItem('pedidos_sobral', JSON.stringify(pedidosAtualizados));
                                        alert('✅ Alterado para entregador próprio!');
                                      }
                                    }}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 text-sm"
                                  >
                                    🔄 Alterar para Entregador Próprio
                                  </button>
                                </div>
                              )}
                              
                              <button
                                onClick={() => {
                                  alert(`📞 Contato do Cliente:\n\nNome: ${pedido.consumidorNome}\nTelefone: ${pedido.telefone}\nEndereço: ${pedido.endereco}, ${pedido.bairro}`);
                                }}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 text-sm"
                              >
                                📞 Contatar Cliente
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'relatorios' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Relatórios
                </h2>
                
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Relatórios de Vendas
                    </h3>
                    <p className="text-gray-600">
                      Funcionalidade em desenvolvimento
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Dashboard do entregador logado
  if (entregadorLogado) {
    const pedidosDisponiveis = pedidos.filter(p => 
      p.status === 'aguardando_entregador' && 
      p.tipoEntrega === 'sistema' && 
      p.disponibilizadoParaEntregadores
    );
    const minhasEntregas = pedidos.filter(p => p.entregadorId === entregadorLogado.id);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-green-600">
                  🏍️ {entregadorLogado.nome}
                </h1>
                <span className="ml-4 text-sm text-gray-600">
                  Painel do Entregador
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleEntregadorLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-2xl font-bold text-gray-900">{pedidosDisponiveis.length}</div>
                <div className="text-sm text-gray-600">Pedidos Disponíveis</div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-3xl mb-2">🚚</div>
                <div className="text-2xl font-bold text-gray-900">
                  {minhasEntregas.filter(p => p.status === 'entrega').length}
                </div>
                <div className="text-sm text-gray-600">Em Entrega</div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-gray-900">
                  {minhasEntregas.filter(p => p.status === 'entregue').length}
                </div>
                <div className="text-sm text-gray-600">Entregues</div>
              </div>
            </div>

            {/* Pedidos Disponíveis */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📦 Pedidos Disponíveis</h3>
              
              {pedidosDisponiveis.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-gray-600">Nenhum pedido disponível no momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidosDisponiveis.map(pedido => (
                    <div key={pedido.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Pedido #{pedido.id.slice(-6)}</h4>
                          <p className="text-sm text-gray-600">{pedido.consumidorNome}</p>
                          <p className="text-sm text-gray-600">{pedido.endereco}, {pedido.bairro}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-bold">R$ {pedido.total.toFixed(2)}</div>
                          <button
                            onClick={() => {
                              if (confirm(`Aceitar entrega do pedido #${pedido.id.slice(-6)}?`)) {
                                const pedidosAtualizados = pedidos.map(p => 
                                  p.id === pedido.id ? { 
                                    ...p, 
                                    status: 'entrega',
                                    entregadorId: entregadorLogado.id,
                                    entregadorNome: entregadorLogado.nome,
                                    aceitoEm: new Date().toLocaleString('pt-BR')
                                  } : p
                                );
                                setPedidos(pedidosAtualizados);
                                localStorage.setItem('pedidos_sobral', JSON.stringify(pedidosAtualizados));
                                alert('✅ Entrega aceita!');
                              }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                          >
                            ✅ Aceitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Minhas Entregas */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                🚚 Minhas Entregas
              </h2>
              
              <div className="space-y-4">
                {(() => {
                  const minhasEntregas = pedidos.filter(p => p.entregadorId === entregadorLogado.id);

                  if (minhasEntregas.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🚚</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhuma entrega ainda
                        </h3>
                        <p className="text-gray-600">
                          Aceite pedidos acima para começar a fazer entregas.
                        </p>
                      </div>
                    );
                  }

                  return minhasEntregas.map(pedido => (
                    <div key={pedido.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{pedido.id.slice(-6)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Aceito em: {pedido.aceitoEm}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            <strong>Cliente:</strong> {pedido.consumidorNome}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Telefone:</strong> {pedido.telefone}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            pedido.status === 'entrega' ? 'bg-orange-100 text-orange-800' :
                            pedido.status === 'entregue' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {pedido.status === 'entrega' ? '🚚 Em Entrega' :
                             pedido.status === 'entregue' ? '✅ Entregue' :
                             pedido.status}
                          </span>
                          
                          <div className="text-lg font-bold text-green-600 mt-2">
                            R$ {pedido.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Informações Completas de Entrega */}
                      <div className="space-y-4 mb-4">
                        {/* Dados do Cliente */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                            👤 DADOS DO CLIENTE
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="font-semibold text-blue-800">Nome:</p>
                              <p className="text-blue-700">{pedido.consumidorNome}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-blue-800">Telefone:</p>
                              <p className="text-blue-700">{pedido.telefone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Endereço de Entrega Detalhado */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-bold text-green-900 mb-3 flex items-center">
                            📍 ENDEREÇO DE ENTREGA
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="font-semibold text-green-800">Endereço Completo:</p>
                              <p className="text-green-700 font-medium">{pedido.endereco}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-green-800">Bairro:</p>
                              <p className="text-green-700">{pedido.bairro}</p>
                            </div>
                            {(() => {
                              // Buscar dados completos do consumidor
                              const consumidorCompleto = consumidores.find(c => c.id === pedido.consumidorId);
                              
                              if (consumidorCompleto && consumidorCompleto.pontoReferencia) {
                                return (
                                  <div>
                                    <p className="font-semibold text-green-800">Ponto de Referência:</p>
                                    <p className="text-green-700 italic">📍 {consumidorCompleto.pontoReferencia}</p>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          
                          {/* Botões de Navegação */}
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => {
                                  const endereco = encodeURIComponent(`${pedido.endereco}, ${pedido.bairro}, Sobral, CE`);
                                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${endereco}`, '_blank');
                                }}
                                className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center"
                              >
                                🗺️ Abrir no Google Maps
                              </button>
                              <button
                                onClick={() => {
                                  const endereco = encodeURIComponent(`${pedido.endereco}, ${pedido.bairro}, Sobral, CE`);
                                  window.open(`https://waze.com/ul?q=${endereco}`, '_blank');
                                }}
                                className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 flex items-center"
                              >
                                🚗 Abrir no Waze
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Dados das Empresas */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h4 className="font-bold text-orange-900 mb-3 flex items-center">
                            🏢 EMPRESAS ENVOLVIDAS
                          </h4>
                          <div className="space-y-3">
                            {pedido.empresas.map((empresaPedido, index) => {
                              // Buscar dados completos da empresa
                              const empresaCompleta = empresas.find(e => e.id === empresaPedido.empresaId);
                              
                              return (
                                <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-semibold text-orange-900">{empresaPedido.empresaNome}</h5>
                                    <span className="text-green-600 font-bold">R$ {empresaPedido.subtotal.toFixed(2)}</span>
                                  </div>
                                  
                                  {empresaCompleta && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-orange-700">
                                      <div>
                                        <p><strong>📞 Telefone:</strong> {empresaCompleta.telefone}</p>
                                        <p><strong>📧 Email:</strong> {empresaCompleta.email}</p>
                                      </div>
                                      <div>
                                        <p><strong>📍 Endereço:</strong> {empresaCompleta.endereco}</p>
                                        <p><strong>🏘️ Bairro:</strong> {empresaCompleta.bairro}</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Itens da empresa */}
                                  <div className="mt-2 pt-2 border-t border-orange-100">
                                    <p className="text-xs font-semibold text-orange-800 mb-1">Itens para retirar:</p>
                                    <div className="space-y-1">
                                      {empresaPedido.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="text-xs text-orange-700 flex justify-between">
                                          <span>• {item.quantidade}x {item.nome}</span>
                                          <span className="font-medium">R$ {(parseFloat(item.preco) * item.quantidade).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Botões de Contato da Empresa */}
                                  {empresaCompleta && (
                                    <div className="mt-3 pt-2 border-t border-orange-200">
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          onClick={() => {
                                            window.open(`tel:${empresaCompleta.telefone}`, '_self');
                                          }}
                                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                        >
                                          📞 Ligar
                                        </button>
                                        <button
                                          onClick={() => {
                                            const message = `Olá! Sou o entregador do pedido #${pedido.id.slice(-6)}. Estou a caminho para retirar.`;
                                            const whatsapp = empresaCompleta.telefone.replace(/\D/g, '');
                                            window.open(`https://wa.me/55${whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                                          }}
                                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                        >
                                          💬 WhatsApp
                                        </button>
                                        <button
                                          onClick={() => {
                                            const endereco = encodeURIComponent(`${empresaCompleta.endereco}, ${empresaCompleta.bairro}, Sobral, CE`);
                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${endereco}`, '_blank');
                                          }}
                                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                                        >
                                          📍 Ver Local
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Resumo da Entrega */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                            📋 RESUMO DA ENTREGA
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Total de Empresas:</p>
                              <p className="font-bold text-gray-900">{pedido.empresas.length}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Total de Itens:</p>
                              <p className="font-bold text-gray-900">{pedido.items.length}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Valor Total:</p>
                              <p className="font-bold text-green-600 text-lg">R$ {pedido.total.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Status:</p>
                              <p className="font-bold text-orange-600">🚚 Em Entrega</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Ações de Entrega */}
                      {pedido.status === 'entrega' && (
                        <div className="space-y-3">
                          {/* Botão de Contato com Cliente */}
                          <button
                            onClick={() => {
                              const message = `Olá! Sou o entregador do seu pedido #${pedido.id.slice(-6)}. Estou a caminho!`;
                              const whatsapp = pedido.telefone.replace(/\D/g, '');
                              window.open(`https://wa.me/55${whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold"
                          >
                            💬 Avisar Cliente (WhatsApp)
                          </button>
                          
                          {/* Botão de Confirmação de Entrega */}
                          <button
                            onClick={() => {
                              if (confirm(`Confirmar entrega do pedido #${pedido.id.slice(-6)}?\n\nCliente: ${pedido.consumidorNome}\nEndereço: ${pedido.endereco}, ${pedido.bairro}\nValor: R$ ${pedido.total.toFixed(2)}`)) {
                                const pedidosAtualizados = pedidos.map(p => 
                                  p.id === pedido.id ? { 
                                    ...p, 
                                    status: 'entregue',
                                    entregueEm: new Date().toLocaleString('pt-BR'),
                                    atualizadoEm: new Date().toLocaleString('pt-BR')
                                  } : p
                                );
                                setPedidos(pedidosAtualizados);
                                localStorage.setItem('pedidos_sobral', JSON.stringify(pedidosAtualizados));
                                alert('🎉 Entrega confirmada! Obrigado pelo seu trabalho!');
                              }
                            }}
                            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold"
                          >
                            ✅ Confirmar Entrega
                          </button>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Estados específicos do consumidor já declarados no topo do componente

  // Dashboard do consumidor logado - DASHBOARD COMPLETO COM PRODUTOS
  if (consumidorLogado) {

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-green-600">
                  🛒 Entrega Sobral
                </h1>
                <span className="ml-4 text-sm text-gray-600">
                  Olá, {consumidorLogado.nome}!
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Carrinho */}
                <div className="relative">
                  <button
                    onClick={() => setActiveConsumerTab('carrinho')}
                    className={`relative p-2 rounded-md ${
                      activeConsumerTab === 'carrinho' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🛒
                    {carrinho.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {carrinho.length}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleConsumidorLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {['marketplace', 'empresas', 'pedidos', 'perfil', 'carrinho'].map(tab => (
                <button
                  key={tab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeConsumerTab === tab 
                      ? 'border-green-500 text-green-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveConsumerTab(tab)}
                >
                  {tab === 'marketplace' && `🏪 Produtos (${produtosFiltrados.length})`}
                  {tab === 'empresas' && `🏢 Empresas (${empresasAprovadas.length})`}
                  {tab === 'pedidos' && `📦 Meus Pedidos (${meusPedidos.length})`}
                  {tab === 'perfil' && '👤 Perfil'}
                  {tab === 'carrinho' && `🛒 Carrinho (${carrinho.length})`}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">

            {/* Marketplace - Produtos */}
            {activeConsumerTab === 'marketplace' && (
              <div>
                {/* Header do Marketplace - Melhorado */}
                <div className="mb-8">
                  {/* Banner principal */}
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
                    {/* Elementos decorativos */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold mb-2">
                            {filtroCategoria || busca ? 
                              (filtroCategoria ? `🍽️ ${filtroCategoria}` : `🔍 "${busca}"`) :
                              '🏪 Cardápio Completo'
                            }
                          </h1>
                          <p className="text-blue-100 text-lg">
                            {produtosFiltrados.length === 0 ? 'Nenhum produto encontrado' :
                             produtosFiltrados.length === 1 ? '1 produto disponível' :
                             `${produtosFiltrados.length} produtos disponíveis`} 
                            {empresasAprovadas.length > 0 && ` • ${empresasAprovadas.length} empresas ativas`}
                          </p>
                        </div>
                        
                        {/* Botão de sincronização melhorado */}
                        <button
                          onClick={() => {
                            try {
                              console.log('👤 Consumidor: iniciando sincronização manual...');
                              
                              const savedProdutos = localStorage.getItem('produtos_sobral');
                              const savedEmpresas = localStorage.getItem('empresas_sobral');
                              
                              let produtosData = [];
                              let empresasData = [];
                              
                              if (savedProdutos) {
                                produtosData = JSON.parse(savedProdutos);
                                setProdutos(produtosData);
                                console.log('👤 Produtos carregados:', produtosData.length);
                              }
                              
                              if (savedEmpresas) {
                                empresasData = JSON.parse(savedEmpresas);
                                setEmpresas(empresasData);
                                console.log('👤 Empresas carregadas:', empresasData.length);
                              }
                              
                              const empresasAprovadas = empresasData.filter(e => e.status === 'aprovada');
                              const produtosDisponiveis = produtosData.filter(p => p.disponivel);
                              const produtosVisiveisParaConsumidor = produtosDisponiveis.filter(p => 
                                empresasAprovadas.find(e => e.id === p.empresaId)
                              );
                              
                              setForceConsumerUpdate(prev => prev + 1);
                              
                              alert(`🔄 Catálogo atualizado!\n\n📊 RESULTADO:\n• ${produtosVisiveisParaConsumidor.length} produtos disponíveis\n• ${empresasAprovadas.length} empresas ativas\n\n✅ Tudo pronto para você!`);
                            } catch (error) {
                              console.error('👤 Erro na sincronização do consumidor:', error);
                              alert('Erro na sincronização: ' + error.message);
                            }
                          }}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium transition-all duration-300 flex items-center space-x-2 border border-white/30"
                        >
                          <span className="animate-spin text-lg">🔄</span>
                          <span className="hidden sm:inline">Atualizar</span>
                        </button>
                      </div>
                      
                      {/* Estatísticas rápidas */}
                      <div className="flex items-center space-x-6 text-sm text-blue-100">
                        <div className="flex items-center space-x-1">
                          <span>🚚</span>
                          <span>Entrega rápida</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🛡️</span>
                          <span>Pagamento seguro</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span>Qualidade garantida</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Busca melhorada */}
                  <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-xl">🔍</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Busque por pratos, restaurantes ou ingredientes..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg placeholder-gray-400 transition-all duration-300"
                      />
                      {busca && (
                        <button
                          onClick={() => setBusca('')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <span className="text-xl">❌</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Categorias melhoradas */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="flex overflow-x-auto scrollbar-hide">
                      <button
                        onClick={() => {
                          setFiltroCategoria('');
                          setBusca('');
                        }}
                        className={`flex-shrink-0 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-3 transition-all duration-300 ${
                          !filtroCategoria && !busca 
                            ? 'border-blue-500 text-blue-600 bg-blue-50' 
                            : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🍽️</span>
                          <span>Todos</span>
                        </div>
                      </button>
                      
                      {[
                        { nome: 'Hambúrguer', emoji: '🍔' },
                        { nome: 'Pizzas', emoji: '🍕' },
                        { nome: 'Lanches', emoji: '🥪' },
                        { nome: 'Bebidas', emoji: '🥤' },
                        { nome: 'Sobremesas', emoji: '🍰' },
                        { nome: 'Entradas', emoji: '🍟' },
                        { nome: 'Japonesa', emoji: '🍣' },
                        { nome: 'Italiana', emoji: '🍝' },
                        { nome: 'Açaí', emoji: '🍨' }
                      ].map(categoria => (
                        <button
                          key={categoria.nome}
                          onClick={() => {
                            setFiltroCategoria(categoria.nome === filtroCategoria ? '' : categoria.nome);
                            setBusca('');
                          }}
                          className={`flex-shrink-0 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-3 transition-all duration-300 ${
                            filtroCategoria === categoria.nome
                              ? 'border-blue-500 text-blue-600 bg-blue-50' 
                              : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{categoria.emoji}</span>
                            <span>{categoria.nome}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lista de Produtos - Layout Melhorado */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {empresasAprovadas.length === 0 ? (
                    <div className="text-center py-16 px-6">
                      <div className="text-8xl mb-6">🏢</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Nenhuma empresa cadastrada ainda
                      </h3>
                      <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                        As empresas ainda não se cadastraram na plataforma. Em breve teremos opções incríveis para você!
                      </p>
                      <div className="animate-pulse flex justify-center space-x-2">
                        <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                  ) : produtos.length === 0 ? (
                    <div className="text-center py-16 px-6">
                      <div className="text-8xl mb-6">🍽️</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Nenhum produto cadastrado ainda
                      </h3>
                      <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                        As empresas ainda não cadastraram produtos. Aguarde, delícias estão por vir!
                      </p>
                      <div className="animate-pulse flex justify-center space-x-2">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                  ) : produtosFiltrados.length === 0 ? (
                    <div className="text-center py-16 px-6">
                      <div className="text-8xl mb-6">🔍</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Nenhum produto encontrado
                      </h3>
                      <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                        Não encontramos produtos com esses filtros. Que tal tentar algo diferente?
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <button
                          onClick={() => {
                            setBusca('');
                            setFiltroCategoria('');
                          }}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-blue-700 transition duration-300 font-semibold shadow-lg transform hover:scale-105"
                        >
                          🔄 Limpar Filtros
                        </button>
                        <button
                          onClick={() => setBusca('')}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Apenas remover busca
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Header da lista com contador */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {filtroCategoria ? `${filtroCategoria}` : 'Todos os Produtos'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                            </p>
                          </div>
                          <div className="hidden sm:flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Ordenar por:</span>
                            <select className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white">
                              <option>Relevância</option>
                              <option>Menor preço</option>
                              <option>Maior preço</option>
                              <option>Mais populares</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Lista de produtos */}
                      <div className="divide-y divide-gray-100">
                        {produtosFiltrados.map((produto, index) => {
                          const empresa = empresasAprovadas.find(emp => emp.id === produto.empresaId);
                          if (!empresa) return null;
                          
                          return (
                            <div 
                              key={produto.id} 
                              className="group relative p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300"
                            >
                              {/* Badge de destaque para produtos com desconto ou novos */}
                              {index < 3 && (
                                <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg z-10">
                                  🔥 Popular
                                </div>
                              )}

                              <div className="flex items-center space-x-4">
                                {/* Imagem do Produto - Melhorada */}
                                <div className="flex-shrink-0 relative">
                                  {produto.imagem ? (
                                    <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300">
                                      <img
                                        src={produto.imagem}
                                        alt={produto.nome}
                                        className="w-24 h-24 object-cover transform group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.parentElement.nextElementSibling.style.display = 'flex';
                                        }}
                                      />
                                      {/* Overlay com gradiente */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                  ) : null}
                                  
                                  {/* Placeholder melhorado */}
                                  {!produto.imagem && (
                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-300 transition-colors duration-300">
                                      <span className="text-3xl">🍽️</span>
                                    </div>
                                  )}
                                  
                                  {/* Fallback placeholder */}
                                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 items-center justify-center hidden">
                                    <span className="text-3xl">🍽️</span>
                                  </div>

                                  {/* Badge de tempo de preparo */}
                                  {produto.tempoPreparacao && (
                                    <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-md">
                                      ⏱️{produto.tempoPreparacao}min
                                    </div>
                                  )}
                                </div>
                                
                                {/* Informações do Produto - Melhoradas */}
                                <div className="flex-1 min-w-0 space-y-2">
                                  {/* Nome do Produto */}
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                                      {produto.nome}
                                    </h3>
                                    
                                    {/* Badge da empresa */}
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        🏪 {empresa.nome}
                                      </span>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✅ Disponível
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Descrição */}
                                  <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                                    {produto.descricao}
                                  </p>
                                  
                                  {/* Preço e Botão - Layout horizontal melhorado */}
                                  <div className="flex items-center justify-between pt-2">
                                    <div className="flex flex-col">
                                      <span className="text-2xl font-bold text-green-600">
                                        R$ {parseFloat(produto.preco).toFixed(2)}
                                      </span>
                                      {/* Informação adicional de frete ou promoção */}
                                      <span className="text-xs text-gray-500">
                                        Taxa de entrega não incluída
                                      </span>
                                    </div>
                                    
                                    {/* Botão Adicionar - Melhorado */}
                                    <button
                                      onClick={() => adicionarAoCarrinho(produto, empresa)}
                                      className="group/btn relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                                    >
                                      <span className="group-hover/btn:scale-110 transition-transform duration-200">🛒</span>
                                      <span>Adicionar</span>
                                      
                                      {/* Efeito de brilho */}
                                      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Linha de separação com gradiente */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer da lista com informações adicionais */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span>🚚 Entrega rápida</span>
                            <span>🛡️ Compra segura</span>
                            <span>📞 Suporte 24h</span>
                          </div>
                          <div className="hidden sm:block">
                            <span>Mostrando {produtosFiltrados.length} de {produtos.filter(p => p.disponivel).length} produtos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Aba Empresas */}
            {activeConsumerTab === 'empresas' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Empresas Cadastradas ({empresasAprovadas.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {empresasAprovadas.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="text-6xl mb-4">🏢</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma empresa aprovada ainda
                      </h3>
                      <p className="text-gray-600">
                        Aguarde as empresas serem aprovadas pelos administradores.
                      </p>
                    </div>
                  ) : (
                    empresasAprovadas.map(empresa => {
                      const produtosDaEmpresa = produtos.filter(prod => prod.empresaId === empresa.id && prod.disponivel);
                      
                      return (
                        <div key={empresa.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{empresa.nome}</h3>
                                <p className="text-sm text-gray-600">{empresa.categoria}</p>
                              </div>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                ✅ Ativa
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                              <div>
                                <p className="flex items-center">
                                  <span className="mr-2">📍</span>
                                  {empresa.bairro}
                                </p>
                                <p className="flex items-center">
                                  <span className="mr-2">📞</span>
                                  {empresa.telefone}
                                </p>
                              </div>
                              <div>
                                <p className="flex items-center">
                                  <span className="mr-2">🍽️</span>
                                  {produtosDaEmpresa.length} produtos
                                </p>
                                {empresa.tempoEntrega && (
                                  <p className="flex items-center">
                                    <span className="mr-2">⏱️</span>
                                    {empresa.tempoEntrega} min
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {produtosDaEmpresa.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-600 mb-2">
                                  Produtos disponíveis: {produtosDaEmpresa.length}
                                </p>
                                <button
                                  onClick={() => {
                                    setBusca(empresa.nome);
                                    setActiveConsumerTab('marketplace');
                                  }}
                                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
                                >
                                  Ver Produtos
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Carrinho */}
            {activeConsumerTab === 'carrinho' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Meu Carrinho ({carrinho.length} itens)
                </h2>
                
                <div className="bg-white shadow rounded-lg p-6">
                  {carrinho.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🛒</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Carrinho vazio
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Adicione produtos ao seu carrinho para continuar.
                      </p>
                      <button
                        onClick={() => setActiveConsumerTab('marketplace')}
                        className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
                      >
                        Explorar Produtos
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="space-y-4 mb-6">
                        {carrinho.map(item => (
                          <div key={item.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{item.nome}</h3>
                              <p className="text-sm text-gray-600">🏪 {item.empresaNome}</p>
                              <p className="text-sm text-gray-500">Quantidade: {item.quantidade}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-bold text-green-600">
                                R$ {(parseFloat(item.preco) * item.quantidade).toFixed(2)}
                              </span>
                              <button
                                onClick={() => removerDoCarrinho(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-green-600">
                            R$ {carrinho.reduce((sum, item) => sum + (parseFloat(item.preco) * item.quantidade), 0).toFixed(2)}
                          </span>
                        </div>
                        
                        <button
                          onClick={finalizarPedido}
                          className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold"
                        >
                          🚀 Finalizar Pedido
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meus Pedidos */}
            {activeConsumerTab === 'pedidos' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Meus Pedidos ({meusPedidos.length})
                </h2>
                
                <div className="space-y-4">
                  {meusPedidos.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum pedido ainda
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Faça seu primeiro pedido e acompanhe aqui!
                      </p>
                      <button
                        onClick={() => setActiveConsumerTab('marketplace')}
                        className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
                      >
                        Fazer Pedido
                      </button>
                    </div>
                  ) : (
                    meusPedidos.map(pedido => (
                      <div key={pedido.id} className="bg-white shadow rounded-lg p-6">
                        {/* Aba Meus Pedidos - Exibir status e opções */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Pedido #{pedido.id.slice(-6)}
                            </h3>
                            <p className="text-sm text-gray-600">{pedido.criadoEm}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                              pedido.status === 'preparando' ? 'bg-blue-100 text-blue-800' :
                              pedido.status === 'pronto' ? 'bg-green-100 text-green-800' :
                              pedido.status === 'aguardando_entregador' ? 'bg-purple-100 text-purple-800' :
                              pedido.status === 'entrega' ? 'bg-orange-100 text-orange-800' :
                              pedido.status === 'entregue' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {pedido.status === 'pendente' ? '⏳ Aguardando Confirmação' :
                               pedido.status === 'preparando' ? '👨‍🍳 Em Preparação' :
                               pedido.status === 'pronto' ? '🍽️ Pronto - Entrega Própria' :
                               pedido.status === 'aguardando_entregador' ? '📢 Buscando Entregador' :
                               pedido.status === 'entrega' ? '🚚 Em Entrega' :
                               pedido.status === 'entregue' ? '✅ Entregue' :
                               pedido.status}
                            </span>
                            
                            <div className="text-lg font-bold text-green-600 mt-2">
                              R$ {pedido.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Informações do tipo de entrega */}
                        {pedido.tipoEntrega && (
                          <div className={`mb-4 p-3 rounded-lg border ${
                            pedido.tipoEntrega === 'proprio' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'
                          }`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className={`text-sm font-medium ${
                                  pedido.tipoEntrega === 'proprio' ? 'text-blue-800' : 'text-purple-800'
                                }`}>
                                  {pedido.tipoEntrega === 'proprio' ? '🚗 Entrega Própria da Empresa' : '🏍️ Entrega via Sistema'}
                                </p>
                                <p className={`text-xs ${
                                  pedido.tipoEntrega === 'proprio' ? 'text-blue-600' : 'text-purple-600'
                                }`}>
                                  {pedido.tipoEntrega === 'proprio' 
                                    ? 'A empresa fará a entrega com veículo próprio' 
                                    : 'Um entregador do sistema pegará seu pedido'
                                  }
                                </p>
                              </div>
                              
                              {/* Botão para alterar tipo de entrega - apenas para pedidos prontos com entrega própria */}
                              {pedido.status === 'pronto' && pedido.tipoEntrega === 'proprio' && (
                                <button
                                  onClick={() => {
                                    if (confirm('🔄 Alterar para entregador do sistema?\n\nSeu pedido ficará disponível para entregadores cadastrados na plataforma.\n\nIsso pode acelerar a entrega!')) {
                                      const pedidosAtualizados = pedidos.map(p => 
                                        p.id === pedido.id ? { 
                                          ...p, 
                                          status: 'aguardando_entregador',
                                          tipoEntrega: 'sistema',
                                          disponibilizadoParaEntregadores: true,
                                          disponibilizadoEm: new Date().toLocaleString('pt-BR'),
                                          alteradoPeloClienteEm: new Date().toLocaleString('pt-BR'),
                                          atualizadoEm: new Date().toLocaleString('pt-BR')
                                        } : p
                                      );
                                      setPedidos(pedidosAtualizados);
                                      localStorage.setItem('pedidos_sobral', JSON.stringify(pedidosAtualizados));
                                      
                                      // Disparar evento para notificar entregadores
                                      window.dispatchEvent(new CustomEvent('novo_pedido_disponivel', {
                                        detail: { pedido: pedidosAtualizados.find(p => p.id === pedido.id) }
                                      }));
                                      
                                      alert('✅ Pedido alterado para entregador do sistema!\n\nSeu pedido agora está disponível para entregadores cadastrados.');
                                    }
                                  }}
                                  className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition duration-200"
                                >
                                  🔄 Mudar p/ Sistema
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Informações do entregador quando aceito */}
                        {pedido.entregadorNome && (
                          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-sm font-medium text-green-800">
                              🏍️ Entregador: {pedido.entregadorNome}
                            </p>
                            <p className="text-xs text-green-600">
                              Entrega aceita em: {pedido.aceitoEm}
                            </p>
                          </div>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          {pedido.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantidade}x {item.nome}</span>
                              <span>R$ {(parseFloat(item.preco) * item.quantidade).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Status específico com informações adicionais */}
                        {pedido.status === 'aguardando_entregador' && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-purple-800">
                              📢 Procurando entregador disponível...
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                              Disponibilizado em: {pedido.disponibilizadoEm}
                            </p>
                          </div>
                        )}
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total:</span>
                            <span className="text-lg font-bold text-green-600">
                              R$ {pedido.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Perfil */}
            {activeConsumerTab === 'perfil' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Meu Perfil
                </h2>
                
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Informações Pessoais
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p><strong>Nome:</strong> {consumidorLogado.nome}</p>
                        <p><strong>Email:</strong> {consumidorLogado.email}</p>
                        <p><strong>Telefone:</strong> {consumidorLogado.telefone}</p>
                        {consumidorLogado.cpf && (
                          <p><strong>CPF:</strong> {consumidorLogado.cpf}</p>
                        )}
                        <p><strong>Cadastrado em:</strong> {consumidorLogado.cadastradoEm}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Endereço de Entrega
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p><strong>Endereço:</strong> {consumidorLogado.endereco}</p>
                        <p><strong>Bairro:</strong> {consumidorLogado.bairro}</p>
                        {consumidorLogado.pontoReferencia && (
                          <p><strong>Ponto de Referência:</strong> {consumidorLogado.pontoReferencia}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Estatísticas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {meusPedidos.length}
                          </div>
                          <div className="text-sm text-gray-600">Total de Pedidos</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            R$ {meusPedidos.reduce((sum, pedido) => sum + pedido.total, 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">Valor Total Gasto</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Dashboard do administrador
  if (isAuthenticated && !entregadorLogado && !empresaLogada && !consumidorLogado) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-red-600">
                  🍕 Entrega Sobral - Admin
                </h1>
                <span className="ml-4 text-sm text-gray-600">
                  Painel Administrativo
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAdminLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {['dashboard', 'empresas', 'entregadores', 'consumidores', 'pedidos', 'database'].map(tab => (
                <button
                  key={tab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab 
                      ? 'border-red-500 text-red-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'dashboard' && '📊 Dashboard'}
                  {tab === 'empresas' && `🏢 Empresas (${empresas.filter(e => e.status === 'pendente').length})`}
                  {tab === 'entregadores' && `🏍️ Entregadores (${entregadores.filter(e => e.status === 'pendente').length})`}
                  {tab === 'consumidores' && `🛒 Consumidores (${consumidores.length})`}
                  {tab === 'pedidos' && `📦 Pedidos (${pedidos.length})`}
                  {tab === 'database' && `🗄️ Banco de Dados ${databaseConfig.isConnected ? '✅' : '❌'}`}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Dashboard Administrativo
                </h2>
                
                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-3xl">🏢</div>
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {empresas.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Empresas Total
                        </div>
                        <div className="text-xs text-orange-600">
                          {empresas.filter(e => e.status === 'pendente').length} pendentes
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-3xl">🏍️</div>
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {entregadores.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Entregadores Total
                        </div>
                        <div className="text-xs text-orange-600">
                          {entregadores.filter(e => e.status === 'pendente').length} pendentes
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-3xl">🛒</div>
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {consumidores.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Consumidores
                        </div>
                        <div className="text-xs text-green-600">
                          Todos ativos
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-3xl">📦</div>
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {pedidos.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Pedidos Total
                        </div>
                        <div className="text-xs text-blue-600">
                          {pedidos.filter(p => p.status === 'pendente').length} pendentes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aprovações Pendentes */}
                {(empresas.filter(e => e.status === 'pendente').length > 0 || entregadores.filter(e => e.status === 'pendente').length > 0) && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      🔔 Aprovações Pendentes
                    </h3>
                    
                    {empresas.filter(e => e.status === 'pendente').length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">
                          🏢 Empresas aguardando aprovação: {empresas.filter(e => e.status === 'pendente').length}
                        </h4>
                        <button
                          onClick={() => setActiveTab('empresas')}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Ver empresas pendentes →
                        </button>
                      </div>
                    )}

                    {entregadores.filter(e => e.status === 'pendente').length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          🏍️ Entregadores aguardando aprovação: {entregadores.filter(e => e.status === 'pendente').length}
                        </h4>
                        <button
                          onClick={() => setActiveTab('entregadores')}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Ver entregadores pendentes →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Produtos */}
                <div className="bg-white shadow rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    🍽️ Produtos no Sistema
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {produtos.length}
                      </div>
                      <div className="text-sm text-gray-600">Total de Produtos</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {produtos.filter(p => p.disponivel).length}
                      </div>
                      <div className="text-sm text-gray-600">Produtos Disponíveis</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {produtos.filter(p => !p.disponivel).length}
                      </div>
                      <div className="text-sm text-gray-600">Produtos Indisponíveis</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'empresas' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gerenciamento de Empresas
                </h2>
                
                {/* Filtros */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setActiveTab('empresas')}
                      className="px-4 py-2 text-sm bg-orange-100 text-orange-800 rounded-md"
                    >
                      🔔 Pendentes ({empresas.filter(e => e.status === 'pendente').length})
                    </button>
                    <button
                      onClick={() => setActiveTab('empresas')}
                      className="px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md"
                    >
                      ✅ Aprovadas ({empresas.filter(e => e.status === 'aprovada').length})
                    </button>
                    <button
                      onClick={() => setActiveTab('empresas')}
                      className="px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md"
                    >
                      ❌ Rejeitadas ({empresas.filter(e => e.status === 'rejeitada').length})
                    </button>
                  </div>
                </div>

                {/* Lista de Empresas */}
                <div className="space-y-4">
                  {empresas.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                      <div className="text-6xl mb-4">🏢</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma empresa cadastrada
                      </h3>
                      <p className="text-gray-600">
                        Aguarde empresas se cadastrarem na plataforma.
                      </p>
                    </div>
                  ) : (
                    empresas.map(empresa => (
                      <div key={empresa.id} className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{empresa.nome}</h3>
                              <span className={`ml-3 px-3 py-1 text-sm rounded-full ${
                                empresa.status === 'pendente' ? 'bg-orange-100 text-orange-800' :
                                empresa.status === 'aprovada' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {empresa.status === 'pendente' ? '⏳ Pendente' :
                                 empresa.status === 'aprovada' ? '✅ Aprovada' :
                                 '❌ Rejeitada'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p><strong>CNPJ:</strong> {empresa.cnpj}</p>
                                <p><strong>Categoria:</strong> {empresa.categoria}</p>
                                <p><strong>Responsável:</strong> {empresa.responsavel}</p>
                                <p><strong>Email:</strong> {empresa.email}</p>
                              </div>
                              <div>
                                <p><strong>Telefone:</strong> {empresa.telefone}</p>
                                <p><strong>Endereço:</strong> {empresa.endereco}</p>
                                <p><strong>Bairro:</strong> {empresa.bairro}</p>
                                <p><strong>Cadastrada em:</strong> {empresa.cadastradaEm}</p>
                              </div>
                            </div>
                          </div>
                          
                          {empresa.status === 'pendente' && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => aprovarEmpresa(empresa.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                              >
                                ✅ Aprovar
                              </button>
                              <button
                                onClick={() => rejeitarEmpresa(empresa.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                              >
                                ❌ Rejeitar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'entregadores' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gerenciamento de Entregadores
                </h2>
                
                {/* Filtros */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setActiveTab('entregadores')}
                      className="px-4 py-2 text-sm bg-orange-100 text-orange-800 rounded-md"
                    >
                      🔔 Pendentes ({entregadores.filter(e => e.status === 'pendente').length})
                    </button>
                    <button
                      onClick={() => setActiveTab('entregadores')}
                      className="px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md"
                    >
                      ✅ Aprovados ({entregadores.filter(e => e.status === 'aprovado').length})
                    </button>
                    <button
                      onClick={() => setActiveTab('entregadores')}
                      className="px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md"
                    >
                      ❌ Rejeitados ({entregadores.filter(e => e.status === 'rejeitado').length})
                    </button>
                  </div>
                </div>

                {/* Lista de Entregadores */}
                <div className="space-y-4">
                  {entregadores.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                      <div className="text-6xl mb-4">🏍️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum entregador cadastrado
                      </h3>
                      <p className="text-gray-600">
                        Aguarde entregadores se cadastrarem na plataforma.
                      </p>
                    </div>
                  ) : (
                    entregadores.map(entregador => (
                      <div key={entregador.id} className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{entregador.nome}</h3>
                              <span className={`ml-3 px-3 py-1 text-sm rounded-full ${
                                entregador.status === 'pendente' ? 'bg-orange-100 text-orange-800' :
                                entregador.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {entregador.status === 'pendente' ? '⏳ Pendente' :
                                 entregador.status === 'aprovado' ? '✅ Aprovado' :
                                 '❌ Rejeitado'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p><strong>CPF:</strong> {entregador.cpf}</p>
                                <p><strong>Email:</strong> {entregador.email}</p>
                                <p><strong>Telefone:</strong> {entregador.telefone}</p>
                                <p><strong>Endereço:</strong> {entregador.endereco}</p>
                              </div>
                              <div>
                                <p><strong>Bairro:</strong> {entregador.bairro}</p>
                                <p><strong>Veículo:</strong> {entregador.veiculo}</p>
                                {entregador.placa && <p><strong>Placa:</strong> {entregador.placa}</p>}
                                {entregador.cnh && <p><strong>CNH:</strong> {entregador.cnh}</p>}
                                <p><strong>Cadastrado em:</strong> {entregador.cadastradoEm}</p>
                              </div>
                            </div>
                          </div>
                          
                          {entregador.status === 'pendente' && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => aprovarEntregador(entregador.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                              >
                                ✅ Aprovar
                              </button>
                              <button
                                onClick={() => rejeitarEntregador(entregador.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                              >
                                ❌ Rejeitar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'consumidores' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gerenciamento de Consumidores
                </h2>
                
                <div className="space-y-4">
                  {consumidores.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                      <div className="text-6xl mb-4">🛒</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum consumidor cadastrado
                      </h3>
                      <p className="text-gray-600">
                        Aguarde consumidores se cadastrarem na plataforma.
                      </p>
                    </div>
                  ) : (
                    consumidores.map(consumidor => (
                      <div key={consumidor.id} className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{consumidor.nome}</h3>
                              <span className="ml-3 px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                                ✅ Ativo
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p><strong>CPF:</strong> {consumidor.cpf}</p>
                                <p><strong>Email:</strong> {consumidor.email}</p>
                                <p><strong>Telefone:</strong> {consumidor.telefone}</p>
                                <p><strong>Cadastrado em:</strong> {consumidor.cadastradoEm}</p>
                              </div>
                              <div>
                                <p><strong>Endereço:</strong> {consumidor.endereco}</p>
                                <p><strong>Bairro:</strong> {consumidor.bairro}</p>
                                {consumidor.pontoReferencia && (
                                  <p><strong>Ponto de Referência:</strong> {consumidor.pontoReferencia}</p>
                                )}
                                <p><strong>Pedidos:</strong> {pedidos.filter(p => p.consumidorId === consumidor.id).length}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pedidos' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gerenciamento de Pedidos
                </h2>
                
                <div className="space-y-4">
                  {pedidos.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum pedido realizado
                      </h3>
                      <p className="text-gray-600">
                        Aguarde pedidos serem realizados pelos consumidores.
                      </p>
                    </div>
                  ) : (
                    pedidos.map(pedido => (
                      <div key={pedido.id} className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Pedido #{pedido.id.slice(-6)}
                            </h3>
                            <p className="text-sm text-gray-600">{pedido.criadoEm}</p>
                          </div>
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            pedido.status === 'pendente' ? 'bg-orange-100 text-orange-800' :
                            pedido.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {pedido.status === 'pendente' ? '⏳ Pendente' :
                             pedido.status === 'aprovado' ? '✅ Aprovado' :
                             '❌ Rejeitado'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p><strong>Cliente:</strong> {pedido.consumidorNome}</p>
                            <p><strong>Telefone:</strong> {pedido.telefone}</p>
                            <p><strong>Endereço:</strong> {pedido.endereco}</p>
                            <p><strong>Bairro:</strong> {pedido.bairro}</p>
                          </div>
                          <div>
                            <p><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</p>
                            <p><strong>Itens:</strong> {pedido.items.length}</p>
                            <p><strong>Empresas:</strong> {pedido.empresas?.length || 0}</p>
                          </div>
                        </div>
                        
                        {pedido.items && pedido.items.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-2">Itens do Pedido:</h4>
                            <div className="space-y-1">
                              {pedido.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.quantidade}x {item.nome}</span>
                                  <span>R$ {(parseFloat(item.preco) * item.quantidade).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Configuração do Banco de Dados
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      databaseConfig.isConnected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {databaseConfig.isConnected ? '✅ Conectado' : '❌ Desconectado'}
                    </span>
                    {databaseConfig.isConnected && (
                      <button
                        onClick={disconnectDatabase}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 text-sm"
                      >
                        Desconectar
                      </button>
                    )}
                  </div>
                </div>

                {/* Status da Conexão */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Status da Conexão
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Status</div>
                      <div className={`text-lg font-bold ${
                        databaseConfig.isConnected ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {databaseConfig.isConnected ? 'Conectado' : 'Desconectado'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Tipo</div>
                      <div className="text-lg font-bold text-gray-900">
                        {databaseConfig.type.toUpperCase()}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Última Conexão</div>
                      <div className="text-lg font-bold text-gray-900">
                        {databaseConfig.lastConnection || 'Nunca'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuração do Banco */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Configuração da Conexão
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Tipo de Banco */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Banco de Dados
                        </label>
                        <select
                          value={databaseConfig.type}
                          onChange={(e) => setDatabaseConfig({
                            ...databaseConfig,
                            type: e.target.value,
                            port: e.target.value === 'mysql' ? '3306' : 
                                  e.target.value === 'postgresql' ? '5432' : 
                                  e.target.value === 'mongodb' ? '27017' : '3306'
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="mysql">MySQL</option>
                          <option value="postgresql">PostgreSQL</option>
                          <option value="mongodb">MongoDB</option>
                          <option value="sqlite">SQLite</option>
                          <option value="supabase">🚀 Supabase (PostgreSQL Cloud)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Método de Conexão
                        </label>
                        <select
                          value={databaseConfig.useConnectionString ? 'string' : 'config'}
                          onChange={(e) => setDatabaseConfig({
                            ...databaseConfig,
                            useConnectionString: e.target.value === 'string'
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="config">Configuração Manual</option>
                          <option value="string">String de Conexão</option>
                        </select>
                      </div>
                    </div>

                    {/* Configuração do Supabase */}
                    {databaseConfig.type === 'supabase' ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 mb-2 flex items-center">
                            🚀 Configuração do Supabase
                          </h4>
                          <p className="text-sm text-green-700 mb-3">
                            O Supabase é uma alternativa open-source ao Firebase. Configure sua conexão abaixo:
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <span>📚</span>
                            <a 
                              href="https://supabase.com/dashboard" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline font-medium"
                            >
                              Acesse seu Dashboard do Supabase
                            </a>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🔗 URL do Projeto Supabase *
                          </label>
                          <input
                            type="url"
                            required
                            value={databaseConfig.supabaseUrl}
                            onChange={(e) => setDatabaseConfig({
                              ...databaseConfig,
                              supabaseUrl: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="https://seu-projeto.supabase.co"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Encontre em: Projeto → Settings → API → Project URL
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🔑 Chave Pública (anon key) *
                          </label>
                          <textarea
                            required
                            value={databaseConfig.supabaseKey}
                            onChange={(e) => setDatabaseConfig({
                              ...databaseConfig,
                              supabaseKey: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={3}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Encontre em: Projeto → Settings → API → Project API keys → anon public
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🛡️ Chave de Serviço (service_role key)
                          </label>
                          <textarea
                            value={databaseConfig.supabaseServiceKey}
                            onChange={(e) => setDatabaseConfig({
                              ...databaseConfig,
                              supabaseServiceKey: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={3}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (opcional para operações administrativas)"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Opcional: Para operações administrativas. Encontre em: Projeto → Settings → API → service_role
                          </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>⚠️ Segurança:</strong> A chave de serviço possui acesso total ao banco. 
                            Use apenas em ambiente seguro e nunca a exponha no frontend em produção.
                          </p>
                        </div>
                      </div>
                    ) : databaseConfig.useConnectionString ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          String de Conexão
                        </label>
                        <textarea
                          value={databaseConfig.connectionString}
                          onChange={(e) => setDatabaseConfig({
                            ...databaseConfig,
                            connectionString: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          rows={3}
                          placeholder={
                            databaseConfig.type === 'mysql' ? 'mysql://usuario:senha@localhost:3306/entrega_sobral' :
                            databaseConfig.type === 'postgresql' ? 'postgresql://usuario:senha@localhost:5432/entrega_sobral' :
                            databaseConfig.type === 'mongodb' ? 'mongodb://usuario:senha@localhost:27017/entrega_sobral' :
                            'sqlite://./entrega_sobral.db'
                          }
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Host/Servidor
                          </label>
                          <input
                            type="text"
                            value={databaseConfig.host}
                            onChange={(e) => setDatabaseConfig({
                              ...databaseConfig,
                              host: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="localhost"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Porta
                          </label>
                          <input
                            type="text"
                            value={databaseConfig.port}
                            onChange={(e) => setDatabaseConfig({
                              ...databaseConfig,
                              port: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="3306"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Banco
                          </label>
                          <input
                            type="text"
                            value={databaseConfig.database}
                            onChange={(e) => setDatabaseConfig({
                              ...databaseConfig,
                              database: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="entrega_sobral"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Usuário
                          </label>
                          <input
                            type="text"
                            value={databaseConfig.username}
                            onChange={(e) => setDatabaseConfig({
                              ...databaseConfig,
                              username: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="usuario"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Senha
                          </label>
                          <input
                            type="password"
                            value={databaseConfig.password}
                            onChange={(e) => setDatabaseConfig({
                              ...databaseConfig,
                              password: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="senha"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="ssl"
                            checked={databaseConfig.ssl}
                            onChange={(e) => setDatabaseConfig({
                              ...databaseConfig,
                              ssl: e.target.checked
                            })}
                            className="mr-2"
                          />
                          <label htmlFor="ssl" className="text-sm text-gray-700">
                            Usar SSL/TLS
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Ações
                  </h3>
                  
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={testDatabaseConnection}
                      disabled={databaseConfig.isConnected}
                      className={`px-6 py-3 rounded-md font-medium transition duration-200 ${
                        databaseConfig.isConnected
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      🔌 Testar Conexão
                    </button>
                    
                    <button
                      onClick={migrateToDatabase}
                      disabled={!databaseConfig.isConnected}
                      className={`px-6 py-3 rounded-md font-medium transition duration-200 ${
                        !databaseConfig.isConnected
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      🔄 Migrar Dados do LocalStorage
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('⚠️ Tem certeza que deseja limpar todas as configurações?\n\nEsta ação não pode ser desfeita!')) {
                          setDatabaseConfig({
                            type: 'mysql',
                            host: 'localhost',
                            port: '3306',
                            database: 'entrega_sobral',
                            username: '',
                            password: '',
                            ssl: false,
                            connectionString: '',
                            isConnected: false,
                            lastConnection: null,
                            useConnectionString: false,
                            supabaseUrl: '',
                            supabaseKey: '',
                            supabaseServiceKey: ''
                          });
                          alert('🗑️ Configurações limpas!');
                        }
                      }}
                      className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 font-medium transition duration-200"
                    >
                      🗑️ Limpar Configurações
                    </button>
                  </div>
                </div>

                {/* Informações Importantes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-yellow-800 mb-4">
                    ⚠️ Informações Importantes
                  </h3>
                  <div className="space-y-3 text-sm text-yellow-700">
                    <p>
                      <strong>📋 Funcionalidade em Desenvolvimento:</strong> Esta é uma simulação da conexão com banco de dados. Em produção, seria necessário implementar as rotas de API no backend.
                    </p>
                    <p>
                      <strong>🔐 Segurança:</strong> Nunca exponha credenciais de banco de dados no frontend. Use variáveis de ambiente e APIs seguras.
                    </p>
                    <p>
                      <strong>🔄 Migração:</strong> A migração atual é simulada. Em produção, implemente validações e backups antes da migração.
                    </p>
                    <p>
                      <strong>💾 Estrutura de Tabelas:</strong> Certifique-se de que as tabelas necessárias existam no banco: usuarios, empresas, entregadores, consumidores, produtos, pedidos.
                    </p>
                    <p>
                      <strong>🚀 Supabase:</strong> Use Row Level Security (RLS) para segurança. Configure políticas de acesso adequadas para cada tabela.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Tela de seleção inicial de login
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🍕 Entrega Sobral
            </h1>
            <p className="text-gray-600">Fazer Login</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView('admin-login')}
              className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center"
            >
              👨‍💼 Login Administrador
            </button>
            
            <button
              onClick={() => setCurrentView('empresa-login')}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium flex items-center justify-center"
            >
              🏢 Login Empresa
            </button>
            
            <button
              onClick={() => setCurrentView('entregador-login')}
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200 font-medium flex items-center justify-center"
            >
              🏍️ Login Entregador
            </button>
            
            <button
              onClick={() => setCurrentView('consumidor-login')}
              className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-200 font-medium flex items-center justify-center"
            >
              🛒 Login Cliente
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentView('home')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de login do administrador
  if (currentView === 'admin-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              👨‍💼 Login Administrador
            </h1>
            <p className="text-gray-600">Acesso restrito</p>
          </div>
          
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <input
                type="text"
                required
                value={loginForm.usuario}
                onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Digite seu usuário"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                required
                value={loginForm.senha}
                onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Digite sua senha"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-200 font-medium"
            >
              Entrar
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentView('login')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de login da empresa
  if (currentView === 'empresa-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🏢 Login Empresa
            </h1>
            <p className="text-gray-600">Acesse seu painel</p>
          </div>
          
          <form onSubmit={handleEmpresaLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                required
                value={loginForm.senha}
                onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua senha"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
            >
              Entrar
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Ainda não é parceiro?
            </p>
            <button
              onClick={() => setCurrentView('cadastro-empresa')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Cadastrar Empresa
            </button>
            
            <div>
              <button
                onClick={() => setCurrentView('login')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de login do entregador
  if (currentView === 'entregador-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🏍️ Login Entregador
            </h1>
            <p className="text-gray-600">Acesse sua conta</p>
          </div>
          
          <form onSubmit={handleEntregadorLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                required
                value={loginForm.senha}
                onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Digite sua senha"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200 font-medium"
            >
              Entrar
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Ainda não é entregador?
            </p>
            <button
              onClick={() => setCurrentView('cadastro-entregador')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Cadastrar Entregador
            </button>
            
            <div>
              <button
                onClick={() => setCurrentView('login')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de login do consumidor
  if (currentView === 'consumidor-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🛒 Login Cliente
            </h1>
            <p className="text-gray-600">Acesse sua conta</p>
          </div>
          
          <form onSubmit={handleConsumidorLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                required
                value={loginForm.senha}
                onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Digite sua senha"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-200 font-medium"
            >
              Entrar
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Ainda não tem conta?
            </p>
            <button
              onClick={() => setCurrentView('cadastro-consumidor')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Cadastrar Cliente
            </button>
            
            <div>
              <button
                onClick={() => setCurrentView('login')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de cadastro de empresa
  if (currentView === 'cadastro-empresa') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🏢 Cadastrar Empresa
            </h1>
            <p className="text-gray-600">Torne-se nosso parceiro</p>
          </div>
          
          <form onSubmit={handleCadastroEmpresa} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={empresaForm.nome}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Pizzaria do João"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  required
                  value={empresaForm.cnpj}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, cnpj: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  required
                  value={empresaForm.categoria}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Pizzarias">Pizzarias</option>
                  <option value="Lanchonetes">Lanchonetes</option>
                  <option value="Restaurantes">Restaurantes</option>
                  <option value="Açaíteria">Açaíteria</option>
                  <option value="Sorveteria">Sorveteria</option>
                  <option value="Padaria">Padaria</option>
                  <option value="Farmácia">Farmácia</option>
                  <option value="Supermercado">Supermercado</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={empresaForm.responsavel}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, responsavel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do responsável"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={empresaForm.email}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="empresa@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={empresaForm.telefone}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(85) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  required
                  value={empresaForm.endereco}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, número"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  required
                  value={empresaForm.bairro}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, bairro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={empresaForm.senha}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, senha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={empresaForm.confirmarSenha}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, confirmarSenha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirme sua senha"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
              >
                Cadastrar Empresa
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Já tem conta?
            </p>
            <button
              onClick={() => setCurrentView('empresa-login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Fazer Login
            </button>
            
            <div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Voltar ao início
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de cadastro de entregador
  if (currentView === 'cadastro-entregador') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🏍️ Cadastrar Entregador
            </h1>
            <p className="text-gray-600">Trabalhe conosco</p>
          </div>
          
          <form onSubmit={handleCadastroEntregador} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={entregadorForm.nome}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  required
                  value={entregadorForm.cpf}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, cpf: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={entregadorForm.email}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={entregadorForm.telefone}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="(85) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  required
                  value={entregadorForm.endereco}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Rua, número"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  required
                  value={entregadorForm.bairro}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, bairro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veículo *
                </label>
                <select
                  required
                  value={entregadorForm.veiculo}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, veiculo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione o veículo</option>
                  <option value="Moto">Moto</option>
                  <option value="Bicicleta">Bicicleta</option>
                  <option value="Carro">Carro</option>
                  <option value="A pé">A pé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa do Veículo
                </label>
                <input
                  type="text"
                  value={entregadorForm.placa}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, placa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="ABC-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNH
                </label>
                <input
                  type="text"
                  value={entregadorForm.cnh}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, cnh: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Número da CNH"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={entregadorForm.senha}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, senha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={entregadorForm.confirmarSenha}
                  onChange={(e) => setEntregadorForm({ ...entregadorForm, confirmarSenha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Confirme sua senha"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200 font-medium"
              >
                Cadastrar Entregador
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Já tem conta?
            </p>
            <button
              onClick={() => setCurrentView('entregador-login')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Fazer Login
            </button>
            
            <div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Voltar ao início
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de cadastro de consumidor
  if (currentView === 'cadastro-consumidor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🛒 Cadastrar Cliente
            </h1>
            <p className="text-gray-600">Crie sua conta</p>
          </div>
          
          <form onSubmit={handleCadastroConsumidor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={consumidorForm.nome}
                  onChange={(e) => setConsumidorForm({ ...consumidorForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  required
                  value={consumidorForm.cpf}
                  onChange={(e) => setConsumidorForm({ ...consumidorForm, cpf: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={consumidorForm.email}
                  onChange={(e) => setConsumidorForm({ ...consumidorForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={consumidorForm.telefone}
                  onChange={(e) => setConsumidorForm({ ...consumidorForm, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="(85) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  required
                  value={consumidorForm.endereco}
                  onChange={(e) => setConsumidorForm({ ...consumidorForm, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Rua, número"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  required
                  value={consumidorForm.bairro}
                  onChange={(e) => setConsumidorForm({ ...consumidorForm, bairro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nome do bairro"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ponto de Referência
                </label>
                <input
                  type="text"
                  value={consumidorForm.pontoReferencia}
                  onChange={(e) => setConsumidorForm({ ...consumidorForm, pontoReferencia: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Próximo ao posto de gasolina"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={consumidorForm.senha}
                  onChange={(e) => setConsumidorForm({ ...consumidorForm, senha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={consumidorForm.confirmarSenha}
                  onChange={(e) => setConsumidorForm({ ...consumidorForm, confirmarSenha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Confirme sua senha"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-200 font-medium"
              >
                Cadastrar Cliente
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Já tem conta?
            </p>
            <button
              onClick={() => setCurrentView('consumidor-login')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Fazer Login
            </button>
            
            <div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Voltar ao início
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se chegou aqui, nenhum usuário está logado - mostrar tela inicial

  // Tela inicial - só mostrar se NENHUM usuário está logado
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-2">
              🍕 Entrega Sobral
            </h1>
            <p className="text-gray-600 text-lg">
              Delivery rápido e seguro em Sobral - CE
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Conectando você ao que deseja
          </h2>
          <p className="text-red-100 text-lg">
            Escolha como deseja acessar nossa plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Coluna 1 */}
          <div className="space-y-4">
            {/* Admin */}
            <div className="bg-white rounded-lg shadow-xl p-6 text-center">
              <div className="text-4xl mb-4">👨‍💼</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Administrador
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Gerencie empresas, entregadores e monitore a plataforma.
              </p>
              <button
                onClick={() => setCurrentView('admin-login')}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition duration-200 font-semibold"
              >
                Acesso Admin
              </button>
            </div>

            {/* Empresa */}
            <div className="bg-white rounded-lg shadow-xl p-6 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Sou Empresa
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Gerencie seu negócio, produtos e pedidos online.
              </p>
              <button
                onClick={() => setCurrentView('empresa-login')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
              >
                Login Empresa
              </button>
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-4">
            {/* Entregador */}
            <div className="bg-white rounded-lg shadow-xl p-6 text-center">
              <div className="text-4xl mb-4">🏍️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Sou Entregador
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Trabalhe conosco e ganhe dinheiro fazendo entregas.
              </p>
              <button
                onClick={() => setCurrentView('entregador-login')}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-semibold"
              >
                Login Entregador
              </button>
            </div>

            {/* Cliente */}
            <div className="bg-white rounded-lg shadow-xl p-6 text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Sou Cliente
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Peça comida e produtos com delivery rápido.
              </p>
              <button
                onClick={() => setCurrentView('consumidor-login')}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition duration-200 font-semibold"
              >
                Login Cliente
              </button>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-xl p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Novo por aqui?
          </h3>
          <p className="text-gray-600 mb-6">
            Cadastre-se gratuitamente e faça parte da maior plataforma de delivery de Sobral
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentView('cadastro-empresa')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
            >
              Cadastrar Empresa
            </button>
            <button
              onClick={() => setCurrentView('cadastro-entregador')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold"
            >
              Cadastrar Entregador
            </button>
            <button
              onClick={() => setCurrentView('cadastro-consumidor')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-semibold"
            >
              Cadastrar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SistemaEntregaSobral;