// <stdin>
import React, { useState } from "https://esm.sh/react@18.2.0";
var { useStoredState } = hatch;
var SistemaEntregaSobral = () => {
  const [currentView, setCurrentView] = useState("home");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  const [databaseConfig, setDatabaseConfig] = useStoredState("database_config", {
    type: "mysql",
    // mysql, postgresql, mongodb, sqlite, supabase
    host: "localhost",
    port: "3306",
    database: "entrega_sobral",
    username: "",
    password: "",
    ssl: false,
    connectionString: "",
    isConnected: false,
    lastConnection: null,
    useConnectionString: false,
    // Campos específicos do Supabase
    supabaseUrl: "",
    supabaseKey: "",
    supabaseServiceKey: ""
  });
  const [empresaLogada, setEmpresaLogada] = useState(null);
  const [entregadorLogado, setEntregadorLogado] = useState(null);
  const [consumidorLogado, setConsumidorLogado] = useState(null);
  const [empresas, setEmpresas] = useStoredState("empresas_sobral", []);
  const [entregadores, setEntregadores] = useStoredState("entregadores_sobral", []);
  const [consumidores, setConsumidores] = useStoredState("consumidores_sobral", []);
  const [pedidos, setPedidos] = useStoredState("pedidos_sobral", []);
  const [produtos, setProdutos] = useStoredState("produtos_sobral", []);
  const [loginForm, setLoginForm] = useState({ email: "", senha: "", usuario: "" });
  const [showProdutoForm, setShowProdutoForm] = useState(false);
  const [editingProdutoId, setEditingProdutoId] = useState(null);
  const [produtoForm, setProdutoForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria: "",
    disponivel: true,
    tempoPreparacao: "",
    imagem: ""
  });
  const [empresaForm, setEmpresaForm] = useState({
    nome: "",
    cnpj: "",
    categoria: "",
    responsavel: "",
    email: "",
    telefone: "",
    endereco: "",
    bairro: "",
    senha: "",
    confirmarSenha: ""
  });
  const [entregadorForm, setEntregadorForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    endereco: "",
    bairro: "",
    veiculo: "",
    placa: "",
    cnh: "",
    senha: "",
    confirmarSenha: ""
  });
  const [consumidorForm, setConsumidorForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    endereco: "",
    bairro: "",
    pontoReferencia: "",
    senha: "",
    confirmarSenha: ""
  });
  const [activeConsumerTab, setActiveConsumerTab] = useState("marketplace");
  const [carrinho, setCarrinho] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [busca, setBusca] = useState("");
  const [forceConsumerUpdate, setForceConsumerUpdate] = useState(0);
  const adminCredentials = {
    usuario: "admin",
    senha: "tenderbr0"
  };
  const testDatabaseConnection = async () => {
    try {
      const config = databaseConfig;
      if (config.type === "supabase") {
        if (!config.supabaseUrl || !config.supabaseKey) {
          throw new Error("Preencha a URL e a chave p\xFAblica do Supabase");
        }
        if (!config.supabaseUrl.includes(".supabase.co")) {
          throw new Error("URL do Supabase deve ter o formato: https://seu-projeto.supabase.co");
        }
      } else if (!config.useConnectionString) {
        if (!config.host || !config.database || !config.username) {
          throw new Error("Preencha todos os campos obrigat\xF3rios");
        }
      } else {
        if (!config.connectionString) {
          throw new Error("String de conex\xE3o \xE9 obrigat\xF3ria");
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      if (config.type === "supabase") {
        console.log("\u{1F517} Testando conex\xE3o com Supabase:", {
          url: config.supabaseUrl,
          hasKey: !!config.supabaseKey,
          hasServiceKey: !!config.supabaseServiceKey
        });
      }
      const updatedConfig = {
        ...config,
        isConnected: true,
        lastConnection: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
      };
      setDatabaseConfig(updatedConfig);
      const successMessage = config.type === "supabase" ? "\u2705 Conex\xE3o com Supabase estabelecida com sucesso!\n\n\u{1F517} Configura\xE7\xE3o validada:\n\u2022 URL do projeto verificada\n\u2022 Chave de API testada\n\u2022 Pronto para usar!" : "\u2705 Conex\xE3o com banco de dados estabelecida com sucesso!";
      alert(successMessage);
      return true;
    } catch (error) {
      console.error("Erro ao conectar com banco:", error);
      alert("\u274C Erro ao conectar com banco de dados: " + error.message);
      setDatabaseConfig({
        ...databaseConfig,
        isConnected: false,
        lastConnection: null
      });
      return false;
    }
  };
  const disconnectDatabase = () => {
    setDatabaseConfig({
      ...databaseConfig,
      isConnected: false,
      lastConnection: null
    });
    alert("\u{1F50C} Desconectado do banco de dados");
  };
  const migrateToDatabase = async () => {
    if (!databaseConfig.isConnected) {
      alert("\u274C Conecte-se ao banco de dados primeiro!");
      return;
    }
    try {
      const localData = {
        empresas: JSON.parse(localStorage.getItem("empresas_sobral") || "[]"),
        entregadores: JSON.parse(localStorage.getItem("entregadores_sobral") || "[]"),
        consumidores: JSON.parse(localStorage.getItem("consumidores_sobral") || "[]"),
        produtos: JSON.parse(localStorage.getItem("produtos_sobral") || "[]"),
        pedidos: JSON.parse(localStorage.getItem("pedidos_sobral") || "[]")
      };
      await new Promise((resolve) => setTimeout(resolve, 3e3));
      console.log("\u{1F504} Dados migrados:", localData);
      alert(`\u2705 Migra\xE7\xE3o conclu\xEDda com sucesso!

\u{1F4CA} DADOS MIGRADOS:
\u2022 Empresas: ${localData.empresas.length}
\u2022 Entregadores: ${localData.entregadores.length}
\u2022 Consumidores: ${localData.consumidores.length}
\u2022 Produtos: ${localData.produtos.length}
\u2022 Pedidos: ${localData.pedidos.length}

\u{1F389} Agora o sistema est\xE1 conectado ao banco de dados!`);
    } catch (error) {
      console.error("Erro na migra\xE7\xE3o:", error);
      alert("\u274C Erro na migra\xE7\xE3o: " + error.message);
    }
  };
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
  const removerDoCarrinho = (itemId) => {
    setCarrinho(carrinho.filter((item) => item.id !== itemId));
  };
  const finalizarPedido = () => {
    if (carrinho.length === 0) {
      alert("Carrinho vazio!");
      return;
    }
    const empresasPedido = {};
    carrinho.forEach((item) => {
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
      total: carrinho.reduce((sum, item) => sum + parseFloat(item.preco) * item.quantidade, 0),
      status: "pendente",
      criadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR"),
      endereco: consumidorLogado.endereco,
      bairro: consumidorLogado.bairro,
      telefone: consumidorLogado.telefone
    };
    const pedidosAtualizados = [...pedidos, novoPedido];
    setPedidos(pedidosAtualizados);
    localStorage.setItem("pedidos_sobral", JSON.stringify(pedidosAtualizados));
    window.dispatchEvent(new CustomEvent("pedidos_updated", {
      detail: {
        pedidos: pedidosAtualizados,
        novoPedido,
        action: "pedido_criado",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("dados_sincronizados", {
        detail: {
          pedidos: pedidosAtualizados,
          novoPedido,
          empresasEnvolvidas: Object.values(empresasPedido).map((emp) => emp.empresaId),
          action: "novo_pedido_realizado",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      }));
      Object.values(empresasPedido).forEach((empresaPedido) => {
        window.dispatchEvent(new CustomEvent("novo_pedido_empresa", {
          detail: {
            empresaId: empresaPedido.empresaId,
            pedido: novoPedido,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        }));
      });
      console.log("\u{1F514} Eventos de sincroniza\xE7\xE3o disparados para todas as empresas envolvidas");
    }, 500);
    setCarrinho([]);
    alert(`Pedido realizado com sucesso!

Pedido #${novoPedido.id.slice(-6)}
Total: R$ ${novoPedido.total.toFixed(2)}

\u{1F514} Empresas notificadas automaticamente!`);
    setActiveConsumerTab("pedidos");
  };
  const empresasAprovadas = empresas.filter((emp) => emp.status === "aprovada");
  const produtosDisponiveis = produtos.filter((prod) => prod.disponivel);
  const produtosFiltrados = produtosDisponiveis.filter((produto) => {
    const empresa = empresasAprovadas.find((emp) => emp.id === produto.empresaId);
    if (!empresa) return false;
    const matchCategoria = !filtroCategoria || produto.categoria === filtroCategoria;
    const matchBusca = !busca || produto.nome.toLowerCase().includes(busca.toLowerCase()) || empresa.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });
  const categorias = [...new Set(produtosDisponiveis.map((p) => p.categoria))];
  const meusPedidos = pedidos.filter((p) => p.consumidorId === consumidorLogado?.id);
  React.useEffect(() => {
    const sessionId = sessionStorage.getItem("session_id") || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("session_id", sessionId);
    const savedAuth = sessionStorage.getItem("admin_authenticated");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      console.log("\u2705 Admin autenticado automaticamente ap\xF3s reload (sess\xE3o local)");
    }
    const savedEmpresa = sessionStorage.getItem("empresa_logada");
    if (savedEmpresa && !empresaLogada) {
      try {
        const empresaData = JSON.parse(savedEmpresa);
        setEmpresaLogada(empresaData);
        console.log("\u2705 Empresa autenticada automaticamente ap\xF3s reload (sess\xE3o local)");
      } catch (error) {
        console.error("Erro ao recuperar empresa logada:", error);
        sessionStorage.removeItem("empresa_logada");
      }
    }
    const savedEntregador = sessionStorage.getItem("entregador_logado");
    if (savedEntregador && !entregadorLogado) {
      try {
        const entregadorData = JSON.parse(savedEntregador);
        setEntregadorLogado(entregadorData);
        console.log("\u2705 Entregador autenticado automaticamente ap\xF3s reload (sess\xE3o local)");
      } catch (error) {
        console.error("Erro ao recuperar entregador logado:", error);
        sessionStorage.removeItem("entregador_logado");
      }
    }
    const savedConsumidor = sessionStorage.getItem("consumidor_logado");
    if (savedConsumidor && !consumidorLogado) {
      try {
        const consumidorData = JSON.parse(savedConsumidor);
        setConsumidorLogado(consumidorData);
        console.log("\u2705 Consumidor autenticado automaticamente ap\xF3s reload (sess\xE3o local)");
      } catch (error) {
        console.error("Erro ao recuperar consumidor logado:", error);
        sessionStorage.removeItem("consumidor_logado");
      }
    }
    const syncAllData = () => {
      try {
        const savedProdutos = localStorage.getItem("produtos_sobral");
        if (savedProdutos) {
          const produtosData = JSON.parse(savedProdutos);
          setProdutos(produtosData);
          console.log("\u{1F504} Produtos sincronizados:", produtosData.length);
          console.log("\u{1F4E6} Produtos dispon\xEDveis:", produtosData.filter((p) => p.disponivel).length);
        } else {
          console.log("\u26A0\uFE0F Nenhum produto encontrado no localStorage");
        }
        const savedEmpresas = localStorage.getItem("empresas_sobral");
        if (savedEmpresas) {
          const empresasData = JSON.parse(savedEmpresas);
          setEmpresas(empresasData);
          console.log("\u{1F504} Empresas sincronizadas:", empresasData.length);
          console.log("\u{1F3E2} Empresas aprovadas:", empresasData.filter((e) => e.status === "aprovada").length);
        } else {
          console.log("\u26A0\uFE0F Nenhuma empresa encontrada no localStorage");
        }
        const savedEntregadores = localStorage.getItem("entregadores_sobral");
        if (savedEntregadores) {
          const entregadoresData = JSON.parse(savedEntregadores);
          setEntregadores(entregadoresData);
          console.log("\u{1F504} Entregadores sincronizados:", entregadoresData.length);
        }
        const savedConsumidores = localStorage.getItem("consumidores_sobral");
        if (savedConsumidores) {
          const consumidoresData = JSON.parse(savedConsumidores);
          setConsumidores(consumidoresData);
          console.log("\u{1F504} Consumidores sincronizados:", consumidoresData.length);
        }
        const savedPedidos = localStorage.getItem("pedidos_sobral");
        if (savedPedidos) {
          const pedidosData = JSON.parse(savedPedidos);
          setPedidos(pedidosData);
          console.log("\u{1F504} Pedidos sincronizados:", pedidosData.length);
          const pedidosPendentes = pedidosData.filter((p) => p.status === "pendente");
          console.log("\u{1F4E5} Pedidos pendentes encontrados:", pedidosPendentes.length);
          if (pedidosPendentes.length > 0) {
            console.log("\u{1F4CB} Pedidos pendentes detalhados:", pedidosPendentes.map((p) => ({
              id: p.id.slice(-6),
              cliente: p.consumidorNome,
              empresas: p.empresas?.map((emp) => emp.empresaNome) || [],
              total: p.total
            })));
          }
        } else {
          console.log("\u26A0\uFE0F Nenhum pedido encontrado no localStorage");
        }
        setForceConsumerUpdate((prev) => prev + 1);
        window.dispatchEvent(new CustomEvent("dados_sincronizados", {
          detail: {
            produtos: JSON.parse(savedProdutos || "[]"),
            empresas: JSON.parse(savedEmpresas || "[]"),
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        }));
      } catch (error) {
        console.error("Erro na sincroniza\xE7\xE3o autom\xE1tica:", error);
      }
    };
    syncAllData();
    setTimeout(() => setIsLoading(false), 100);
    const handleStorageChange = (e) => {
      console.log("\u{1F504} Detectada mudan\xE7a no localStorage:", e.key);
      setTimeout(syncAllData, 100);
    };
    const handleCustomSync = (e) => {
      console.log("\u{1F504} Evento customizado de sincroniza\xE7\xE3o:", e.type);
      syncAllData();
    };
    const handleForcedSync = (e) => {
      console.log("\u{1F504} Sincroniza\xE7\xE3o for\xE7ada entre pain\xE9is:", e.detail);
      syncAllData();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("produtos_updated", handleCustomSync);
    window.addEventListener("empresas_updated", handleCustomSync);
    window.addEventListener("pedidos_updated", handleCustomSync);
    window.addEventListener("sync_all_data", handleCustomSync);
    window.addEventListener("dados_sincronizados", handleForcedSync);
    window.addEventListener("novo_pedido_empresa", (e) => {
      console.log("\u{1F514} Novo pedido recebido para empresa:", e.detail);
      if (empresaLogada && e.detail.empresaId === empresaLogada.id) {
        syncAllData();
        setTimeout(() => {
          if (confirm(`\u{1F514} NOVO PEDIDO RECEBIDO!

Pedido #${e.detail.pedido.id.slice(-6)}
Cliente: ${e.detail.pedido.consumidorNome}
Total: R$ ${e.detail.pedido.total.toFixed(2)}

\u{1F3AF} Clique OK para ver o pedido na aba Pedidos`)) {
            setActiveTab("pedidos");
          }
        }, 1e3);
      }
    });
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("produtos_updated", handleCustomSync);
      window.removeEventListener("empresas_updated", handleCustomSync);
      window.removeEventListener("pedidos_updated", handleCustomSync);
      window.removeEventListener("sync_all_data", handleCustomSync);
      window.removeEventListener("dados_sincronizados", handleForcedSync);
      window.removeEventListener("novo_pedido_empresa", () => {
      });
    };
  }, [empresaLogada, entregadorLogado, consumidorLogado]);
  React.useEffect(() => {
    if (isAuthenticated && currentView === "home" && !empresaLogada && !entregadorLogado && !consumidorLogado) {
      setCurrentView("dashboard");
    }
  }, [isAuthenticated]);
  if (isLoading) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-2xl p-8 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F355}"), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-800 mb-4" }, "Entrega Sobral"), /* @__PURE__ */ React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" }), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mt-4" }, "Carregando...")));
  }
  const handleAdminLogin = (e) => {
    e.preventDefault();
    console.log("\u{1F510} Tentativa de login admin:", {
      usuarioDigitado: loginForm.usuario,
      senhaDigitada: loginForm.senha,
      usuarioCorreto: adminCredentials.usuario,
      senhaCorreta: adminCredentials.senha
    });
    const usuarioLimpo = loginForm.usuario.trim();
    const senhaLimpa = loginForm.senha.trim();
    if (usuarioLimpo === adminCredentials.usuario && senhaLimpa === adminCredentials.senha) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      setCurrentView("dashboard");
      setLoginForm({ usuario: "", senha: "", email: "" });
      console.log("\u2705 Login admin realizado com sucesso!");
      alert("Login realizado com sucesso!");
    } else {
      console.log("\u274C Credenciais incorretas!");
      console.log("Esperado:", { usuario: adminCredentials.usuario, senha: adminCredentials.senha });
      console.log("Recebido:", { usuario: usuarioLimpo, senha: senhaLimpa });
      alert("Usu\xE1rio ou senha incorretos!\nVerifique: admin / tenderbr0");
    }
  };
  const handleEmpresaLogin = (e) => {
    e.preventDefault();
    const empresa = empresas.find(
      (emp) => emp.email === loginForm.email && emp.senha === loginForm.senha
    );
    if (empresa) {
      if (empresa.status === "pendente") {
        alert("Sua empresa ainda est\xE1 aguardando aprova\xE7\xE3o. Voc\xEA receber\xE1 um email quando for aprovada.");
        return;
      }
      if (empresa.status === "rejeitada") {
        alert("Sua empresa foi rejeitada. Entre em contato com o suporte para mais informa\xE7\xF5es.");
        return;
      }
      if (empresa.status === "suspensa") {
        alert("Sua empresa est\xE1 suspensa. Entre em contato com o suporte.");
        return;
      }
      sessionStorage.setItem("empresa_logada", JSON.stringify(empresa));
      setEmpresaLogada(empresa);
      setLoginForm({ email: "", senha: "", usuario: "" });
      alert(`Bem-vindo(a), ${empresa.nome}!`);
    } else {
      alert("Email ou senha incorretos!");
    }
  };
  const handleEntregadorLogin = (e) => {
    e.preventDefault();
    const entregador = entregadores.find(
      (ent) => ent.email === loginForm.email && ent.senha === loginForm.senha
    );
    if (entregador) {
      if (entregador.status === "pendente") {
        alert("Seu cadastro ainda est\xE1 aguardando aprova\xE7\xE3o. Voc\xEA receber\xE1 um email quando for aprovado.");
        return;
      }
      if (entregador.status === "rejeitado") {
        alert("Seu cadastro foi rejeitado. Entre em contato com o suporte para mais informa\xE7\xF5es.");
        return;
      }
      if (entregador.status === "suspenso") {
        alert("Sua conta est\xE1 suspensa. Entre em contato com o suporte.");
        return;
      }
      sessionStorage.setItem("entregador_logado", JSON.stringify(entregador));
      setEntregadorLogado(entregador);
      setLoginForm({ email: "", senha: "", usuario: "" });
      alert(`Bem-vindo(a), ${entregador.nome}!`);
    } else {
      alert("Email ou senha incorretos!");
    }
  };
  const handleConsumidorLogin = (e) => {
    e.preventDefault();
    const consumidor = consumidores.find(
      (cons) => cons.email === loginForm.email && cons.senha === loginForm.senha
    );
    if (consumidor) {
      sessionStorage.setItem("consumidor_logado", JSON.stringify(consumidor));
      setConsumidorLogado(consumidor);
      setLoginForm({ email: "", senha: "", usuario: "" });
      alert(`Bem-vindo(a), ${consumidor.nome}!`);
    } else {
      alert("Email ou senha incorretos!");
    }
  };
  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setCurrentView("home");
    setActiveTab("dashboard");
  };
  const handleEmpresaLogout = () => {
    setEmpresaLogada(null);
    sessionStorage.removeItem("empresa_logada");
    setShowProdutoForm(false);
    setEditingProdutoId(null);
    setProdutoForm({
      nome: "",
      descricao: "",
      preco: "",
      categoria: "",
      disponivel: true,
      tempoPreparacao: "",
      imagem: ""
    });
    setActiveTab("dashboard");
  };
  const handleEntregadorLogout = () => {
    setEntregadorLogado(null);
    sessionStorage.removeItem("entregador_logado");
    setActiveTab("dashboard");
  };
  const handleConsumidorLogout = () => {
    setConsumidorLogado(null);
    sessionStorage.removeItem("consumidor_logado");
    setCarrinho([]);
    setActiveTab("dashboard");
  };
  const handleSubmitProduto = (e) => {
    e.preventDefault();
    if (!empresaLogada) {
      alert("Erro: Empresa n\xE3o est\xE1 logada!");
      return;
    }
    let produtosAtualizados;
    if (editingProdutoId) {
      produtosAtualizados = produtos.map(
        (prod) => prod.id === editingProdutoId ? {
          ...produtoForm,
          id: editingProdutoId,
          empresaId: empresaLogada.id,
          editadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
        } : prod
      );
      console.log("\u270F\uFE0F Produto editado:", produtoForm.nome);
      alert(`\u2705 Produto "${produtoForm.nome}" foi atualizado com sucesso!`);
      setEditingProdutoId(null);
    } else {
      const novoProduto = {
        ...produtoForm,
        id: Date.now().toString(),
        empresaId: empresaLogada.id,
        criadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR"),
        preco: parseFloat(produtoForm.preco).toFixed(2)
      };
      produtosAtualizados = [...produtos, novoProduto];
      console.log("\u{1F195} Novo produto cadastrado:", novoProduto.nome);
      alert(`\u2705 Produto "${novoProduto.nome}" foi cadastrado com sucesso!`);
    }
    setProdutos(produtosAtualizados);
    localStorage.setItem("produtos_sobral", JSON.stringify(produtosAtualizados));
    window.dispatchEvent(new CustomEvent("produtos_updated", {
      detail: { produtos: produtosAtualizados }
    }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("dados_sincronizados", {
        detail: {
          produtos: produtosAtualizados,
          empresas,
          action: editingProdutoId ? "produto_editado" : "produto_criado",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      }));
    }, 200);
    console.log("\u{1F4CA} Total de produtos:", produtosAtualizados.length);
    console.log("\u{1F504} Sincroniza\xE7\xE3o disparada para todos os pain\xE9is");
    const formVazio = {
      nome: "",
      descricao: "",
      preco: "",
      categoria: "",
      disponivel: true,
      tempoPreparacao: "",
      imagem: ""
    };
    setProdutoForm(formVazio);
    setShowProdutoForm(false);
    setEditingProdutoId(null);
  };
  const editarProduto = (id) => {
    const produto = produtos.find((prod) => prod.id === id);
    if (produto) {
      setProdutoForm(produto);
      setEditingProdutoId(id);
      setShowProdutoForm(true);
      setActiveTab("produtos");
    }
  };
  const excluirProduto = (id) => {
    const produto = produtos.find((prod) => prod.id === id);
    if (!produto) {
      alert("Produto n\xE3o encontrado!");
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?

Esta a\xE7\xE3o n\xE3o pode ser desfeita!`)) {
      const produtosAtualizados = produtos.filter((prod) => prod.id !== id);
      setProdutos(produtosAtualizados);
      localStorage.setItem("produtos_sobral", JSON.stringify(produtosAtualizados));
      window.dispatchEvent(new CustomEvent("produtos_updated", {
        detail: { produtos: produtosAtualizados }
      }));
      console.log("\u{1F5D1}\uFE0F Produto exclu\xEDdo:", produto.nome);
      console.log("\u{1F504} Sincroniza\xE7\xE3o disparada para todos os pain\xE9is");
      alert(`\u2705 Produto "${produto.nome}" foi exclu\xEDdo com sucesso!`);
    }
  };
  const handleCadastroEmpresa = (e) => {
    e.preventDefault();
    if (empresaForm.senha !== empresaForm.confirmarSenha) {
      alert("As senhas n\xE3o coincidem!");
      return;
    }
    if (empresaForm.senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }
    if (empresas.find((emp) => emp.email === empresaForm.email)) {
      alert("Este email j\xE1 est\xE1 cadastrado!");
      return;
    }
    if (empresas.find((emp) => emp.cnpj === empresaForm.cnpj)) {
      alert("Este CNPJ j\xE1 est\xE1 cadastrado!");
      return;
    }
    const novaEmpresa = {
      id: "empresa_" + Date.now(),
      ...empresaForm,
      status: "pendente",
      // Sempre inicia como pendente
      cadastradaEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
    };
    delete novaEmpresa.confirmarSenha;
    const empresasAtualizadas = [...empresas, novaEmpresa];
    setEmpresas(empresasAtualizadas);
    localStorage.setItem("empresas_sobral", JSON.stringify(empresasAtualizadas));
    setEmpresaForm({
      nome: "",
      cnpj: "",
      categoria: "",
      responsavel: "",
      email: "",
      telefone: "",
      endereco: "",
      bairro: "",
      senha: "",
      confirmarSenha: ""
    });
    alert(`\u2705 Empresa "${novaEmpresa.nome}" cadastrada com sucesso!

Seu cadastro est\xE1 aguardando aprova\xE7\xE3o.
Voc\xEA receber\xE1 um email quando for aprovado.

Ap\xF3s a aprova\xE7\xE3o, voc\xEA poder\xE1 fazer login no sistema.`);
    setCurrentView("empresa-login");
  };
  const handleCadastroEntregador = (e) => {
    e.preventDefault();
    if (entregadorForm.senha !== entregadorForm.confirmarSenha) {
      alert("As senhas n\xE3o coincidem!");
      return;
    }
    if (entregadorForm.senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }
    if (entregadores.find((ent) => ent.email === entregadorForm.email)) {
      alert("Este email j\xE1 est\xE1 cadastrado!");
      return;
    }
    if (entregadores.find((ent) => ent.cpf === entregadorForm.cpf)) {
      alert("Este CPF j\xE1 est\xE1 cadastrado!");
      return;
    }
    const novoEntregador = {
      id: "entregador_" + Date.now(),
      ...entregadorForm,
      status: "pendente",
      // Sempre inicia como pendente
      cadastradoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
    };
    delete novoEntregador.confirmarSenha;
    const entregadoresAtualizados = [...entregadores, novoEntregador];
    setEntregadores(entregadoresAtualizados);
    localStorage.setItem("entregadores_sobral", JSON.stringify(entregadoresAtualizados));
    setEntregadorForm({
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      endereco: "",
      bairro: "",
      veiculo: "",
      placa: "",
      cnh: "",
      senha: "",
      confirmarSenha: ""
    });
    alert(`\u2705 Entregador "${novoEntregador.nome}" cadastrado com sucesso!

Seu cadastro est\xE1 aguardando aprova\xE7\xE3o.
Voc\xEA receber\xE1 um email quando for aprovado.

Ap\xF3s a aprova\xE7\xE3o, voc\xEA poder\xE1 fazer login no sistema.`);
    setCurrentView("entregador-login");
  };
  const handleCadastroConsumidor = (e) => {
    e.preventDefault();
    if (consumidorForm.senha !== consumidorForm.confirmarSenha) {
      alert("As senhas n\xE3o coincidem!");
      return;
    }
    if (consumidorForm.senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }
    if (consumidores.find((cons) => cons.email === consumidorForm.email)) {
      alert("Este email j\xE1 est\xE1 cadastrado!");
      return;
    }
    if (consumidores.find((cons) => cons.cpf === consumidorForm.cpf)) {
      alert("Este CPF j\xE1 est\xE1 cadastrado!");
      return;
    }
    const novoConsumidor = {
      id: "consumidor_" + Date.now(),
      ...consumidorForm,
      cadastradoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
    };
    delete novoConsumidor.confirmarSenha;
    const consumidoresAtualizados = [...consumidores, novoConsumidor];
    setConsumidores(consumidoresAtualizados);
    localStorage.setItem("consumidores_sobral", JSON.stringify(consumidoresAtualizados));
    setConsumidorForm({
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      endereco: "",
      bairro: "",
      pontoReferencia: "",
      senha: "",
      confirmarSenha: ""
    });
    alert(`\u2705 Cliente "${novoConsumidor.nome}" cadastrado com sucesso!

Voc\xEA j\xE1 pode fazer login no sistema e come\xE7ar a fazer pedidos!`);
    setCurrentView("consumidor-login");
  };
  const toggleDisponibilidadeProduto = (id) => {
    const produtosAtualizados = produtos.map(
      (prod) => prod.id === id ? {
        ...prod,
        disponivel: !prod.disponivel,
        atualizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
      } : prod
    );
    setProdutos(produtosAtualizados);
    localStorage.setItem("produtos_sobral", JSON.stringify(produtosAtualizados));
    window.dispatchEvent(new CustomEvent("produtos_updated", {
      detail: { produtos: produtosAtualizados }
    }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("dados_sincronizados", {
        detail: {
          produtos: produtosAtualizados,
          empresas,
          action: "produto_disponibilidade_alterada",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      }));
    }, 200);
    const produto = produtos.find((p) => p.id === id);
    console.log("\u{1F504} Sincroniza\xE7\xE3o disparada para todos os pain\xE9is");
    alert(`Produto "${produto.nome}" ${!produto.disponivel ? "disponibilizado" : "indisponibilizado"} com sucesso!`);
  };
  const aprovarEmpresa = (id) => {
    const empresasAtualizadas = empresas.map(
      (emp) => emp.id === id ? {
        ...emp,
        status: "aprovada",
        aprovadaEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
      } : emp
    );
    setEmpresas(empresasAtualizadas);
    localStorage.setItem("empresas_sobral", JSON.stringify(empresasAtualizadas));
    const empresa = empresas.find((e) => e.id === id);
    alert(`\u2705 Empresa "${empresa.nome}" foi aprovada com sucesso!`);
  };
  const rejeitarEmpresa = (id) => {
    const empresasAtualizadas = empresas.map(
      (emp) => emp.id === id ? {
        ...emp,
        status: "rejeitada",
        rejeitadaEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
      } : emp
    );
    setEmpresas(empresasAtualizadas);
    localStorage.setItem("empresas_sobral", JSON.stringify(empresasAtualizadas));
    const empresa = empresas.find((e) => e.id === id);
    alert(`\u274C Empresa "${empresa.nome}" foi rejeitada.`);
  };
  const aprovarEntregador = (id) => {
    const entregadoresAtualizados = entregadores.map(
      (ent) => ent.id === id ? {
        ...ent,
        status: "aprovado",
        aprovadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
      } : ent
    );
    setEntregadores(entregadoresAtualizados);
    localStorage.setItem("entregadores_sobral", JSON.stringify(entregadoresAtualizados));
    const entregador = entregadores.find((e) => e.id === id);
    alert(`\u2705 Entregador "${entregador.nome}" foi aprovado com sucesso!`);
  };
  const rejeitarEntregador = (id) => {
    const entregadoresAtualizados = entregadores.map(
      (ent) => ent.id === id ? {
        ...ent,
        status: "rejeitado",
        rejeitadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
      } : ent
    );
    setEntregadores(entregadoresAtualizados);
    localStorage.setItem("entregadores_sobral", JSON.stringify(entregadoresAtualizados));
    const entregador = entregadores.find((e) => e.id === id);
    alert(`\u274C Entregador "${entregador.nome}" foi rejeitado.`);
  };
  if (empresaLogada) {
    const meusProdutos = produtos.filter((p) => p.empresaId === empresaLogada.id);
    const meusPedidos2 = pedidos.filter(
      (pedido) => pedido.empresas && pedido.empresas.some((emp) => emp.empresaId === empresaLogada.id)
    );
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gray-50" }, /* @__PURE__ */ React.createElement("header", { className: "bg-white shadow-sm border-b sticky top-0 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center h-16" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-blue-600" }, "\u{1F3E2} ", empresaLogada.nome), /* @__PURE__ */ React.createElement("span", { className: "ml-4 text-sm text-gray-600" }, "Painel da Empresa")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleEmpresaLogout,
        className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
      },
      "Sair"
    ))))), /* @__PURE__ */ React.createElement("nav", { className: "bg-white shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex space-x-8" }, ["perfil", "produtos", "pedidos", "relatorios"].map((tab) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab,
        className: `py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`,
        onClick: () => setActiveTab(tab)
      },
      tab === "perfil" && "\u{1F464} Perfil",
      tab === "produtos" && "\u{1F37D}\uFE0F Produtos",
      tab === "pedidos" && "\u{1F4E6} Pedidos",
      tab === "relatorios" && "\u{1F4CA} Relat\xF3rios"
    ))))), /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "px-4 py-6 sm:px-0" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl mb-2" }, "\u{1F37D}\uFE0F"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, meusProdutos.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Produtos")), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl mb-2" }, "\u{1F4E6}"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, meusPedidos2.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Pedidos")), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl mb-2" }, "\u23F3"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, meusPedidos2.filter((p) => p.status === "pendente").length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Pendentes")), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl mb-2" }, "\u{1F4B0}"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, "R$ ", meusPedidos2.filter((p) => p.status === "entregue").reduce((sum, pedido) => {
      const empresaPedido = pedido.empresas.find((emp) => emp.empresaId === empresaLogada.id);
      return sum + (empresaPedido ? empresaPedido.subtotal : 0);
    }, 0).toFixed(2)), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Faturamento"))), activeTab === "perfil" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Perfil da Empresa"), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Informa\xE7\xF5es B\xE1sicas"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-sm" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Nome:"), " ", empresaLogada.nome), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "CNPJ:"), " ", empresaLogada.cnpj), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Categoria:"), " ", empresaLogada.categoria), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Respons\xE1vel:"), " ", empresaLogada.responsavel), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Status:"), " ", empresaLogada.status === "aprovada" ? "\u2705 Aprovada" : "\u23F3 Aguardando aprova\xE7\xE3o"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Contato e Localiza\xE7\xE3o"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-sm" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Email:"), " ", empresaLogada.email), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Telefone:"), " ", empresaLogada.telefone), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Endere\xE7o:"), " ", empresaLogada.endereco), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Bairro:"), " ", empresaLogada.bairro), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Cadastrada em:"), " ", empresaLogada.cadastradaEm)))))), activeTab === "produtos" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "Meus Produtos (", produtos.filter((p) => p.empresaId === empresaLogada.id).length, ")"), /* @__PURE__ */ React.createElement("div", { className: "flex space-x-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          try {
            const savedProdutos = localStorage.getItem("produtos_sobral");
            const savedEmpresas = localStorage.getItem("empresas_sobral");
            if (savedProdutos) {
              const produtosData2 = JSON.parse(savedProdutos);
              setProdutos(produtosData2);
              console.log("\u{1F4E6} Produtos recarregados:", produtosData2.length);
            }
            if (savedEmpresas) {
              const empresasData = JSON.parse(savedEmpresas);
              setEmpresas(empresasData);
              console.log("\u{1F3E2} Empresas recarregadas:", empresasData.length);
            }
            window.dispatchEvent(new CustomEvent("sync_all_data"));
            window.dispatchEvent(new CustomEvent("dados_sincronizados", {
              detail: {
                produtos: JSON.parse(savedProdutos || "[]"),
                empresas: JSON.parse(savedEmpresas || "[]"),
                action: "sincronizacao_manual_empresa",
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              }
            }));
            const produtosData = JSON.parse(savedProdutos || "[]");
            alert(`\u{1F504} Sincroniza\xE7\xE3o COMPLETA conclu\xEDda!

\u{1F4CA} DADOS ATUALIZADOS:
\u2022 Total de produtos: ${produtosData.length}
\u2022 Seus produtos: ${produtosData.filter((p) => p.empresaId === empresaLogada.id).length}
\u2022 Produtos dispon\xEDveis: ${produtosData.filter((p) => p.disponivel).length}

\u2705 Dados sincronizados com TODOS os pain\xE9is!`);
          } catch (error) {
            console.error("Erro na sincroniza\xE7\xE3o:", error);
            alert("Erro na sincroniza\xE7\xE3o: " + error.message);
          }
        },
        className: "bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition duration-200 text-sm"
      },
      "\u{1F504} Sincronizar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          const novoEstado = !showProdutoForm;
          setShowProdutoForm(novoEstado);
          if (novoEstado) {
            setEditingProdutoId(null);
            setProdutoForm({
              nome: "",
              descricao: "",
              preco: "",
              categoria: "",
              disponivel: true,
              tempoPreparacao: "",
              imagem: ""
            });
          } else {
            setEditingProdutoId(null);
            setProdutoForm({
              nome: "",
              descricao: "",
              preco: "",
              categoria: "",
              disponivel: true,
              tempoPreparacao: "",
              imagem: ""
            });
          }
        },
        className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
      },
      showProdutoForm ? "Cancelar" : "+ Novo Produto"
    ))), showProdutoForm && /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 mb-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, editingProdutoId ? "Editar Produto" : "Cadastrar Novo Produto"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmitProduto, className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Nome do Produto *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: produtoForm.nome,
        onChange: (e) => {
          setProdutoForm({ ...produtoForm, nome: e.target.value });
        },
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "Ex: Pizza Margherita"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Pre\xE7o (R$) *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        step: "0.01",
        required: true,
        value: produtoForm.preco,
        onChange: (e) => setProdutoForm({ ...produtoForm, preco: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "25.90"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Categoria *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        required: true,
        value: produtoForm.categoria,
        onChange: (e) => {
          setProdutoForm({ ...produtoForm, categoria: e.target.value });
        },
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      },
      /* @__PURE__ */ React.createElement("option", { value: "", disabled: true }, "Selecione uma categoria"),
      /* @__PURE__ */ React.createElement("option", { value: "Pizzas" }, "\u{1F355} Pizzas"),
      /* @__PURE__ */ React.createElement("option", { value: "Lanches" }, "\u{1F354} Lanches"),
      /* @__PURE__ */ React.createElement("option", { value: "Bebidas" }, "\u{1F964} Bebidas"),
      /* @__PURE__ */ React.createElement("option", { value: "Sobremesas" }, "\u{1F370} Sobremesas"),
      /* @__PURE__ */ React.createElement("option", { value: "Pratos Principais" }, "\u{1F37D}\uFE0F Pratos Principais"),
      /* @__PURE__ */ React.createElement("option", { value: "Petiscos" }, "\u{1F37F} Petiscos"),
      /* @__PURE__ */ React.createElement("option", { value: "Saladas" }, "\u{1F957} Saladas"),
      /* @__PURE__ */ React.createElement("option", { value: "A\xE7a\xED" }, "\u{1F368} A\xE7a\xED"),
      /* @__PURE__ */ React.createElement("option", { value: "Sorvetes" }, "\u{1F366} Sorvetes"),
      /* @__PURE__ */ React.createElement("option", { value: "Comida Japonesa" }, "\u{1F363} Comida Japonesa"),
      /* @__PURE__ */ React.createElement("option", { value: "Comida Italiana" }, "\u{1F35D} Comida Italiana"),
      /* @__PURE__ */ React.createElement("option", { value: "Comida Mexicana" }, "\u{1F32E} Comida Mexicana"),
      /* @__PURE__ */ React.createElement("option", { value: "Padaria" }, "\u{1F956} Padaria"),
      /* @__PURE__ */ React.createElement("option", { value: "Farm\xE1cia" }, "\u{1F48A} Farm\xE1cia"),
      /* @__PURE__ */ React.createElement("option", { value: "Supermercado" }, "\u{1F6D2} Supermercado"),
      /* @__PURE__ */ React.createElement("option", { value: "Outros" }, "\u{1F4E6} Outros")
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Tempo de Prepara\xE7\xE3o (minutos)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        value: produtoForm.tempoPreparacao,
        onChange: (e) => setProdutoForm({ ...produtoForm, tempoPreparacao: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "30"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Descri\xE7\xE3o *"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        required: true,
        value: produtoForm.descricao,
        onChange: (e) => {
          setProdutoForm({ ...produtoForm, descricao: e.target.value });
        },
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        rows: "3",
        placeholder: "Descreva o produto..."
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Imagem do Produto"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center w-full" }, /* @__PURE__ */ React.createElement("label", { className: "flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center pt-5 pb-6" }, /* @__PURE__ */ React.createElement("svg", { className: "w-8 h-8 mb-4 text-gray-500", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 20 16" }, /* @__PURE__ */ React.createElement("path", { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" })), /* @__PURE__ */ React.createElement("p", { className: "mb-2 text-sm text-gray-500" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, "\u{1F4F8} Clique para fazer upload")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500" }, "PNG, JPG ou JPEG (MAX. 5MB)")), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "file",
        className: "hidden",
        accept: "image/png,image/jpeg,image/jpg",
        onChange: (e) => {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              alert("\u274C Arquivo muito grande! Tamanho m\xE1ximo: 5MB");
              e.target.value = "";
              return;
            }
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
            if (!allowedTypes.includes(file.type)) {
              alert("\u274C Tipo de arquivo n\xE3o permitido! Use PNG, JPG ou JPEG");
              e.target.value = "";
              return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
              setProdutoForm({ ...produtoForm, imagem: event.target.result });
              alert("\u2705 Imagem carregada com sucesso!");
            };
            reader.onerror = () => {
              alert("\u274C Erro ao carregar imagem. Tente novamente.");
            };
            reader.readAsDataURL(file);
          }
        }
      }
    ))), produtoForm.imagem && /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: produtoForm.imagem,
        alt: "Preview do produto",
        className: "w-full h-40 object-cover rounded-lg border border-gray-300",
        onError: () => {
          alert("\u274C Erro ao carregar imagem. Verifique se o arquivo est\xE1 correto.");
        }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setProdutoForm({ ...produtoForm, imagem: "" });
        },
        className: "absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition duration-200",
        title: "Remover imagem"
      },
      "\u274C"
    )), /* @__PURE__ */ React.createElement("div", { className: "border-t pt-3" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" }, "Ou cole uma URL da imagem:"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "url",
        value: produtoForm.imagem.startsWith("data:") ? "" : produtoForm.imagem,
        onChange: (e) => {
          setProdutoForm({ ...produtoForm, imagem: e.target.value });
        },
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm",
        placeholder: "https://exemplo.com/imagem.jpg"
      }
    )))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        id: "disponivel",
        checked: produtoForm.disponivel,
        onChange: (e) => setProdutoForm({ ...produtoForm, disponivel: e.target.checked }),
        className: "mr-2"
      }
    ), /* @__PURE__ */ React.createElement("label", { htmlFor: "disponivel", className: "text-sm text-gray-700" }, "Produto dispon\xEDvel")), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200"
      },
      editingProdutoId ? "Atualizar" : "Cadastrar",
      " Produto"
    )))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "px-4 py-5 sm:p-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid gap-4" }, produtos.filter((p) => p.empresaId === empresaLogada.id).length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-12" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F37D}\uFE0F"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Nenhum produto cadastrado"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-4" }, "Comece adicionando produtos ao seu card\xE1pio"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowProdutoForm(true),
        className: "bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
      },
      "+ Adicionar Primeiro Produto"
    )) : produtos.filter((p) => p.empresaId === empresaLogada.id).map((produto) => /* @__PURE__ */ React.createElement("div", { key: produto.id, className: "border border-gray-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, produto.imagem && /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: produto.imagem,
        alt: produto.nome,
        className: "w-full h-32 object-cover rounded-lg border border-gray-200",
        onError: (e) => {
          e.target.style.display = "none";
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center mb-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, produto.nome), /* @__PURE__ */ React.createElement("span", { className: `ml-3 px-2 py-1 text-xs rounded-full ${produto.disponivel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}` }, produto.disponivel ? "\u2705 Dispon\xEDvel" : "\u274C Indispon\xEDvel")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600" }, /* @__PURE__ */ React.createElement("p", null, "\u{1F4B0} R$ ", parseFloat(produto.preco).toFixed(2)), /* @__PURE__ */ React.createElement("p", null, "\u{1F4C2} ", produto.categoria), produto.tempoPreparacao && /* @__PURE__ */ React.createElement("p", null, "\u23F1\uFE0F ", produto.tempoPreparacao, " min")), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600 mt-2" }, "\u{1F4DD} ", produto.descricao), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 mt-2" }, "Criado em: ", produto.criadoEm)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col space-y-2 ml-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => toggleDisponibilidadeProduto(produto.id),
        className: `px-3 py-1 rounded text-sm transition duration-200 ${produto.disponivel ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}`
      },
      produto.disponivel ? "\u{1F6AB} Indisponibilizar" : "\u2705 Disponibilizar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => editarProduto(produto.id),
        className: "bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition duration-200"
      },
      "\u270F\uFE0F Editar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => excluirProduto(produto.id),
        className: "bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition duration-200"
      },
      "\u{1F5D1}\uFE0F Excluir"
    ))))))))), activeTab === "pedidos" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "Meus Pedidos"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          try {
            console.log("\u{1F504} Empresa iniciando sincroniza\xE7\xE3o COMPLETA de pedidos...");
            console.log("\u{1F3E2} Empresa logada:", empresaLogada.nome, "- ID:", empresaLogada.id);
            const savedPedidos = localStorage.getItem("pedidos_sobral");
            if (savedPedidos) {
              const pedidosData = JSON.parse(savedPedidos);
              setPedidos(pedidosData);
              console.log("\u{1F4E6} Total de pedidos carregados:", pedidosData.length);
              const meusPedidosEmpresa = pedidosData.filter((pedido) => {
                const temEmpresa = pedido.empresas && pedido.empresas.some((emp) => {
                  const match = emp.empresaId === empresaLogada.id;
                  if (match) {
                    console.log("\u2705 Pedido encontrado para empresa:", pedido.id.slice(-6), "- Cliente:", pedido.consumidorNome);
                  }
                  return match;
                });
                return temEmpresa;
              });
              console.log("\u{1F3AF} Pedidos filtrados para", empresaLogada.nome, ":", meusPedidosEmpresa.length);
              const pendentes = meusPedidosEmpresa.filter((p) => p.status === "pendente");
              const preparando = meusPedidosEmpresa.filter((p) => p.status === "preparando");
              const prontos = meusPedidosEmpresa.filter((p) => p.status === "pronto");
              alert(`\u{1F504} Sincroniza\xE7\xE3o COMPLETA realizada!

\u{1F4CA} RESULTADO DETALHADO:
\u2022 Total no sistema: ${pedidosData.length} pedidos
\u2022 Seus pedidos: ${meusPedidosEmpresa.length}

\u{1F4C8} STATUS DOS SEUS PEDIDOS:
\u2022 \u23F3 Pendentes: ${pendentes.length}
\u2022 \u{1F468}\u200D\u{1F373} Preparando: ${preparando.length}
\u2022 \u{1F37D}\uFE0F Prontos: ${prontos.length}

${meusPedidosEmpresa.length > 0 ? "\u2705 Todos os pedidos est\xE3o listados abaixo!" : "\u26A0\uFE0F Nenhum pedido encontrado.\n\nDica: Verifique se h\xE1 pedidos no marketplace consumidor."}`);
            } else {
              alert("\u26A0\uFE0F Nenhum pedido encontrado no sistema.\n\nIsso pode significar que:\n\u2022 Nenhum consumidor fez pedidos ainda\n\u2022 Houve um problema na sincroniza\xE7\xE3o\n\nTente:\n1. Verificar se h\xE1 pedidos no painel do consumidor\n2. Recarregar a p\xE1gina");
            }
            window.dispatchEvent(new CustomEvent("dados_sincronizados", {
              detail: {
                pedidos: JSON.parse(savedPedidos || "[]"),
                action: "sincronizacao_manual_empresa_pedidos",
                empresaId: empresaLogada.id,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              }
            }));
          } catch (error) {
            console.error("\u274C Erro na sincroniza\xE7\xE3o completa:", error);
            alert("\u274C Erro na sincroniza\xE7\xE3o: " + error.message + "\n\nTente recarregar a p\xE1gina.");
          }
        },
        className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
      },
      "\u{1F504} Atualizar Pedidos"
    )), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-4 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md" }, "\u23F3 Pendentes (", pedidos.filter(
      (p) => p.empresas && p.empresas.some((emp) => emp.empresaId === empresaLogada.id) && p.status === "pendente"
    ).length, ")"), /* @__PURE__ */ React.createElement("div", { className: "px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-md" }, "\u{1F468}\u200D\u{1F373} Em Preparo (", pedidos.filter(
      (p) => p.empresas && p.empresas.some((emp) => emp.empresaId === empresaLogada.id) && p.status === "preparando"
    ).length, ")"), /* @__PURE__ */ React.createElement("div", { className: "px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md" }, "\u{1F37D}\uFE0F Prontos (", pedidos.filter(
      (p) => p.empresas && p.empresas.some((emp) => emp.empresaId === empresaLogada.id) && p.status === "pronto"
    ).length, ")"), /* @__PURE__ */ React.createElement("div", { className: "px-4 py-2 text-sm bg-purple-100 text-purple-800 rounded-md" }, "\u{1F4E2} Aguardando Entregador (", pedidos.filter(
      (p) => p.empresas && p.empresas.some((emp) => emp.empresaId === empresaLogada.id) && p.status === "aguardando_entregador"
    ).length, ")"), /* @__PURE__ */ React.createElement("div", { className: "px-4 py-2 text-sm bg-orange-100 text-orange-800 rounded-md" }, "\u{1F69A} Em Entrega (", pedidos.filter(
      (p) => p.empresas && p.empresas.some((emp) => emp.empresaId === empresaLogada.id) && p.status === "entrega"
    ).length, ")"), /* @__PURE__ */ React.createElement("div", { className: "px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md" }, "\u2705 Entregues (", pedidos.filter(
      (p) => p.empresas && p.empresas.some((emp) => emp.empresaId === empresaLogada.id) && p.status === "entregue"
    ).length, ")"))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, (() => {
      const meusPedidosEmpresa = pedidos.filter(
        (pedido) => pedido.empresas && pedido.empresas.some((emp) => emp.empresaId === empresaLogada.id)
      );
      if (meusPedidosEmpresa.length === 0) {
        return /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-8 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F4E6}"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-3" }, "Nenhum pedido ainda"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-6" }, "Aguarde clientes fazerem pedidos dos seus produtos."), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-blue-600" }, produtos.filter((p) => p.empresaId === empresaLogada.id).length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Produtos Cadastrados")), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-green-600" }, produtos.filter((p) => p.empresaId === empresaLogada.id && p.disponivel).length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Produtos Dispon\xEDveis")), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-orange-600" }, pedidos.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Pedidos no Sistema"))), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => setActiveTab("produtos"),
            className: "mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
          },
          "Gerenciar Produtos"
        ));
      }
      return meusPedidosEmpresa.map((pedido) => {
        const dadosEmpresaPedido = pedido.empresas.find((emp) => emp.empresaId === empresaLogada.id);
        const itensDaEmpresa = dadosEmpresaPedido ? dadosEmpresaPedido.items : [];
        return /* @__PURE__ */ React.createElement("div", { key: pedido.id, className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Pedido #", pedido.id.slice(-6)), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, pedido.criadoEm), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-700 mt-1" }, /* @__PURE__ */ React.createElement("strong", null, "Cliente:"), " ", pedido.consumidorNome), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-700" }, /* @__PURE__ */ React.createElement("strong", null, "Telefone:"), " ", pedido.telefone)), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("span", { className: `px-3 py-1 text-sm rounded-full ${pedido.status === "pendente" ? "bg-yellow-100 text-yellow-800" : pedido.status === "preparando" ? "bg-blue-100 text-blue-800" : pedido.status === "pronto" ? "bg-yellow-100 text-yellow-800" : pedido.status === "aguardando_entregador" ? "bg-purple-100 text-purple-800" : pedido.status === "entrega" ? "bg-orange-100 text-orange-800" : pedido.status === "entregue" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}` }, pedido.status === "pendente" ? "\u23F3 Pendente" : pedido.status === "preparando" ? "\u{1F468}\u200D\u{1F373} Preparando" : pedido.status === "pronto" ? "\u{1F37D}\uFE0F Pronto" : pedido.status === "aguardando_entregador" ? "\u{1F4E2} Aguardando Entregador" : pedido.status === "entrega" ? "\u{1F69A} Em Entrega" : pedido.status === "entregue" ? "\u2705 Entregue" : pedido.status), /* @__PURE__ */ React.createElement("div", { className: "text-right mt-2" }, /* @__PURE__ */ React.createElement("div", { className: "text-lg font-bold text-green-600" }, "R$ ", dadosEmpresaPedido ? dadosEmpresaPedido.subtotal.toFixed(2) : "0.00"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-gray-500" }, itensDaEmpresa.length, " item(s)")))), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 rounded-lg p-4 mb-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-medium text-gray-900 mb-2" }, "\u{1F4CD} Endere\xE7o de Entrega:"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-700" }, pedido.endereco, ", ", pedido.bairro)), /* @__PURE__ */ React.createElement("div", { className: "border-t pt-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-medium text-gray-900 mb-3" }, "\u{1F37D}\uFE0F Seus Itens neste Pedido:"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, itensDaEmpresa.map((item, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "flex justify-between items-center bg-gray-50 p-3 rounded" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, item.quantidade, "x ", item.nome), item.descricao && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-600 mt-1" }, item.descricao)), /* @__PURE__ */ React.createElement("span", { className: "font-medium text-green-600" }, "R$ ", (parseFloat(item.preco) * item.quantidade).toFixed(2)))))), /* @__PURE__ */ React.createElement("div", { className: "border-t pt-4 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, pedido.status === "pendente" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              const pedidosAtualizados = pedidos.map(
                (p) => p.id === pedido.id ? { ...p, status: "preparando", atualizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR") } : p
              );
              setPedidos(pedidosAtualizados);
              localStorage.setItem("pedidos_sobral", JSON.stringify(pedidosAtualizados));
              alert("\u2705 Pedido aceito e em prepara\xE7\xE3o!");
            },
            className: "bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 text-sm"
          },
          "\u2705 Aceitar Pedido"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              if (confirm("Tem certeza que deseja recusar este pedido?")) {
                const pedidosAtualizados = pedidos.map(
                  (p) => p.id === pedido.id ? { ...p, status: "recusado", atualizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR") } : p
                );
                setPedidos(pedidosAtualizados);
                localStorage.setItem("pedidos_sobral", JSON.stringify(pedidosAtualizados));
                alert("\u274C Pedido recusado.");
              }
            },
            className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 text-sm"
          },
          "\u274C Recusar"
        )), pedido.status === "preparando" && /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              const tipoEntrega = confirm('\u{1F69A} Como ser\xE1 a entrega?\n\n\u2705 Clique em "OK" para ENTREGADOR DO SISTEMA\n\u274C Clique em "Cancelar" para ENTREGADOR PR\xD3PRIO');
              let novoStatus = "pronto";
              let entregadorInfo = {};
              if (tipoEntrega) {
                novoStatus = "aguardando_entregador";
                entregadorInfo = {
                  tipoEntrega: "sistema",
                  disponibilizadoParaEntregadores: true,
                  disponibilizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
                };
                alert("\u{1F4E2} Pedido disponibilizado para entregadores do sistema!\n\nOs entregadores cadastrados poder\xE3o aceitar esta entrega.");
              } else {
                entregadorInfo = {
                  tipoEntrega: "proprio",
                  disponibilizadoParaEntregadores: false
                };
                alert("\u{1F37D}\uFE0F Pedido marcado como pronto!\n\nVoc\xEA far\xE1 a entrega com entregador pr\xF3prio.");
              }
              const pedidosAtualizados = pedidos.map(
                (p) => p.id === pedido.id ? {
                  ...p,
                  status: novoStatus,
                  ...entregadorInfo,
                  atualizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
                } : p
              );
              setPedidos(pedidosAtualizados);
              localStorage.setItem("pedidos_sobral", JSON.stringify(pedidosAtualizados));
              if (tipoEntrega) {
                window.dispatchEvent(new CustomEvent("novo_pedido_disponivel", {
                  detail: { pedido: pedidosAtualizados.find((p) => p.id === pedido.id) }
                }));
              }
            },
            className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm"
          },
          "\u{1F37D}\uFE0F Marcar como Pronto"
        ), pedido.status === "pronto" && /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              const pedidosAtualizados = pedidos.map(
                (p) => p.id === pedido.id ? {
                  ...p,
                  status: "entrega",
                  saiuParaEntregaEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR"),
                  atualizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
                } : p
              );
              setPedidos(pedidosAtualizados);
              localStorage.setItem("pedidos_sobral", JSON.stringify(pedidosAtualizados));
              alert("\u{1F69A} Pedido saiu para entrega!");
            },
            className: "bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition duration-200 text-sm"
          },
          "\u{1F69A} Saiu para Entrega"
        ), pedido.status === "aguardando_entregador" && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-yellow-800 font-medium" }, "\u{1F4E2} Pedido dispon\xEDvel para entregadores do sistema"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-yellow-600 mt-1" }, "Aguardando entregador aceitar a entrega")), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              if (confirm("Deseja alterar para entregador pr\xF3prio?\n\nO pedido n\xE3o ficar\xE1 mais dispon\xEDvel para entregadores do sistema.")) {
                const pedidosAtualizados = pedidos.map(
                  (p) => p.id === pedido.id ? {
                    ...p,
                    status: "pronto",
                    tipoEntrega: "proprio",
                    disponibilizadoParaEntregadores: false,
                    atualizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
                  } : p
                );
                setPedidos(pedidosAtualizados);
                localStorage.setItem("pedidos_sobral", JSON.stringify(pedidosAtualizados));
                alert("\u2705 Alterado para entregador pr\xF3prio!");
              }
            },
            className: "bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 text-sm"
          },
          "\u{1F504} Alterar para Entregador Pr\xF3prio"
        )), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              alert(`\u{1F4DE} Contato do Cliente:

Nome: ${pedido.consumidorNome}
Telefone: ${pedido.telefone}
Endere\xE7o: ${pedido.endereco}, ${pedido.bairro}`);
            },
            className: "bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 text-sm"
          },
          "\u{1F4DE} Contatar Cliente"
        ))));
      });
    })())), activeTab === "relatorios" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Relat\xF3rios"), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-center py-12" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F4CA}"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Relat\xF3rios de Vendas"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Funcionalidade em desenvolvimento")))))));
  }
  if (entregadorLogado) {
    const pedidosDisponiveis = pedidos.filter(
      (p) => p.status === "aguardando_entregador" && p.tipoEntrega === "sistema" && p.disponibilizadoParaEntregadores
    );
    const minhasEntregas = pedidos.filter((p) => p.entregadorId === entregadorLogado.id);
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gray-50" }, /* @__PURE__ */ React.createElement("header", { className: "bg-white shadow-sm border-b sticky top-0 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center h-16" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-green-600" }, "\u{1F3CD}\uFE0F ", entregadorLogado.nome), /* @__PURE__ */ React.createElement("span", { className: "ml-4 text-sm text-gray-600" }, "Painel do Entregador")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleEntregadorLogout,
        className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
      },
      "Sair"
    ))))), /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "px-4 py-6 sm:px-0" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl mb-2" }, "\u{1F4E6}"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, pedidosDisponiveis.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Pedidos Dispon\xEDveis")), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl mb-2" }, "\u{1F69A}"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, minhasEntregas.filter((p) => p.status === "entrega").length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Em Entrega")), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl mb-2" }, "\u2705"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, minhasEntregas.filter((p) => p.status === "entregue").length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Entregues"))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 mb-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "\u{1F4E6} Pedidos Dispon\xEDveis"), pedidosDisponiveis.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-8" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl mb-4" }, "\u{1F4E6}"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Nenhum pedido dispon\xEDvel no momento")) : /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, pedidosDisponiveis.map((pedido) => /* @__PURE__ */ React.createElement("div", { key: pedido.id, className: "border rounded-lg p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-medium" }, "Pedido #", pedido.id.slice(-6)), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, pedido.consumidorNome), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, pedido.endereco, ", ", pedido.bairro)), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-green-600 font-bold" }, "R$ ", pedido.total.toFixed(2)), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          if (confirm(`Aceitar entrega do pedido #${pedido.id.slice(-6)}?`)) {
            const pedidosAtualizados = pedidos.map(
              (p) => p.id === pedido.id ? {
                ...p,
                status: "entrega",
                entregadorId: entregadorLogado.id,
                entregadorNome: entregadorLogado.nome,
                aceitoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
              } : p
            );
            setPedidos(pedidosAtualizados);
            localStorage.setItem("pedidos_sobral", JSON.stringify(pedidosAtualizados));
            alert("\u2705 Entrega aceita!");
          }
        },
        className: "bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
      },
      "\u2705 Aceitar"
    ))))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-6" }, "\u{1F69A} Minhas Entregas"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, (() => {
      const minhasEntregas2 = pedidos.filter((p) => p.entregadorId === entregadorLogado.id);
      if (minhasEntregas2.length === 0) {
        return /* @__PURE__ */ React.createElement("div", { className: "text-center py-8" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl mb-4" }, "\u{1F69A}"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Nenhuma entrega ainda"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Aceite pedidos acima para come\xE7ar a fazer entregas."));
      }
      return minhasEntregas2.map((pedido) => /* @__PURE__ */ React.createElement("div", { key: pedido.id, className: "border border-gray-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Pedido #", pedido.id.slice(-6)), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, "Aceito em: ", pedido.aceitoEm), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-700 mt-1" }, /* @__PURE__ */ React.createElement("strong", null, "Cliente:"), " ", pedido.consumidorNome), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-700" }, /* @__PURE__ */ React.createElement("strong", null, "Telefone:"), " ", pedido.telefone)), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("span", { className: `px-3 py-1 text-sm rounded-full ${pedido.status === "entrega" ? "bg-orange-100 text-orange-800" : pedido.status === "entregue" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}` }, pedido.status === "entrega" ? "\u{1F69A} Em Entrega" : pedido.status === "entregue" ? "\u2705 Entregue" : pedido.status), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-bold text-green-600 mt-2" }, "R$ ", pedido.total.toFixed(2)))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-blue-900 mb-3 flex items-center" }, "\u{1F464} DADOS DO CLIENTE"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-blue-800" }, "Nome:"), /* @__PURE__ */ React.createElement("p", { className: "text-blue-700" }, pedido.consumidorNome)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-blue-800" }, "Telefone:"), /* @__PURE__ */ React.createElement("p", { className: "text-blue-700" }, pedido.telefone)))), /* @__PURE__ */ React.createElement("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-green-900 mb-3 flex items-center" }, "\u{1F4CD} ENDERE\xC7O DE ENTREGA"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 text-sm" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-green-800" }, "Endere\xE7o Completo:"), /* @__PURE__ */ React.createElement("p", { className: "text-green-700 font-medium" }, pedido.endereco)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-green-800" }, "Bairro:"), /* @__PURE__ */ React.createElement("p", { className: "text-green-700" }, pedido.bairro)), (() => {
        const consumidorCompleto = consumidores.find((c) => c.id === pedido.consumidorId);
        if (consumidorCompleto && consumidorCompleto.pontoReferencia) {
          return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-green-800" }, "Ponto de Refer\xEAncia:"), /* @__PURE__ */ React.createElement("p", { className: "text-green-700 italic" }, "\u{1F4CD} ", consumidorCompleto.pontoReferencia));
        }
        return null;
      })()), /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-3 border-t border-green-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            const endereco = encodeURIComponent(`${pedido.endereco}, ${pedido.bairro}, Sobral, CE`);
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${endereco}`, "_blank");
          },
          className: "bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center"
        },
        "\u{1F5FA}\uFE0F Abrir no Google Maps"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            const endereco = encodeURIComponent(`${pedido.endereco}, ${pedido.bairro}, Sobral, CE`);
            window.open(`https://waze.com/ul?q=${endereco}`, "_blank");
          },
          className: "bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 flex items-center"
        },
        "\u{1F697} Abrir no Waze"
      )))), /* @__PURE__ */ React.createElement("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-orange-900 mb-3 flex items-center" }, "\u{1F3E2} EMPRESAS ENVOLVIDAS"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, pedido.empresas.map((empresaPedido, index) => {
        const empresaCompleta = empresas.find((e) => e.id === empresaPedido.empresaId);
        return /* @__PURE__ */ React.createElement("div", { key: index, className: "bg-white rounded-lg p-3 border border-orange-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-2" }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-orange-900" }, empresaPedido.empresaNome), /* @__PURE__ */ React.createElement("span", { className: "text-green-600 font-bold" }, "R$ ", empresaPedido.subtotal.toFixed(2))), empresaCompleta && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-orange-700" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "\u{1F4DE} Telefone:"), " ", empresaCompleta.telefone), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "\u{1F4E7} Email:"), " ", empresaCompleta.email)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "\u{1F4CD} Endere\xE7o:"), " ", empresaCompleta.endereco), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "\u{1F3D8}\uFE0F Bairro:"), " ", empresaCompleta.bairro))), /* @__PURE__ */ React.createElement("div", { className: "mt-2 pt-2 border-t border-orange-100" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-orange-800 mb-1" }, "Itens para retirar:"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, empresaPedido.items.map((item, itemIndex) => /* @__PURE__ */ React.createElement("div", { key: itemIndex, className: "text-xs text-orange-700 flex justify-between" }, /* @__PURE__ */ React.createElement("span", null, "\u2022 ", item.quantidade, "x ", item.nome), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, "R$ ", (parseFloat(item.preco) * item.quantidade).toFixed(2)))))), empresaCompleta && /* @__PURE__ */ React.createElement("div", { className: "mt-3 pt-2 border-t border-orange-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              window.open(`tel:${empresaCompleta.telefone}`, "_self");
            },
            className: "bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
          },
          "\u{1F4DE} Ligar"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              const message = `Ol\xE1! Sou o entregador do pedido #${pedido.id.slice(-6)}. Estou a caminho para retirar.`;
              const whatsapp = empresaCompleta.telefone.replace(/\D/g, "");
              window.open(`https://wa.me/55${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
            },
            className: "bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
          },
          "\u{1F4AC} WhatsApp"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              const endereco = encodeURIComponent(`${empresaCompleta.endereco}, ${empresaCompleta.bairro}, Sobral, CE`);
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${endereco}`, "_blank");
            },
            className: "bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
          },
          "\u{1F4CD} Ver Local"
        ))));
      }))), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-gray-900 mb-3 flex items-center" }, "\u{1F4CB} RESUMO DA ENTREGA"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4 text-sm" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Total de Empresas:"), /* @__PURE__ */ React.createElement("p", { className: "font-bold text-gray-900" }, pedido.empresas.length)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Total de Itens:"), /* @__PURE__ */ React.createElement("p", { className: "font-bold text-gray-900" }, pedido.items.length)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Valor Total:"), /* @__PURE__ */ React.createElement("p", { className: "font-bold text-green-600 text-lg" }, "R$ ", pedido.total.toFixed(2))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Status:"), /* @__PURE__ */ React.createElement("p", { className: "font-bold text-orange-600" }, "\u{1F69A} Em Entrega"))))), pedido.status === "entrega" && /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            const message = `Ol\xE1! Sou o entregador do seu pedido #${pedido.id.slice(-6)}. Estou a caminho!`;
            const whatsapp = pedido.telefone.replace(/\D/g, "");
            window.open(`https://wa.me/55${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
          },
          className: "w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold"
        },
        "\u{1F4AC} Avisar Cliente (WhatsApp)"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            if (confirm(`Confirmar entrega do pedido #${pedido.id.slice(-6)}?

Cliente: ${pedido.consumidorNome}
Endere\xE7o: ${pedido.endereco}, ${pedido.bairro}
Valor: R$ ${pedido.total.toFixed(2)}`)) {
              const pedidosAtualizados = pedidos.map(
                (p) => p.id === pedido.id ? {
                  ...p,
                  status: "entregue",
                  entregueEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR"),
                  atualizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
                } : p
              );
              setPedidos(pedidosAtualizados);
              localStorage.setItem("pedidos_sobral", JSON.stringify(pedidosAtualizados));
              alert("\u{1F389} Entrega confirmada! Obrigado pelo seu trabalho!");
            }
          },
          className: "w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold"
        },
        "\u2705 Confirmar Entrega"
      ))));
    })())))));
  }
  if (consumidorLogado) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gray-50" }, /* @__PURE__ */ React.createElement("header", { className: "bg-white shadow-sm border-b sticky top-0 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center h-16" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-green-600" }, "\u{1F6D2} Entrega Sobral"), /* @__PURE__ */ React.createElement("span", { className: "ml-4 text-sm text-gray-600" }, "Ol\xE1, ", consumidorLogado.nome, "!")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveConsumerTab("carrinho"),
        className: `relative p-2 rounded-md ${activeConsumerTab === "carrinho" ? "bg-green-100 text-green-600" : "text-gray-600 hover:text-gray-900"}`
      },
      "\u{1F6D2}",
      carrinho.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" }, carrinho.length)
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleConsumidorLogout,
        className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
      },
      "Sair"
    ))))), /* @__PURE__ */ React.createElement("nav", { className: "bg-white shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex space-x-8" }, ["marketplace", "empresas", "pedidos", "perfil", "carrinho"].map((tab) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab,
        className: `py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeConsumerTab === tab ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`,
        onClick: () => setActiveConsumerTab(tab)
      },
      tab === "marketplace" && `\u{1F3EA} Produtos (${produtosFiltrados.length})`,
      tab === "empresas" && `\u{1F3E2} Empresas (${empresasAprovadas.length})`,
      tab === "pedidos" && `\u{1F4E6} Meus Pedidos (${meusPedidos.length})`,
      tab === "perfil" && "\u{1F464} Perfil",
      tab === "carrinho" && `\u{1F6D2} Carrinho (${carrinho.length})`
    ))))), /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "px-4 py-6 sm:px-0" }, activeConsumerTab === "marketplace" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl shadow-lg p-6 mb-6 text-white relative overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" }), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12" }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold mb-2" }, filtroCategoria || busca ? filtroCategoria ? `\u{1F37D}\uFE0F ${filtroCategoria}` : `\u{1F50D} "${busca}"` : "\u{1F3EA} Card\xE1pio Completo"), /* @__PURE__ */ React.createElement("p", { className: "text-blue-100 text-lg" }, produtosFiltrados.length === 0 ? "Nenhum produto encontrado" : produtosFiltrados.length === 1 ? "1 produto dispon\xEDvel" : `${produtosFiltrados.length} produtos dispon\xEDveis`, empresasAprovadas.length > 0 && ` \u2022 ${empresasAprovadas.length} empresas ativas`)), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          try {
            console.log("\u{1F464} Consumidor: iniciando sincroniza\xE7\xE3o manual...");
            const savedProdutos = localStorage.getItem("produtos_sobral");
            const savedEmpresas = localStorage.getItem("empresas_sobral");
            let produtosData = [];
            let empresasData = [];
            if (savedProdutos) {
              produtosData = JSON.parse(savedProdutos);
              setProdutos(produtosData);
              console.log("\u{1F464} Produtos carregados:", produtosData.length);
            }
            if (savedEmpresas) {
              empresasData = JSON.parse(savedEmpresas);
              setEmpresas(empresasData);
              console.log("\u{1F464} Empresas carregadas:", empresasData.length);
            }
            const empresasAprovadas2 = empresasData.filter((e) => e.status === "aprovada");
            const produtosDisponiveis2 = produtosData.filter((p) => p.disponivel);
            const produtosVisiveisParaConsumidor = produtosDisponiveis2.filter(
              (p) => empresasAprovadas2.find((e) => e.id === p.empresaId)
            );
            setForceConsumerUpdate((prev) => prev + 1);
            alert(`\u{1F504} Cat\xE1logo atualizado!

\u{1F4CA} RESULTADO:
\u2022 ${produtosVisiveisParaConsumidor.length} produtos dispon\xEDveis
\u2022 ${empresasAprovadas2.length} empresas ativas

\u2705 Tudo pronto para voc\xEA!`);
          } catch (error) {
            console.error("\u{1F464} Erro na sincroniza\xE7\xE3o do consumidor:", error);
            alert("Erro na sincroniza\xE7\xE3o: " + error.message);
          }
        },
        className: "bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium transition-all duration-300 flex items-center space-x-2 border border-white/30"
      },
      /* @__PURE__ */ React.createElement("span", { className: "animate-spin text-lg" }, "\u{1F504}"),
      /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "Atualizar")
    )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-6 text-sm text-blue-100" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-1" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F69A}"), /* @__PURE__ */ React.createElement("span", null, "Entrega r\xE1pida")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-1" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F6E1}\uFE0F"), /* @__PURE__ */ React.createElement("span", null, "Pagamento seguro")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-1" }, /* @__PURE__ */ React.createElement("span", null, "\u2B50"), /* @__PURE__ */ React.createElement("span", null, "Qualidade garantida"))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl shadow-lg p-4 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 text-xl" }, "\u{1F50D}")), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "Busque por pratos, restaurantes ou ingredientes...",
        value: busca,
        onChange: (e) => setBusca(e.target.value),
        className: "w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg placeholder-gray-400 transition-all duration-300"
      }
    ), busca && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setBusca(""),
        className: "absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
      },
      /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, "\u274C")
    ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl shadow-lg overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex overflow-x-auto scrollbar-hide" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setFiltroCategoria("");
          setBusca("");
        },
        className: `flex-shrink-0 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-3 transition-all duration-300 ${!filtroCategoria && !busca ? "border-blue-500 text-blue-600 bg-blue-50" : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, "\u{1F37D}\uFE0F"), /* @__PURE__ */ React.createElement("span", null, "Todos"))
    ), [
      { nome: "Hamb\xFArguer", emoji: "\u{1F354}" },
      { nome: "Pizzas", emoji: "\u{1F355}" },
      { nome: "Lanches", emoji: "\u{1F96A}" },
      { nome: "Bebidas", emoji: "\u{1F964}" },
      { nome: "Sobremesas", emoji: "\u{1F370}" },
      { nome: "Entradas", emoji: "\u{1F35F}" },
      { nome: "Japonesa", emoji: "\u{1F363}" },
      { nome: "Italiana", emoji: "\u{1F35D}" },
      { nome: "A\xE7a\xED", emoji: "\u{1F368}" }
    ].map((categoria) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: categoria.nome,
        onClick: () => {
          setFiltroCategoria(categoria.nome === filtroCategoria ? "" : categoria.nome);
          setBusca("");
        },
        className: `flex-shrink-0 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-3 transition-all duration-300 ${filtroCategoria === categoria.nome ? "border-blue-500 text-blue-600 bg-blue-50" : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, categoria.emoji), /* @__PURE__ */ React.createElement("span", null, categoria.nome))
    ))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-sm overflow-hidden" }, empresasAprovadas.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-16 px-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-8xl mb-6" }, "\u{1F3E2}"), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold text-gray-900 mb-3" }, "Nenhuma empresa cadastrada ainda"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-lg mb-6 max-w-md mx-auto" }, "As empresas ainda n\xE3o se cadastraram na plataforma. Em breve teremos op\xE7\xF5es incr\xEDveis para voc\xEA!"), /* @__PURE__ */ React.createElement("div", { className: "animate-pulse flex justify-center space-x-2" }, /* @__PURE__ */ React.createElement("div", { className: "h-2 w-2 bg-blue-400 rounded-full" }), /* @__PURE__ */ React.createElement("div", { className: "h-2 w-2 bg-blue-400 rounded-full animate-bounce" }), /* @__PURE__ */ React.createElement("div", { className: "h-2 w-2 bg-blue-400 rounded-full" }))) : produtos.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-16 px-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-8xl mb-6" }, "\u{1F37D}\uFE0F"), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold text-gray-900 mb-3" }, "Nenhum produto cadastrado ainda"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-lg mb-6 max-w-md mx-auto" }, "As empresas ainda n\xE3o cadastraram produtos. Aguarde, del\xEDcias est\xE3o por vir!"), /* @__PURE__ */ React.createElement("div", { className: "animate-pulse flex justify-center space-x-2" }, /* @__PURE__ */ React.createElement("div", { className: "h-2 w-2 bg-green-400 rounded-full" }), /* @__PURE__ */ React.createElement("div", { className: "h-2 w-2 bg-green-400 rounded-full animate-bounce" }), /* @__PURE__ */ React.createElement("div", { className: "h-2 w-2 bg-green-400 rounded-full" }))) : produtosFiltrados.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-16 px-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-8xl mb-6" }, "\u{1F50D}"), /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold text-gray-900 mb-3" }, "Nenhum produto encontrado"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-lg mb-6 max-w-md mx-auto" }, "N\xE3o encontramos produtos com esses filtros. Que tal tentar algo diferente?"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row gap-3 justify-center items-center" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setBusca("");
          setFiltroCategoria("");
        },
        className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-blue-700 transition duration-300 font-semibold shadow-lg transform hover:scale-105"
      },
      "\u{1F504} Limpar Filtros"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setBusca(""),
        className: "text-blue-600 hover:text-blue-700 font-medium"
      },
      "Apenas remover busca"
    ))) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, filtroCategoria ? `${filtroCategoria}` : "Todos os Produtos"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, produtosFiltrados.length, " ", produtosFiltrados.length === 1 ? "produto encontrado" : "produtos encontrados")), /* @__PURE__ */ React.createElement("div", { className: "hidden sm:flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-gray-500" }, "Ordenar por:"), /* @__PURE__ */ React.createElement("select", { className: "text-sm border border-gray-200 rounded-md px-2 py-1 bg-white" }, /* @__PURE__ */ React.createElement("option", null, "Relev\xE2ncia"), /* @__PURE__ */ React.createElement("option", null, "Menor pre\xE7o"), /* @__PURE__ */ React.createElement("option", null, "Maior pre\xE7o"), /* @__PURE__ */ React.createElement("option", null, "Mais populares"))))), /* @__PURE__ */ React.createElement("div", { className: "divide-y divide-gray-100" }, produtosFiltrados.map((produto, index) => {
      const empresa = empresasAprovadas.find((emp) => emp.id === produto.empresaId);
      if (!empresa) return null;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: produto.id,
          className: "group relative p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300"
        },
        index < 3 && /* @__PURE__ */ React.createElement("div", { className: "absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg z-10" }, "\u{1F525} Popular"),
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0 relative" }, produto.imagem ? /* @__PURE__ */ React.createElement("div", { className: "relative overflow-hidden rounded-xl border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300" }, /* @__PURE__ */ React.createElement(
          "img",
          {
            src: produto.imagem,
            alt: produto.nome,
            className: "w-24 h-24 object-cover transform group-hover:scale-110 transition-transform duration-300",
            onError: (e) => {
              e.target.style.display = "none";
              e.target.parentElement.nextElementSibling.style.display = "flex";
            }
          }
        ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" })) : null, !produto.imagem && /* @__PURE__ */ React.createElement("div", { className: "w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-300 transition-colors duration-300" }, /* @__PURE__ */ React.createElement("span", { className: "text-3xl" }, "\u{1F37D}\uFE0F")), /* @__PURE__ */ React.createElement("div", { className: "w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 items-center justify-center hidden" }, /* @__PURE__ */ React.createElement("span", { className: "text-3xl" }, "\u{1F37D}\uFE0F")), produto.tempoPreparacao && /* @__PURE__ */ React.createElement("div", { className: "absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-md" }, "\u23F1\uFE0F", produto.tempoPreparacao, "min")), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0 space-y-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300" }, produto.nome), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" }, "\u{1F3EA} ", empresa.nome), /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" }, "\u2705 Dispon\xEDvel"))), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300" }, produto.descricao), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pt-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold text-green-600" }, "R$ ", parseFloat(produto.preco).toFixed(2)), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-500" }, "Taxa de entrega n\xE3o inclu\xEDda")), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => adicionarAoCarrinho(produto, empresa),
            className: "group/btn relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          },
          /* @__PURE__ */ React.createElement("span", { className: "group-hover/btn:scale-110 transition-transform duration-200" }, "\u{1F6D2}"),
          /* @__PURE__ */ React.createElement("span", null, "Adicionar"),
          /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 rounded-full bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300" })
        )))),
        /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" })
      );
    })), /* @__PURE__ */ React.createElement("div", { className: "bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-sm text-gray-600" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F69A} Entrega r\xE1pida"), /* @__PURE__ */ React.createElement("span", null, "\u{1F6E1}\uFE0F Compra segura"), /* @__PURE__ */ React.createElement("span", null, "\u{1F4DE} Suporte 24h")), /* @__PURE__ */ React.createElement("div", { className: "hidden sm:block" }, /* @__PURE__ */ React.createElement("span", null, "Mostrando ", produtosFiltrados.length, " de ", produtos.filter((p) => p.disponivel).length, " produtos"))))))), activeConsumerTab === "empresas" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Empresas Cadastradas (", empresasAprovadas.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, empresasAprovadas.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "col-span-full text-center py-12" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F3E2}"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Nenhuma empresa aprovada ainda"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Aguarde as empresas serem aprovadas pelos administradores.")) : empresasAprovadas.map((empresa) => {
      const produtosDaEmpresa = produtos.filter((prod) => prod.empresaId === empresa.id && prod.disponivel);
      return /* @__PURE__ */ React.createElement("div", { key: empresa.id, className: "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-semibold text-gray-900 mb-1" }, empresa.nome), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, empresa.categoria)), /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800" }, "\u2705 Ativa")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("span", { className: "mr-2" }, "\u{1F4CD}"), empresa.bairro), /* @__PURE__ */ React.createElement("p", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("span", { className: "mr-2" }, "\u{1F4DE}"), empresa.telefone)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("span", { className: "mr-2" }, "\u{1F37D}\uFE0F"), produtosDaEmpresa.length, " produtos"), empresa.tempoEntrega && /* @__PURE__ */ React.createElement("p", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("span", { className: "mr-2" }, "\u23F1\uFE0F"), empresa.tempoEntrega, " min"))), produtosDaEmpresa.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-4 border-t" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600 mb-2" }, "Produtos dispon\xEDveis: ", produtosDaEmpresa.length), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setBusca(empresa.nome);
            setActiveConsumerTab("marketplace");
          },
          className: "w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
        },
        "Ver Produtos"
      ))));
    }))), activeConsumerTab === "carrinho" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Meu Carrinho (", carrinho.length, " itens)"), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, carrinho.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-12" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F6D2}"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Carrinho vazio"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-6" }, "Adicione produtos ao seu carrinho para continuar."), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveConsumerTab("marketplace"),
        className: "bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
      },
      "Explorar Produtos"
    )) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "space-y-4 mb-6" }, carrinho.map((item) => /* @__PURE__ */ React.createElement("div", { key: item.id, className: "flex justify-between items-center p-4 border border-gray-200 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-gray-900" }, item.nome), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, "\u{1F3EA} ", item.empresaNome), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-500" }, "Quantidade: ", item.quantidade)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-green-600" }, "R$ ", (parseFloat(item.preco) * item.quantidade).toFixed(2)), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => removerDoCarrinho(item.id),
        className: "text-red-600 hover:text-red-800"
      },
      "\u{1F5D1}\uFE0F"
    ))))), /* @__PURE__ */ React.createElement("div", { className: "border-t pt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg font-semibold" }, "Total:"), /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold text-green-600" }, "R$ ", carrinho.reduce((sum, item) => sum + parseFloat(item.preco) * item.quantidade, 0).toFixed(2))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: finalizarPedido,
        className: "w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold"
      },
      "\u{1F680} Finalizar Pedido"
    ))))), activeConsumerTab === "pedidos" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Meus Pedidos (", meusPedidos.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, meusPedidos.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 text-center py-12" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F4E6}"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Nenhum pedido ainda"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-6" }, "Fa\xE7a seu primeiro pedido e acompanhe aqui!"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveConsumerTab("marketplace"),
        className: "bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
      },
      "Fazer Pedido"
    )) : meusPedidos.map((pedido) => /* @__PURE__ */ React.createElement("div", { key: pedido.id, className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Pedido #", pedido.id.slice(-6)), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, pedido.criadoEm)), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("span", { className: `px-3 py-1 text-sm rounded-full ${pedido.status === "pendente" ? "bg-yellow-100 text-yellow-800" : pedido.status === "preparando" ? "bg-blue-100 text-blue-800" : pedido.status === "pronto" ? "bg-green-100 text-green-800" : pedido.status === "aguardando_entregador" ? "bg-purple-100 text-purple-800" : pedido.status === "entrega" ? "bg-orange-100 text-orange-800" : pedido.status === "entregue" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}` }, pedido.status === "pendente" ? "\u23F3 Aguardando Confirma\xE7\xE3o" : pedido.status === "preparando" ? "\u{1F468}\u200D\u{1F373} Em Prepara\xE7\xE3o" : pedido.status === "pronto" ? "\u{1F37D}\uFE0F Pronto - Entrega Pr\xF3pria" : pedido.status === "aguardando_entregador" ? "\u{1F4E2} Buscando Entregador" : pedido.status === "entrega" ? "\u{1F69A} Em Entrega" : pedido.status === "entregue" ? "\u2705 Entregue" : pedido.status), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-bold text-green-600 mt-2" }, "R$ ", pedido.total.toFixed(2)))), pedido.tipoEntrega && /* @__PURE__ */ React.createElement("div", { className: `mb-4 p-3 rounded-lg border ${pedido.tipoEntrega === "proprio" ? "bg-blue-50 border-blue-200" : "bg-purple-50 border-purple-200"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `text-sm font-medium ${pedido.tipoEntrega === "proprio" ? "text-blue-800" : "text-purple-800"}` }, pedido.tipoEntrega === "proprio" ? "\u{1F697} Entrega Pr\xF3pria da Empresa" : "\u{1F3CD}\uFE0F Entrega via Sistema"), /* @__PURE__ */ React.createElement("p", { className: `text-xs ${pedido.tipoEntrega === "proprio" ? "text-blue-600" : "text-purple-600"}` }, pedido.tipoEntrega === "proprio" ? "A empresa far\xE1 a entrega com ve\xEDculo pr\xF3prio" : "Um entregador do sistema pegar\xE1 seu pedido")), pedido.status === "pronto" && pedido.tipoEntrega === "proprio" && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          if (confirm("\u{1F504} Alterar para entregador do sistema?\n\nSeu pedido ficar\xE1 dispon\xEDvel para entregadores cadastrados na plataforma.\n\nIsso pode acelerar a entrega!")) {
            const pedidosAtualizados = pedidos.map(
              (p) => p.id === pedido.id ? {
                ...p,
                status: "aguardando_entregador",
                tipoEntrega: "sistema",
                disponibilizadoParaEntregadores: true,
                disponibilizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR"),
                alteradoPeloClienteEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR"),
                atualizadoEm: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
              } : p
            );
            setPedidos(pedidosAtualizados);
            localStorage.setItem("pedidos_sobral", JSON.stringify(pedidosAtualizados));
            window.dispatchEvent(new CustomEvent("novo_pedido_disponivel", {
              detail: { pedido: pedidosAtualizados.find((p) => p.id === pedido.id) }
            }));
            alert("\u2705 Pedido alterado para entregador do sistema!\n\nSeu pedido agora est\xE1 dispon\xEDvel para entregadores cadastrados.");
          }
        },
        className: "bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition duration-200"
      },
      "\u{1F504} Mudar p/ Sistema"
    ))), pedido.entregadorNome && /* @__PURE__ */ React.createElement("div", { className: "mb-4 p-3 rounded-lg bg-green-50 border border-green-200" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-green-800" }, "\u{1F3CD}\uFE0F Entregador: ", pedido.entregadorNome), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-green-600" }, "Entrega aceita em: ", pedido.aceitoEm)), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 mb-4" }, pedido.items.map((item, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "flex justify-between text-sm" }, /* @__PURE__ */ React.createElement("span", null, item.quantidade, "x ", item.nome), /* @__PURE__ */ React.createElement("span", null, "R$ ", (parseFloat(item.preco) * item.quantidade).toFixed(2))))), pedido.status === "aguardando_entregador" && /* @__PURE__ */ React.createElement("div", { className: "bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-medium text-purple-800" }, "\u{1F4E2} Procurando entregador dispon\xEDvel..."), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-purple-600 mt-1" }, "Disponibilizado em: ", pedido.disponibilizadoEm)), /* @__PURE__ */ React.createElement("div", { className: "border-t pt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, "Total:"), /* @__PURE__ */ React.createElement("span", { className: "text-lg font-bold text-green-600" }, "R$ ", pedido.total.toFixed(2)))))))), activeConsumerTab === "perfil" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Meu Perfil"), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Informa\xE7\xF5es Pessoais"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-sm" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Nome:"), " ", consumidorLogado.nome), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Email:"), " ", consumidorLogado.email), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Telefone:"), " ", consumidorLogado.telefone), consumidorLogado.cpf && /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "CPF:"), " ", consumidorLogado.cpf), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Cadastrado em:"), " ", consumidorLogado.cadastradoEm))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Endere\xE7o de Entrega"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-sm" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Endere\xE7o:"), " ", consumidorLogado.endereco), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Bairro:"), " ", consumidorLogado.bairro), consumidorLogado.pontoReferencia && /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Ponto de Refer\xEAncia:"), " ", consumidorLogado.pontoReferencia))), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Estat\xEDsticas"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-green-600" }, meusPedidos.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Total de Pedidos")), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-green-600" }, "R$ ", meusPedidos.reduce((sum, pedido) => sum + pedido.total, 0).toFixed(2)), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Valor Total Gasto"))))))))));
  }
  if (isAuthenticated && !entregadorLogado && !empresaLogada && !consumidorLogado) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gray-50" }, /* @__PURE__ */ React.createElement("header", { className: "bg-white shadow-sm border-b sticky top-0 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center h-16" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-red-600" }, "\u{1F355} Entrega Sobral - Admin"), /* @__PURE__ */ React.createElement("span", { className: "ml-4 text-sm text-gray-600" }, "Painel Administrativo")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleAdminLogout,
        className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
      },
      "Sair"
    ))))), /* @__PURE__ */ React.createElement("nav", { className: "bg-white shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex space-x-8" }, ["dashboard", "empresas", "entregadores", "consumidores", "pedidos", "database"].map((tab) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab,
        className: `py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`,
        onClick: () => setActiveTab(tab)
      },
      tab === "dashboard" && "\u{1F4CA} Dashboard",
      tab === "empresas" && `\u{1F3E2} Empresas (${empresas.filter((e) => e.status === "pendente").length})`,
      tab === "entregadores" && `\u{1F3CD}\uFE0F Entregadores (${entregadores.filter((e) => e.status === "pendente").length})`,
      tab === "consumidores" && `\u{1F6D2} Consumidores (${consumidores.length})`,
      tab === "pedidos" && `\u{1F4E6} Pedidos (${pedidos.length})`,
      tab === "database" && `\u{1F5C4}\uFE0F Banco de Dados ${databaseConfig.isConnected ? "\u2705" : "\u274C"}`
    ))))), /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "px-4 py-6 sm:px-0" }, activeTab === "dashboard" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Dashboard Administrativo"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl" }, "\u{1F3E2}")), /* @__PURE__ */ React.createElement("div", { className: "ml-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, empresas.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Empresas Total"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-orange-600" }, empresas.filter((e) => e.status === "pendente").length, " pendentes")))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl" }, "\u{1F3CD}\uFE0F")), /* @__PURE__ */ React.createElement("div", { className: "ml-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, entregadores.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Entregadores Total"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-orange-600" }, entregadores.filter((e) => e.status === "pendente").length, " pendentes")))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl" }, "\u{1F6D2}")), /* @__PURE__ */ React.createElement("div", { className: "ml-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, consumidores.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Consumidores"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-green-600" }, "Todos ativos")))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl" }, "\u{1F4E6}")), /* @__PURE__ */ React.createElement("div", { className: "ml-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, pedidos.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Pedidos Total"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-600" }, pedidos.filter((p) => p.status === "pendente").length, " pendentes"))))), (empresas.filter((e) => e.status === "pendente").length > 0 || entregadores.filter((e) => e.status === "pendente").length > 0) && /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "\u{1F514} Aprova\xE7\xF5es Pendentes"), empresas.filter((e) => e.status === "pendente").length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-medium text-gray-700 mb-2" }, "\u{1F3E2} Empresas aguardando aprova\xE7\xE3o: ", empresas.filter((e) => e.status === "pendente").length), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveTab("empresas"),
        className: "text-blue-600 hover:text-blue-700 text-sm"
      },
      "Ver empresas pendentes \u2192"
    )), entregadores.filter((e) => e.status === "pendente").length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-medium text-gray-700 mb-2" }, "\u{1F3CD}\uFE0F Entregadores aguardando aprova\xE7\xE3o: ", entregadores.filter((e) => e.status === "pendente").length), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveTab("entregadores"),
        className: "text-blue-600 hover:text-blue-700 text-sm"
      },
      "Ver entregadores pendentes \u2192"
    ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 mt-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "\u{1F37D}\uFE0F Produtos no Sistema"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-blue-600" }, produtos.length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Total de Produtos")), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-green-600" }, produtos.filter((p) => p.disponivel).length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Produtos Dispon\xEDveis")), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-red-600" }, produtos.filter((p) => !p.disponivel).length), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Produtos Indispon\xEDveis"))))), activeTab === "empresas" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Gerenciamento de Empresas"), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-4 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveTab("empresas"),
        className: "px-4 py-2 text-sm bg-orange-100 text-orange-800 rounded-md"
      },
      "\u{1F514} Pendentes (",
      empresas.filter((e) => e.status === "pendente").length,
      ")"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveTab("empresas"),
        className: "px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md"
      },
      "\u2705 Aprovadas (",
      empresas.filter((e) => e.status === "aprovada").length,
      ")"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveTab("empresas"),
        className: "px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md"
      },
      "\u274C Rejeitadas (",
      empresas.filter((e) => e.status === "rejeitada").length,
      ")"
    ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, empresas.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F3E2}"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Nenhuma empresa cadastrada"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Aguarde empresas se cadastrarem na plataforma.")) : empresas.map((empresa) => /* @__PURE__ */ React.createElement("div", { key: empresa.id, className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center mb-3" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, empresa.nome), /* @__PURE__ */ React.createElement("span", { className: `ml-3 px-3 py-1 text-sm rounded-full ${empresa.status === "pendente" ? "bg-orange-100 text-orange-800" : empresa.status === "aprovada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}` }, empresa.status === "pendente" ? "\u23F3 Pendente" : empresa.status === "aprovada" ? "\u2705 Aprovada" : "\u274C Rejeitada")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "CNPJ:"), " ", empresa.cnpj), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Categoria:"), " ", empresa.categoria), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Respons\xE1vel:"), " ", empresa.responsavel), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Email:"), " ", empresa.email)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Telefone:"), " ", empresa.telefone), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Endere\xE7o:"), " ", empresa.endereco), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Bairro:"), " ", empresa.bairro), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Cadastrada em:"), " ", empresa.cadastradaEm)))), empresa.status === "pendente" && /* @__PURE__ */ React.createElement("div", { className: "flex space-x-2 ml-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => aprovarEmpresa(empresa.id),
        className: "bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
      },
      "\u2705 Aprovar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => rejeitarEmpresa(empresa.id),
        className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
      },
      "\u274C Rejeitar"
    ))))))), activeTab === "entregadores" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Gerenciamento de Entregadores"), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-4 mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveTab("entregadores"),
        className: "px-4 py-2 text-sm bg-orange-100 text-orange-800 rounded-md"
      },
      "\u{1F514} Pendentes (",
      entregadores.filter((e) => e.status === "pendente").length,
      ")"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveTab("entregadores"),
        className: "px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md"
      },
      "\u2705 Aprovados (",
      entregadores.filter((e) => e.status === "aprovado").length,
      ")"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveTab("entregadores"),
        className: "px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md"
      },
      "\u274C Rejeitados (",
      entregadores.filter((e) => e.status === "rejeitado").length,
      ")"
    ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, entregadores.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F3CD}\uFE0F"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Nenhum entregador cadastrado"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Aguarde entregadores se cadastrarem na plataforma.")) : entregadores.map((entregador) => /* @__PURE__ */ React.createElement("div", { key: entregador.id, className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center mb-3" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, entregador.nome), /* @__PURE__ */ React.createElement("span", { className: `ml-3 px-3 py-1 text-sm rounded-full ${entregador.status === "pendente" ? "bg-orange-100 text-orange-800" : entregador.status === "aprovado" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}` }, entregador.status === "pendente" ? "\u23F3 Pendente" : entregador.status === "aprovado" ? "\u2705 Aprovado" : "\u274C Rejeitado")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "CPF:"), " ", entregador.cpf), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Email:"), " ", entregador.email), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Telefone:"), " ", entregador.telefone), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Endere\xE7o:"), " ", entregador.endereco)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Bairro:"), " ", entregador.bairro), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Ve\xEDculo:"), " ", entregador.veiculo), entregador.placa && /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Placa:"), " ", entregador.placa), entregador.cnh && /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "CNH:"), " ", entregador.cnh), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Cadastrado em:"), " ", entregador.cadastradoEm)))), entregador.status === "pendente" && /* @__PURE__ */ React.createElement("div", { className: "flex space-x-2 ml-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => aprovarEntregador(entregador.id),
        className: "bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
      },
      "\u2705 Aprovar"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => rejeitarEntregador(entregador.id),
        className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
      },
      "\u274C Rejeitar"
    ))))))), activeTab === "consumidores" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Gerenciamento de Consumidores"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, consumidores.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F6D2}"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Nenhum consumidor cadastrado"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Aguarde consumidores se cadastrarem na plataforma.")) : consumidores.map((consumidor) => /* @__PURE__ */ React.createElement("div", { key: consumidor.id, className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center mb-3" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, consumidor.nome), /* @__PURE__ */ React.createElement("span", { className: "ml-3 px-3 py-1 text-sm rounded-full bg-green-100 text-green-800" }, "\u2705 Ativo")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "CPF:"), " ", consumidor.cpf), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Email:"), " ", consumidor.email), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Telefone:"), " ", consumidor.telefone), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Cadastrado em:"), " ", consumidor.cadastradoEm)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Endere\xE7o:"), " ", consumidor.endereco), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Bairro:"), " ", consumidor.bairro), consumidor.pontoReferencia && /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Ponto de Refer\xEAncia:"), " ", consumidor.pontoReferencia), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Pedidos:"), " ", pedidos.filter((p) => p.consumidorId === consumidor.id).length))))))))), activeTab === "pedidos" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Gerenciamento de Pedidos"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, pedidos.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-6xl mb-4" }, "\u{1F4E6}"), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-2" }, "Nenhum pedido realizado"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Aguarde pedidos serem realizados pelos consumidores.")) : pedidos.map((pedido) => /* @__PURE__ */ React.createElement("div", { key: pedido.id, className: "bg-white shadow rounded-lg p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Pedido #", pedido.id.slice(-6)), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, pedido.criadoEm)), /* @__PURE__ */ React.createElement("span", { className: `px-3 py-1 text-sm rounded-full ${pedido.status === "pendente" ? "bg-orange-100 text-orange-800" : pedido.status === "aprovado" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}` }, pedido.status === "pendente" ? "\u23F3 Pendente" : pedido.status === "aprovado" ? "\u2705 Aprovado" : "\u274C Rejeitado")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Cliente:"), " ", pedido.consumidorNome), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Telefone:"), " ", pedido.telefone), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Endere\xE7o:"), " ", pedido.endereco), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Bairro:"), " ", pedido.bairro)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Total:"), " R$ ", pedido.total.toFixed(2)), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Itens:"), " ", pedido.items.length), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Empresas:"), " ", pedido.empresas?.length || 0))), pedido.items && pedido.items.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "border-t pt-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-medium text-gray-900 mb-2" }, "Itens do Pedido:"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, pedido.items.map((item, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: "flex justify-between text-sm" }, /* @__PURE__ */ React.createElement("span", null, item.quantidade, "x ", item.nome), /* @__PURE__ */ React.createElement("span", null, "R$ ", (parseFloat(item.preco) * item.quantidade).toFixed(2)))))))))), activeTab === "database" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-6" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "Configura\xE7\xE3o do Banco de Dados"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("span", { className: `px-3 py-1 text-sm rounded-full ${databaseConfig.isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}` }, databaseConfig.isConnected ? "\u2705 Conectado" : "\u274C Desconectado"), databaseConfig.isConnected && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: disconnectDatabase,
        className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 text-sm"
      },
      "Desconectar"
    ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 mb-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Status da Conex\xE3o"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Status"), /* @__PURE__ */ React.createElement("div", { className: `text-lg font-bold ${databaseConfig.isConnected ? "text-green-600" : "text-red-600"}` }, databaseConfig.isConnected ? "Conectado" : "Desconectado")), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "Tipo"), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-bold text-gray-900" }, databaseConfig.type.toUpperCase())), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-50 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-600" }, "\xDAltima Conex\xE3o"), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-bold text-gray-900" }, databaseConfig.lastConnection || "Nunca")))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 mb-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "Configura\xE7\xE3o da Conex\xE3o"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Tipo de Banco de Dados"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: databaseConfig.type,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          type: e.target.value,
          port: e.target.value === "mysql" ? "3306" : e.target.value === "postgresql" ? "5432" : e.target.value === "mongodb" ? "27017" : "3306"
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
      },
      /* @__PURE__ */ React.createElement("option", { value: "mysql" }, "MySQL"),
      /* @__PURE__ */ React.createElement("option", { value: "postgresql" }, "PostgreSQL"),
      /* @__PURE__ */ React.createElement("option", { value: "mongodb" }, "MongoDB"),
      /* @__PURE__ */ React.createElement("option", { value: "sqlite" }, "SQLite"),
      /* @__PURE__ */ React.createElement("option", { value: "supabase" }, "\u{1F680} Supabase (PostgreSQL Cloud)")
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "M\xE9todo de Conex\xE3o"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: databaseConfig.useConnectionString ? "string" : "config",
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          useConnectionString: e.target.value === "string"
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
      },
      /* @__PURE__ */ React.createElement("option", { value: "config" }, "Configura\xE7\xE3o Manual"),
      /* @__PURE__ */ React.createElement("option", { value: "string" }, "String de Conex\xE3o")
    ))), databaseConfig.type === "supabase" ? /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-medium text-green-800 mb-2 flex items-center" }, "\u{1F680} Configura\xE7\xE3o do Supabase"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-green-700 mb-3" }, "O Supabase \xE9 uma alternativa open-source ao Firebase. Configure sua conex\xE3o abaixo:"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2 text-sm text-green-600" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4DA}"), /* @__PURE__ */ React.createElement(
      "a",
      {
        href: "https://supabase.com/dashboard",
        target: "_blank",
        rel: "noopener noreferrer",
        className: "hover:underline font-medium"
      },
      "Acesse seu Dashboard do Supabase"
    ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "\u{1F517} URL do Projeto Supabase *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "url",
        required: true,
        value: databaseConfig.supabaseUrl,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          supabaseUrl: e.target.value
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "https://seu-projeto.supabase.co"
      }
    ), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Encontre em: Projeto \u2192 Settings \u2192 API \u2192 Project URL")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "\u{1F511} Chave P\xFAblica (anon key) *"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        required: true,
        value: databaseConfig.supabaseKey,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          supabaseKey: e.target.value
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        rows: 3,
        placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    ), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Encontre em: Projeto \u2192 Settings \u2192 API \u2192 Project API keys \u2192 anon public")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "\u{1F6E1}\uFE0F Chave de Servi\xE7o (service_role key)"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: databaseConfig.supabaseServiceKey,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          supabaseServiceKey: e.target.value
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        rows: 3,
        placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (opcional para opera\xE7\xF5es administrativas)"
      }
    ), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Opcional: Para opera\xE7\xF5es administrativas. Encontre em: Projeto \u2192 Settings \u2192 API \u2192 service_role")), /* @__PURE__ */ React.createElement("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-yellow-800" }, /* @__PURE__ */ React.createElement("strong", null, "\u26A0\uFE0F Seguran\xE7a:"), " A chave de servi\xE7o possui acesso total ao banco. Use apenas em ambiente seguro e nunca a exponha no frontend em produ\xE7\xE3o."))) : databaseConfig.useConnectionString ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "String de Conex\xE3o"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: databaseConfig.connectionString,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          connectionString: e.target.value
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
        rows: 3,
        placeholder: databaseConfig.type === "mysql" ? "mysql://usuario:senha@localhost:3306/entrega_sobral" : databaseConfig.type === "postgresql" ? "postgresql://usuario:senha@localhost:5432/entrega_sobral" : databaseConfig.type === "mongodb" ? "mongodb://usuario:senha@localhost:27017/entrega_sobral" : "sqlite://./entrega_sobral.db"
      }
    )) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Host/Servidor"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: databaseConfig.host,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          host: e.target.value
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
        placeholder: "localhost"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Porta"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: databaseConfig.port,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          port: e.target.value
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
        placeholder: "3306"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Nome do Banco"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: databaseConfig.database,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          database: e.target.value
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
        placeholder: "entrega_sobral"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Usu\xE1rio"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: databaseConfig.username,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          username: e.target.value
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
        placeholder: "usuario"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Senha"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        value: databaseConfig.password,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          password: e.target.value
        }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
        placeholder: "senha"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        id: "ssl",
        checked: databaseConfig.ssl,
        onChange: (e) => setDatabaseConfig({
          ...databaseConfig,
          ssl: e.target.checked
        }),
        className: "mr-2"
      }
    ), /* @__PURE__ */ React.createElement("label", { htmlFor: "ssl", className: "text-sm text-gray-700" }, "Usar SSL/TLS"))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white shadow rounded-lg p-6 mb-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-gray-900 mb-4" }, "A\xE7\xF5es"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: testDatabaseConnection,
        disabled: databaseConfig.isConnected,
        className: `px-6 py-3 rounded-md font-medium transition duration-200 ${databaseConfig.isConnected ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`
      },
      "\u{1F50C} Testar Conex\xE3o"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: migrateToDatabase,
        disabled: !databaseConfig.isConnected,
        className: `px-6 py-3 rounded-md font-medium transition duration-200 ${!databaseConfig.isConnected ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`
      },
      "\u{1F504} Migrar Dados do LocalStorage"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          if (confirm("\u26A0\uFE0F Tem certeza que deseja limpar todas as configura\xE7\xF5es?\n\nEsta a\xE7\xE3o n\xE3o pode ser desfeita!")) {
            setDatabaseConfig({
              type: "mysql",
              host: "localhost",
              port: "3306",
              database: "entrega_sobral",
              username: "",
              password: "",
              ssl: false,
              connectionString: "",
              isConnected: false,
              lastConnection: null,
              useConnectionString: false,
              supabaseUrl: "",
              supabaseKey: "",
              supabaseServiceKey: ""
            });
            alert("\u{1F5D1}\uFE0F Configura\xE7\xF5es limpas!");
          }
        },
        className: "bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 font-medium transition duration-200"
      },
      "\u{1F5D1}\uFE0F Limpar Configura\xE7\xF5es"
    ))), /* @__PURE__ */ React.createElement("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-medium text-yellow-800 mb-4" }, "\u26A0\uFE0F Informa\xE7\xF5es Importantes"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-sm text-yellow-700" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "\u{1F4CB} Funcionalidade em Desenvolvimento:"), " Esta \xE9 uma simula\xE7\xE3o da conex\xE3o com banco de dados. Em produ\xE7\xE3o, seria necess\xE1rio implementar as rotas de API no backend."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "\u{1F510} Seguran\xE7a:"), " Nunca exponha credenciais de banco de dados no frontend. Use vari\xE1veis de ambiente e APIs seguras."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "\u{1F504} Migra\xE7\xE3o:"), " A migra\xE7\xE3o atual \xE9 simulada. Em produ\xE7\xE3o, implemente valida\xE7\xF5es e backups antes da migra\xE7\xE3o."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "\u{1F4BE} Estrutura de Tabelas:"), " Certifique-se de que as tabelas necess\xE1rias existam no banco: usuarios, empresas, entregadores, consumidores, produtos, pedidos."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "\u{1F680} Supabase:"), " Use Row Level Security (RLS) para seguran\xE7a. Configure pol\xEDticas de acesso adequadas para cada tabela.")))))));
  }
  if (currentView === "login") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-2xl p-8 w-full max-w-md" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-gray-800 mb-2" }, "\u{1F355} Entrega Sobral"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Fazer Login")), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("admin-login"),
        className: "w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center"
      },
      "\u{1F468}\u200D\u{1F4BC} Login Administrador"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("empresa-login"),
        className: "w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium flex items-center justify-center"
      },
      "\u{1F3E2} Login Empresa"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("entregador-login"),
        className: "w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200 font-medium flex items-center justify-center"
      },
      "\u{1F3CD}\uFE0F Login Entregador"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("consumidor-login"),
        className: "w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-200 font-medium flex items-center justify-center"
      },
      "\u{1F6D2} Login Cliente"
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("home"),
        className: "text-gray-500 hover:text-gray-700 text-sm"
      },
      "\u2190 Voltar ao in\xEDcio"
    ))));
  }
  if (currentView === "admin-login") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-2xl p-8 w-full max-w-md" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-gray-800 mb-2" }, "\u{1F468}\u200D\u{1F4BC} Login Administrador"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Acesso restrito")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAdminLogin, className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Usu\xE1rio"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: loginForm.usuario,
        onChange: (e) => setLoginForm({ ...loginForm, usuario: e.target.value }),
        className: "w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
        placeholder: "Digite seu usu\xE1rio"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Senha"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        value: loginForm.senha,
        onChange: (e) => setLoginForm({ ...loginForm, senha: e.target.value }),
        className: "w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500",
        placeholder: "Digite sua senha"
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-200 font-medium"
      },
      "Entrar"
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("login"),
        className: "text-gray-500 hover:text-gray-700 text-sm"
      },
      "\u2190 Voltar"
    ))));
  }
  if (currentView === "empresa-login") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-2xl p-8 w-full max-w-md" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-gray-800 mb-2" }, "\u{1F3E2} Login Empresa"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Acesse seu painel")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleEmpresaLogin, className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Email"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        required: true,
        value: loginForm.email,
        onChange: (e) => setLoginForm({ ...loginForm, email: e.target.value }),
        className: "w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "seu@email.com"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Senha"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        value: loginForm.senha,
        onChange: (e) => setLoginForm({ ...loginForm, senha: e.target.value }),
        className: "w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "Digite sua senha"
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
      },
      "Entrar"
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-sm" }, "Ainda n\xE3o \xE9 parceiro?"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("cadastro-empresa"),
        className: "text-blue-600 hover:text-blue-700 font-medium"
      },
      "Cadastrar Empresa"
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("login"),
        className: "text-gray-500 hover:text-gray-700 text-sm"
      },
      "\u2190 Voltar"
    )))));
  }
  if (currentView === "entregador-login") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-2xl p-8 w-full max-w-md" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-gray-800 mb-2" }, "\u{1F3CD}\uFE0F Login Entregador"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Acesse sua conta")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleEntregadorLogin, className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Email"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        required: true,
        value: loginForm.email,
        onChange: (e) => setLoginForm({ ...loginForm, email: e.target.value }),
        className: "w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "seu@email.com"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Senha"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        value: loginForm.senha,
        onChange: (e) => setLoginForm({ ...loginForm, senha: e.target.value }),
        className: "w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "Digite sua senha"
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200 font-medium"
      },
      "Entrar"
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-sm" }, "Ainda n\xE3o \xE9 entregador?"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("cadastro-entregador"),
        className: "text-green-600 hover:text-green-700 font-medium"
      },
      "Cadastrar Entregador"
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("login"),
        className: "text-gray-500 hover:text-gray-700 text-sm"
      },
      "\u2190 Voltar"
    )))));
  }
  if (currentView === "consumidor-login") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-2xl p-8 w-full max-w-md" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-gray-800 mb-2" }, "\u{1F6D2} Login Cliente"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Acesse sua conta")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleConsumidorLogin, className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Email"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        required: true,
        value: loginForm.email,
        onChange: (e) => setLoginForm({ ...loginForm, email: e.target.value }),
        className: "w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "seu@email.com"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Senha"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        value: loginForm.senha,
        onChange: (e) => setLoginForm({ ...loginForm, senha: e.target.value }),
        className: "w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "Digite sua senha"
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-200 font-medium"
      },
      "Entrar"
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-sm" }, "Ainda n\xE3o tem conta?"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("cadastro-consumidor"),
        className: "text-purple-600 hover:text-purple-700 font-medium"
      },
      "Cadastrar Cliente"
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("login"),
        className: "text-gray-500 hover:text-gray-700 text-sm"
      },
      "\u2190 Voltar"
    )))));
  }
  if (currentView === "cadastro-empresa") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-gray-800 mb-2" }, "\u{1F3E2} Cadastrar Empresa"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Torne-se nosso parceiro")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleCadastroEmpresa, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Nome da Empresa *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: empresaForm.nome,
        onChange: (e) => setEmpresaForm({ ...empresaForm, nome: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "Ex: Pizzaria do Jo\xE3o"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "CNPJ *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: empresaForm.cnpj,
        onChange: (e) => setEmpresaForm({ ...empresaForm, cnpj: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "00.000.000/0001-00"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Categoria *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        required: true,
        value: empresaForm.categoria,
        onChange: (e) => setEmpresaForm({ ...empresaForm, categoria: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione uma categoria"),
      /* @__PURE__ */ React.createElement("option", { value: "Pizzarias" }, "Pizzarias"),
      /* @__PURE__ */ React.createElement("option", { value: "Lanchonetes" }, "Lanchonetes"),
      /* @__PURE__ */ React.createElement("option", { value: "Restaurantes" }, "Restaurantes"),
      /* @__PURE__ */ React.createElement("option", { value: "A\xE7a\xEDteria" }, "A\xE7a\xEDteria"),
      /* @__PURE__ */ React.createElement("option", { value: "Sorveteria" }, "Sorveteria"),
      /* @__PURE__ */ React.createElement("option", { value: "Padaria" }, "Padaria"),
      /* @__PURE__ */ React.createElement("option", { value: "Farm\xE1cia" }, "Farm\xE1cia"),
      /* @__PURE__ */ React.createElement("option", { value: "Supermercado" }, "Supermercado"),
      /* @__PURE__ */ React.createElement("option", { value: "Outros" }, "Outros")
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Respons\xE1vel *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: empresaForm.responsavel,
        onChange: (e) => setEmpresaForm({ ...empresaForm, responsavel: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "Nome do respons\xE1vel"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Email *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        required: true,
        value: empresaForm.email,
        onChange: (e) => setEmpresaForm({ ...empresaForm, email: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "empresa@email.com"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Telefone *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "tel",
        required: true,
        value: empresaForm.telefone,
        onChange: (e) => setEmpresaForm({ ...empresaForm, telefone: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "(85) 99999-9999"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Endere\xE7o *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: empresaForm.endereco,
        onChange: (e) => setEmpresaForm({ ...empresaForm, endereco: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "Rua, n\xFAmero"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Bairro *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: empresaForm.bairro,
        onChange: (e) => setEmpresaForm({ ...empresaForm, bairro: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "Nome do bairro"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Senha *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        minLength: 6,
        value: empresaForm.senha,
        onChange: (e) => setEmpresaForm({ ...empresaForm, senha: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "M\xEDnimo 6 caracteres"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Confirmar Senha *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        minLength: 6,
        value: empresaForm.confirmarSenha,
        onChange: (e) => setEmpresaForm({ ...empresaForm, confirmarSenha: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        placeholder: "Confirme sua senha"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "mt-6" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
      },
      "Cadastrar Empresa"
    ))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-sm" }, "J\xE1 tem conta?"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("empresa-login"),
        className: "text-blue-600 hover:text-blue-700 font-medium"
      },
      "Fazer Login"
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("home"),
        className: "text-gray-500 hover:text-gray-700 text-sm"
      },
      "\u2190 Voltar ao in\xEDcio"
    )))));
  }
  if (currentView === "cadastro-entregador") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-gray-800 mb-2" }, "\u{1F3CD}\uFE0F Cadastrar Entregador"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Trabalhe conosco")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleCadastroEntregador, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Nome Completo *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: entregadorForm.nome,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, nome: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "Seu nome completo"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "CPF *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: entregadorForm.cpf,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, cpf: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "000.000.000-00"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Email *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        required: true,
        value: entregadorForm.email,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, email: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "seu@email.com"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Telefone *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "tel",
        required: true,
        value: entregadorForm.telefone,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, telefone: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "(85) 99999-9999"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Endere\xE7o *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: entregadorForm.endereco,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, endereco: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "Rua, n\xFAmero"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Bairro *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: entregadorForm.bairro,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, bairro: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "Nome do bairro"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Ve\xEDculo *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        required: true,
        value: entregadorForm.veiculo,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, veiculo: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione o ve\xEDculo"),
      /* @__PURE__ */ React.createElement("option", { value: "Moto" }, "Moto"),
      /* @__PURE__ */ React.createElement("option", { value: "Bicicleta" }, "Bicicleta"),
      /* @__PURE__ */ React.createElement("option", { value: "Carro" }, "Carro"),
      /* @__PURE__ */ React.createElement("option", { value: "A p\xE9" }, "A p\xE9")
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Placa do Ve\xEDculo"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: entregadorForm.placa,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, placa: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "ABC-1234"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "CNH"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: entregadorForm.cnh,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, cnh: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "N\xFAmero da CNH"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Senha *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        minLength: 6,
        value: entregadorForm.senha,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, senha: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "M\xEDnimo 6 caracteres"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Confirmar Senha *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        minLength: 6,
        value: entregadorForm.confirmarSenha,
        onChange: (e) => setEntregadorForm({ ...entregadorForm, confirmarSenha: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500",
        placeholder: "Confirme sua senha"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "mt-6" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-200 font-medium"
      },
      "Cadastrar Entregador"
    ))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-sm" }, "J\xE1 tem conta?"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("entregador-login"),
        className: "text-green-600 hover:text-green-700 font-medium"
      },
      "Fazer Login"
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("home"),
        className: "text-gray-500 hover:text-gray-700 text-sm"
      },
      "\u2190 Voltar ao in\xEDcio"
    )))));
  }
  if (currentView === "cadastro-consumidor") {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-3xl font-bold text-gray-800 mb-2" }, "\u{1F6D2} Cadastrar Cliente"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, "Crie sua conta")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleCadastroConsumidor, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Nome Completo *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: consumidorForm.nome,
        onChange: (e) => setConsumidorForm({ ...consumidorForm, nome: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "Seu nome completo"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "CPF *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: consumidorForm.cpf,
        onChange: (e) => setConsumidorForm({ ...consumidorForm, cpf: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "000.000.000-00"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Email *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        required: true,
        value: consumidorForm.email,
        onChange: (e) => setConsumidorForm({ ...consumidorForm, email: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "seu@email.com"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Telefone *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "tel",
        required: true,
        value: consumidorForm.telefone,
        onChange: (e) => setConsumidorForm({ ...consumidorForm, telefone: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "(85) 99999-9999"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Endere\xE7o *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: consumidorForm.endereco,
        onChange: (e) => setConsumidorForm({ ...consumidorForm, endereco: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "Rua, n\xFAmero"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Bairro *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        required: true,
        value: consumidorForm.bairro,
        onChange: (e) => setConsumidorForm({ ...consumidorForm, bairro: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "Nome do bairro"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Ponto de Refer\xEAncia"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: consumidorForm.pontoReferencia,
        onChange: (e) => setConsumidorForm({ ...consumidorForm, pontoReferencia: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "Ex: Pr\xF3ximo ao posto de gasolina"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Senha *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        minLength: 6,
        value: consumidorForm.senha,
        onChange: (e) => setConsumidorForm({ ...consumidorForm, senha: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "M\xEDnimo 6 caracteres"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Confirmar Senha *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        required: true,
        minLength: 6,
        value: consumidorForm.confirmarSenha,
        onChange: (e) => setConsumidorForm({ ...consumidorForm, confirmarSenha: e.target.value }),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500",
        placeholder: "Confirme sua senha"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "mt-6" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-200 font-medium"
      },
      "Cadastrar Cliente"
    ))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-sm" }, "J\xE1 tem conta?"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("consumidor-login"),
        className: "text-purple-600 hover:text-purple-700 font-medium"
      },
      "Fazer Login"
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setCurrentView("home"),
        className: "text-gray-500 hover:text-gray-700 text-sm"
      },
      "\u2190 Voltar ao in\xEDcio"
    )))));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-red-500 to-orange-600" }, /* @__PURE__ */ React.createElement("header", { className: "bg-white shadow-lg" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 py-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl font-bold text-red-600 mb-2" }, "\u{1F355} Entrega Sobral"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 text-lg" }, "Delivery r\xE1pido e seguro em Sobral - CE")))), /* @__PURE__ */ React.createElement("div", { className: "max-w-4xl mx-auto px-4 py-16" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-12" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-4" }, "Conectando voc\xEA ao que deseja"), /* @__PURE__ */ React.createElement("p", { className: "text-red-100 text-lg" }, "Escolha como deseja acessar nossa plataforma")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-xl p-6 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl mb-4" }, "\u{1F468}\u200D\u{1F4BC}"), /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-gray-800 mb-3" }, "Administrador"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-4 text-sm" }, "Gerencie empresas, entregadores e monitore a plataforma."), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentView("admin-login"),
      className: "w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition duration-200 font-semibold"
    },
    "Acesso Admin"
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-xl p-6 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl mb-4" }, "\u{1F3E2}"), /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-gray-800 mb-3" }, "Sou Empresa"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-4 text-sm" }, "Gerencie seu neg\xF3cio, produtos e pedidos online."), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentView("empresa-login"),
      className: "w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
    },
    "Login Empresa"
  ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-xl p-6 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl mb-4" }, "\u{1F3CD}\uFE0F"), /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-gray-800 mb-3" }, "Sou Entregador"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-4 text-sm" }, "Trabalhe conosco e ganhe dinheiro fazendo entregas."), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentView("entregador-login"),
      className: "w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-semibold"
    },
    "Login Entregador"
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-xl p-6 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl mb-4" }, "\u{1F6D2}"), /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-gray-800 mb-3" }, "Sou Cliente"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-4 text-sm" }, "Pe\xE7a comida e produtos com delivery r\xE1pido."), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentView("consumidor-login"),
      className: "w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition duration-200 font-semibold"
    },
    "Login Cliente"
  )))), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-lg shadow-xl p-8 mt-12 text-center" }, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-bold text-gray-800 mb-4" }, "Novo por aqui?"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600 mb-6" }, "Cadastre-se gratuitamente e fa\xE7a parte da maior plataforma de delivery de Sobral"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row gap-4 justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentView("cadastro-empresa"),
      className: "bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
    },
    "Cadastrar Empresa"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentView("cadastro-entregador"),
      className: "bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold"
    },
    "Cadastrar Entregador"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentView("cadastro-consumidor"),
      className: "bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-semibold"
    },
    "Cadastrar Cliente"
  )))));
};
var stdin_default = SistemaEntregaSobral;
export {
  stdin_default as default
};
