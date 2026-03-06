# Pro Critic Review: AI架空ショップ
## Date: 2026-03-04
## Review: #001 (Initial)
## Overall Score: 55/100

---

### Industry Comparison References
- **Shopify / Amazon**: 商品ページの完成度（画像、レビュー、関連商品、ナビゲーション）
- **ボケて (bokete.jp)**: ユーザー生成コンテンツ + エンタメループ（投稿→閲覧→投票→ランキング）
- **Waifu Labs**: AI生成 + ビジュアルフィードバック + コレクション要素
- **This Person Does Not Exist**: 架空生成のインパクト（ビジュアルが全て）
- **Linear / Vercel Dashboard**: ダークテーマUI/UXの洗練度

---

### Category Scores

| Category | Score | Details |
|----------|-------|---------|
| ブラウザアプリ完成度 | 12/20 | ダークテーマ統一、動的OGイメージあり。致命的: トップページOG画像なし、JSON-LD未実装、robots.txtが内部API保護不足、keywords未設定、body fontがCSS上で`Arial`に上書きされGeist無効化、Navコンポーネントなし（ページ間ナビゲーションがアドホック）、canonical/robots metadata未設定 |
| UI/UXデザイン | 13/20 | ヒーローのグラデーションオーブ、フェードインアニメ、商品ページのカード構成は良好。問題: グローバルナビなし（どのページからもカタログ/トップに戻りづらい）、商品画像が一切ない（テキストのみのECサイトは致命的）、ローディングスケルトンなし、エンプティステート未対応（商品ゼロ時にRecentProductsが消える）、フィードカードのホバーアニメ不足。Shopify等と比較すると商品ページの情報密度が低い |
| システム設計 | 10/20 | KV使用、入力バリデーション、レート制限あり。致命的: **本番環境でAI生成が動作しない**（OllamaのlocalhostはVercelから到達不能）。レート制限に競合状態あり（`get`→`set`は非アトミック、`incr`を使うべき）。MCPルートにレート制限なし。MCP内の`generateProduct`が`/api/generate`のロジックを重複。MCP buy_productのレシートが簡素版。MCP JSON parseエラーでクラッシュ。カタログの空catch |
| AIエージェント導線 | 11/20 | MCPエンドポイント動作確認済み。agent.json存在。問題: robots.txtが`/api/*`を無差別許可（`/api/mcp`だけ許可すべき）。llms.txtがMCPフローの具体手順を記載していない（initialize→tools/list→tools/callの3ステップ）。agent.jsonにtools一覧・protocol・transport・authentication情報なし。MCPにレート制限なく無限生成可能 |
| 人間エンタメ体験 | 9/20 | コンセプト自体は面白い（架空商品を真面目に売る）。レシートのユーモア、33% OFFバッジ。致命的: **本番AI生成が動かない**ため体験自体が成立しない。商品画像なし（テキストだけのECは楽しくない）。生成→結果表示にビジュアル演出なし。エンプティステート（商品ゼロ時）が寂しい。ランキング/トレンド/ゲーミフィケーション要素なし |

---

### Critical Issues (P0 - Must Fix)

1. **本番AI生成が完全に壊れている**: Ollama (`localhost:11434`) はVercel Serverlessから到達不能。Anthropic APIフォールバックが必要
2. **MCPルートのエラーハンドリング**: `generateProduct`でOllama失敗時にunhandled exceptionでクラッシュ。`req.json()`のparse失敗もハンドルされていない
3. **レート制限の競合状態**: `/api/generate`の`checkRateLimit`が`kv.get`→`kv.set`パターン。並行リクエストで制限をバイパス可能。`kv.incr`に変更すべき
4. **MCPにレート制限なし**: AIエージェントが無限に`generate_product`を呼べる
5. **robots.txt**: `/api/mcp`のみ許可し、他の`/api/*`をDisallowすべき

### Major Issues (P1)

6. **グローバルNavなし**: 全ページにNav/ヘッダーコンポーネントがない。ユーザーがページ間を自由に行き来できない
7. **llms.txt不足**: MCPフロー（3ステップ）、ツール詳細、制約事項の記載なし
8. **agent.json不足**: `mcp`セクションにtools/protocol/transport/authentication情報なし
9. **JSON-LD未実装**: WebApplication + Product schema。ECサイトとしてのSEO基盤が欠如
10. **OGイメージ**: layout.tsxのOpenGraphに`images`未設定。トップページ共有時にプレビュー画像なし

### Minor Issues (P2)

11. **Body font上書き**: globals.cssの`font-family: Arial`がGeistフォントを上書き
12. **エンプティステート**: 商品ゼロ時のUI（サンプル商品提案 or 生成を促すCTA）
13. **MCP generateProductのコード重複**: `/api/generate`と同一ロジックを共有すべき
14. **カタログの空catch**: `catch {}`がエラーを完全に握りつぶしている

---

### Score Breakdown

```
ブラウザアプリ完成度:  12/20
UI/UXデザイン:        13/20
システム設計:          10/20
AIエージェント導線:    11/20
人間エンタメ体験:       9/20
──────────────────────
合計:                  55/100
```

**目標スコア80点に未到達。P0・P1の修正が必要。**
