# 💰 PilaSafe

Controle financeiro simples, moderno e seguro.

Aplicação web para gerenciamento de receitas, despesas e investimentos, com foco em clareza visual, usabilidade e isolamento seguro por usuário.

---

## 🚀 Tecnologias

* **Frontend:** Next.js (App Router)
* **Backend:** Server Actions (Next.js)
* **Banco de dados:** PostgreSQL (Supabase)
* **ORM:** Prisma
* **Autenticação:** Supabase Auth (SSR)
* **Deploy:** Vercel

---

## ✨ Funcionalidades

### 🔐 Autenticação

* Cadastro com confirmação por e-mail
* Login seguro com sessão persistida
* Logout
* Recuperação de senha

---

### 💸 Lançamentos financeiros

* Criar lançamentos (Receita, Despesa, Investimento)
* Editar lançamentos
* Excluir lançamentos
* Associação com categorias
* Validação por usuário (ownership)

---

### 📊 Dashboard

* Resumo financeiro do período:

  * Receita
  * Despesa
  * Investimentos
  * Saldo
* Status automático (Saudável / Em alerta)
* Lançamentos recentes
* Gráficos financeiros (dados reais)

---

### 🗂️ Categorias

* Categorias por usuário
* Criação automática inicial
* Criação dinâmica via input inteligente

---

### 🎨 Experiência do usuário

* Interface responsiva (mobile-first)
* Feedback com toast
* Modal reutilizável para criação/edição
* Layout limpo e moderno

---

### 🔒 Segurança

* Autenticação via Supabase Auth
* Isolamento por usuário no backend
* Row Level Security (RLS) em:

  * Transaction
  * Category
* Validação de ownership no servidor

---

## 🧠 Arquitetura

O projeto segue uma estrutura limpa baseada em separação de responsabilidades:

```text
src/
  app/                # Rotas (App Router)
  components/         # Componentes reutilizáveis
  modules/            # Domínio (transactions, etc)
  shared/             # Configs (prisma, supabase, utils)
```

### Princípios aplicados:

* Server-first (Next.js)
* Separação de domínio
* Reutilização de componentes
* Evitar duplicação
* Clean Code

---

## ⚙️ Setup local

### 1. Clonar o repositório

```bash
git clone https://github.com/VarRgas/pila-safe.git
cd pila-safe
```

---

### 2. Instalar dependências

```bash
npm install
```

---

### 3. Configurar variáveis de ambiente

Crie um `.env.local`:

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

### 4. Rodar migrations

```bash
npx prisma migrate dev
```

---

### 5. Rodar o projeto

```bash
npm run dev
```

---

## 🌐 Produção

Deploy realizado na **Vercel**

### Configuração necessária:

* Variáveis de ambiente configuradas
* Supabase com:

  * Redirect URLs corretas
  * RLS habilitado
* Prisma conectado via pooler (Supabase)

---

## 🧪 Validação

Antes de publicar:

* [x] Login funcionando
* [x] Cadastro com confirmação
* [x] Reset de senha
* [x] CRUD de lançamentos
* [x] CRUD de categorias
* [x] Isolamento entre usuários
* [x] Dashboard com dados reais
* [x] Mobile responsivo

---

## 📌 Roadmap

* [ ] Gestão completa de categorias (CRUD UI)
* [ ] Melhorias nos gráficos
* [ ] Exportação de dados (CSV/Excel)
* [ ] Filtros avançados
* [ ] Notificações financeiras
* [ ] Rate limiting e hardening de segurança

---

## 👨‍💻 Autor

Desenvolvido por **Guilherme Vargas**

---

## 📄 Licença

Este projeto é de uso restrito.
Disponível apenas para fins de estudo e avaliação.

Não é permitido copiar, modificar ou utilizar este código sem autorização.
