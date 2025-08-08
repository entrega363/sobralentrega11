# Requirements Document

## Introduction

O sistema está apresentando erro ao salvar produtos devido a inconsistências entre as categorias de produtos definidas no arquivo de constantes e as categorias utilizadas no formulário de cadastro de produtos. O erro ocorre porque o schema de validação usa as categorias do arquivo constants.ts, mas o formulário usa categorias diferentes, causando falha na validação.

## Requirements

### Requirement 1

**User Story:** Como uma empresa, eu quero cadastrar produtos com categorias válidas, para que o sistema aceite meus produtos sem erros de validação.

#### Acceptance Criteria

1. WHEN uma empresa seleciona uma categoria no formulário THEN o sistema SHALL aceitar apenas categorias válidas definidas no constants.ts
2. WHEN uma empresa tenta salvar um produto THEN o sistema SHALL validar a categoria contra a lista oficial de categorias
3. WHEN há inconsistência entre categorias do formulário e constants.ts THEN o sistema SHALL usar as categorias do constants.ts como fonte única da verdade

### Requirement 2

**User Story:** Como desenvolvedor, eu quero ter uma única fonte de verdade para categorias de produtos, para que não haja inconsistências no sistema.

#### Acceptance Criteria

1. WHEN o formulário de produtos é renderizado THEN o sistema SHALL usar as categorias definidas em CATEGORIAS_PRODUTOS do constants.ts
2. WHEN novas categorias são adicionadas THEN elas SHALL ser adicionadas apenas no constants.ts
3. WHEN categorias são removidas THEN elas SHALL ser removidas apenas do constants.ts

### Requirement 3

**User Story:** Como uma empresa, eu quero ver mensagens de erro claras quando há problemas de validação, para que eu possa corrigir os dados rapidamente.

#### Acceptance Criteria

1. WHEN há erro de validação de categoria THEN o sistema SHALL mostrar uma mensagem clara indicando as categorias válidas
2. WHEN há erro de conexão ou autenticação THEN o sistema SHALL mostrar mensagens específicas para cada tipo de erro
3. WHEN o produto é salvo com sucesso THEN o sistema SHALL mostrar uma mensagem de confirmação