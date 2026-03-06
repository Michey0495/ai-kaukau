import Link from "next/link";
import { GenerateForm } from "./components/GenerateForm";
import { RecentProducts } from "./components/RecentProducts";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.3),transparent)]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-400/5 rounded-full blur-[100px] animate-[float-reverse_12s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative text-center px-4 animate-[fade-in-up_0.8s_ease-out]">
          <p className="text-emerald-400/80 text-xs font-mono tracking-[0.3em] uppercase mb-6">
            AI Fake Shop
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            AI架空ショップ
          </h1>
          <p className="text-white/40 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            AIが生成した架空の商品を架空で購入できる、
            <br className="hidden sm:block" />
            世界一無意味なECサイト。
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <div className="animate-[fade-in_0.6s_ease-out_0.3s_both]">
          <GenerateForm />
        </div>

        <div className="mt-16 animate-[fade-in_0.6s_ease-out_0.5s_both]">
          <RecentProducts />
        </div>

        <div className="mt-10 text-center animate-[fade-in_0.6s_ease-out_0.7s_both]">
          <Link
            href="/catalog"
            className="inline-block text-emerald-400/70 hover:text-emerald-400 text-sm font-mono tracking-wider transition-colors duration-300"
          >
            全商品カタログを見る →
          </Link>
        </div>
      </div>

      {/* Footer text */}
      <section className="text-center pb-16">
        <p className="text-xs text-white/20">
          AI powered / 無料・登録不要
        </p>
      </section>
    </div>
  );
}
