import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-kaukau.ezoai.jp";

export const metadata: Metadata = {
  title: {
    default: "AI架空ショップ - 架空の商品を架空で購入",
    template: "%s | AI架空ショップ",
  },
  description:
    "AIが生成した架空の商品を架空で購入できる、世界一無意味なECサイト。存在しない商品の購入体験をお楽しみください。",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "AI架空ショップ",
    title: "AI架空ショップ - 架空の商品を架空で購入",
    description:
      "AIが生成した架空の商品を架空で購入できる、世界一無意味なECサイト。",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI架空ショップ - 架空の商品を架空で購入",
    description:
      "AIが生成した架空の商品を架空で購入できる、世界一無意味なECサイト。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geist.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
