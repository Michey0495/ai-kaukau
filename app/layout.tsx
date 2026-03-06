import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { Nav } from "./components/Nav";
import CrossPromo from "./components/CrossPromo";
import { FeedbackWidget } from "./components/FeedbackWidget";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-kaukau.ezoai.jp";

export const metadata: Metadata = {
  title: {
    default: "AI架空ショップ - 架空の商品を架空で購入",
    template: "%s | AI架空ショップ",
  },
  description:
    "AIが生成した架空の商品を架空で購入できる、世界一無意味なECサイト。存在しない商品の購入体験をお楽しみください。",
  keywords: [
    "AI",
    "架空商品",
    "ECサイト",
    "AI生成",
    "ネタ",
    "エンタメ",
    "架空ショップ",
    "fake shop",
    "AI generated products",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI架空ショップ",
  url: siteUrl,
  description:
    "AIが生成した架空の商品を架空で購入できる、世界一無意味なECサイト。存在しない商品の購入体験をお楽しみください。",
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  inLanguage: "ja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ja" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geist.className} antialiased min-h-screen bg-black text-white`}
      >
        <a
          href="https://ezoai.jp"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 border-b border-white/5 py-1.5 text-center text-xs text-white/50 hover:text-white/70 transition-colors"
        >
          ezoai.jp -- 7つのAIサービスを無料で体験
        </a>
        <Nav />
        <main>{children}</main>
        <CrossPromo current="AI架空ショップ" />
        <footer className="border-t border-white/5 py-8 text-center text-sm text-white/30">
          <p>© 2026 AI架空ショップ</p>
        </footer>
        <FeedbackWidget repoName="ai-kaukau" />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
