import { createClient } from "@/lib/supabase/server";
import { getActiveGroupId } from "@/lib/activeGroup";
import AddRestaurantModal from "@/components/restaurants/AddRestaurantModal";
import RestaurantsView, {
  type RestaurantWithStatuses,
  type FilterMember,
} from "@/components/restaurants/RestaurantsView";
import type { MemberStatusItem } from "@/components/restaurants/RestaurantCard";

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

  // Derive unique group members from the member_statuses data (no extra query)
  const memberMap = new Map<string, FilterMember>();
  for (const r of all) {
    for (const ms of r.member_statuses as MemberStatusItem[]) {
      if (!memberMap.has(ms.user_id)) {
        const name =
          ms.user_id === userId
            ? "You"
            : ms.profiles?.display_name ??
              ms.profiles?.username ??
              "Member";
        memberMap.set(ms.user_id, { id: ms.user_id, name });
      }
    }
  }
  // Put "You" first
  const filterMembers = Array.from(memberMap.values()).sort((a) =>
    a.id === userId ? -1 : 1
  );

  return (
    <div className="container py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <AddRestaurantModal />
      </div>

      <RestaurantsView
        restaurants={all}
        userId={userId}
        filterMembers={filterMembers}
      />
    </div>
  );
}
