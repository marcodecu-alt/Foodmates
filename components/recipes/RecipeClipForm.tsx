"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Link2, CheckCircle2 } from "lucide-react";

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

interface RecipeClipFormProps {
  onResult: (
    recipe: RecipeData,
    confidence: "high" | "low",
    sourceUrl: string,
    coverPhotoUrl: string | null
  ) => void;
  onError: (sourceUrl: string, errorDetail?: string) => void;
}

export default function RecipeClipForm({ onResult, onError }: RecipeClipFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);
  const [lastImportedUrl, setLastImportedUrl] = useState("");

  async function handleImport(importUrl?: string) {
    const target = (importUrl ?? url).trim();
    if (!target || target === lastImportedUrl) return;
    if (!target.startsWith("http")) return;

    setLoading(true);
    setImported(false);

    try {
      const res = await fetch("/api/recipes/clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });

      const data = await res.json();
      setLastImportedUrl(target);

      // If title is empty the extraction failed — treat as error
      if (!data.recipe?.title) {
        // Pass the real error message up so the user can see it
        onError(target, data.error ?? undefined);
        return;
      }

      setImported(true);
      onResult(data.recipe, data.confidence, target, data.cover_photo_url ?? null);
    } catch {
      onError(target);
    } finally {
      setLoading(false);
    }
  }

  function handleBlur() {
    // Auto-import when the user leaves the field with a new valid URL
    handleImport();
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="recipe-url">Import from URL</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="recipe-url"
            type="url"
            placeholder="Paste a recipe link and we'll fill in the details…"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setImported(false);
            }}
            onBlur={handleBlur}
            className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && handleImport()}
          />
        </div>
        <Button
          onClick={() => handleImport()}
          disabled={loading || !url.trim()}
          variant={imported ? "outline" : "default"}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading…
            </>
          ) : imported ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Done
            </>
          ) : (
            "Import"
          )}
        </Button>
      </div>
      {loading && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Reading recipe from link…
        </p>
      )}
      {imported && !loading && (
        <p className="text-xs text-green-600">
          ✓ Recipe imported — review the details below
        </p>
      )}
    </div>
  );
}
