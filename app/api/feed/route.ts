import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import type { Product } from "@/app/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const cursor = parseInt(searchParams.get("cursor") || "0", 10);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      50
    );
    const sort = searchParams.get("sort") || "new";

    const feedKey =
      sort === "popular" ? "kaukau:popular" : "kaukau:feed";

    const ids = (await kv.zrange(feedKey, cursor, cursor + limit, {
      rev: true,
    })) as string[];

    if (!ids || ids.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null });
    }

    const products = await Promise.all(
      ids.map((id) => kv.get<Product>(`product:${id}`))
    );

    const likeKeys = ids.map((id) => `likes:kaukau:${id}`);
    const likeCounts = await kv.mget<(number | null)[]>(...likeKeys);

    const items = products
      .filter((p): p is Product => p !== null)
      .map((p, i) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description.slice(0, 100),
        category: p.category,
        likes: likeCounts[i] ?? 0,
      }));

    const hasMore = ids.length === limit + 1;
    const nextCursor = hasMore ? cursor + limit : null;

    return NextResponse.json({ items, nextCursor });
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json(
      { items: [], nextCursor: null },
      { status: 500 }
    );
  }
}
