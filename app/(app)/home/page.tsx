import { createClient } from "@/lib/supabase/server";
import { getActiveGroupId } from "@/lib/activeGroup";
import Link from "next/link";
import { UtensilsCrossed, Plus, Star, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedPhotoLightbox from "@/components/shared/FeedPhotoLightbox";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Activity = {
  key: string;
  type:
    | "restaurant_added"
    | "restaurant_visited"
    | "recipe_added"
    | "recipe_cooked"
    | "photo_added";
  entityId: string;
  entityName: string;
  photoReference?: string | null;
  storagePath?: string | null;   // for uploaded photos
  caption?: string | null;
  addedById: string;
  addedByName: string;
  date: string;
  rating?: number | null;
  cuisine?: string | null;
  entityType?: "restaurant" | "recipe"; // only set for photo_added
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
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function mediaPublicUrl(supabaseUrl: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/media/${path}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const supabase = createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

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
  const activeGroupId =
    groupIds.find((id) => id === cookieGroupId) ?? groupIds[0] ?? null;

  // --- No group state ---
  if (!activeGroupId) {
    return (
      <div className="container py-10 flex flex-col items-center gap-4 text-center">
        <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
        <h2 className="font-semibold text-xl">No group yet</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Create or join a group to start tracking restaurants and recipes
          together.
        </p>
        <Button asChild>
          <Link href="/groups">Get started</Link>
        </Button>
      </div>
    );
  }

  // --- Fetch restaurants & recipes in parallel ---
  const [{ data: restaurants }, { data: recipes }] = await Promise.all([
    supabase
      .from("restaurants")
      .select(
        "id, name, photo_reference, added_by, created_at, visited_at, status, my_rating, cuisine, profiles:added_by(id, display_name, username)"
      )
      .eq("group_id", activeGroupId)
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("recipes")
      .select(
        "id, title, added_by, created_at, cooked_at, status, cuisine, profiles:added_by(id, display_name, username)"
      )
      .eq("group_id", activeGroupId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // --- Fetch recent media for those restaurants & recipes ---
  const restaurantIds = (restaurants ?? []).map((r) => r.id);
  const recipeIds = (recipes ?? []).map((r) => r.id);

  // Build name lookup maps so we don't need an extra join
  const restaurantNames = new Map(
    (restaurants ?? []).map((r) => [r.id, r.name])
  );
  const recipeNames = new Map(
    (recipes ?? []).map((r) => [r.id, r.title])
  );

  const [{ data: restaurantMedia }, { data: recipeMedia }] = await Promise.all([
    restaurantIds.length > 0
      ? supabase
          .from("restaurant_media")
          .select(
            "id, storage_path, type, caption, created_at, uploaded_by, restaurant_id, profiles:uploaded_by(id, display_name, username)"
          )
          .in("restaurant_id", restaurantIds)
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] as {
          id: string;
          storage_path: string;
          type: string;
          caption: string | null;
          created_at: string;
          uploaded_by: string;
          restaurant_id: string;
          profiles: { id: string; display_name: string | null; username: string | null } | null;
        }[] }),

    recipeIds.length > 0
      ? supabase
          .from("recipe_media")
          .select(
            "id, storage_path, type, caption, created_at, uploaded_by, recipe_id, profiles:uploaded_by(id, display_name, username)"
          )
          .in("recipe_id", recipeIds)
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] as {
          id: string;
          storage_path: string;
          type: string;
          caption: string | null;
          created_at: string;
          uploaded_by: string;
          recipe_id: string;
          profiles: { id: string; display_name: string | null; username: string | null } | null;
        }[] }),
  ]);

  // --- Build feed ---
  const activities: Activity[] = [];

  for (const r of restaurants ?? []) {
    const profile = r.profiles as unknown as {
      id: string;
      display_name: string | null;
      username: string | null;
    } | null;
    const addedById = r.added_by ?? "";
    const addedByName = profile?.display_name ?? profile?.username ?? "Someone";

    if (r.status === "visited" && r.visited_at) {
      // Only show the visited event — avoids duplicate when added directly as visited
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
    } else {
      // Wishlist: show the "added" event
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
    }
  }

  for (const r of recipes ?? []) {
    const profile = r.profiles as unknown as {
      id: string;
      display_name: string | null;
      username: string | null;
    } | null;
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

  // Photo events — restaurant media
  for (const m of restaurantMedia ?? []) {
    const profile = m.profiles as unknown as {
      id: string;
      display_name: string | null;
      username: string | null;
    } | null;
    const entityName = restaurantNames.get(m.restaurant_id) ?? "Restaurant";

    activities.push({
      key: `restaurant_photo_${m.id}`,
      type: "photo_added",
      entityType: "restaurant",
      entityId: m.restaurant_id,
      entityName,
      storagePath: m.storage_path,
      caption: m.caption,
      addedById: m.uploaded_by,
      addedByName: profile?.display_name ?? profile?.username ?? "Someone",
      date: m.created_at,
    });
  }

  // Photo events — recipe media
  for (const m of recipeMedia ?? []) {
    const profile = m.profiles as unknown as {
      id: string;
      display_name: string | null;
      username: string | null;
    } | null;
    const entityName = recipeNames.get(m.recipe_id) ?? "Recipe";

    activities.push({
      key: `recipe_photo_${m.id}`,
      type: "photo_added",
      entityType: "recipe",
      entityId: m.recipe_id,
      entityName,
      storagePath: m.storage_path,
      caption: m.caption,
      addedById: m.uploaded_by,
      addedByName: profile?.display_name ?? profile?.username ?? "Someone",
      date: m.created_at,
    });
  }

  activities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const feed = activities.slice(0, 35);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="container py-6 space-y-5 max-w-2xl">
      {/* Header */}
      <div>
        <h1
          style={{ fontFamily: "var(--font-fraunces)" }}
          className="text-2xl font-bold text-foreground"
        >
          Activity
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          What&apos;s happening in your group
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href="/restaurants">
            <Plus className="h-3.5 w-3.5" />
            Add restaurant
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href="/recipes">
            <Plus className="h-3.5 w-3.5" />
            Add recipe
          </Link>
        </Button>
      </div>

      {/* Feed */}
      {feed.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold">No activity yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Add your first restaurant or recipe and it will appear here
          </p>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-xl mt-1"
          >
            <Link href="/restaurants">
              <Plus className="h-4 w-4" />
              Add restaurant
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {feed.map((item) => {
            const isRestaurant =
              item.type === "restaurant_added" ||
              item.type === "restaurant_visited" ||
              (item.type === "photo_added" && item.entityType === "restaurant");
            const isVisited = item.type === "restaurant_visited";
            const isCooked = item.type === "recipe_cooked";
            const isPhoto = item.type === "photo_added";
            const href = isRestaurant
              ? `/restaurants/${item.entityId}`
              : `/recipes/${item.entityId}`;
            const actor =
              item.addedById === user!.id ? "You" : item.addedByName;

            return (
              <li key={item.key}>
                <Link
                  href={href}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 hover:bg-muted/30 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center text-3xl">
                    {isPhoto && item.storagePath ? (
                      <FeedPhotoLightbox
                        src={mediaPublicUrl(supabaseUrl, item.storagePath)}
                        alt={item.caption ?? item.entityName}
                        caption={item.caption}
                      />
                    ) : isRestaurant && item.photoReference ? (
                      <img
                        src={`/api/places/photo?ref=${item.photoReference}`}
                        alt={item.entityName}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : isRestaurant ? (
                      <span className="text-3xl">🍽️</span>
                    ) : (
                      <span className="text-3xl">📖</span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 py-0.5">
                    {/* Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5 ${
                        isVisited || isCooked
                          ? "bg-green-100 text-green-700"
                          : isPhoto
                          ? "bg-blue-50 text-blue-600"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isVisited ? (
                        "✓ Visited"
                      ) : isCooked ? (
                        "✓ Cooked"
                      ) : isPhoto ? (
                        <>
                          <Camera className="h-2.5 w-2.5" />
                          Photo
                        </>
                      ) : isRestaurant ? (
                        "＋ Wishlist"
                      ) : (
                        "＋ Saved"
                      )}
                    </span>

                    <p className="font-semibold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {item.entityName}
                    </p>

                    {/* Caption (photo events only) */}
                    {isPhoto && item.caption && (
                      <p className="text-xs text-foreground/70 mt-0.5 line-clamp-1 italic">
                        &ldquo;{item.caption}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {actor}
                      </span>
                      {item.cuisine && !isPhoto && (
                        <>
                          <span className="text-muted-foreground/40 text-xs">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.cuisine}
                          </span>
                        </>
                      )}
                      {isVisited && item.rating != null && (
                        <>
                          <span className="text-muted-foreground/40 text-xs">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {item.rating}/10
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground/60 mt-1.5">
                      {relativeTime(item.date)}
                    </p>
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
