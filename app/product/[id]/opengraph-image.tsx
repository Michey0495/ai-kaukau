import { ImageResponse } from "next/og";
import { kv } from "@vercel/kv";
import type { Product } from "@/app/types";

export const runtime = "edge";
export const alt = "AI架空ショップ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await kv.get<Product>(`product:${id}`);

  if (!product) {
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
          商品が見つかりません
        </div>
      ),
      { ...size }
    );
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
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
            marginBottom: "20px",
          }}
        >
          AI FAKE SHOP
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 900,
            color: "#fff",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          {product.name}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: "#10b981",
            }}
          >
            ¥{product.price.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.2)",
              textDecoration: "line-through",
            }}
          >
            ¥{Math.floor(product.price * 1.5).toLocaleString()}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.6,
            maxWidth: "900px",
          }}
        >
          {product.description.slice(0, 120)}
          {product.description.length > 120 ? "..." : ""}
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "60px",
            left: "60px",
            right: "60px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: 20, color: "#10b981" }}>
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </span>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>
              {product.category}
            </span>
          </div>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.2)" }}>
            ai-kaukau.ezoai.jp
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
