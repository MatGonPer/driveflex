# Driveflex

Sistema de gerenciamento de frotas com arquitetura distribuída e alta disponibilidade. O projeto utiliza uma API Java nativa, infraestrutura orquestrada por containers com Proxy Reverso (Traefik) e banco de dados resiliente (PostgreSQL Master/Slave), além de um front-end mobile em React Native.

---

## 1. Arquitetura do Sistema

O ecossistema é dividido em três pilares fundamentais:

- **`/backend`**: Servidor API desenvolvido em Java 25 (OpenJDK). Utiliza o `HttpServer` nativo do Java (sem frameworks pesados como Spring) e conexão direta via JDBC.
- **`/infra`**: Orquestração via Docker Compose. Gerencia o Traefik (Load Balancer), o banco de dados PostgreSQL Master (Escrita) e o PostgreSQL Slave (Leitura).
- **`/mobile`**: Aplicativo móvel em React Native 0.73 para Android e iOS, focado na interface do usuário.

---

## 2. Pré-requisitos

Para rodar o projeto, certifique-se de possuir as seguintes ferramentas instaladas:

### Comum (Linux e Windows)

| Ferramenta | Versão |
|---|---|
| Java JDK | 25 |
| Maven | 3.9+ |
| Docker & Docker Compose | Última estável |
| Node.js | LTS |

### Específico para Mobile

- **Android Studio**: Configurado com SDK, Build Tools e Emulador.
- **Variável de Ambiente**: `ANDROID_HOME` configurado.

---

## 3. Guia de Instalação e Execução

### Passo 1: Preparação do Backend

Antes de subir a infraestrutura, o binário Java deve ser gerado e transformado em uma imagem Docker local.

**Linux:**
```bash
cd backend
mvn clean package
sudo docker build -t driveflex-backend .
```

**Windows (PowerShell):**
```powershell
cd backend
mvn clean package
docker build -t driveflex-backend .
```

### Passo 2: Inicialização da Infraestrutura

Com a imagem do backend pronta, subimos os serviços. O Traefik escutará na porta 80 do host.

**Linux:**
```bash
cd ../infra
sudo docker compose up -d
```

**Windows:**
```powershell
cd ../infra
docker compose up -d
```

### Passo 3: Inicialização do Mobile

Instale as bibliotecas necessárias e inicie o ambiente React Native.

```bash
cd ../mobile
npm install
npx react-native run-android
```

---

## 4. Portas e Endereços

| Serviço | Endereço (Host) | Porta Interna | Função |
|---|---|---|---|
| API Gateway | `http://localhost` | 80 | Entrada principal (Traefik) |
| Painel Traefik | `http://localhost:8080` | 8080 | Dashboard do Load Balancer |
| Postgres Master | `localhost:5432` | 5432 | Banco Principal (Escrita) |
| Postgres Slave | `localhost:5433` | 5432 | Banco Réplica (Leitura) |
| Backend Java | — | 8081 | Processamento de Regras |

---

## 5. Fundamentos Técnicos
### Comunicação de Rede
Dentro do Docker, os serviços utilizam a rede `driveflex-network`. O Backend não expõe portas diretamente para fora; toda comunicação externa passa obrigatoriamente pelo Traefik.
### Conectividade Mobile (Emuladores)
O Android utiliza o IP `10.0.2.2` para se comunicar com o `localhost` da máquina host. Portanto, no código do aplicativo, a URL base da API deve ser:
```
http://10.0.2.2/
```
### Replicação de Dados
Utilizamos imagens Bitnami PostgreSQL com replicação **Master-Slave**, garantindo resiliência e separação de responsabilidades entre leitura e escrita.

A estratégia consiste em dois bancos de dados rodando em paralelo:
- O **Master** (`postgres-master`, porta 5432) recebe todas as operações de escrita (INSERT, UPDATE, DELETE) e gera logs de replicação.
- O **Slave** (`postgres-slave`, porta 5433) consome esses logs e mantém uma cópia idêntica para consultas de leitura.

O PostgreSQL utiliza um mecanismo chamado **WAL (Write-Ahead Log)**: antes de aplicar qualquer alteração no banco, ele registra a operação em um arquivo de log. O Slave se conecta ao Master continuamente e consome esse WAL, reproduzindo as mesmas operações localmente — é assim que os dois bancos permanecem sincronizados.

```
Aplicação (backend)
       │
       ▼
postgres-master (porta 5432)
  - recebe INSERT / UPDATE / DELETE
  - grava no WAL (Write-Ahead Log)
       │
       │  envia WAL continuamente
       ▼
postgres-slave (porta 5433)
  - lê o WAL do master
  - replica todas as mudanças
  - disponível apenas para leitura
```

O container Master é definido com as seguintes variáveis de ambiente:
```yaml
POSTGRESQL_REPLICATION_MODE=master       # define o papel como master
POSTGRESQL_REPLICATION_USER=repl_user    # cria um usuário dedicado à replicação
POSTGRESQL_REPLICATION_PASSWORD=repl_senha
```
O container Slave aponta para o Master e usa o mesmo usuário de replicação:
```yaml
POSTGRESQL_REPLICATION_MODE=slave
POSTGRESQL_MASTER_HOST=postgres-master   # referencia o master pelo nome do serviço Docker
POSTGRESQL_MASTER_PORT_NUMBER=5432
POSTGRESQL_REPLICATION_USER=repl_user
POSTGRESQL_REPLICATION_PASSWORD=repl_senha
```
O campo `depends_on: postgres-master` garante que o Slave só sobe após o Master estar pronto. O hostname `postgres-master` funciona sem IP fixo porque o Docker Compose resolve nomes de serviços como DNS interno dentro da `driveflex-network`.

| Benefício | Explicação |
|---|---|
| Alta disponibilidade | Se o Master cair, o Slave já possui uma cópia completa e atualizada dos dados |
| Performance | Consultas pesadas de leitura podem ser direcionadas ao Slave, aliviando o Master |
| Backup em tempo real | O Slave funciona como espelho contínuo, sem necessidade de backups manuais frequentes |

---

## 6. Troubleshooting

### Erro de Permissão no Docker Socket (Linux)

Se o Traefik falhar ao detectar containers, verifique o ID do grupo `docker` no seu sistema:

```bash
getent group docker | cut -d: -f3
```

Garanta que o valor no campo `group_add` do arquivo `docker-compose.yml` seja o mesmo retornado acima.

### API Docker "Too Old"

O projeto força o uso da API Docker `1.44` via variáveis de ambiente no `docker-compose.yml` para garantir compatibilidade com versões modernas do Docker Engine.

### Variáveis Android SDK

- **Linux**: Adicione `export ANDROID_HOME=$HOME/Android/Sdk` ao seu `.bashrc`.
- **Windows**: Configure `ANDROID_HOME` no painel de "Variáveis de Ambiente do Sistema" apontando para a pasta do SDK (geralmente em `AppData/Local`).
