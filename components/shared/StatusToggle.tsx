"use client";

import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type EntityType = "restaurant" | "recipe";

interface StatusToggleProps {
  id: string;
  type: EntityType;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const config = {
  restaurant: {
    table: "restaurants",
    statusA: "wishlist",
    statusB: "visited",
    labelB: "Visited",
    actionLabel: "Mark as visited",
    timestampField: "visited_at",
  },
  recipe: {
    table: "recipes",
    statusA: "wishlist",
    statusB: "cooked",
    labelB: "Cooked",
    actionLabel: "Mark as cooked",
    timestampField: "cooked_at",
  },
};

export default function StatusToggle({
  id,
  type,
  currentStatus,
  onStatusChange,
}: StatusToggleProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const cfg = config[type];
  const isActive = status === cfg.statusB; // visited / cooked

  async function toggle() {
    const newStatus = isActive ? cfg.statusA : cfg.statusB;
    const prevStatus = status;

    setStatus(newStatus);
    onStatusChange?.(newStatus);
    setLoading(true);

    const update: Record<string, unknown> = {
      status: newStatus,
      [cfg.timestampField]: newStatus === cfg.statusB ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from(cfg.table as "restaurants" | "recipes")
      .update(update)
      .eq("id", id);

    if (error) {
      setStatus(prevStatus);
      onStatusChange?.(prevStatus);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border w-full justify-center",
        isActive
          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          : "bg-muted/60 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/20"
      )}
    >
      {isActive ? (
        <>
          <CheckCircle className="h-3.5 w-3.5" />
          {cfg.labelB}
          <span className="opacity-50 font-normal">· undo</span>
        </>
      ) : (
        <>
          <Circle className="h-3.5 w-3.5" />
          {cfg.actionLabel}
        </>
      )}
    </button>
  );
}
