# 🎮 スキル図鑑（Skill-dex）

自分のスキルを**ポケ〇ン図鑑風に**管理するWebアプリ。

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: FastAPI (Python)
- **DB**: MySQL
- **認証**: JWT（実装予定）

## 特徴

- スキルごとのレベル管理
- Nord配色の落ち着いたUI
- CRUD完備
- 型安全（TypeScript + Pydantic）

## 起動方法

### バックエンド

\`\`\`bash
cd backend
venv\\Scripts\\activate
uvicorn main:app --reload
\`\`\`

### フロントエンド

\`\`\`bash
cd frontend
npm run dev
\`\`\`