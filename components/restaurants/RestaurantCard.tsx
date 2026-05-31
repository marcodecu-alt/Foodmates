"use client";

import Link from "next/link";
import { Star, User } from "lucide-react";
import type { Restaurant } from "@/lib/supabase/types";
import StatusToggle from "@/components/shared/StatusToggle";
import { cn } from "@/lib/utils";

export interface MemberStatusItem {
  user_id: string;
  status: string;
  profiles: { display_name: string | null; username: string | null } | null;
}

interface RestaurantCardProps {
  restaurant: Restaurant & { member_statuses?: MemberStatusItem[] };
  addedByName?: string | null;
  userId: string;
}

function PriceLevel({ level }: { level: number | null }) {
  if (!level) return null;
  return (
    <span className="text-muted-foreground text-xs">
      {"$".repeat(level)}
      <span className="opacity-30">{"$".repeat(4 - level)}</span>
    </span>
  );
}

export default function RestaurantCard({
  restaurant: r,
  addedByName,
  userId,
}: RestaurantCardProps) {
  const memberStatuses = r.member_statuses ?? [];
  const myStatus =
    memberStatuses.find((ms) => ms.user_id === userId)?.status ?? null;

  const badgeLabel =
    myStatus === "visited"
      ? "Visited"
      : myStatus === "wishlist"
      ? "Wishlist"
      : null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Photo */}
      <Link href={`/restaurants/${r.id}`} className="block">
        <div className="h-40 bg-muted flex items-center justify-center relative overflow-hidden">
          {r.photo_reference ? (
            <img
              src={`/api/places/photo?ref=${encodeURIComponent(r.photo_reference)}`}
              alt={r.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="text-4xl">🍽️</span>
          )}

          {/* My status badge */}
          {badgeLabel && (
            <div className="absolute top-2.5 right-2.5">
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  myStatus === "wishlist"
                    ? "bg-primary/15 text-primary"
                    : "bg-white/90 text-foreground"
                )}
              >
                {badgeLabel}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="p-3 space-y-1.5">
        {/* Name + price level */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/restaurants/${r.id}`}
            className="hover:underline min-w-0"
          >
            <p className="font-semibold text-sm leading-tight line-clamp-2">
              {r.name}
            </p>
          </Link>
          <PriceLevel level={r.price_level} />
        </div>

        {/* Cuisine */}
        {r.cuisine && (
          <p className="text-xs text-muted-foreground">{r.cuisine}</p>
        )}

        {/* Google rating */}
        {r.google_rating ? (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">
              {r.google_rating}
            </span>
            <span className="text-[10px] text-muted-foreground/60">Google</span>
          </div>
        ) : null}

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
              const isVisited = ms.status === "visited";
              return (
                <div
                  key={ms.user_id}
                  className={`flex items-center gap-1.5 text-[11px] font-medium ${
                    isVisited ? "text-green-600" : "text-primary"
                  }`}
                >
                  <span className="w-3 text-center flex-shrink-0">
                    {isVisited ? "✓" : "★"}
                  </span>
                  <span className="font-semibold">{name}</span>
                  <span className="font-normal opacity-70">
                    {isVisited ? "Visited" : "Wishlist"}
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
          type="restaurant"
          currentStatus={myStatus}
          userId={userId}
        />
      </div>
    </div>
  );
}
