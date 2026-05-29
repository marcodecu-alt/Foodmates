import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecipeCard from "@/components/recipes/RecipeCard";
import AddRecipeModal from "@/components/recipes/AddRecipeModal";
import { BookOpen } from "lucide-react";
import type { Recipe } from "@/lib/supabase/types";

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

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .in("group_id", groupIds.length > 0 ? groupIds : ["none"])
    .order("created_at", { ascending: false });

  const wishlist = (recipes ?? []).filter((r) => r.status === "wishlist");
  const cooked = (recipes ?? []).filter((r) => r.status === "cooked");

  return (
    <div className="container py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <AddRecipeModal />
      </div>

      <Tabs defaultValue="wishlist">
        <TabsList>
          <TabsTrigger value="wishlist">
            Wishlist ({wishlist.length})
          </TabsTrigger>
          <TabsTrigger value="cooked">Cooked ({cooked.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="wishlist" className="mt-4">
          {wishlist.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed p-12 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Your recipe wishlist is empty</p>
              <p className="text-sm text-muted-foreground">
                Clip recipes from any website or add them manually
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlist.map((r) => (
                <RecipeCard key={r.id} recipe={r as Recipe} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cooked" className="mt-4">
          {cooked.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed p-12 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">No cooked recipes yet</p>
              <p className="text-sm text-muted-foreground">
                Mark a recipe as cooked when you make it
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cooked.map((r) => (
                <RecipeCard key={r.id} recipe={r as Recipe} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
