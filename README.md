# Sistema de Pagamentos
## Descrição
Esta API permite:
- Cadastro de usuários
- Login com autenticação JWT
- Realizar transferências entre usuários
- Consultar histórico de transferências

O sistema utiliza SQLite como banco de dados local e valida entradas com Zod e funções personalizadas. A aplicação é ideal para testar operações básicas de pagamento em ambiente local.

## Tecnologias Utilizadas

### Stack Tecnológica
- **Node.js** — Obrigatório, utilizado como runtime da aplicação.
- **Express** — Framework web utilizado para criar rotas e middlewares de forma simples e direta.
- **SQLite** — Banco de dados leve, armazenando dados localmente em arquivo.
- **bcrypt** — Hash de senhas para segurança.
- **jsonwebtoken (JWT)** — Autenticação baseada em token.
- **Zod** — Validação de schemas e dados recebidos nas requisições.
- **Nodemon** — Auxilia no desenvolvimento reiniciando o servidor automaticamente.
- **Jest** - Garante a qualidade do código permitindo que o desenvolvedor escrevam testes unitários.
- **Supertest** - Verifica as respostas do servidor, como códigos de status, cabeçalhos e corpo da resposta.

### Decisões Design
Embora a recomendação fosse utilizar TypeScript, Fastify e Knex.js, optei por:
- **Express** em vez de Fastify: Express é mais simples e direto para projetos pequenos, ideal para testes rápidos de APIs.
- **SQLite puro** em vez de Knex.js: SQLite é suficiente para este projeto, evitando complexidade adicional com query builders.
- **JavaScript puro** em vez de TypeScript: Para agilizar a entrega do teste e evitar configuração adicional, mantendo o foco nas funcionalidades.

Essas escolhas mantêm a aplicação funcional, segura e fácil de entender, atendendo todos os requisitos do teste.

## Como Executar o Projeto

### Pré-requisitos
- Node.js v20+
- npm v9+

### Passo a passo

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd sistema-pagamentos

2. Instale as dependências:

    ```bash
    npm install

### Configuração das Variáveis de Ambiente e iniciando projeto

Para que a aplicação funcione corretamente, é necessário criar o arquivo `.env` e definir algumas variáveis:

1. Copie o arquivo de exemplo:
    ```bash
    cp .env.example .env
    
2. Abra o arquivo .env e adicione as variáveis abaixo:
    ```bash
    # Chave secreta para criar e validar tokens JWT
    JWT_SECRET=minha_chave_super_secreta
    
    # Caminho para o banco de dados SQLite (opcional)
    DATABASE_URL=./database.db

* Observação: Não use aspas ao redor dos valores. A chave JWT_SECRET deve ser a mesma usada pelo seu aplicativo para criar e verificar tokens.

3. Inicie a aplicação:
    ```bash
    npm run dev
A API estará disponível em <http://localhost:3000>

##  Rotas da API
- **POST /register** - Rota para cadastrar usuário
- **POST /login** - Rota para logar usuário
- **POST /transfers** - Rota para transferir dinheiro a outro usuário
- **GET /history** - Rota para ver histórico de transações

## Testando as rotas com Postman
- POST <http://localhost:3000/register>
- Criando Usuário 01
    ```bash
    json
    {
      "name": "Usuário 01",
      "email": "user01@example.com",
      "password": "senha123"
    }
    
    Resposta (201):

- Criando Usuário 02
    ```bash
    json
    {
      "name": "Usuário 02",
      "email": "user02@example.com",
      "password": "senha123"
    }
    
    Resposta (201):
    
- Resposta no body
    ```bash
        {
          "id": 1,
          "name": "Usuário 01",
          "email": "user01@example.com",
          "balance_cents": 10000 //Valor inicial (R$ 100,00)
        }

- POST <http:localhost/3000/login>
- Logando na conta

    ``` bash
    json
    {
      "email": "user1@example.com",
      "password": "senha123"
    }
    
- Resposta no body
    ```bash
    {
      "message": "Login realizado com sucesso",
      "user": {
        "id": 1,
        "name": "Usuário 1",
        "email": "user1@example.com",
        "balance_cents": 10000 //Valor inicial (R$ 100,00)
      },
      "token": "<SEU_TOKEN_AQUI>" //Copie o token 
    }

- POST <http:localhost/transfers>
- Transferindo dinheiro para outra conta
- Coloque o <SEU_TOKEN_AQUI> que citei anterior mente no Headers do Postman da seguinte forma:
-- Na coluna Key, adicione uma linha chamada Authorization
-- Na colune Value, adicione uma linha chamada Bearer <SEU_TOKEN_AQUI> <-- Token que copiou
- Agora vamaos para a transferência
    ```bash
    {
      "receiverEmail": "user2@example.com",
      "amount": 5000
    }

- Resposta
    ```bash
    {
      "message": "Transferência realizada com sucesso."
    }
    
- Agora se você entrar na rota de login, e logar na conta Usuário 02, verá que o valor inicial (R$ 100,00) estará acumulado com o valor da transferência recebida (R$ 50,00)

## Decisões de Design
- Separei as rotas em arquivos individuais (register.js, login.js, transfer.js, history.js) para facilitar manutenção.
- Adicionei middleware auth.js para autenticação JWT.
- Usei Zod para validação de schema, garantindo dados corretos antes de inserir no banco.
- Mantive o banco SQLite local para simplicidade, suficiente para o teste.
