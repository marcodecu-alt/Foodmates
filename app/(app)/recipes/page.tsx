import { createClient } from "@/lib/supabase/server";
import { getActiveGroupId } from "@/lib/activeGroup";
import AddRecipeModal from "@/components/recipes/AddRecipeModal";
import RecipesView, {
  type RecipeWithStatuses,
  type FilterMember,
} from "@/components/recipes/RecipesView";

export default async function RecipesPage() {
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

  const { data: recipesRaw } = await supabase
    .from("recipes")
    .select(
      "*, profiles:added_by(display_name, username), member_statuses:recipe_member_status(user_id, status, profiles:user_id(display_name, username))"
    )
    .eq("group_id", activeGroupId ?? "none")
    .order("created_at", { ascending: false });

  const recipes = (recipesRaw ?? []) as unknown as RecipeWithStatuses[];

  // Build filter members from member_statuses data (no extra query needed)
  const memberMap = new Map<string, string>();
  for (const r of recipes) {
    for (const ms of r.member_statuses ?? []) {
      if (!memberMap.has(ms.user_id)) {
        const name =
          (ms.profiles as unknown as { display_name: string | null; username: string | null } | null)
            ?.display_name ??
          (ms.profiles as unknown as { display_name: string | null; username: string | null } | null)
            ?.username ??
          "Member";
        memberMap.set(ms.user_id, name);
      }
    }
  }

  const filterMembers: FilterMember[] = Array.from(memberMap.entries())
    .map(([id, name]) => ({
      id,
      name: id === user!.id ? "You" : name,
    }))
    .sort((a, b) => {
      if (a.id === user!.id) return -1;
      if (b.id === user!.id) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="container py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <AddRecipeModal />
      </div>

      <RecipesView
        recipes={recipes}
        userId={user!.id}
        filterMembers={filterMembers}
      />
    </div>
  );
}
