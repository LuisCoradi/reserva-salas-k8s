# **Reserva de Salas API**

## **Sumário**
- [Descrição Geral](#descrição-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Funcionamento](#funcionamento)
- [Configuração](#configuração)
- [Execução](#execução)

---

## **Descrição Geral**
Este projeto é uma API backend para gerenciamento de reservas de salas em uma organização. A aplicação permite registrar unidades, setores, salas e reservas, utilizando PostgreSQL como banco de dados relacional e Prisma como ORM para acesso e modelagem dos dados.

O objetivo principal é expor endpoints para consulta e manipulação das reservas, com estrutura organizada para facilitar manutenção e evolução da solução.

---

## **Tecnologias Utilizadas**
- **TypeScript**: `>= 5.x`
- **Node.js / Express**: servidor HTTP e rotas da API
- **Prisma ORM**: modelagem e acesso ao banco de dados PostgreSQL
- **PostgreSQL**: banco de dados relacional
- **Docker / Docker Compose**: ambiente de desenvolvimento e infraestrutura local
- **dotenv**: carregamento de variáveis de ambiente
- **tsx**: execução em desenvolvimento com hot reload

---

## **Estrutura do Repositório**
- **src/**:
  - `server.ts`: inicializa o Express, conecta ao PostgreSQL e sobe o servidor
- **prisma/**:
  - `schema.prisma`: definição dos modelos do banco de dados (`unidade`, `setor`, `sala`, `reserva`)
- `init.sql`: script SQL inicial para criação das tabelas no PostgreSQL
- `docker-compose.yml`: configuração do ambiente local com banco, pgAdmin e API
- `Dockerfile`: imagem da aplicação backend
- `package.json`: dependências e scripts do projeto
- `tsconfig.json`: configuração do TypeScript
- `aws/`: arquivos relacionados a infraestrutura e políticas de acesso

---

## **Funcionamento**
1. O servidor Express é iniciado em `src/server.ts`.
2. A aplicação lê a variável `DATABASE_URL` para conectar ao PostgreSQL via Prisma.
3. O Prisma Client é inicializado com o adapter PostgreSQL.
4. A API responde em JSON na rota raiz `/` com uma mensagem de status.
5. Os dados são persistidos e acessados por meio dos modelos definidos em `prisma/schema.prisma`.

---

## **Configuração**
### 1. Pré-requisitos
```bash
Node.js instalado
Docker e Docker Compose instalados
PostgreSQL ou ambiente local configurado
```

### 2. Instalação de dependências
```bash
npm install
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com a seguinte configuração:
```env
DATABASE_URL=postgresql://admin:adminpassword@localhost:5433/reserva_salas?schema=public
PORT=8080
NODE_ENV=development
```

> Caso utilize o ambiente com Docker Compose, o banco será exposto na porta `5433` e a API na porta `3000`.

### 4. Banco de Dados
O projeto possui o script de inicialização em `init.sql` e também um modelo Prisma em `prisma/schema.prisma`. Para rodar em ambiente local, você pode usar:

```bash
docker compose up --build
```

Isso inicializa os containers do banco PostgreSQL, pgAdmin e da API backend.

---

## **Execução**
### Em desenvolvimento
```bash
npm run dev
```

### Build de produção
```bash
npm run build
npm start
```

### Com Docker
```bash
docker compose up --build
```

A aplicação estará disponível em:
- API: `http://localhost:3000`
- pgAdmin: `http://localhost:5050`
- PostgreSQL: `localhost:5433`

---

## **Observações**
- O banco de dados está estruturado para suportar `unidade`, `setor`, `sala` e `reserva`.
- A aplicação já inclui validação básica de horário na tabela de reservas com a constraint `hora_inicio < hora_fim`.
- O projeto foi pensado para uso em ambiente de desenvolvimento e containerizado, com possibilidade de expansão para rotas e regras de negócio mais complexas.