# Project Overview
pixel-forge: 静的ページ完結型の画像加工・エクスポートツール群をまとめるWebアプリケーションリポジトリ。ブラウザ内（Canvas APIなど）で画像を加工し、そのままエクスポートできるアプリを用途ごとにディレクトリ単位で追加していく方針。

# Setup and Basic Usage
Setup instructions and basic usage are documented in [README.md](./README.md).

# Directory Structure
- `/index.html` — topページ（現状は `icon-generator/` へリダイレクトのみ）
- `/icon-generator/` — macOS風アイコン生成ツール（`index.html` / `style.css` / `script.js`）

新しい画像加工アプリを追加する際は、`icon-generator/` と同様にルート直下へ用途ごとのディレクトリを切り、`index.html` / `style.css` / `script.js` を配置する。

# Work Rules
1. Propose implementation plan
2. Wait for approval
3. Start implementation

# Tool Usage Policy
**Prefer dedicated tools for file operations by default** (not enforced via `permissions.deny` — occasional Bash use is fine when it's genuinely more convenient):
- `ls`, `find` → `Glob` tool
- `cat`, `head`, `tail` → `Read` tool
- `grep` → `Grep` tool
- `sed`, `awk` → `Edit` tool
- File writing → `Write` tool
- `curl` → `WebFetch` tool

# Language Settings
- Responses: `.claude/settings.json` - `language`
- Thinking: English (for token reduction)
