"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  src: string;
  alt: string;
  caption?: string | null;
}

export default function FeedPhotoLightbox({ src, alt, caption }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Thumbnail — stops propagation so the parent <Link> doesn't fire */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover cursor-zoom-in"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      />

      {/* Lightbox overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4"
          onClick={() => setOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Full-size image */}
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Caption */}
          {caption && (
            <p
              className="mt-3 text-sm text-white/80 text-center max-w-sm px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
