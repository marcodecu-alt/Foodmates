"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Link2 } from "lucide-react";

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
  onResult: (recipe: RecipeData, confidence: "high" | "low", sourceUrl: string) => void;
  onError: (sourceUrl: string) => void;
}

export default function RecipeClipForm({ onResult, onError }: RecipeClipFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!url.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/recipes/clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      onResult(data.recipe, data.confidence, url.trim());
    } catch {
      onError(url.trim());
    } finally {
      setLoading(false);
    }
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
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && handleImport()}
          />
        </div>
        <Button onClick={handleImport} disabled={loading || !url.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading…
            </>
          ) : (
            "Import"
          )}
        </Button>
      </div>
      {loading && (
        <p className="text-xs text-muted-foreground">Reading recipe…</p>
      )}
    </div>
  );
}
