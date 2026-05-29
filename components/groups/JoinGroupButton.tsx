"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function JoinGroupButton({
  groupId,
  groupName,
}: {
  groupId: string;
  inviteCode: string;
  groupName?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleJoin() {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: joinError } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: user.id, role: "member" });

    if (joinError) {
      setError(joinError.message);
      setLoading(false);
      return;
    }

    // Get the new member's display name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", user.id)
      .single();

    const newUserName =
      profile?.display_name ?? profile?.username ?? user.email?.split("@")[0] ?? "Someone";

    // Notify existing members (fire-and-forget)
    fetch("/api/push/notify-join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        newUserId: user.id,
        newUserName,
        groupName: groupName ?? "your group",
      }),
    }).catch(() => {});

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" onClick={handleJoin} disabled={loading}>
        {loading ? "Joining…" : "Join group"}
      </Button>
    </div>
  );
}
