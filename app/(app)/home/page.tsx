import { createClient } from "@/lib/supabase/server";
import { getActiveGroupId } from "@/lib/activeGroup";
import Link from "next/link";
import { UtensilsCrossed, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Activity = {
  key: string;
  type: "restaurant_added" | "restaurant_visited" | "recipe_added" | "recipe_cooked";
  entityId: string;
  entityName: string;
  photoReference?: string | null;
  addedById: string;
  addedByName: string;
  date: string;
  rating?: number | null;
  cuisine?: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function actionText(type: Activity["type"], name: string): string {
  switch (type) {
    case "restaurant_added":
      return `added ${name} to the wishlist`;
    case "restaurant_visited":
      return `visited ${name}`;
    case "recipe_added":
      return `saved ${name} to try`;
    case "recipe_cooked":
      return `cooked ${name}`;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Determine active group ---
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user!.id);

  const groupIds = memberships?.map((m) => m.group_id) ?? [];
  const cookieGroupId = getActiveGroupId();
  const activeGroupId = groupIds.find((id) => id === cookieGroupId) ?? groupIds[0] ?? null;

  // --- No group state ---
  if (!activeGroupId) {
    return (
      <div className="container py-10 flex flex-col items-center gap-4 text-center">
        <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
        <h2 className="font-semibold text-xl">No group yet</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Create or join a group to start tracking restaurants and recipes together.
        </p>
        <Button asChild>
          <Link href="/groups">Get started</Link>
        </Button>
      </div>
    );
  }

  // --- Fetch data ---
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select(
      "id, name, photo_reference, added_by, created_at, visited_at, status, my_rating, cuisine, profiles:added_by(id, display_name, username)"
    )
    .eq("group_id", activeGroupId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: recipes } = await supabase
    .from("recipes")
    .select(
      "id, title, added_by, created_at, cooked_at, status, cuisine, profiles:added_by(id, display_name, username)"
    )
    .eq("group_id", activeGroupId)
    .order("created_at", { ascending: false })
    .limit(20);

  // --- Build feed ---
  const activities: Activity[] = [];

  for (const r of restaurants ?? []) {
    const profile = r.profiles as { id: string; display_name: string | null; username: string | null } | null;
    const addedById = r.added_by ?? "";
    const addedByName = profile?.display_name ?? profile?.username ?? "Someone";

    activities.push({
      key: `restaurant_added_${r.id}`,
      type: "restaurant_added",
      entityId: r.id,
      entityName: r.name,
      photoReference: r.photo_reference,
      addedById,
      addedByName,
      date: r.created_at,
      cuisine: r.cuisine,
    });

    if (r.status === "visited" && r.visited_at) {
      activities.push({
        key: `restaurant_visited_${r.id}`,
        type: "restaurant_visited",
        entityId: r.id,
        entityName: r.name,
        photoReference: r.photo_reference,
        addedById,
        addedByName,
        date: r.visited_at,
        rating: r.my_rating,
        cuisine: r.cuisine,
      });
    }
  }

  for (const r of recipes ?? []) {
    const profile = r.profiles as { id: string; display_name: string | null; username: string | null } | null;
    const addedById = r.added_by ?? "";
    const addedByName = profile?.display_name ?? profile?.username ?? "Someone";

    activities.push({
      key: `recipe_added_${r.id}`,
      type: "recipe_added",
      entityId: r.id,
      entityName: r.title,
      addedById,
      addedByName,
      date: r.created_at,
      cuisine: r.cuisine,
    });

    if (r.status === "cooked" && r.cooked_at) {
      activities.push({
        key: `recipe_cooked_${r.id}`,
        type: "recipe_cooked",
        entityId: r.id,
        entityName: r.title,
        addedById,
        addedByName,
        date: r.cooked_at,
        cuisine: r.cuisine,
      });
    }
  }

  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const feed = activities.slice(0, 30);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="container py-6 space-y-5 max-w-2xl">
      {/* Quick actions */}
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/restaurants">
            <Plus className="h-3.5 w-3.5" />
            Add restaurant
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/recipes">
            <Plus className="h-3.5 w-3.5" />
            Add recipe
          </Link>
        </Button>
      </div>

      {/* Section header */}
      <div>
        <h2 className="font-semibold text-lg">Activity</h2>
        <div className="mt-1 border-b" />
      </div>

      {/* Feed */}
      {feed.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <UtensilsCrossed className="h-9 w-9 text-muted-foreground" />
          <p className="font-medium">No activity yet</p>
          <p className="text-sm text-muted-foreground">Add your first restaurant to get started</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/restaurants">
              <Plus className="h-4 w-4" />
              Add restaurant
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-1">
          {feed.map((item) => {
            const isRestaurant = item.type === "restaurant_added" || item.type === "restaurant_visited";
            const href = isRestaurant ? `/restaurants/${item.entityId}` : `/recipes/${item.entityId}`;
            const actor = item.addedById === user!.id ? "You" : item.addedByName;

            return (
              <li key={item.key}>
                <Link
                  href={href}
                  className="flex items-start gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center text-2xl">
                    {isRestaurant && item.photoReference ? (
                      <img
                        src={`/api/places/photo?ref=${item.photoReference}`}
                        alt={item.entityName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : isRestaurant ? (
                      "🍽️"
                    ) : (
                      "📖"
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{actor}</span>{" "}
                      <span className="text-muted-foreground">{actionText(item.type, item.entityName)}</span>
                    </p>

                    {/* Sub-line: cuisine + rating */}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {item.cuisine && (
                        <span className="text-xs text-muted-foreground">{item.cuisine}</span>
                      )}
                      {item.type === "restaurant_visited" && item.rating != null && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {item.rating}/5
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{relativeTime(item.date)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
