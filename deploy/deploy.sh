#!/usr/bin/env bash
# Atualiza o Fabiju na VPS a partir da branch main.
# Uso:  sudo bash /var/www/fabiju/deploy/deploy.sh
set -euo pipefail

APP=/var/www/fabiju          # clone do repositório (Next roda daqui)
API=/var/www/fabiju-api      # saída do dotnet publish (systemd roda o DLL daqui)

echo ">> [1/4] Atualizando código (main)"
cd "$APP"
git fetch origin
git checkout main
git pull origin main

echo ">> [2/4] Publicando API (.NET)"
dotnet publish ApiImobiliaria/ApiImobiliaria/ApiImobiliaria.csproj -c Release -o "$API"

echo ">> [3/4] Buildando Next.js"
npm ci
npm run build

echo ">> [4/4] Reiniciando serviços"
systemctl restart fabiju-api
systemctl restart fabiju-web
echo ">> Deploy concluído."
