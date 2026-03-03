import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import type { Product } from "@/app/types";

const client = new Anthropic();

const RATE_LIMIT = 5;
const RATE_WINDOW = 10 * 60;

async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `rate:kaukau:${ip}`;
  const count = (await kv.get<number>(key)) ?? 0;
  if (count >= RATE_LIMIT) return false;
  await kv.set(key, count + 1, { ex: RATE_WINDOW });
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const allowed = await checkRateLimit(ip).catch(() => true);
  if (!allowed) {
    return NextResponse.json(
      { error: "レート制限に達しました。しばらく待ってから再試行してください。" },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.category?.trim()) {
    return NextResponse.json(
      { error: "カテゴリは必須です" },
      { status: 400 }
    );
  }

  const category = String(body.category).slice(0, 30);
  const keyword = body.keyword ? String(body.keyword).slice(0, 50) : undefined;

  const prompt = `あなたは架空のECサイト「AI架空ショップ」の商品企画担当です。
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

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  let parsed;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? text);
  } catch {
    return NextResponse.json(
      { error: "生成に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }

  const id = nanoid(10);
  const product: Product = {
    id,
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
    category,
    keyword,
    createdAt: new Date().toISOString(),
  };

  await kv.set(`product:${id}`, product, { ex: 60 * 60 * 24 * 365 });
  await kv.zadd("kaukau:feed", { score: Date.now(), member: id });

  return NextResponse.json({ id });
}
