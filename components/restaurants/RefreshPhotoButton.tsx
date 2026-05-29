"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  restaurantId: string;
  placeId: string | null;
}

export default function RefreshPhotoButton({ restaurantId, placeId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!placeId) return null;

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/places/details?id=${encodeURIComponent(placeId!)}`);
      const details = await res.json();
      if (details.photo_reference) {
        const supabase = createClient();
        await supabase
          .from("restaurants")
          .update({ photo_reference: details.photo_reference })
          .eq("id", restaurantId);
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={loading}
      className="gap-1.5"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Fetching…" : "Fetch photo from Google"}
    </Button>
  );
}
