import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#E05835"/><path d="M50 84C20 68 8 52 8 36C8 20 20 12 32 12C40 12 47 16 50 22C53 16 60 12 68 12C80 12 92 20 92 36C92 52 80 68 50 84Z" fill="white"/><line x1="43" y1="29" x2="43" y2="45" stroke="#E05835" stroke-width="5.5" stroke-linecap="round"/><line x1="50" y1="29" x2="50" y2="45" stroke="#E05835" stroke-width="5.5" stroke-linecap="round"/><line x1="57" y1="29" x2="57" y2="45" stroke="#E05835" stroke-width="5.5" stroke-linecap="round"/><path d="M43 45Q50 54 57 45" stroke="#E05835" stroke-width="4.5" fill="none" stroke-linecap="round"/><line x1="50" y1="54" x2="50" y2="68" stroke="#E05835" stroke-width="5.5" stroke-linecap="round"/></svg>`;

export default function Icon() {
  const b64 = Buffer.from(ICON_SVG).toString("base64");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage: `url(data:image/svg+xml;base64,${b64})`,
          backgroundSize: "cover",
        }}
      />
    ),
    { ...size }
  );
}
