import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GroupDetailTabs from "@/components/groups/GroupDetailTabs";
import type { ChatMessage } from "@/components/groups/GroupChat";

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // Load group
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!group) notFound();

  // Load members with profiles
  const { data: membersData } = await supabase
    .from("group_members")
    .select("role, joined_at, profiles(id, username, display_name)")
    .eq("group_id", params.id);

  const members = (membersData ?? []).map((m) => {
    const profile = m.profiles as unknown as {
      id: string;
      username: string;
      display_name: string | null;
    } | null;
    return {
      id: profile?.id ?? "",
      username: profile?.username ?? "",
      display_name: profile?.display_name ?? null,
      role: m.role,
      joined_at: m.joined_at,
    };
  });

  // Load initial messages (last 50) — gracefully handle if table doesn't exist yet
  let initialMessages: ChatMessage[] = [];
  try {
    const { data: msgs } = await supabase
      .from("messages")
      .select(
        "id, group_id, sender_id, content, created_at, profiles:sender_id(id, username, display_name)"
      )
      .eq("group_id", params.id)
      .order("created_at", { ascending: true })
      .limit(50);

    initialMessages = (msgs ?? []).map((m) => ({
      id: m.id,
      group_id: m.group_id,
      sender_id: m.sender_id,
      content: m.content,
      created_at: m.created_at,
      profiles: m.profiles as unknown as {
        id: string;
        username: string;
        display_name: string | null;
      } | null,
    }));
  } catch {
    // messages table may not exist yet — show empty chat with setup hint
  }

  return (
    // Full height minus top nav (56px desktop) and mobile bottom nav (80px)
    <div className="h-[calc(100dvh-56px-80px)] md:h-[calc(100dvh-56px)] flex flex-col">
      <GroupDetailTabs
        group={group}
        members={members}
        initialMessages={initialMessages}
        currentUserId={user.id}
      />
    </div>
  );
}
