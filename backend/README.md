# Backend

Diretório com lógica de negócio, controladores, modelos e APIs do projeto.

## Estrutura

- **api/** - API routes do Next.js (opcional, pode ser migrado para Express/FastAPI)
- **controllers/** - Controladores (lógica de negócio)
  - auth.js - Autenticação e autorização
  - condominio.js - Gerenciamento de condomínios
  - logs.js - Logging
  - permissoes.js - Controle de permissões
  - usuarios.js - Gerenciamento de usuários

- **models/** - Modelos de dados
  - condominio.js - Modelo de condomínio
  - supabase.js - Cliente Supabase

- **middlewares/** - Middlewares (FUTURA)
- **routes/** - Rotas (FUTURA)

## Notas

Atualmente usa API routes do Next.js. Para separar completamente, migre para backend standalone (Express, FastAPI, etc).
