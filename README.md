Driveflex
Sistema de gerenciamento de frotas com arquitetura distribuída e alta disponibilidade. O projeto utiliza uma API Java nativa, infraestrutura orquestrada por containers com Proxy Reverso (Traefik) e banco de dados resiliente (PostgreSQL Master/Slave), além de um front-end mobile em React Native.

1. Arquitetura do Sistema
O ecossistema é dividido em três pilares fundamentais:

/backend: Servidor API desenvolvido em Java 25 (OpenJDK). Utiliza o HttpServer nativo do Java (sem frameworks pesados como Spring) e conexão direta via JDBC.
/infra: Orquestração via Docker Compose. Gerencia o Traefik (Load Balancer), o banco de dados PostgreSQL Master (Escrita) e o PostgreSQL Slave (Leitura).
/mobile: Aplicativo móvel em React Native 0.73 para Android e iOS, focado na interface do usuário.
2. Pré-requisitos
Para rodar o projeto, certifique-se de possuir as seguintes ferramentas instaladas:

Comum (Linux e Windows)
Ferramenta	Versão
Java JDK	25
Maven	3.9+
Docker & Docker Compose	Última estável
Node.js	LTS
Específico para Mobile
Android Studio: Configurado com SDK, Build Tools e Emulador.
Variável de Ambiente: ANDROID_HOME configurado.
3. Guia de Instalação e Execução
Passo 1: Preparação do Backend
Antes de subir a infraestrutura, o binário Java deve ser gerado e transformado em uma imagem Docker local.

Linux:

cd backend
mvn clean package
sudo docker build -t driveflex-backend .
Windows (PowerShell):

cd backend
mvn clean package
docker build -t driveflex-backend .
Passo 2: Inicialização da Infraestrutura
Com a imagem do backend pronta, subimos os serviços. O Traefik escutará na porta 80 do host.

Linux:

cd ../infra
sudo docker compose up -d
Windows:

cd ../infra
docker compose up -d
Passo 3: Inicialização do Mobile
Instale as bibliotecas necessárias e inicie o ambiente React Native.

cd ../mobile
npm install
npx react-native run-android
4. Portas e Endereços
Serviço	Endereço (Host)	Porta Interna	Função
API Gateway	http://localhost	80	Entrada principal (Traefik)
Painel Traefik	http://localhost:8080	8080	Dashboard do Load Balancer
Postgres Master	localhost:5432	5432	Banco Principal (Escrita)
Postgres Slave	localhost:5433	5432	Banco Réplica (Leitura)
Backend Java	—	8081	Processamento de Regras
5. Fundamentos Técnicos
Comunicação de Rede
Dentro do Docker, os serviços utilizam a rede driveflex-network. O Backend não expõe portas diretamente para fora; toda comunicação externa passa obrigatoriamente pelo Traefik.

Conectividade Mobile (Emuladores)
O Android utiliza o IP 10.0.2.2 para se comunicar com o localhost da máquina host. Portanto, no código do aplicativo, a URL base da API deve ser:

http://10.0.2.2/
Replicação de Dados
Utilizamos imagens Bitnami PostgreSQL.

O Master recebe transações e gera logs de replicação.
O Slave consome esses logs e mantém uma cópia idêntica para consultas de leitura.
6. Troubleshooting
Erro de Permissão no Docker Socket (Linux)
Se o Traefik falhar ao detectar containers, verifique o ID do grupo docker no seu sistema:

getent group docker | cut -d: -f3
Garanta que o valor no campo group_add do arquivo docker-compose.yml seja o mesmo retornado acima.

API Docker "Too Old"
O projeto força o uso da API Docker 1.44 via variáveis de ambiente no docker-compose.yml para garantir compatibilidade com versões modernas do Docker Engine.

Variáveis Android SDK
Linux: Adicione export ANDROID_HOME=$HOME/Android/Sdk ao seu .bashrc.
Windows: Configure ANDROID_HOME no painel de "Variáveis de Ambiente do Sistema" apontando para a pasta do SDK (geralmente em AppData/Local).
