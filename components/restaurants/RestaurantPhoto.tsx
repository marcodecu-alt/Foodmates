"use client";

import { useState } from "react";

interface Props {
  photoReference: string;
  alt: string;
}

export default function RestaurantPhoto({ photoReference, alt }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) return <span className="text-6xl">🍽️</span>;

  return (
    <img
      src={`/api/places/photo?ref=${encodeURIComponent(photoReference)}`}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
