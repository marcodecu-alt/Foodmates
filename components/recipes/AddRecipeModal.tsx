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
import { Plus, AlertTriangle } from "lucide-react";
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

  function handleClipResult(
    recipe: RecipeData,
    conf: "high" | "low",
    url: string
  ) {
    setForm(recipe);
    setConfidence(conf);
    setSourceUrl(url);
  }

  function handleClipError(url: string) {
    setSourceUrl(url);
    setConfidence("low");
    setError("Could not extract recipe. Please fill in the details manually.");
  }

  function updateField(field: keyof RecipeData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    const groupId = activeGroupId ?? await getOrCreatePersonalGroup(setActiveGroupId);
    if (!groupId) {
      setError("Could not create a group. Please try again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("recipes").insert({
      group_id: groupId,
      added_by: user.id,
      title: form.title.trim(),
      description: form.description,
      source_url: sourceUrl || null,
      ingredients: form.ingredients.length > 0 ? form.ingredients : null,
      steps: form.steps.length > 0 ? form.steps : null,
      prep_time: form.prep_time,
      cook_time: form.cook_time,
      servings: form.servings,
      cuisine: form.cuisine,
      tags: form.tags.length > 0 ? form.tags : null,
      status,
      cooked_at: status === "cooked" ? new Date().toISOString() : null,
    });

    if (error) {
      setError(error.message);
    } else {
      setOpen(false);
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
      router.refresh();
    }
    setLoading(false);
  }

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

      <RecipeClipForm
        onResult={handleClipResult}
        onError={handleClipError}
      />

      {confidence === "low" && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Please review — some fields may be incomplete.</span>
        </div>
      )}

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
        {loading ? "Saving…" : status === "cooked" ? "Save as cooked" : "Save to wishlist"}
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
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
        <Dialog open={open} onOpenChange={setOpen}>
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
