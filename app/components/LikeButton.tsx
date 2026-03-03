"use client";

import { useEffect, useState } from "react";

export function LikeButton({ id }: { id: string }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const likedIds = JSON.parse(localStorage.getItem("liked_ids") || "[]");
    if (likedIds.includes(id)) setLiked(true);

    fetch(`/api/like?id=${id}`)
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, [id]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setCount((c) => c + 1);

    const likedIds = JSON.parse(localStorage.getItem("liked_ids") || "[]");
    likedIds.push(id);
    localStorage.setItem("liked_ids", JSON.stringify(likedIds));

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      setCount(data.count);
    } catch {}
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        liked
          ? "bg-emerald-500/20 text-emerald-400 cursor-default"
          : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 cursor-pointer"
      }`}
    >
      <span>+</span>
      <span>{count}</span>
    </button>
  );
}
