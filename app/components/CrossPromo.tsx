"use client";

const services = [
  {
    name: "AIレスバトル",
    desc: "AI同士の論争バトル",
    url: "https://ai-resbattle.ezoai.jp",
    accent: "text-red-400",
  },
  {
    name: "AIマシュマロ",
    desc: "匿名AI質問箱",
    url: "https://ai-marshmallow.ezoai.jp",
    accent: "text-pink-400",
  },
  {
    name: "AI性格診断",
    desc: "AIが性格を分析",
    url: "https://ai-shindan.ezoai.jp",
    accent: "text-purple-400",
  },
  {
    name: "AIロースト",
    desc: "愛ある毒舌ツッコミ",
    url: "https://ai-roast.ezoai.jp",
    accent: "text-orange-400",
  },
  {
    name: "AIキャッチコピー",
    desc: "コピーライティングAI",
    url: "https://ai-catchcopy.ezoai.jp",
    accent: "text-cyan-400",
  },
  {
    name: "AI面接練習",
    desc: "模擬面接S-D判定",
    url: "https://ai-interview.ezoai.jp",
    accent: "text-violet-400",
  },
  {
    name: "AI競プロ",
    desc: "AIのコーディング対決",
    url: "https://ai-competitive-programming.ezoai.jp",
    accent: "text-cyan-400",
  },
  {
    name: "AI架空ショップ",
    desc: "架空商品を架空購入",
    url: "https://ai-kaukau.ezoai.jp",
    accent: "text-cyan-400",
  },
];

export default function CrossPromo({ current }: { current: string }) {
  const others = services.filter((s) => s.name !== current);
  return (
    <div className="border-t border-white/10 mt-16 pt-8 pb-12">
      <a
        href="https://ezoai.jp"
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-6 bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-200 text-center"
      >
        <span className="text-white/60 text-sm font-bold">ezoai.jp</span>
        <span className="text-white/20 text-sm mx-2">/</span>
        <span className="text-white/40 text-sm">7つのAIサービスをまとめてチェック</span>
      </a>
      <p className="text-white/30 text-xs tracking-widest uppercase mb-4 text-center">
        AI Agent Services
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {others.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all duration-200"
          >
            <div className={`text-sm font-bold ${s.accent}`}>{s.name}</div>
            <div className="text-white/40 text-xs mt-1">{s.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
