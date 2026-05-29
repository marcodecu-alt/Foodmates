"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Returns the active group ID, or auto-creates a personal "My List" group
 * if the user has no groups. This lets solo users add content without
 * manually creating a group first.
 */
export async function getOrCreatePersonalGroup(
  setActiveGroupId: (id: string) => void
): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if user has any existing group membership
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    const id = memberships[0].group_id;
    setActiveGroupId(id);
    return id;
  }

  // No groups — create a personal "My List" group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name: "My List", created_by: user.id })
    .select()
    .single();

  if (groupError || !group) return null;

  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
  });

  setActiveGroupId(group.id);
  return group.id;
}
