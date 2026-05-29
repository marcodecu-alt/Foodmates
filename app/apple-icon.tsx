import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#E05835",
          borderRadius: 40,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="128"
          viewBox="0 0 32 34"
        >
          {/* Heart */}
          <path
            d="M16 31C16 31 2 21.5 2 12C2 7 6 3 11 3C13.4 3 15.5 4.1 16 5.8C16.5 4.1 18.6 3 21 3C26 3 30 7 30 12C30 21.5 16 31 16 31Z"
            fill="white"
          />
          {/* Fork tines */}
          <path d="M13 9L13 13" stroke="#E05835" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 8L16 13" stroke="#E05835" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19 9L19 13" stroke="#E05835" strokeWidth="1.8" strokeLinecap="round" />
          {/* Fork neck */}
          <path d="M13 13 Q16 15.5 19 13" stroke="#E05835" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Fork handle */}
          <path d="M16 15L16 22" stroke="#E05835" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
