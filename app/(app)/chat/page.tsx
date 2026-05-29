import { createClient } from "@/lib/supabase/server";
import { getActiveGroupId } from "@/lib/activeGroup";
import { redirect } from "next/navigation";
import GroupChat, { type ChatMessage, type ChatMember } from "@/components/groups/GroupChat";
import Link from "next/link";
import { Users } from "lucide-react";

export default async function ChatPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get the active group
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  const groupIds = memberships?.map((m) => m.group_id) ?? [];
  const cookieGroupId = getActiveGroupId();
  const activeGroupId =
    groupIds.find((id) => id === cookieGroupId) ?? groupIds[0] ?? null;

  // No groups yet
  if (!activeGroupId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-124px)] md:h-[calc(100dvh-56px)] text-center px-6">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-1">No group yet</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Create or join a group to start chatting
        </p>
        <Link
          href="/groups"
          className="text-sm font-medium text-primary hover:underline"
        >
          Go to Groups →
        </Link>
      </div>
    );
  }

  // Load group name
  const { data: group } = await supabase
    .from("groups")
    .select("id, name")
    .eq("id", activeGroupId)
    .single();

  // Load members
  const { data: membersData } = await supabase
    .from("group_members")
    .select("profiles(id, username, display_name)")
    .eq("group_id", activeGroupId);

  const members: ChatMember[] = (membersData ?? [])
    .map((m) => m.profiles as unknown as ChatMember | null)
    .filter(Boolean) as ChatMember[];

  // Load last 50 messages
  let initialMessages: ChatMessage[] = [];
  try {
    const { data: msgs } = await supabase
      .from("messages")
      .select(
        "id, group_id, sender_id, content, created_at, profiles:sender_id(id, username, display_name)"
      )
      .eq("group_id", activeGroupId)
      .order("created_at", { ascending: true })
      .limit(50);

    initialMessages = (msgs ?? []).map((m) => ({
      id: m.id,
      group_id: m.group_id,
      sender_id: m.sender_id,
      content: m.content,
      created_at: m.created_at,
      profiles: m.profiles as unknown as ChatMember | null,
    }));
  } catch {
    // messages table may not exist yet
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-124px)] md:h-[calc(100dvh-56px)]">
      {/* Desktop header only — mobile has GroupBar */}
      {group && (
        <div className="hidden md:flex items-center gap-2 px-4 py-3 border-b">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h1 className="font-semibold">{group.name}</h1>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <GroupChat
          groupId={activeGroupId}
          currentUserId={user.id}
          initialMessages={initialMessages}
          members={members}
        />
      </div>
    </div>
  );
}
