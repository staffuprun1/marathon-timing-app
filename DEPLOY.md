# デプロイ手順

## 方法A: ワンコマンド（推奨）

PowerShell でプロジェクトフォルダを開き、以下を実行:

```powershell
.\scripts\deploy.ps1
```

初回は GitHub / Vercel のブラウザ認証が求められます。

---

## 方法B: 手動で GitHub + Vercel

### 1. GitHub に公開

```powershell
gh auth login --web
gh repo create marathon-timing-app --public --source=. --remote=origin --push
```

### 2. Vercel にデプロイ

```powershell
npx vercel@latest deploy --prod
```

または [vercel.com](https://vercel.com) → **Add New Project** → GitHub リポジトリ `marathon-timing-app` を Import

---

## 公開後のURL

- **Vercel**: `https://marathon-timing-app.vercel.app` （プロジェクト名により変動）
- **GitHub**: `https://github.com/<あなたのユーザー名>/marathon-timing-app`

---

## 注意

- データ（記録）は各端末の IndexedDB に保存されます（サーバーには送信されません）
- PWA としてホーム画面に追加するとオフラインでも使用可能です
- カメラ/OCR 機能は HTTPS 環境（Vercel）で正常に動作します
