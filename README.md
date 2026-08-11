# pixel-forge

静的ページで完結する画像加工・エクスポートツール群です。ブラウザ内（Canvas APIなど）で画像を加工し、そのままエクスポートできるアプリケーションをディレクトリ単位でまとめています。

## アプリ一覧

- [Icon Generator](./icon-generator/index.html) — 画像をmacOS風squircle（超楕円）でクリップし、影を付けて透過PNGとして書き出すツール

## 前提条件

[mise](https://mise.jdx.dev/) がインストールされ、シェルに統合されていること。

macOS (Homebrew):

```bash
brew install mise
```

シェル統合 (zsh):

```bash
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc
```

## セットアップ

```bash
mise trust && mise run setup
```

gitleaks / lefthook のインストールと Git フックの設定が一括で行われます。

