"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function BuyButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [buyerName, setBuyerName] = useState("");

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          buyerName: buyerName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "購入に失敗しました");
        return;
      }
      router.push(`/receipt/${data.id}`);
    } catch {
      toast.error("ネットワークエラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
        架空購入
      </p>
      <input
        type="text"
        value={buyerName}
        onChange={(e) => setBuyerName(e.target.value)}
        placeholder="購入者名（任意。未入力で架空の名前が付きます）"
        maxLength={20}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors mb-3 text-sm"
      />
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold py-4 rounded-lg transition-all duration-200 text-lg"
      >
        {loading
          ? "架空購入処理中..."
          : `「${productName}」を架空で購入する`}
      </button>
      <p className="text-white/20 text-xs text-center mt-2">
        ※ 架空の購入です。実際の決済は発生しません。
      </p>
    </div>
  );
}
