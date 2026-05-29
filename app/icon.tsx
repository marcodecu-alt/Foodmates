import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg width="32" height="32" viewBox="0 0 32 34" fill="none">
        <path
          d="M16 31C16 31 2 21.5 2 12C2 7 6 3 11 3C13.4 3 15.5 4.1 16 5.8C16.5 4.1 18.6 3 21 3C26 3 30 7 30 12C30 21.5 16 31 16 31Z"
          fill="#E05835"
        />
        <path d="M13 9 L13 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 8 L16 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M19 9 L19 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M13 13 Q16 15.5 19 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M16 15 L16 22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    { ...size }
  );
}
