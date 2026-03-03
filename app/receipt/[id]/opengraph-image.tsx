import { ImageResponse } from "next/og";
import { kv } from "@vercel/kv";
import type { Purchase } from "@/app/types";

export const runtime = "edge";
export const alt = "AI架空ショップ レシート";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchase = await kv.get<Purchase>(`purchase:${id}`);

  if (!purchase) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            color: "#fff",
            fontSize: 48,
          }}
        >
          レシートが見つかりません
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          padding: "60px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #10b981, #059669)",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 16,
            color: "#10b981",
            fontWeight: 700,
            letterSpacing: "0.2em",
            marginBottom: "24px",
          }}
        >
          PURCHASE RECEIPT
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "rgba(255,255,255,0.5)",
            marginBottom: "16px",
          }}
        >
          {purchase.buyerName} が架空購入
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 900,
            color: "#fff",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {purchase.productName}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 900,
            color: "#10b981",
          }}
        >
          ¥{purchase.price.toLocaleString()}
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "40px",
            fontSize: 14,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          ai-kaukau.ezoai.jp - ※ この商品は架空です
        </div>
      </div>
    ),
    { ...size }
  );
}
