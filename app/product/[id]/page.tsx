import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Product } from "@/app/types";
import Link from "next/link";
import { BuyButton } from "@/app/components/BuyButton";
import { LikeButton } from "@/app/components/LikeButton";
import { ShareButtons } from "@/app/components/ShareButtons";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-kaukau.ezoai.jp";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await kv.get<Product>(`product:${id}`);
  if (!product) return { title: "商品が見つかりません" };

  const title = `${product.name} - ¥${product.price.toLocaleString()}`;
  const desc = product.description.slice(0, 100);

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, url: `${siteUrl}/product/${id}` },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-emerald-400 text-sm tracking-wider">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await kv.get<Product>(`product:${id}`);
  if (!product) notFound();

  const shareUrl = `${siteUrl}/product/${id}`;
  const shareText = `【架空商品】${product.name} ¥${product.price.toLocaleString()}\n${product.description.slice(0, 60)}...\n\nAI架空ショップで架空購入できます`;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-emerald-400 text-sm font-bold tracking-widest mb-2">
            {"// PRODUCT"}
          </p>
          <p className="text-white/30 text-xs">{product.category}</p>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 p-8 mb-6">
          <h1 className="text-2xl font-black text-white mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-emerald-400 text-3xl font-black">
              ¥{product.price.toLocaleString()}
            </span>
            <span className="text-white/20 text-sm line-through">
              ¥{Math.floor(product.price * 1.5).toLocaleString()}
            </span>
            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded">
              33% OFF
            </span>
          </div>

          <p className="text-white/70 leading-relaxed text-base mb-6">
            {product.description}
          </p>

          <div className="border-t border-white/10 pt-4 mb-6">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
              特徴
            </p>
            <ul className="space-y-2">
              {product.features.map((f, i) => (
                <li
                  key={i}
                  className="text-white/60 text-sm pl-4 border-l-2 border-emerald-500/50"
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-white/40 text-xs uppercase tracking-widest">
                レビュー
              </p>
              <Stars rating={Math.round(avgRating)} />
              <span className="text-white/30 text-xs">
                ({avgRating.toFixed(1)})
              </span>
            </div>
            <div className="space-y-3">
              {product.reviews.map((r, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-lg p-3 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/60 text-sm font-medium">
                      {r.author}
                    </span>
                    <Stars rating={r.rating} />
                  </div>
                  <p className="text-white/50 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-white/30">by AI架空ショップ</span>
            <span className="text-xs text-white/20">ai-kaukau.ezoai.jp</span>
          </div>
        </div>

        <BuyButton productId={id} productName={product.name} />

        <div className="flex items-center gap-3 mt-4 mb-4">
          <LikeButton id={id} />
        </div>

        <ShareButtons
          shareUrl={shareUrl}
          shareText={shareText}
          name={product.name}
        />

        <p className="text-center text-white/20 text-xs mt-6">
          ※ この商品は完全に架空です。実在の商品とは一切関係ありません。
        </p>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-emerald-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-emerald-400 transition-colors"
          >
            別の架空商品を生成する
          </Link>
        </div>
      </div>
    </main>
  );
}
