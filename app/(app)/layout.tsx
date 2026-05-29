import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/components/shared/AppNav";
import GroupBar from "@/components/shared/GroupBar";
import RealtimeProvider from "@/components/shared/RealtimeProvider";
import { NotificationsProvider } from "@/lib/contexts/notifications";
import { getActiveGroupId } from "@/lib/activeGroup";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load user's groups for the group selector
  const { data: groups } = await supabase
    .from("group_members")
    .select("groups(id, name)")
    .eq("user_id", user.id);

  const userGroups =
    groups
      ?.map((m) => m.groups as unknown as { id: string; name: string } | null)
      .filter(Boolean) ?? [];

  const flatGroups = userGroups as unknown as { id: string; name: string }[];

  // Determine the active group for server-side rendering
  const cookieGroupId = getActiveGroupId();
  const activeGroupId =
    flatGroups.find((g) => g.id === cookieGroupId)?.id ??
    flatGroups[0]?.id ??
    null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NotificationsProvider groups={flatGroups} currentUserId={user.id}>
        <AppNav groups={flatGroups} />
        <GroupBar groups={flatGroups} initialActiveGroupId={activeGroupId} />
        <RealtimeProvider>
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </RealtimeProvider>
      </NotificationsProvider>
    </div>
  );
}
