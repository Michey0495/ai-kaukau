import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-emerald-400 text-sm font-bold tracking-widest mb-4">
          {"// 404"}
        </p>
        <h1 className="text-4xl font-black text-white mb-4">
          架空のページ
        </h1>
        <p className="text-white/50 mb-8">
          このページは架空ですらありません。存在しません。
        </p>
        <Link
          href="/"
          className="inline-block bg-emerald-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-emerald-400 transition-colors"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
