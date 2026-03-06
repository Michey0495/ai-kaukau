import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { generateProductData } from "@/app/lib/ai";
import type { Product } from "@/app/types";

const RATE_LIMIT = 5;
const RATE_WINDOW_SEC = 600;

const memRateMap = new Map<string, { count: number; resetAt: number }>();

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      const key = `ratelimit:kaukau:generate:${ip}`;
      const count = await kv.incr(key);
      if (count === 1) {
        await kv.expire(key, RATE_WINDOW_SEC);
      }
      return count > RATE_LIMIT;
    }
  } catch {
    // Fall through to in-memory
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

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらく待ってからお試しください。" },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  if (!body?.category?.trim()) {
    return NextResponse.json(
      { error: "カテゴリは必須です" },
      { status: 400 }
    );
  }

  const category = String(body.category).slice(0, 30);
  const keyword = body.keyword ? String(body.keyword).slice(0, 50) : undefined;

  try {
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

    return NextResponse.json({ id });
  } catch (e) {
    console.error("Product generation failed:", e);
    const message =
      e instanceof Error
        ? e.message
        : "商品の生成に失敗しました。しばらくしてからお試しください。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
