#!/usr/bin/env pwsh
# GitHub 公開 + Vercel デプロイ用スクリプト
Set-Location $PSScriptRoot/..

Write-Host "=== 1. GitHub リポジトリ作成 & プッシュ ===" -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host "GitHub にログインしてください: gh auth login --web" -ForegroundColor Yellow
  exit 1
}

$repoName = "marathon-timing-app"
gh repo create $repoName --public --source=. --remote=origin --push --description "マラソン大会用手動計測PWA"

Write-Host "`n=== 2. Vercel デプロイ ===" -ForegroundColor Cyan
npx vercel@latest deploy --prod --yes

Write-Host "`n完了!" -ForegroundColor Green
