import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UtensilsCrossed, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GroupBanner from "@/components/groups/GroupBanner";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name), role")
    .eq("user_id", user!.id);

  const groupIds = memberships?.map((m) => m.group_id) ?? [];

  let hasGroupWithMultipleMembers = false;
  if (groupIds.length > 0) {
    const { data: memberCounts } = await supabase
      .from("group_members")
      .select("group_id")
      .in("group_id", groupIds);

    const countByGroup: Record<string, number> = {};
    memberCounts?.forEach((m) => {
      countByGroup[m.group_id] = (countByGroup[m.group_id] ?? 0) + 1;
    });
    hasGroupWithMultipleMembers = Object.values(countByGroup).some(
      (c) => c >= 2
    );
  }

  const noGroups = groupIds.length === 0;

  const { data: recentRestaurants } = await supabase
    .from("restaurants")
    .select("id, name, cuisine, status, google_rating, photo_reference")
    .in("group_id", groupIds.length > 0 ? groupIds : ["none"])
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: recentRecipes } = await supabase
    .from("recipes")
    .select("id, title, cuisine, status, tags")
    .in("group_id", groupIds.length > 0 ? groupIds : ["none"])
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="container py-6 space-y-6">
      <GroupBanner
        noGroups={noGroups}
        hasGroupWithMultipleMembers={hasGroupWithMultipleMembers}
      />

      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1 sm:flex-none">
          <Link href="/restaurants">
            <UtensilsCrossed className="h-4 w-4" />
            Restaurants
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 sm:flex-none">
          <Link href="/recipes">
            <BookOpen className="h-4 w-4" />
            Recipes
          </Link>
        </Button>
      </div>

      {(recentRestaurants?.length ?? 0) > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Recent restaurants</h2>
            <Link href="/restaurants" className="text-sm text-primary hover:underline">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recentRestaurants!.map((r) => (
              <Link
                key={r.id}
                href={`/restaurants/${r.id}`}
                className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-28 bg-muted flex items-center justify-center text-3xl">🍽️</div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.cuisine ?? "Restaurant"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border-2 border-dashed p-8 text-center">
          <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium">No restaurants yet</p>
          <p className="text-sm text-muted-foreground mb-4">Start building your wishlist</p>
          <Button asChild size="sm">
            <Link href="/restaurants">
              <Plus className="h-4 w-4" />
              Add a restaurant
            </Link>
          </Button>
        </section>
      )}

      {(recentRecipes?.length ?? 0) > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Recent recipes</h2>
            <Link href="/recipes" className="text-sm text-primary hover:underline">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recentRecipes!.map((r) => (
              <Link
                key={r.id}
                href={`/recipes/${r.id}`}
                className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-28 bg-muted flex items-center justify-center text-3xl">🍳</div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.cuisine ?? (r.tags?.[0] ?? "Recipe")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border-2 border-dashed p-8 text-center">
          <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium">No recipes yet</p>
          <p className="text-sm text-muted-foreground mb-4">Clip recipes from any website</p>
          <Button asChild size="sm">
            <Link href="/recipes">
              <Plus className="h-4 w-4" />
              Add a recipe
            </Link>
          </Button>
        </section>
      )}
    </div>
  );
}
