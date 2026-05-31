"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, UtensilsCrossed, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import RestaurantCard, { type MemberStatusItem } from "./RestaurantCard";
import type { Restaurant } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RestaurantWithStatuses = Restaurant & {
  profiles: { display_name: string | null; username: string } | null;
  member_statuses: MemberStatusItem[];
};

export type FilterMember = {
  id: string;
  name: string;
};

interface RestaurantsViewProps {
  restaurants: RestaurantWithStatuses[];
  userId: string;
  filterMembers: FilterMember[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractCity(address: string | null | undefined): string {
  if (!address) return "Other";
  const parts = address
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (
      /^(UK|US|GB|United Kingdom|United States|France|Italy|Spain|Germany|Japan|Australia|Netherlands|Portugal|Greece)$/i.test(
        p
      )
    )
      continue;
    const stripped = p.replace(/\s+[A-Z]{1,2}\d[\w\s]*$/i, "").trim();
    const city = stripped.replace(/^\d[\d\s]*/, "").trim();
    if (city.length > 1 && !/^\d+$/.test(city)) return city;
  }
  return "Other";
}

function groupByCity(
  restaurants: RestaurantWithStatuses[]
): [string, RestaurantWithStatuses[]][] {
  const map = new Map<string, RestaurantWithStatuses[]>();
  for (const r of restaurants) {
    const city = extractCity(r.address);
    if (!map.has(city)) map.set(city, []);
    map.get(city)!.push(r);
  }
  return Array.from(map.entries()).sort(([a], [b]) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed p-12 text-center">
      <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="font-medium">{message}</p>
    </div>
  );
}

function LocationSection({
  city,
  restaurants,
  showCity,
  userId,
}: {
  city: string;
  restaurants: RestaurantWithStatuses[];
  showCity: boolean;
  userId: string;
}) {
  return (
    <div className="space-y-3">
      {showCity && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">
            <MapPin className="h-3 w-3" />
            {city}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {restaurants.map((r) => {
          const addedByName =
            r.profiles?.display_name ?? r.profiles?.username ?? null;
          return (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              addedByName={addedByName}
              userId={userId}
            />
          );
        })}
      </div>
    </div>
  );
}

function MemberFilter({
  members,
  activeId,
  onChange,
}: {
  members: FilterMember[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  // Only show filter if there are multiple members
  if (members.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap pb-1">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Users className="h-3 w-3" />
        Show:
      </span>
      <button
        onClick={() => onChange("all")}
        className={cn(
          "text-xs px-3 py-1 rounded-full border transition-colors",
          activeId === "all"
            ? "bg-primary text-primary-foreground border-primary"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
        )}
      >
        Anyone
      </button>
      {members.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={cn(
            "text-xs px-3 py-1 rounded-full border transition-colors",
            activeId === m.id
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          {m.name}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RestaurantsView({
  restaurants,
  userId,
  filterMembers,
}: RestaurantsViewProps) {
  const [filterMemberId, setFilterMemberId] = useState("all");

  // ── Filtering helpers ────────────────────────────────────────────────────
  function hasStatus(
    r: RestaurantWithStatuses,
    status: "wishlist" | "visited"
  ): boolean {
    if (filterMemberId === "all") {
      return r.member_statuses.some((ms) => ms.status === status);
    }
    return r.member_statuses.some(
      (ms) => ms.user_id === filterMemberId && ms.status === status
    );
  }

  const filteredAll =
    filterMemberId === "all"
      ? restaurants
      : restaurants.filter((r) =>
          r.member_statuses.some((ms) => ms.user_id === filterMemberId)
        );

  const filteredWishlist = restaurants.filter((r) =>
    hasStatus(r, "wishlist")
  );
  const filteredVisited = restaurants.filter((r) => hasStatus(r, "visited"));

  const allGroups = groupByCity(filteredAll);
  const wishlistGroups = groupByCity(filteredWishlist);
  const visitedGroups = groupByCity(filteredVisited);

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All ({restaurants.length})</TabsTrigger>
        <TabsTrigger value="wishlist">
          Wishlist ({filteredWishlist.length})
        </TabsTrigger>
        <TabsTrigger value="visited">
          Visited ({filteredVisited.length})
        </TabsTrigger>
      </TabsList>

      {/* ── All ── */}
      <TabsContent value="all" className="mt-4 space-y-4">
        <MemberFilter
          members={filterMembers}
          activeId={filterMemberId}
          onChange={setFilterMemberId}
        />
        {filteredAll.length === 0 ? (
          <EmptyState message="No restaurants yet" />
        ) : (
          <div className="space-y-8">
            {allGroups.map(([city, items]) => (
              <LocationSection
                key={city}
                city={city}
                restaurants={items}
                showCity={allGroups.length > 1}
                userId={userId}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Wishlist ── */}
      <TabsContent value="wishlist" className="mt-4 space-y-4">
        <MemberFilter
          members={filterMembers}
          activeId={filterMemberId}
          onChange={setFilterMemberId}
        />
        {filteredWishlist.length === 0 ? (
          <EmptyState
            message={
              filterMemberId === "all"
                ? "No restaurants on the wishlist yet"
                : "No wishlist restaurants for this person"
            }
          />
        ) : (
          <div className="space-y-8">
            {wishlistGroups.map(([city, items]) => (
              <LocationSection
                key={city}
                city={city}
                restaurants={items}
                showCity={wishlistGroups.length > 1}
                userId={userId}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Visited ── */}
      <TabsContent value="visited" className="mt-4 space-y-4">
        <MemberFilter
          members={filterMembers}
          activeId={filterMemberId}
          onChange={setFilterMemberId}
        />
        {filteredVisited.length === 0 ? (
          <EmptyState
            message={
              filterMemberId === "all"
                ? "No visited restaurants yet"
                : "No visited restaurants for this person"
            }
          />
        ) : (
          <div className="space-y-8">
            {visitedGroups.map(([city, items]) => (
              <LocationSection
                key={city}
                city={city}
                restaurants={items}
                showCity={visitedGroups.length > 1}
                userId={userId}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
