# Tela do Motorista - Documentação Técnica

## 📋 Visão Geral

Esta documentação descreve a implementação completa da **Tela Principal do Motorista** no aplicativo Driveflex, incluindo componentes frontend React Native/TypeScript e handlers backend Java.

## 🏗️ Arquitetura

### Frontend (React Native + Expo Router)

```
mobile/mobile-two/
├── app/(tabs)/
│   ├── _layout.tsx              ← Navigation com nova aba "Motorista"
│   └── driver-dashboard.tsx     ← Tela principal do motorista ✨ NEW
├── components/
│   ├── DriverContractCard.tsx   ← Card de contrato pendente ✨ NEW
│   ├── themed-text.tsx
│   └── themed-view.tsx
├── hooks/
│   ├── usePendingContracts.ts   ← Hook para contratos pendentes (existente)
│   └── useDriverProfile.ts      ← Hook para perfil do motorista ✨ NEW
└── types/
    ├── contract.ts              ← Types de contrato (atualizado)
    └── driver.ts                ← Types do motorista ✨ NEW
```

### Backend (Java)

```
backend/src/main/java/br/com/driveflex/api/
├── Main.java                    ← Registro de rotas (atualizado)
├── DriverProfileHandler.java    ← GET /api/driver/profile ✨ NEW
├── AcceptContractHandler.java   ← PATCH /api/contracts/{id}/accept ✨ NEW
└── [outros handlers...]

repository/
└── ContractRepository.java      ← Método updateStatus() adicionado ✨ NEW
```

## 🔌 Endpoints da API

### 1. Buscar Perfil do Motorista
```
GET /api/driver/profile
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "id": "uuid",
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "birthDate": "1990-05-15",
  "role": "DRIVER",
  "createdAt": "2024-01-15T10:30:00",
  "totalTrips": 45,
  "rating": 4.8,
  "currentVehicle": {
    "id": "uuid",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2023,
    "licensePlate": "ABC-1234",
    "color": "Preto"
  }
}
```

### 2. Listar Contratos Pendentes
```
GET /api/contracts/pending
Authorization: Bearer <JWT_TOKEN>

Response (200):
[
  {
    "id": "uuid",
    "clientId": "uuid",
    "clientName": "Maria Santos",
    "driverId": "uuid",
    "status": "PENDING",
    "startTime": "2024-01-20T14:30:00",
    "endTime": "2024-01-20T16:00:00",
    "createdAt": "2024-01-20T10:00:00",
    "updatedAt": "2024-01-20T10:00:00",
    "pickupLocation": "Av. Paulista, 1000",
    "dropoffLocation": "Rua 25 de Março, 500",
    "estimatedFare": 45.50
  }
]
```

### 3. Aceitar Contrato
```
PATCH /api/contracts/{contractId}/accept
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "message": "Contrato aceito com sucesso.",
  "contractId": "uuid",
  "newStatus": "ACCEPTED"
}
```

## 📦 Tipos TypeScript

### DriverProfile
```typescript
interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  role: 'DRIVER';
  createdAt: string;
  currentVehicle?: Vehicle;
  rating?: number;
  totalTrips?: number;
}
```

### Vehicle
```typescript
interface Vehicle {
  id: string;
  driverId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}
```

### ContractRequest
```typescript
interface ContractRequest {
  id: string;
  clientId: string;
  clientName: string;
  driverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  startTime: string;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  estimatedFare?: number;
}
```

## 🎨 Componentes

### DriverContractCard

Componente que exibe um card com informações da solicitação de contrato.

**Props:**
- `contract: ContractRequest` - Dados do contrato
- `onAccepted?: (contractId: string) => void` - Callback ao aceitar
- `onError?: (error: string) => void` - Callback de erro

**Features:**
- Informações do cliente (nome, foto)
- Localização de partida e destino
- Horários de início e fim
- Valor estimado da corrida
- Botão de aceitar contrato com loading state

### useDriverProfile

Hook customizado para buscar perfil do motorista.

```typescript
const { profile, loading, error, refresh } = useDriverProfile();
```

**Retorna:**
- `profile: DriverProfile | null` - Dados do perfil
- `loading: boolean` - Status de carregamento
- `error: string | null` - Mensagem de erro
- `refresh: () => Promise<void>` - Função para recarregar dados

## 📱 Tela Driver Dashboard

A tela principal do motorista é composta por 4 seções:

### 1. **Perfil do Motorista**
- Avatar (círculo com ícone)
- Nome, email, dados do veículo atual
- Botão de edição
- Estatísticas: total de viagens, avaliação

