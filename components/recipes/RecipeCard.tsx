"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import type { Recipe } from "@/lib/supabase/types";
import StatusToggle from "@/components/shared/StatusToggle";
import StarRating from "@/components/shared/StarRating";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  recipe: Recipe;
  photoUrl?: string | null;
}

export default function RecipeCard({ recipe: r, photoUrl }: RecipeCardProps) {
  const totalTime = (r.prep_time ?? 0) + (r.cook_time ?? 0);
  const displayPhoto = photoUrl ?? r.cover_photo_url ?? null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <Link href={`/recipes/${r.id}`} className="block">
        <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={r.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">🍳</span>
          )}
        </div>
      </Link>

      <div className="p-3 space-y-2">
        <Link href={`/recipes/${r.id}`} className="hover:underline">
          <p className="font-semibold text-sm leading-tight line-clamp-2">
            {r.title}
          </p>
        </Link>

        {r.cuisine && (
          <p className="text-xs text-muted-foreground">{r.cuisine}</p>
        )}

        {totalTime > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {totalTime} min
          </div>
        )}

        {r.tags && r.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {r.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {r.my_rating !== null && r.my_rating !== undefined && (
          <StarRating value={r.my_rating} readonly size="sm" />
        )}
        <StatusToggle id={r.id} type="recipe" currentStatus={r.status} />
      </div>
    </div>
  );
}
