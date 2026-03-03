import Link from "next/link";
import { GenerateForm } from "./components/GenerateForm";
import { RecentProducts } from "./components/RecentProducts";
import CrossPromo from "./components/CrossPromo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <p className="text-emerald-400 text-sm font-bold tracking-widest mb-3">
            {"// AI FAKE SHOP"}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            AI架空ショップ
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-md mx-auto">
            AIが生成した架空の商品を架空で購入できる、
            世界一無意味なECサイト。
          </p>
          <p className="text-white/30 text-xs mt-3">
            ※ 全ての商品は架空です。実在の商品とは一切関係ありません。
          </p>
        </div>

        <GenerateForm />

        <RecentProducts />

        <div className="mt-8 text-center">
          <Link
            href="/catalog"
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            全商品カタログを見る →
          </Link>
        </div>

        <CrossPromo current="AI架空ショップ" />
      </div>
    </main>
  );
}
