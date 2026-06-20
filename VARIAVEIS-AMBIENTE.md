# Variáveis de Ambiente — Fabiju Imóveis

Guia completo para configurar o projeto localmente e em produção.

---

## Variáveis obrigatórias

### API (.NET 10)

| Variável | Descrição | Exemplo |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | String de conexão SQL Server | `Server=localhost\SQLEXPRESS;Database=ImobiliariaDb;...` |
| `Jwt__SecretKey` | Chave secreta para assinar tokens JWT (mín. 32 caracteres) | `MinhaChaveSecreta2026!...` |
| `Jwt__Issuer` | Identificador do emissor do JWT | `ImobiliariaApi` |
| `Jwt__Audience` | Audiência do JWT | `ImobiliariaFrontend` |
| `Jwt__ExpiracaoHoras` | Validade do token em horas | `24` |
| `Corretor__Email` | Email do corretor administrador | `corretor@email.com` |
| `Corretor__SenhaHash` | Hash BCrypt da senha do corretor | `$2a$12$...` |

> **Separador em variáveis de ambiente .NET:** use `__` (dois underscores) para representar `:`.
> Exemplo: `Jwt:SecretKey` vira `Jwt__SecretKey`.

### Frontend (Next.js)

| Variável | Descrição | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública da API | `https://api.seudominio.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase | `sb_publishable_...` |

---

## Como gerar o hash BCrypt da senha

O `Corretor__SenhaHash` deve conter o hash BCrypt da sua senha (nunca a senha em texto puro).

### Opção 1 — Endpoint da API (recomendado para desenvolvimento local)

Com a API rodando em modo Development:

```
GET http://localhost:5162/api/auth/gerar-hash?senha=SuaSenhaAqui
```

Resposta:
```json
{ "hash": "$2a$12$..." }
```

Copie o valor do campo `hash`. Este endpoint **não existe em produção**.

### Opção 2 — Gerador online

Use um gerador BCrypt confiável com work factor 12:
- https://bcrypt-generator.com (selecione "Rounds: 12")

### Opção 3 — Node.js

```bash
node -e "const b = require('bcryptjs'); b.hash('SuaSenha', 12).then(h => console.log(h));"
```

---

## Desenvolvimento local

### Pré-requisitos

- .NET 10 SDK
- SQL Server Express (ou LocalDB)
- Node.js 18+

### Configurar segredos da API (User Secrets)

Execute os comandos abaixo na pasta `ApiImobiliaria/ApiImobiliaria/`:

```bash
dotnet user-secrets init

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost\\SQLEXPRESS;Database=ImobiliariaDb;Trusted_Connection=True;TrustServerCertificate=True;"

dotnet user-secrets set "Jwt:SecretKey" "FabijuImoveisSecretKey2026!SqlServer@DotNet10#JWT"

dotnet user-secrets set "Corretor:Email" "seuEmail@dominio.com"

dotnet user-secrets set "Corretor:SenhaHash" "$2a$12$COLE_O_HASH_AQUI"
```

> **Como obter o SenhaHash:**
> 1. Defina os três primeiros segredos acima
> 2. Inicie a API: `dotnet run`
> 3. Acesse: `http://localhost:5162/api/auth/gerar-hash?senha=SuaSenha`
> 4. Copie o hash retornado
> 5. Execute o quarto comando com o hash copiado
> 6. Reinicie a API

### Configurar variáveis do frontend

Crie ou edite `.env.local` na raiz do projeto Next.js:

```env
NEXT_PUBLIC_API_URL=http://localhost:5162
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

### Iniciar localmente

```bash
# Terminal 1 — API
cd ApiImobiliaria/ApiImobiliaria
dotnet run

# Terminal 2 — Frontend
npm run dev
```

### Criar tabela no banco (primeira vez)

```bash
cd ApiImobiliaria/ApiImobiliaria
dotnet ef database update
```

---

## Produção

### API — variáveis de ambiente do servidor

Configure as variáveis diretamente no servidor (IIS, Railway, Azure, VPS):

```
ConnectionStrings__DefaultConnection = Server=...;Database=...;User=...;Password=...;
Jwt__SecretKey                       = SuaChaveSecretaProducao32CaracteresMinimo
Corretor__Email                      = corretor@email.com
Corretor__SenhaHash                  = $2a$12$...
ASPNETCORE_ENVIRONMENT               = Production
```

> Em produção, `ASPNETCORE_ENVIRONMENT=Production` garante que o endpoint
> `/api/auth/gerar-hash` nunca seja exposto.

### Frontend — Vercel

No painel do Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL        = https://api.seudominio.com
NEXT_PUBLIC_SUPABASE_URL   = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_...
```

### CORS da API

Antes do deploy, adicione o domínio do frontend no `Program.cs`:

```csharp
policy.WithOrigins(
    "http://localhost:3000",
    "https://localhost:3000",
    "https://seusite.vercel.app"    // ← adicionar aqui
)
```

---

## Segurança — O que mudou

| Antes | Depois |
|---|---|
| Senha em texto puro no `appsettings.json` | Hash BCrypt (work factor 12) em variável de ambiente |
| JWT secret no `appsettings.json` | Variável de ambiente / User Secrets |
| Connection string no `appsettings.Development.json` | User Secrets (local) / env var (produção) |
| `appsettings.json` com credenciais reais | `appsettings.json` com valores vazios (template) |

O BCrypt com work factor 12 requer ~300ms para verificar uma senha, tornando ataques de força bruta inviáveis mesmo que o hash vaze.
