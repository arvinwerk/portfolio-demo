import { ImageResponse } from "next/og";
import { loadPortfolioPage } from "@/modules/portfolio/server";

export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default function OpenGraphImage() {
  const { profile } = loadPortfolioPage(undefined);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#9d1c24",
        color: "#f3efe8",
        padding: "80px",
      }}
    >
      <div style={{ fontSize: 32, letterSpacing: 4 }}>{profile.function}</div>
      <div style={{ fontSize: 76, fontWeight: 700, marginTop: 20 }}>{profile.fullName}</div>
      <div style={{ fontSize: 32, marginTop: 24 }}>{profile.location}</div>
    </div>,
    size,
  );
}
