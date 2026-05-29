"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number | null) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const active = hovered ?? value ?? 0;
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => !readonly && setHovered(null)}
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => {
            if (readonly) return;
            // Click the same star again → clear
            onChange?.(value === star ? null : star);
          }}
          onMouseEnter={() => !readonly && setHovered(star)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
          aria-label={`Rate ${star} out of 10`}
        >
          <Star
            className={cn(
              starSize,
              "transition-colors",
              star <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40"
            )}
          />
        </button>
      ))}
      {value !== null && value !== undefined && (
        <span className="ml-1.5 text-sm font-medium tabular-nums text-muted-foreground">
          {value}/10
        </span>
      )}
    </div>
  );
}
