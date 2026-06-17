import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#1a2440",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: -4,
            fontFamily: "sans-serif",
          }}
        >
          RC
        </span>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
