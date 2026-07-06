#!/usr/bin/env bash
# Atualiza o Fabiju na VPS a partir da branch main.
# Uso:  sudo bash /var/www/fabiju/deploy/deploy.sh
set -euo pipefail

APP=/var/www/fabiju          # clone do repositório (Next roda daqui)
API=/var/www/fabiju-api      # saída do dotnet publish (systemd roda o DLL daqui)
APP_USER=paulo               # dono do clone; o serviço fabiju (Next) roda como ele

# git/npm rodam como $APP_USER: build feito como root deixa arquivos que o
# serviço (User=paulo) não consegue sobrescrever e quebra o cache do .next.
como_app_user() { runuser -u "$APP_USER" -- "$@"; }

echo ">> [1/4] Atualizando código (main)"
cd "$APP"
como_app_user git fetch origin
como_app_user git checkout main
como_app_user git pull origin main

echo ">> [2/4] Publicando API (.NET)"
dotnet publish ApiImobiliaria/ApiImobiliaria/ApiImobiliaria.csproj -c Release -o "$API"
chown -R www-data:www-data "$API"

echo ">> [3/4] Buildando Next.js"
como_app_user npm ci
como_app_user npm run build

echo ">> [4/4] Reiniciando serviços"
systemctl restart fabiju-api
systemctl restart fabiju     # unit instalada: fabiju.service (Next.js)
echo ">> Deploy concluído."
