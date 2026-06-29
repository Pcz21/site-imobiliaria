# Deploy — Fabiju Imóveis (VPS Ubuntu 24.04)

Arquitetura: **Cloudflare → Nginx (443) → Next.js (127.0.0.1:3000) → API .NET (127.0.0.1:5162) → SQL Server (127.0.0.1:1433) → Cloudflare R2**.
Só o Nginx é público; o resto fica em `localhost`.

> ⚠️ **Pré-requisito de DNS:** os nameservers do domínio precisam estar no Cloudflare
> (no Registro.br, trocar para os NS que o Cloudflare indicou). Enquanto isso não
> propagar, **só o passo 6 (SSL) fica bloqueado** — os passos 1–5 podem adiantar.

Caminhos usados:
- `/var/www/fabiju`      → clone do repositório (Next roda daqui)
- `/var/www/fabiju-api`  → saída do `dotnet publish`
- `/etc/fabiju/*.env`    → segredos (fora do Git)

---

## 1. Servidor base
```bash
sudo adduser deploy && sudo usermod -aG sudo deploy   # se ainda não houver
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable

# Docker (p/ SQL Server)
curl -fsSL https://get.docker.com | sudo sh

# Node 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# .NET SDK 10 + Nginx + Certbot
sudo apt-get update
sudo apt-get install -y dotnet-sdk-10.0 nginx
sudo apt-get install -y certbot python3-certbot-nginx    # só se for usar Let's Encrypt
node -v && dotnet --version
```

## 2. Banco de dados (SQL Server em Docker)
```bash
sudo mkdir -p /opt/fabiju && cd /opt/fabiju
sudo cp /var/www/fabiju/deploy/docker-compose.sql.yml .   # (após o clone do passo 3)
sudo MSSQL_SA_PASSWORD='UmaSenhaForte!2026' docker compose -f docker-compose.sql.yml up -d
# criar o banco:
docker exec -i fabiju-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
  -P 'UmaSenhaForte!2026' -No -Q "CREATE DATABASE ImobiliariaDb;"
```

## 3. Código + segredos
```bash
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/Pcz21/site-imobiliaria.git fabiju
sudo chown -R $USER:$USER /var/www/fabiju

# Segredos (fora do Git). Preencha com os valores reais:
sudo mkdir -p /etc/fabiju
sudo cp /var/www/fabiju/deploy/env/api.env.example /etc/fabiju/api.env
sudo cp /var/www/fabiju/deploy/env/web.env.example /etc/fabiju/web.env
sudo nano /etc/fabiju/api.env    # trocar todos os __PLACEHOLDERS__
sudo nano /etc/fabiju/web.env    # JWT_SECRET = mesmo do Jwt__SecretKey da API
sudo chmod 600 /etc/fabiju/*.env
```
> Os hashes BCrypt e o JWT secret estão no seu ambiente local:
> `cd ApiImobiliaria/ApiImobiliaria && dotnet user-secrets list`

## 4. Migrations do banco
```bash
cd /var/www/fabiju/ApiImobiliaria/ApiImobiliaria
dotnet tool install --global dotnet-ef
export PATH="$PATH:$HOME/.dotnet/tools"
set -a && source /etc/fabiju/api.env && set +a     # carrega a connection string
dotnet ef database update
```

## 5. Publicar API + Next (serviços)
```bash
cd /var/www/fabiju
dotnet publish ApiImobiliaria/ApiImobiliaria/ApiImobiliaria.csproj -c Release -o /var/www/fabiju-api
npm ci && npm run build
sudo chown -R www-data:www-data /var/www/fabiju /var/www/fabiju-api

# systemd
sudo cp deploy/systemd/fabiju-api.service /etc/systemd/system/
sudo cp deploy/systemd/fabiju-web.service /etc/systemd/system/
#   confira o caminho do node:  which node   (ajuste o ExecStart se != /usr/bin/node)
sudo systemctl daemon-reload
sudo systemctl enable --now fabiju-api fabiju-web
systemctl status fabiju-api fabiju-web --no-pager
curl -s -o /dev/null -w "API %{http_code}\n" http://127.0.0.1:5162/api/imoveis
curl -s -o /dev/null -w "WEB %{http_code}\n" http://127.0.0.1:3000/corretor/login
```

## 6. Nginx + SSL
```bash
sudo cp /var/www/fabiju/deploy/nginx/fabijuimoveis.conf /etc/nginx/sites-available/fabijuimoveis
sudo ln -s /etc/nginx/sites-available/fabijuimoveis /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```
**SSL — escolha um caminho (proxy do Cloudflare está ATIVO):**

- **A) Cloudflare Origin Certificate (recomendado, sem mexer no DNS):**
  Cloudflare → SSL/TLS → *Origin Server* → *Create Certificate* → salve em
  `/etc/ssl/cloudflare/fabiju-origin.pem` e `.key`. No Cloudflare, SSL/TLS mode = **Full (strict)**.
  O `fabijuimoveis.conf` já aponta para esses caminhos.

- **B) Let's Encrypt (Certbot):** exige que o desafio chegue na origem. Como o
  proxy está laranja, deixe os registros A **temporariamente em "DNS only" (cinza)**,
  rode `sudo certbot --nginx -d fabijuimoveis.com.br -d www.fabijuimoveis.com.br`,
  e religue o proxy depois. (No conf, troque para as linhas `ssl_certificate` do Let's Encrypt.)

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 7. Smoke test (no navegador)
- `https://fabijuimoveis.com.br` carrega (cadeado válido)
- Login admin e corretora → cai no painel
- Publicar imóvel **com foto** → imagem abre pela URL do R2
- Enviar lead pelo formulário → aparece no painel de leads

## 8. Atualizações futuras
```bash
sudo bash /var/www/fabiju/deploy/deploy.sh   # git pull + publish + build + restart
```

## Logs / troubleshooting
```bash
journalctl -u fabiju-api -f
journalctl -u fabiju-web -f
sudo tail -f /var/log/nginx/error.log
```
