# Gestão de Condomínio - Monorepo

Projeto de gestão de condomínio com arquitetura monorepo separando frontend e backend.

## 🏗️ Estrutura do Projeto

```
gestao-condominio/
├── frontend/                 # Frontend Next.js + React
│   ├── app/                 # Páginas e rotas (App Router)
│   ├── components/          # Componentes React
│   ├── public/              # Assets estáticos
│   ├── package.json         # Dependências frontend
│   ├── next.config.mjs      # Config Next.js
│   ├── jsconfig.json        # Path aliases
│   └── postcss.config.mjs   # Tailwind CSS config
│
├── backend/                 # Backend (API routes + Controllers)
│   ├── api/                 # Rotas API Next.js
│   ├── controllers/         # Lógica de negócio
│   │   ├── auth.js
│   │   ├── condominio.js
│   │   ├── logs.js
│   │   ├── permissoes.js
│   │   └── usuarios.js
│   ├── models/              # Modelos de dados
│   │   ├── condominio.js
│   │   └── supabase.js
│   └── README.md
│
├── config/                  # Configurações compartilhadas
│   ├── eslint.config.mjs    # ESLint config
│   └── README.md
│
├── scripts/                 # Scripts de utilidade
│   ├── limpar-cache.bat
│   └── README.md
│
├── package.json             # Root (workspaces monorepo)
├── .gitignore
└── README.md                # Você está aqui
```

## 🚀 Scripts Disponíveis

### Frontend Only
```bash
npm run dev          # Inicia dev server (localhost:3000)
npm run build        # Build para produção
npm start            # Inicia em produção
npm run lint         # Validação ESLint
```

### Monorepo
```bash
npm run dev:all      # Inicia frontend + backend em paralelo
npm run install:all  # Instala dependências de tudo
```

## 📦 Instalação

```bash
# Instalar dependências de todos os workspaces
npm run install:all

# Ou manualmente
cd frontend && npm install
cd backend && npm install
```

## 💻 Desenvolvimento

```bash
# Frontend
cd frontend
npm run dev

# Em outro terminal, você pode trabalhar no backend
cd backend
npm run dev  # (se houver scripts setup)
```

## 📱 Stack Tecnológico

**Frontend:**
- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase JS

**Backend:**
- Next.js API Routes (atualmente)
- Controllers MVC pattern
- Supabase como BD

## 🔄 Arquitetura MVC

```
Requisição HTTP
    ↓
API Routes (app/api/*) / Controllers
    ↓
Models (Supabase queries)
    ↓
Resposta JSON
    ↓
Frontend Components (renderizam)
```

## 📝 Notas

- Frontend e Backend são workspaces npm separados
- Compartilham a mesma configuração de ESLint
- Podem ser deployados independentemente
- Backend pode ser migrado para Express/FastAPI no futuro

## 👨‍💻 Próximas Etapas

- [ ] Separar API em backend standalone (Express/Node)
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD
- [ ] Documentar endpoints API
