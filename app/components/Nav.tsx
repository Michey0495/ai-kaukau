"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-white font-bold text-sm hover:text-emerald-400 transition-colors"
        >
          <span className="text-emerald-400 font-mono text-xs">AI</span>
          <span>架空ショップ</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/catalog"
            className={`text-sm transition-colors ${
              pathname === "/catalog"
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            カタログ
          </Link>
          <Link
            href="/"
            className={`text-sm transition-colors ${
              pathname === "/"
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            商品を生成
          </Link>
        </div>
      </div>
    </nav>
  );
}
