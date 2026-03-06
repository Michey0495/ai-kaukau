import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { generateProductData, sanitizeInput } from "@/app/lib/ai";
import type { Product } from "@/app/types";

interface JsonRpcRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-kaukau.ezoai.jp";

const RATE_LIMIT = 10;
const RATE_WINDOW_SEC = 600;
const memRateMap = new Map<string, { count: number; resetAt: number }>();

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      const key = `ratelimit:kaukau:mcp:${ip}`;
      const count = await kv.incr(key);
      if (count === 1) {
        await kv.expire(key, RATE_WINDOW_SEC);
      }
      return count > RATE_LIMIT;
    }
  } catch {
    // Fall through
  }
  const now = Date.now();
  const entry = memRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    memRateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_SEC * 1000 });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

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
            "商品カテゴリ。選択肢: 家電, 食品, ファッション, ガジェット, 美容, スポーツ, ペット用品, 文房具, インテリア, おもちゃ。これ以外の自由なカテゴリも指定可能。",
        },
        keyword: {
          type: "string",
          description:
            "商品のキーワードやテーマ（例: 時間を戻せる, 透明になれる, 猫語翻訳）。省略可。指定すると生成される商品がこのテーマに沿う。",
        },
      },
      required: ["category"],
    },
  },
  {
    name: "buy_product",
    description:
      "架空の商品を架空で購入し、レシートを発行する。実際の決済は発生しない。購入後のレシートページURLを返す。",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "購入する商品のID（generate_productの結果に含まれる）",
        },
        buyerName: {
          type: "string",
          description:
            "購入者の名前（架空でOK）。省略するとランダムな架空名が使われる。",
        },
      },
      required: ["productId"],
    },
  },
];

const FAKE_BUYERS = [
  "架空太郎", "虚構花子", "存在しない次郎", "妄想美咲",
  "空想一郎", "幻影さくら", "非実在健太", "想像の彼方子",
  "夢幻大介", "蜃気楼あかり",
];

export async function POST(req: NextRequest) {
  let body: JsonRpcRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 }
    );
  }

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
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      if (await isRateLimited(ip)) {
        return jsonRpcError(body.id, -32000, "Rate limit exceeded. Try again later.");
      }

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

        try {
          const category = sanitizeInput(String(args.category), 30);
          const keyword = args.keyword ? sanitizeInput(String(args.keyword), 50) : undefined;
          const parsed = await generateProductData(category, keyword);
          const id = nanoid(10);
          const product: Product = {
            id,
            ...parsed,
            category,
            keyword,
            createdAt: new Date().toISOString(),
          };

          const { kv } = await import("@vercel/kv");
          await kv.set(`product:${id}`, product, { ex: 60 * 60 * 24 * 365 });
          await kv.zadd("kaukau:feed", { score: Date.now(), member: id });

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
        } catch (e) {
          const msg = e instanceof Error ? e.message : "商品生成に失敗しました";
          return jsonRpcError(body.id, -32000, msg);
        }
      }

      if (params?.name === "buy_product") {
        const args = params.arguments as {
          productId: string;
          buyerName?: string;
        };
        if (!args?.productId) {
          return jsonRpcError(body.id, -32602, "productId is required");
        }

        try {
          const { kv } = await import("@vercel/kv");
          const product = await kv.get<Product>(`product:${args.productId}`);
          if (!product) {
            return jsonRpcError(body.id, -32602, "Product not found");
          }

          const purchaseId = nanoid(10);
          const buyerName =
            (args.buyerName ? sanitizeInput(String(args.buyerName), 50) : "") || FAKE_BUYERS[Math.floor(Math.random() * FAKE_BUYERS.length)];
          const tax = Math.floor(product.price * 0.1);
          const total = product.price + tax;
          const now = new Date();
          const jstStr = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

          const receipt = [
            "╔══════════════════════════════════╗",
            "║        AI架空ショップ           ║",
            "║          架空レシート            ║",
            "╠══════════════════════════════════╣",
            `  注文番号: KAU-${purchaseId.toUpperCase()}`,
            `  日時: ${jstStr}`,
            "──────────────────────────────────",
            `  商品: ${product.name}`,
            `  価格: ¥${product.price.toLocaleString()}`,
            `  消費税(10%): ¥${tax.toLocaleString()}`,
            `  合計: ¥${total.toLocaleString()}`,
            "──────────────────────────────────",
            `  購入者: ${buyerName}`,
            "──────────────────────────────────",
            "  お届け先: 異次元空間",
            "  配送方法: 量子テレポート便",
            "  返品: 前世まで遡って受け付けます",
            "╚══════════════════════════════════╝",
            "  ※ この商品は架空です",
          ].join("\n");

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
        } catch (e) {
          const msg = e instanceof Error ? e.message : "購入処理に失敗しました";
          return jsonRpcError(body.id, -32000, msg);
        }
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
