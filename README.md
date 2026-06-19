# マラソン大会 手動計測WEBアプリ

スマホ・タブレット向けのマラソン大会運営用計測アプリ（PWA対応）。

## 機能

- 大会スタート時間設定（経過タイム自動算出）
- ゼッケン番号入力 + 記録ボタン
- Bluetoothテンキー対応（番号入力 + Enter で即記録）
- ゴール渋滞モード（ゼッケン未入力でも記録可、後から入力可能）
- 写真記録 + Tesseract.js OCR（ゼッケン自動読取）
- 記録編集（順位・タイム・ゼッケン・DNF/DNS・削除）
- ドラッグ並び替え
- CSV出力（UTF-8 BOM付き、Excel互換）
- JSONバックアップ/復元
- 種目切替（5km / 10km / ハーフ / リレー）
- 音声読み上げ
- オフライン動作（PWA + IndexedDB）

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## 本番ビルド

```bash
npm run build
npm start
```

## PWAインストール

1. スマホブラウザでアプリを開く
2. 「ホーム画面に追加」を選択
3. オフラインでも使用可能

## 使い方

1. **大会設定** でスタート日時を設定
2. ゼッケン番号を入力して **記録** ボタン（または Enter）
3. 渋滞時は **ゴール渋滞モード** をONにして連打記録
4. 記録一覧から **編集** でゼッケン入力・修正
5. **CSV出力** で結果をエクスポート

## 技術構成

- Next.js 15 / TypeScript / Tailwind CSS
- IndexedDB（idb）
- Tesseract.js（OCR）
- @ducanh2912/next-pwa
