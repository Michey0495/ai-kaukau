import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import type { Product } from "@/app/types";

interface JsonRpcRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-kaukau.ezoai.jp";

function jsonRpcError(id: string | number, code: number, message: string) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: { code, message },
  });
}

const TOOLS = [
  {
    name: "generate_product",
    description:
      "架空のECサイトに架空の商品を生成する。AIが面白い架空商品を作成し、商品ページのURLを返す。",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            "商品カテゴリ（家電, 食品, ファッション, ガジェット, 美容, スポーツ, ペット用品, 文房具, インテリア, おもちゃ など）",
        },
        keyword: {
          type: "string",
          description:
            "商品のキーワードやテーマ（例: 時間を戻せる, 透明になれる, 猫語翻訳）",
        },
      },
      required: ["category"],
    },
  },
  {
    name: "buy_product",
    description:
      "架空の商品を架空で購入する。架空のレシートが発行される。",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "購入する商品のID",
        },
        buyerName: {
          type: "string",
          description: "購入者の名前（架空でOK）",
        },
      },
      required: ["productId"],
    },
  },
];

async function generateProduct(
  category: string,
  keyword?: string
): Promise<Product> {
  const client = new Anthropic();

  const prompt = `あなたは架空のECサイト「AI架空ショップ」の商品企画担当です。
完全に架空の、実在しない商品を1つ考案してください。

カテゴリ: ${category}
${keyword ? `キーワード: ${keyword}` : ""}

以下のJSON形式で出力してください（JSONのみ、他のテキストは不要）:
{
  "name": "商品名（ユニークで面白い名前。20文字以内）",
  "price": 数値（100〜999999の間）,
  "description": "商品説明（100〜200文字。真面目なトーンで完全に架空の効能や特徴を書く）",
  "features": ["特徴1", "特徴2", "特徴3"],
  "reviews": [
    {"author": "架空のレビュワー名", "rating": 1-5, "comment": "架空のレビュー（50文字以内）"},
    {"author": "別の名前", "rating": 1-5, "comment": "別のレビュー"},
    {"author": "さらに別", "rating": 1-5, "comment": "もう1つ"}
  ]
}

ルール:
- 商品は完全に架空で、物理法則を無視してもOK
- 説明は真面目な通販サイト風の文体
- レビューは3つ。星1〜5のバラつきをつける
- 日本語で出力`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch?.[0] ?? text);

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

  return product;
}

export async function POST(req: NextRequest) {
  const body: JsonRpcRequest = await req.json();

  switch (body.method) {
    case "initialize":
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "ai-kaukau-mcp", version: "1.0.0" },
          capabilities: { tools: {} },
        },
      });

    case "notifications/initialized":
      return NextResponse.json({ jsonrpc: "2.0" });

    case "tools/list":
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: { tools: TOOLS },
      });

    case "tools/call": {
      const params = body.params as {
        name?: string;
        arguments?: Record<string, unknown>;
      };

      if (params?.name === "generate_product") {
        const args = params.arguments as {
          category: string;
          keyword?: string;
        };
        if (!args?.category) {
          return jsonRpcError(body.id, -32602, "category is required");
        }

        const product = await generateProduct(args.category, args.keyword);
        return NextResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  description: product.description,
                  url: `${siteUrl}/product/${product.id}`,
                }),
              },
            ],
          },
        });
      }

      if (params?.name === "buy_product") {
        const args = params.arguments as {
          productId: string;
          buyerName?: string;
        };
        if (!args?.productId) {
          return jsonRpcError(body.id, -32602, "productId is required");
        }

        const product = await kv.get<Product>(`product:${args.productId}`);
        if (!product) {
          return jsonRpcError(body.id, -32602, "Product not found");
        }

        const purchaseId = nanoid(10);
        const buyerName = args.buyerName || "架空太郎";
        const receipt = `注文番号: KAU-${purchaseId.toUpperCase()}\n商品: ${product.name}\n価格: ¥${product.price.toLocaleString()}\n購入者: ${buyerName}\n※この商品は架空です`;

        await kv.set(
          `purchase:${purchaseId}`,
          {
            id: purchaseId,
            productId: args.productId,
            productName: product.name,
            price: product.price,
            buyerName,
            receipt,
            createdAt: new Date().toISOString(),
          },
          { ex: 60 * 60 * 24 * 365 }
        );
        await kv.zadd("kaukau:purchases", {
          score: Date.now(),
          member: purchaseId,
        });
        await kv.incr(`purchases:kaukau:${args.productId}`);

        return NextResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  purchaseId,
                  receipt,
                  url: `${siteUrl}/receipt/${purchaseId}`,
                }),
              },
            ],
          },
        });
      }

      return jsonRpcError(body.id, -32601, "Tool not found");
    }

    default:
      return jsonRpcError(body.id, -32601, "Method not found");
  }
}

export async function GET() {
  return NextResponse.json({
    name: "ai-kaukau",
    version: "1.0.0",
    description:
      "架空の商品を架空で購入できるECサイト。AIが生成した架空商品を閲覧・購入できる。",
    tools: TOOLS,
    endpoint: "/api/mcp",
    protocol: "jsonrpc",
  });
}