### 2. **Gerenciamento de Veículo**
- Card com informações do veículo atual
- Botão para adicionar novo veículo
- Status da placa e cor

### 3. **Solicitações de Contratos**
- Lista de contratos com status PENDING
- Cada card mostra:
  - Informações do cliente
  - Localização (pickup + dropoff)
  - Horários
  - Valor estimado
  - Botão "Aceitar Contrato"
- Estados vazios e de erro

### 4. **Pull-to-Refresh**
- Funcionalidade nativa de recarregamento
- Recarrega perfil e contratos simultaneamente

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────┐
│   Driver Dashboard Screen           │
└──────────┬──────────────────────────┘
           │
           ├──→ useDriverProfile()     ──→ GET /api/driver/profile
           │
           ├──→ usePendingContracts()  ──→ GET /api/contracts/pending
           │
           └──→ DriverContractCard
                 └──→ handleAcceptContract()
                      └──→ PATCH /api/contracts/{id}/accept
```

## 🔐 Segurança

### Autenticação
- Token JWT obrigatório em todos os endpoints
- Token armazenado em `AsyncStorage`
- Validação de role (DRIVER) no servidor

### Autorização
- `/api/driver/profile` - Apenas motoristas
- `/api/contracts/pending` - Apenas motoristas
- `/api/contracts/{id}/accept` - Motorista do contrato

## ⚠️ TODO / Funcionalidades Futuras

1. **Backend - DriverProfileHandler:**
   - [ ] Implementar `GET /api/driver/profile` com:
     - Busca de veículo atual do motorista
     - Cálculo de rating (média de avaliações)
     - Total de viagens completadas

2. **Backend - Vehicle Model e Handler:**
   - [ ] Criar modelo `Vehicle` Java
   - [ ] Criar `VehicleRepository`
   - [ ] Criar `AddVehicleHandler` (POST /api/driver/vehicle)
   - [ ] Criar `ListVehiclesHandler` (GET /api/driver/vehicles)

3. **Frontend - Adicionar Veículo:**
   - [ ] Criar tela de cadastro de veículo
   - [ ] Integrar com API de adicionar veículo

4. **Frontend - Perfil do Motorista:**
   - [ ] Criar tela de edição de perfil
   - [ ] Integrar com API de atualizar perfil

5. **Backend - Status do Contrato:**
   - [ ] Criar handler para REJECT contrato
   - [ ] Criar handler para COMPLETE contrato
   - [ ] Implementar notificações em tempo real

## 🚀 Como Usar

### 1. Compilar Backend
```bash
cd backend
mvn clean compile
# ou use o Dockerfile para executar em container
```

### 2. Iniciar Backend
```bash
java -cp target/classes:target/dependency/* br.com.driveflex.api.Main
# Servidor rodará em http://localhost:8081
```

### 3. Executar Frontend
```bash
cd mobile/mobile-two
npm install
npx expo start
```

### 4. Acessar Tela
- Faça login como motorista
- Navegue para a aba "Motorista"

## 🧪 Testes

### Testar com cURL

#### 1. Login
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "senha123"
  }'
```

#### 2. Buscar Perfil
```bash
curl -X GET http://localhost:8081/api/driver/profile \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### 3. Listar Contratos Pendentes
```bash
curl -X GET http://localhost:8081/api/contracts/pending \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### 4. Aceitar Contrato
```bash
curl -X PATCH http://localhost:8081/api/contracts/{contractId}/accept \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 📚 Referências

- **React Native Docs:** https://reactnative.dev/
- **Expo Router:** https://docs.expo.dev/routing/introduction/
- **TypeScript:** https://www.typescriptlang.org/
- **Java HTTP Server:** https://docs.oracle.com/en/java/javase/17/docs/api/com.sun.net.httpserver/com/sun/net/httpserver/HttpServer.html

## 📝 Notas de Desenvolvimento

1. **Axios Configuration:**
   - Base URL configurada para emulador Android: `http://10.0.2.2:8080`
   - Para iOS ou web: mudar para `http://localhost:8080`
   - Para dispositivo físico: usar IP local da máquina

2. **Color Palette:**
   - Primary: `#FF6B35` (Orange)
   - Background: `#0a0a0a` (Dark)
   - Border: `#1a1a1a` (Dark Gray)
   - Text: `#ffffff` (White)

3. **Icons:**
   - Utilizando `@expo/vector-icons` (Ionicons)
   - Ref: https://ionic.io/ionicons

---

**Versão:** 1.0  
**Data:** 2024-01-20  
**Autor:** Desenvolvimento Driveflex
