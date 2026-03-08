"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

interface FeedItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  likes: number;
  imageUrl?: string;
}

interface Props {
  initialItems: FeedItem[];
  initialNextCursor: number | null;
}

export function FeedList({ initialItems, initialNextCursor }: Props) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [sort, setSort] = useState<"new" | "popular">("new");
  const [nextCursor, setNextCursor] = useState<number | null>(
    initialNextCursor
  );
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchMore = useCallback(
    async (cursor: number, sortMode: string, replace = false) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/feed?cursor=${cursor}&limit=20&sort=${sortMode}`
        );
        const data = await res.json();
        if (replace) {
          setItems(data.items || []);
        } else {
          setItems((prev) => [...prev, ...(data.items || [])]);
        }
        setNextCursor(data.nextCursor);
      } catch {
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMore(0, sort, true);
  }, [sort, fetchMore]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor !== null && !loading) {
          fetchMore(nextCursor, sort);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, sort, loading, fetchMore]);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSort("new")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            sort === "new"
              ? "bg-emerald-500 text-black"
              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
          }`}
        >
          新着
        </button>
        <button
          onClick={() => setSort("popular")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            sort === "popular"
              ? "bg-emerald-500 text-black"
              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
          }`}
        >
          人気
        </button>
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-white/30 text-sm">まだ架空商品がありません</p>
          <Link
            href="/"
            className="text-emerald-400 text-sm mt-2 inline-block hover:text-emerald-300"
          >
            最初の架空商品を生成する →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-200"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10"
              />
            )}
            <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between mb-2">
              <p className="text-white font-bold text-base line-clamp-1">
                {item.name}
              </p>
              <span className="text-emerald-400 font-bold ml-3 shrink-0">
                ¥{item.price.toLocaleString()}
              </span>
            </div>
            <p className="text-white/50 text-sm line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-white/30 text-xs">{item.category}</span>
              {item.likes > 0 && (
                <span className="text-white/30 text-xs">+{item.likes}</span>
              )}
            </div>
            </div>
          </Link>
        ))}
      </div>

      <div ref={observerRef} className="py-8 text-center">
        {loading && <p className="text-white/30 text-sm">読み込み中...</p>}
      </div>
    </div>
  );
}
