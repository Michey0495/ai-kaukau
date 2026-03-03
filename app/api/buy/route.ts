import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import type { Product, Purchase } from "@/app/types";

const BUYER_NAMES = [
  "架空太郎",
  "虚構花子",
  "存在しない次郎",
  "幻の美咲",
  "想像上の健太",
  "非実在の優子",
  "脳内の大輔",
  "妄想の真理子",
  "空想の翔太",
  "夢の中の沙織",
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.productId) {
    return NextResponse.json(
      { error: "商品IDが必要です" },
      { status: 400 }
    );
  }

  const productId = String(body.productId);
  const product = await kv.get<Product>(`product:${productId}`);
  if (!product) {
    return NextResponse.json(
      { error: "商品が見つかりません" },
      { status: 404 }
    );
  }

  const buyerName =
    body.buyerName?.trim()
      ? String(body.buyerName).slice(0, 20)
      : BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];

  const purchaseId = nanoid(10);
  const now = new Date();

  const receiptLines = [
    "================================",
    "      AI架空ショップ",
    "      架空購入レシート",
    "================================",
    "",
    `注文番号: KAU-${purchaseId.toUpperCase()}`,
    `日時: ${now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
    "",
    "--------------------------------",
    `商品: ${product.name}`,
    `価格: ¥${product.price.toLocaleString()}`,
    `数量: 1`,
    "--------------------------------",
    `小計: ¥${product.price.toLocaleString()}`,
    `架空消費税(10%): ¥${Math.floor(product.price * 0.1).toLocaleString()}`,
    `合計: ¥${Math.floor(product.price * 1.1).toLocaleString()}`,
    "",
    `購入者: ${buyerName}`,
    "",
    "※ この商品は架空です",
    "※ お届け先は異次元空間です",
    "※ 返品は前世まで遡って受け付けます",
    "",
    "================================",
    "  ご利用ありがとうございました",
    "   ai-kaukau.ezoai.jp",
    "================================",
  ];

  const purchase: Purchase = {
    id: purchaseId,
    productId,
    productName: product.name,
    price: product.price,
    buyerName,
    receipt: receiptLines.join("\n"),
    createdAt: now.toISOString(),
  };

  await kv.set(`purchase:${purchaseId}`, purchase, {
    ex: 60 * 60 * 24 * 365,
  });
  await kv.zadd("kaukau:purchases", { score: Date.now(), member: purchaseId });

  // Increment purchase count on product
  await kv.incr(`purchases:kaukau:${productId}`);

  return NextResponse.json({ id: purchaseId });
}
