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
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, created_by")
    .eq("invite_code", params.code)
    .maybeSingle();

  if (groupError) console.error("[invite] group fetch error:", groupError);
  if (!group) notFound();

  // Fetch creator profile separately to avoid join issues
  const { data: creator } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", group.created_by)
    .maybeSingle();

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
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <svg width="32" height="34" viewBox="0 0 32 34" fill="none">
              <path d="M16 31C16 31 2 21.5 2 12C2 7 6 3 11 3C13.4 3 15.5 4.1 16 5.8C16.5 4.1 18.6 3 21 3C26 3 30 7 30 12C30 21.5 16 31 16 31Z" fill="#E05835"/>
              <line x1="13" y1="9" x2="13" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="16" y1="8" x2="16" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="19" y1="9" x2="19" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M13 13 Q16 15.5 19 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="16" y1="15" x2="16" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span style={{fontFamily: "var(--font-fraunces)"}} className="text-2xl font-bold text-foreground">Foodmates</span>
          </div>
          <p className="text-muted-foreground text-sm text-center">Your private culinary space —<br/>even better when shared.</p>
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
              <JoinGroupButton groupId={group.id} inviteCode={params.code} groupName={group.name} />
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
