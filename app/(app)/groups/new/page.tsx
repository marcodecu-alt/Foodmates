"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({ name: name.trim(), created_by: user.id })
      .select()
      .single();

    if (groupError || !group) {
      setError(groupError?.message ?? "Failed to create group");
      setLoading(false);
      return;
    }

    // Add creator as owner
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "owner",
    });

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    router.push(`/groups/${group.id}`);
  }

  return (
    <div className="container py-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create a group</CardTitle>
          <CardDescription>
            Give your group a name, then share the invite link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Group name</Label>
              <Input
                id="name"
                placeholder="e.g. Marco & Sofia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating…" : "Create group"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
