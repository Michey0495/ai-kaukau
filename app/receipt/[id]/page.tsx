import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Purchase } from "@/app/types";
import Link from "next/link";
import { ShareButtons } from "@/app/components/ShareButtons";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-kaukau.ezoai.jp";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const purchase = await kv.get<Purchase>(`purchase:${id}`);
  if (!purchase) return { title: "レシートが見つかりません" };

  const title = `${purchase.buyerName}が「${purchase.productName}」を架空購入`;
  const desc = `¥${purchase.price.toLocaleString()} - AI架空ショップで架空購入されました`;

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, url: `${siteUrl}/receipt/${id}` },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function ReceiptPage({ params }: Props) {
  const { id } = await params;
  const purchase = await kv.get<Purchase>(`purchase:${id}`);
  if (!purchase) notFound();

  const shareUrl = `${siteUrl}/receipt/${id}`;
  const shareText = `「${purchase.productName}」を架空で購入しました\n¥${purchase.price.toLocaleString()}（架空）\n\nAI架空ショップ`;

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-emerald-400 text-sm font-bold tracking-widest mb-2">
            {"// RECEIPT"}
          </p>
          <h1 className="text-2xl font-black text-white">架空購入完了</h1>
          <p className="text-white/40 text-sm mt-2">
            おめでとうございます。架空の商品を架空で購入しました。
          </p>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 p-8 mb-6">
          <pre className="text-emerald-400/80 text-sm leading-relaxed font-mono whitespace-pre-wrap">
            {purchase.receipt}
          </pre>
        </div>

        <ShareButtons
          shareUrl={shareUrl}
          shareText={shareText}
          name={purchase.productName}
        />

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/product/${purchase.productId}`}
            className="bg-white/5 text-white/70 font-medium px-6 py-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-center text-sm"
          >
            商品ページに戻る
          </Link>
          <Link
            href="/"
            className="bg-emerald-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-emerald-400 transition-colors text-center text-sm"
          >
            別の架空商品を探す
          </Link>
        </div>
      </div>
    </div>
  );
}
