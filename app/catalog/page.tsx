import { kv } from "@vercel/kv";
import type { Metadata } from "next";
import type { Product } from "@/app/types";
import { FeedList } from "@/app/components/FeedList";
import Link from "next/link";

export const metadata: Metadata = {
  title: "商品カタログ",
  description: "AIが生成した架空商品の一覧。新着・人気順で閲覧できます。",
};

export default async function CatalogPage() {
  let initialItems: {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    likes: number;
  }[] = [];
  let initialNextCursor: number | null = null;

  try {
    const ids = (await kv.zrange("kaukau:feed", 0, 20, {
      rev: true,
    })) as string[];

    if (ids && ids.length > 0) {
      const products = await Promise.all(
        ids.map((id) => kv.get<Product>(`product:${id}`))
      );
      const likeKeys = ids.map((id) => `likes:kaukau:${id}`);
      const likeCounts = await kv.mget<(number | null)[]>(...likeKeys);

      initialItems = products
        .filter((p): p is Product => p !== null)
        .map((p, i) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description.slice(0, 100),
          category: p.category,
          likes: likeCounts[i] ?? 0,
        }));

      if (ids.length === 21) {
        initialNextCursor = 20;
      }
    }
  } catch {}

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-emerald-400 text-sm font-bold tracking-widest mb-1">
              {"// CATALOG"}
            </p>
            <h1 className="text-2xl font-black text-white">架空商品カタログ</h1>
          </div>
          <Link
            href="/"
            className="text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            ← トップ
          </Link>
        </div>

        <FeedList
          initialItems={initialItems}
          initialNextCursor={initialNextCursor}
        />
      </div>
    </main>
  );
}
