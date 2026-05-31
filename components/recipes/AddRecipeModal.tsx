"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RecipeClipForm from "./RecipeClipForm";
import { Plus, AlertTriangle, BookOpen } from "lucide-react";
import { useActiveGroup } from "@/lib/hooks/useActiveGroup";
import { getOrCreatePersonalGroup } from "@/lib/hooks/useOrCreateGroup";

interface RecipeData {
  title: string;
  description: string | null;
  ingredients: { name: string; amount: string; unit: string }[];
  steps: { order: number; text: string }[];
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  cuisine: string | null;
  tags: string[];
}

export default function AddRecipeModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<"high" | "low" | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const { activeGroupId, setActiveGroupId } = useActiveGroup();
  const supabase = createClient();

  const [status, setStatus] = useState<"wishlist" | "cooked">("wishlist");
  const [form, setForm] = useState<RecipeData>({
    title: "",
    description: null,
    ingredients: [],
    steps: [],
    prep_time: null,
    cook_time: null,
    servings: null,
    cuisine: null,
    tags: [],
  });

  // Join flow — when a recipe with the same source_url already exists
  const [existingRecipe, setExistingRecipe] = useState<{
    id: string;
    title: string;
    addedByName: string;
  } | null>(null);

  function handleClipResult(
    recipe: RecipeData,
    conf: "high" | "low",
    url: string,
    coverUrl: string | null
  ) {
    setForm(recipe);
    setConfidence(conf);
    setSourceUrl(url);
    setCoverPhotoUrl(coverUrl);
    setExistingRecipe(null);
  }

  function handleClipError(url: string, errorDetail?: string) {
    setSourceUrl(url);
    setConfidence("low");
    setError(
      errorDetail
        ? `Import failed: ${errorDetail}`
        : "Couldn't extract recipe from this page — the site may block automated access. You can fill in the details manually below."
    );
  }

  function updateField(field: keyof RecipeData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setStatus("wishlist");
    setForm({
      title: "",
      description: null,
      ingredients: [],
      steps: [],
      prep_time: null,
      cook_time: null,
      servings: null,
      cuisine: null,
      tags: [],
    });
    setConfidence(null);
    setSourceUrl("");
    setCoverPhotoUrl(null);
    setError(null);
    setExistingRecipe(null);
  }

  async function handleJoin(joinStatus: "wishlist" | "cooked") {
    if (!existingRecipe) return;
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: upsertError } = await supabase
      .from("recipe_member_status")
      .upsert(
        {
          recipe_id: existingRecipe.id,
          user_id: user.id,
          status: joinStatus,
          cooked_at: joinStatus === "cooked" ? new Date().toISOString() : null,
        },
        { onConflict: "recipe_id,user_id" }
      );

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setOpen(false);
      resetForm();
      router.refresh();
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Auto-create a personal group if the user has none
    const groupId =
      activeGroupId ?? (await getOrCreatePersonalGroup(setActiveGroupId));
    if (!groupId) {
      setError("Could not create a group. Please try again.");
      setLoading(false);
      return;
    }

    // --- Duplicate check by source_url ---
    if (sourceUrl) {
      const { data: existing } = await supabase
        .from("recipes")
        .select(
          "id, title, added_by, profiles:added_by(display_name, username)"
        )
        .eq("group_id", groupId)
        .eq("source_url", sourceUrl)
        .maybeSingle();

      if (existing) {
        // Check if this user already has a status for it
        const { data: myStatus } = await supabase
          .from("recipe_member_status")
          .select("status")
          .eq("recipe_id", existing.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (myStatus) {
          setError(
            `You already have this recipe in your ${myStatus.status} list.`
          );
          setLoading(false);
          return;
        }

        // Show join UI
        const profile = existing.profiles as unknown as
          | { display_name: string | null; username: string | null }
          | null;
        const addedByName =
          profile?.display_name ?? profile?.username ?? "Someone";

        setExistingRecipe({
          id: existing.id,
          title: existing.title,
          addedByName,
        });
        setLoading(false);
        return;
      }
    }

    // --- Insert new recipe ---
    const { data: newRecipe, error: insertError } = await supabase
      .from("recipes")
      .insert({
        group_id: groupId,
        added_by: user.id,
        title: form.title.trim(),
        description: form.description,
        source_url: sourceUrl || null,
        cover_photo_url: coverPhotoUrl || null,
        ingredients: form.ingredients.length > 0 ? form.ingredients : null,
        steps: form.steps.length > 0 ? form.steps : null,
        prep_time: form.prep_time,
        cook_time: form.cook_time,
        servings: form.servings,
        cuisine: form.cuisine,
        tags: form.tags.length > 0 ? form.tags : null,
        status,
        cooked_at: status === "cooked" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (insertError || !newRecipe) {
      setError(insertError?.message ?? "Failed to save recipe");
      setLoading(false);
      return;
    }

    // --- Also create a recipe_member_status row for the adder ---
    await supabase.from("recipe_member_status").insert({
      recipe_id: newRecipe.id,
      user_id: user.id,
      status,
      cooked_at: status === "cooked" ? new Date().toISOString() : null,
    });

    setOpen(false);
    resetForm();
    router.refresh();
    setLoading(false);
  }

  // ── Join UI ────────────────────────────────────────────────────────────────
  const joinPanel = existingRecipe ? (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <BookOpen className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Already in your group
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            <span className="font-medium">{existingRecipe.addedByName}</span>{" "}
            already saved &ldquo;{existingRecipe.title}&rdquo;. Add it to your
            list instead?
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-100"
          onClick={() => handleJoin("wishlist")}
          disabled={loading}
        >
          ★ Add to Wishlist
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-100"
          onClick={() => handleJoin("cooked")}
          disabled={loading}
        >
          ✓ Mark as Cooked
        </Button>
      </div>
      <button
        className="text-xs text-amber-600 hover:underline w-full text-center"
        onClick={() => setExistingRecipe(null)}
      >
        Save as a separate recipe instead
      </button>
    </div>
  ) : null;

  // ── Main form ──────────────────────────────────────────────────────────────
  const content = (
    <div className="space-y-4 py-2 overflow-y-auto max-h-[70vh]">
      {/* Status toggle */}
      <div className="space-y-1.5">
        <Label>Add to</Label>
        <div className="flex rounded-lg bg-muted p-1 gap-1">
          <button
            type="button"
            onClick={() => setStatus("wishlist")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              status === "wishlist"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Wishlist
          </button>
          <button
            type="button"
            onClick={() => setStatus("cooked")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              status === "cooked"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cooked
          </button>
        </div>
      </div>

      <RecipeClipForm onResult={handleClipResult} onError={handleClipError} />

      {joinPanel}

      {!existingRecipe && confidence === "low" && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Please review — some fields may be incomplete.</span>
        </div>
      )}

      {!existingRecipe && (
        <>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Recipe name"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="prep_time">Prep (min)</Label>
                <Input
                  id="prep_time"
                  type="number"
                  min={0}
                  value={form.prep_time ?? ""}
                  onChange={(e) =>
                    updateField(
                      "prep_time",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cook_time">Cook (min)</Label>
                <Input
                  id="cook_time"
                  type="number"
                  min={0}
                  value={form.cook_time ?? ""}
                  onChange={(e) =>
                    updateField(
                      "cook_time",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  value={form.servings ?? ""}
                  onChange={(e) =>
                    updateField(
                      "servings",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input
                id="cuisine"
                value={form.cuisine ?? ""}
                onChange={(e) => updateField("cuisine", e.target.value || null)}
                placeholder="e.g. Italian"
              />
            </div>

            {form.ingredients.length > 0 && (
              <div className="space-y-1.5">
                <Label>Ingredients ({form.ingredients.length})</Label>
                <div className="rounded-lg bg-muted p-3 text-sm space-y-1 max-h-32 overflow-y-auto">
                  {form.ingredients.map((ing, i) => (
                    <p key={i} className="text-muted-foreground">
                      {[ing.amount, ing.unit, ing.name].filter(Boolean).join(" ")}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {form.steps.length > 0 && (
              <div className="space-y-1.5">
                <Label>Steps ({form.steps.length})</Label>
                <div className="rounded-lg bg-muted p-3 text-sm space-y-2 max-h-40 overflow-y-auto">
                  {form.steps.map((step) => (
                    <p key={step.order} className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {step.order}.{" "}
                      </span>
                      {step.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={loading || !form.title}
          >
            {loading
              ? "Saving…"
              : status === "cooked"
              ? "Save as cooked"
              : "Save to wishlist"}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add recipe
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl max-h-[95vh] overflow-hidden flex flex-col"
          >
            <SheetHeader>
              <SheetTitle>Add recipe</SheetTitle>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Dialog */}
      <div className="hidden md:block">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add recipe</DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
