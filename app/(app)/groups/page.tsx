import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function GroupsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("role, groups(id, name, invite_code, created_by, created_at)")
    .eq("user_id", user!.id);

  const groups =
    memberships?.map((m) => ({
      ...(m.groups as unknown as {
        id: string;
        name: string;
        invite_code: string;
        created_by: string;
        created_at: string;
      }),
      role: m.role,
    })) ?? [];

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Button asChild>
          <Link href="/groups/new">
            <Plus className="h-4 w-4" />
            New group
          </Link>
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-12 text-center">
          <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No groups yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create a group to share your food lists with friends or family
          </p>
          <Button asChild>
            <Link href="/groups/new">Create your first group</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <Link key={g.id} href={`/groups/${g.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{g.name}</CardTitle>
                    {g.role === "owner" && (
                      <Badge variant="secondary" className="text-xs">
                        Owner
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Code: <code className="font-mono">{g.invite_code}</code>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
