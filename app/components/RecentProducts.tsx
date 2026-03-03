"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FeedItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  likes: number;
}

export function RecentProducts() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    fetch("/api/feed?limit=6")
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-white/40 text-xs tracking-widest uppercase mb-4">
        最近の架空商品
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-white font-bold text-sm line-clamp-1">
                {item.name}
              </p>
              <span className="text-emerald-400 text-sm font-bold ml-2 shrink-0">
                ¥{item.price.toLocaleString()}
              </span>
            </div>
            <p className="text-white/50 text-xs line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white/30 text-xs">{item.category}</span>
              {item.likes > 0 && (
                <span className="text-white/30 text-xs">+{item.likes}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
