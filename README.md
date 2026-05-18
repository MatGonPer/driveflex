O que foi feito
Criada interface TypeScript de Contract baseada em Contract.java

contract.ts
Criado hook de dados para buscar contratos pendentes

usePendingContracts.ts
Faz GET /api/contracts/pending
Usa token do AsyncStorage
Retorna contracts, loading, error e refresh
Criado componente visual reutilizável de card

ContractCard.tsx
Exibe status, cliente, motorista, data de criação e intervalo de horário
Atualizada a tela de contratos pendentes

contratosPendentes.tsx
Usa FlatList para renderizar ContractCard
Mostra:
loading
erro de conexão/autenticação
lista de contratos
card de exemplo quando não há dados reais
Também foi criado / ajustado o cliente Axios existente em api.ts para integrar as chamadas.

Arquivos principais
contract.ts
usePendingContracts.ts
ContractCard.tsx
contratosPendentes.tsx
api.ts
