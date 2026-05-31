"use client";

import Link from "next/link";
import { Clock, User } from "lucide-react";
import type { Recipe } from "@/lib/supabase/types";
import StatusToggle from "@/components/shared/StatusToggle";
import { Badge } from "@/components/ui/badge";

export interface RecipeMemberStatusItem {
  user_id: string;
  status: string;
  profiles: { display_name: string | null; username: string | null } | null;
}

interface RecipeCardProps {
  recipe: Recipe & { member_statuses?: RecipeMemberStatusItem[] };
  photoUrl?: string | null;
  addedByName?: string | null;
  userId: string;
}

export default function RecipeCard({
  recipe: r,
  photoUrl,
  addedByName,
  userId,
}: RecipeCardProps) {
  const totalTime = (r.prep_time ?? 0) + (r.cook_time ?? 0);
  const displayPhoto = photoUrl ?? r.cover_photo_url ?? null;
  const memberStatuses = r.member_statuses ?? [];
  const myStatus =
    memberStatuses.find((ms) => ms.user_id === userId)?.status ?? null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <Link href={`/recipes/${r.id}`} className="block">
        <div className="h-40 bg-muted flex items-center justify-center overflow-hidden relative">
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

      <div className="p-3 space-y-1.5">
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

        {/* Member statuses — one row per person */}
        {memberStatuses.length > 0 ? (
          <div className="space-y-0.5 pt-0.5">
            {memberStatuses.map((ms) => {
              const isMe = ms.user_id === userId;
              const name = isMe
                ? "You"
                : ms.profiles?.display_name ??
                  ms.profiles?.username ??
                  "Member";
              const isCooked = ms.status === "cooked";
              return (
                <div
                  key={ms.user_id}
                  className={`flex items-center gap-1.5 text-[11px] font-medium ${
                    isCooked ? "text-green-600" : "text-primary"
                  }`}
                >
                  <span className="w-3 text-center flex-shrink-0">
                    {isCooked ? "✓" : "★"}
                  </span>
                  <span className="font-semibold">{name}</span>
                  <span className="font-normal opacity-70">
                    {isCooked ? "Cooked" : "Wishlist"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          addedByName && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{addedByName}</span>
            </div>
          )
        )}

        <StatusToggle
          id={r.id}
          type="recipe"
          currentStatus={myStatus}
          userId={userId}
        />
      </div>
    </div>
  );
}
