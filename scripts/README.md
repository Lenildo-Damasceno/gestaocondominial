# Scripts de Utilidade

Diretório para scripts auxiliares e automações do projeto.

## Arquivos

- **limpar-cache.bat** - Script para limpar cache do Next.js
  - Remove diretório `.next`
  - Remove diretório `out`
  - Reconstrói o projeto com `npm run build`

## Uso

Execute manualmente no Windows:
```cmd
scripts\limpar-cache.bat
```

Ou integre com CI/CD conforme necessário.
