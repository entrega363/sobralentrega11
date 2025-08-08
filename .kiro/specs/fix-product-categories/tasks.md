# Plano de Implementação

- [x] 1. Atualizar constantes de categorias de produtos


  - Revisar e padronizar a lista CATEGORIAS_PRODUTOS no arquivo constants.ts
  - Incluir categorias mais práticas e comuns para delivery
  - Garantir que as categorias sejam consistentes com o uso real
  - _Requisitos: 1.1, 2.2_



- [ ] 2. Corrigir componente do formulário de produtos
  - Remover array hardcoded de categorias do componente produtos/page.tsx
  - Importar CATEGORIAS_PRODUTOS do arquivo constants.ts


  - Atualizar o Select para usar as categorias importadas
  - _Requisitos: 1.1, 2.1_

- [x] 3. Melhorar mensagens de erro de validação


  - Atualizar produtoSchema para mostrar categorias válidas em caso de erro
  - Implementar mensagens de erro mais descritivas
  - Testar validação com categorias válidas e inválidas
  - _Requisitos: 3.1_



- [ ] 4. Aprimorar tratamento de erros na API de produtos
  - Melhorar handleApiError para diferentes tipos de erro de validação
  - Adicionar mensagens específicas para erros de categoria




  - Implementar logging detalhado para debug
  - _Requisitos: 3.1, 3.2_

- [ ] 5. Remover API de debug temporária
  - Verificar se a API principal /api/produtos está funcionando corretamente
  - Atualizar o componente para usar /api/produtos em vez de /api/debug-produtos
  - Remover arquivo debug-produtos/route.ts se não for mais necessário
  - _Requisitos: 1.2_

- [ ] 6. Testar fluxo completo de criação de produtos
  - Testar cadastro de produto com cada categoria disponível
  - Verificar mensagens de erro para dados inválidos
  - Confirmar que produtos são salvos corretamente no banco
  - Validar que a lista de produtos é atualizada após criação
  - _Requisitos: 1.1, 1.2, 3.3_