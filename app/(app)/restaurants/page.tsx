import { createClient } from "@/lib/supabase/server";
import { getActiveGroupId } from "@/lib/activeGroup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RestaurantCard, {
  type MemberStatusItem,
} from "@/components/restaurants/RestaurantCard";
import AddRestaurantModal from "@/components/restaurants/AddRestaurantModal";
import { MapPin, UtensilsCrossed } from "lucide-react";
import type { Restaurant } from "@/lib/supabase/types";

/* ── Extract city from a formatted Google Places address ── */
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

type RestaurantWithStatuses = Restaurant & {
  profiles: { display_name: string | null; username: string } | null;
  member_statuses: MemberStatusItem[];
};

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

export default async function RestaurantsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user!.id);

  const groupIds = memberships?.map((m) => m.group_id) ?? [];
  const cookieGroupId = getActiveGroupId();
  const activeGroupId =
    groupIds.find((id) => id === cookieGroupId) ?? groupIds[0] ?? null;

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select(
      `*, profiles:added_by(display_name, username),
       member_statuses:restaurant_member_status(
         user_id, status, visited_at,
         profiles:user_id(display_name, username)
       )`
    )
    .eq("group_id", activeGroupId ?? "none")
    .order("created_at", { ascending: false });

  const userId = user!.id;
  const all = (restaurants ?? []) as unknown as RestaurantWithStatuses[];

  // Filter by current user's personal status
  const myWishlist = all.filter(
    (r) => r.member_statuses.find((ms) => ms.user_id === userId)?.status === "wishlist"
  );
  const myVisited = all.filter(
    (r) => r.member_statuses.find((ms) => ms.user_id === userId)?.status === "visited"
  );

  const allGroups = groupByCity(all);
  const wishlistGroups = groupByCity(myWishlist);
  const visitedGroups = groupByCity(myVisited);

  return (
    <div className="container py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <AddRestaurantModal />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="wishlist">
            Wishlist ({myWishlist.length})
          </TabsTrigger>
          <TabsTrigger value="visited">
            Visited ({myVisited.length})
          </TabsTrigger>
        </TabsList>

        {/* ── All group restaurants ── */}
        <TabsContent value="all" className="mt-4">
          {all.length === 0 ? (
            <EmptyState message="No restaurants added yet — be the first to add one!" />
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

        {/* ── My wishlist ── */}
        <TabsContent value="wishlist" className="mt-4">
          {myWishlist.length === 0 ? (
            <EmptyState message="Your wishlist is empty — add restaurants you want to try" />
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

        {/* ── My visited ── */}
        <TabsContent value="visited" className="mt-4">
          {myVisited.length === 0 ? (
            <EmptyState message="No visited restaurants yet — mark wishlist items as visited when you go" />
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
    </div>
  );
}
