/** MCP/API入力のサニタイズ: 制御文字除去 + 長さ制限 */
export function sanitizeInput(input: string, maxLength: number): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, maxLength)
    .trim();
}

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function callAI(prompt: string): Promise<string> {
  if (ANTHROPIC_API_KEY) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const block = message.content[0];
    return block.type === "text" ? block.text : "";
  }

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      options: { num_ctx: 2048, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    throw new Error(`AI server error: ${res.status}`);
  }

  const data = await res.json();
  return data.message?.content ?? "";
}

function buildProductPrompt(category: string, keyword?: string): string {
  return `あなたは架空のECサイト「AI架空ショップ」の商品企画担当です。
完全に架空の、実在しない商品を1つ考案してください。

カテゴリ: ${category}
${keyword ? `キーワード: ${keyword}` : ""}

以下のJSON形式で出力してください（JSONのみ、他のテキストは不要）:
{
  "name": "商品名（ユニークで面白い名前。20文字以内）",
  "price": 数値（100〜999999の間。ありえない価格設定も可）,
  "description": "商品説明（100〜200文字。真面目なトーンで完全に架空の効能や特徴を書く）",
  "features": ["特徴1", "特徴2", "特徴3"]（3つ。各30文字以内。もっともらしいが架空の機能）,
  "reviews": [
    {"author": "架空のレビュワー名", "rating": 1-5の数値, "comment": "架空のレビュー（50文字以内）"},
    {"author": "別の架空名", "rating": 1-5, "comment": "別の架空レビュー"},
    {"author": "さらに別の名前", "rating": 1-5, "comment": "もう1つの架空レビュー"}
  ]
}

ルール:
- 商品は完全に架空で、物理法則を無視してもOK
- 説明は真面目な通販サイト風の文体で書く（それが面白さを生む）
- レビューは3つ。星1〜5のバラつきをつけて、リアルなECサイト風に
- 日本語で出力`;
}

interface ParsedProduct {
  name: string;
  price: number;
  description: string;
  features: string[];
  reviews: { author: string; rating: number; comment: string }[];
}

function parseProductJSON(text: string): ParsedProduct {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI応答からJSONを抽出できませんでした");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("AI応答のJSON解析に失敗しました。もう一度お試しください。");
  }

  return {
    name: String(parsed.name ?? "不明な商品").slice(0, 50),
    price: Math.max(100, Math.min(999999, Number(parsed.price) || 9999)),
    description: String(parsed.description ?? "").slice(0, 500),
    features: Array.isArray(parsed.features)
      ? parsed.features.map((f: unknown) => String(f).slice(0, 60)).slice(0, 5)
      : [],
    reviews: Array.isArray(parsed.reviews)
      ? parsed.reviews
          .map((r: Record<string, unknown>) => ({
            author: String(r.author ?? "匿名").slice(0, 20),
            rating: Math.max(1, Math.min(5, Number(r.rating) || 3)),
            comment: String(r.comment ?? "").slice(0, 100),
          }))
          .slice(0, 3)
      : [],
  };
}

export async function generateProductData(
  category: string,
  keyword?: string
): Promise<ParsedProduct> {
  const prompt = buildProductPrompt(category, keyword);
  const text = await callAI(prompt);
  return parseProductJSON(text);
}
