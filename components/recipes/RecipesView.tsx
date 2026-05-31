"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import RecipeCard, { type RecipeMemberStatusItem } from "./RecipeCard";
import type { Recipe } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecipeWithStatuses = Recipe & {
  profiles: { display_name: string | null; username: string } | null;
  member_statuses: RecipeMemberStatusItem[];
};

export type FilterMember = {
  id: string;
  name: string;
};

interface RecipesViewProps {
  recipes: RecipeWithStatuses[];
  userId: string;
  filterMembers: FilterMember[];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyState({
  message,
  subtext,
}: {
  message: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed p-12 text-center">
      <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="font-medium">{message}</p>
      {subtext && (
        <p className="text-sm text-muted-foreground mt-1">{subtext}</p>
      )}
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

export default function RecipesView({
  recipes,
  userId,
  filterMembers,
}: RecipesViewProps) {
  const [filterMemberId, setFilterMemberId] = useState("all");

  function hasStatus(
    r: RecipeWithStatuses,
    status: "wishlist" | "cooked"
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
      ? recipes
      : recipes.filter((r) =>
          r.member_statuses.some((ms) => ms.user_id === filterMemberId)
        );

  const filteredWishlist = recipes.filter((r) => hasStatus(r, "wishlist"));
  const filteredCooked = recipes.filter((r) => hasStatus(r, "cooked"));

  function RecipeGrid({ items }: { items: RecipeWithStatuses[] }) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((r) => {
          const addedByName =
            r.profiles?.display_name ?? r.profiles?.username ?? null;
          return (
            <RecipeCard
              key={r.id}
              recipe={r}
              addedByName={addedByName}
              userId={userId}
            />
          );
        })}
      </div>
    );
  }

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All ({recipes.length})</TabsTrigger>
        <TabsTrigger value="wishlist">
          Wishlist ({filteredWishlist.length})
        </TabsTrigger>
        <TabsTrigger value="cooked">
          Cooked ({filteredCooked.length})
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
          <EmptyState
            message="No recipes yet"
            subtext="Clip recipes from any website or add them manually"
          />
        ) : (
          <RecipeGrid items={filteredAll} />
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
                ? "No recipes on the wishlist yet"
                : "No wishlist recipes for this person"
            }
            subtext={
              filterMemberId === "all"
                ? "Clip recipes from any website or add them manually"
                : undefined
            }
          />
        ) : (
          <RecipeGrid items={filteredWishlist} />
        )}
      </TabsContent>

      {/* ── Cooked ── */}
      <TabsContent value="cooked" className="mt-4 space-y-4">
        <MemberFilter
          members={filterMembers}
          activeId={filterMemberId}
          onChange={setFilterMemberId}
        />
        {filteredCooked.length === 0 ? (
          <EmptyState
            message={
              filterMemberId === "all"
                ? "No cooked recipes yet"
                : "No cooked recipes for this person"
            }
            subtext={
              filterMemberId === "all"
                ? "Mark a recipe as cooked when you make it"
                : undefined
            }
          />
        ) : (
          <RecipeGrid items={filteredCooked} />
        )}
      </TabsContent>
    </Tabs>
  );
}
