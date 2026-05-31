"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type EntityType = "restaurant" | "recipe";

interface StatusToggleProps {
  id: string;
  type: EntityType;
  /** Pass the current user's personal status (null = not yet added to their list) */
  currentStatus: string | null;
  /** Required for type="restaurant" — the logged-in user's ID */
  userId?: string;
  onStatusChange?: (newStatus: string) => void;
}

export default function StatusToggle({
  id,
  type,
  currentStatus,
  userId,
  onStatusChange,
}: StatusToggleProps) {
  const [status, setStatus] = useState<string | null>(currentStatus);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const isVisited = status === "visited" || status === "cooked";
  const isWishlist = status === "wishlist";
  const noStatus = !status;

  // Determine next status on click
  function nextStatus(): string {
    if (type === "recipe") {
      return status === "cooked" ? "wishlist" : "cooked";
    }
    // restaurant
    if (!status) return "wishlist";
    if (status === "wishlist") return "visited";
    return "wishlist"; // visited → wishlist
  }

  async function toggle() {
    const newStatus = nextStatus();
    const prevStatus = status;

    // Optimistic update
    setStatus(newStatus);
    onStatusChange?.(newStatus);
    setLoading(true);

    if (type === "restaurant") {
      const { error } = await supabase
        .from("restaurant_member_status")
        .upsert(
          {
            restaurant_id: id,
            user_id: userId!,
            status: newStatus,
            visited_at:
              newStatus === "visited" ? new Date().toISOString() : null,
          },
          { onConflict: "restaurant_id,user_id" }
        );

      if (error) {
        setStatus(prevStatus);
        onStatusChange?.(prevStatus ?? "");
      } else {
        router.refresh();
      }
    } else {
      // Recipe: keep updating the recipes row
      const { error } = await supabase
        .from("recipes")
        .update({
          status: newStatus,
          cooked_at: newStatus === "cooked" ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) {
        setStatus(prevStatus);
        onStatusChange?.(prevStatus ?? "");
      } else {
        router.refresh();
      }
    }
    setLoading(false);
  }

  // Label copy
  const actionLabel =
    type === "recipe" ? "Mark as cooked" : "Mark as visited";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border w-full justify-center",
        isVisited
          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          : isWishlist
          ? "bg-muted/60 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/20"
          : // no status yet
            "bg-muted/40 text-muted-foreground/70 border-dashed border-border hover:bg-primary/10 hover:text-primary hover:border-primary/20"
      )}
    >
      {isVisited ? (
        <>
          <CheckCircle className="h-3.5 w-3.5" />
          {type === "recipe" ? "Cooked" : "Visited"}
          <span className="opacity-50 font-normal">· undo</span>
        </>
      ) : isWishlist ? (
        <>
          <Circle className="h-3.5 w-3.5" />
          {actionLabel}
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5" />
          Add to my list
        </>
      )}
    </button>
  );
}
