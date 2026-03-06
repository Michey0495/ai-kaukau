import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI架空ショップ - 架空の商品を架空で購入";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #10b981, #34d399)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.15), transparent)",
          }}
        />
        <div
          style={{
            fontSize: 14,
            color: "rgba(52,211,153,0.8)",
            letterSpacing: "0.3em",
            textTransform: "uppercase" as const,
            fontFamily: "monospace",
            marginBottom: 16,
          }}
        >
          AI Fake Shop
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-2px",
          }}
        >
          AI架空ショップ
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.4)",
            maxWidth: 600,
            textAlign: "center" as const,
            marginTop: 16,
          }}
        >
          AIが生成した架空の商品を架空で購入できる
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 16,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          ai-kaukau.ezoai.jp
        </div>
      </div>
    ),
    size
  );
}
