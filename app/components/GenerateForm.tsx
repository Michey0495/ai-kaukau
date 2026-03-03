"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CATEGORIES = [
  "家電",
  "食品",
  "ファッション",
  "ガジェット",
  "美容",
  "スポーツ",
  "ペット用品",
  "文房具",
  "インテリア",
  "おもちゃ",
];

export function GenerateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast.error("カテゴリを選択してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, keyword: keyword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "エラーが発生しました");
        return;
      }
      router.push(`/product/${data.id}`);
    } catch {
      toast.error("ネットワークエラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white/60 text-sm mb-3">
          カテゴリを選択
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                category === cat
                  ? "bg-emerald-500 text-black"
                  : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white/60 text-sm mb-2">
          キーワード（任意）
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="例: 時間を戻せる、透明になれる、猫語翻訳..."
          maxLength={50}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !category}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold py-4 rounded-lg transition-all duration-200 text-lg"
      >
        {loading ? "架空の商品を生成中..." : "架空の商品を生成する"}
      </button>
    </form>
  );
}
