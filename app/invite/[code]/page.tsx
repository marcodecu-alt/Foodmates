import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import JoinGroupButton from "@/components/groups/JoinGroupButton";

export default async function InvitePage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = createClient();

  // This page is public — use anon key to fetch group info
  const { data: group } = await supabase
    .from("groups")
    .select("id, name, created_by, profiles(display_name, username)")
    .eq("invite_code", params.code)
    .single();

  if (!group) notFound();

  const creator = group.profiles as unknown as {
    display_name: string | null;
    username: string;
  } | null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if already a member
  let alreadyMember = false;
  if (user) {
    const { data } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .single();
    alreadyMember = !!data;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Foodmates</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>You&apos;re invited!</CardTitle>
            <CardDescription>
              {creator?.display_name ?? creator?.username} invited you to join
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-2xl font-bold">{group.name}</p>
            </div>

            {alreadyMember ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You&apos;re already a member of this group
                </p>
                <Button asChild className="w-full">
                  <Link href="/">Go to Foodmates</Link>
                </Button>
              </div>
            ) : user ? (
              <JoinGroupButton groupId={group.id} inviteCode={params.code} />
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Sign in to join this group
                </p>
                <Button asChild className="w-full">
                  <Link
                    href={`/login?next=/invite/${params.code}`}
                  >
                    Sign in to join
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
