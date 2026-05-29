"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteRestaurantButton({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("restaurants").delete().eq("id", restaurantId);
    router.push("/restaurants");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-destructive/5 border border-destructive/20 px-3 py-2.5">
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-sm text-destructive flex-1">
          Remove this restaurant from your list?
        </span>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Removing…" : "Yes, remove"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(false)}
          disabled={deleting}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setConfirming(true)}
      className="text-muted-foreground hover:text-destructive gap-1.5"
    >
      <Trash2 className="h-4 w-4" />
      Remove from list
    </Button>
  );
}
