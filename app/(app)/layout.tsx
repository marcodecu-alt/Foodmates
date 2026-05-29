import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppNav from "@/components/shared/AppNav";
import RealtimeProvider from "@/components/shared/RealtimeProvider";
import { NotificationsProvider } from "@/lib/contexts/notifications";

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NotificationsProvider groups={flatGroups} currentUserId={user.id}>
        <AppNav groups={flatGroups} />
        <RealtimeProvider>
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </RealtimeProvider>
      </NotificationsProvider>
    </div>
  );
}
