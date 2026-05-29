"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useActiveGroup } from "@/lib/hooks/useActiveGroup";

export default function RealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { activeGroupId } = useActiveGroup();
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);

  const refresh = useCallback(() => router.refresh(), [router]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    if (!activeGroupId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel("group-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "restaurants",
          filter: `group_id=eq.${activeGroupId}`,
        },
        refresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recipes",
          filter: `group_id=eq.${activeGroupId}`,
        },
        refresh
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeGroupId, refresh]);

  return <>{children}</>;
}
