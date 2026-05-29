"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useActiveGroup } from "@/lib/hooks/useActiveGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Check, ArrowRight } from "lucide-react";

export default function NewGroupPage() {
  const router = useRouter();
  const { setActiveGroupId } = useActiveGroup();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<{ id: string; inviteCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  const inviteUrl = createdGroup
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${createdGroup.inviteCode}`
    : "";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

    // Switch to the new group automatically
    setActiveGroupId(group.id);
    setCreatedGroup({ id: group.id, inviteCode: group.invite_code });
    setLoading(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Success state ──────────────────────────────────────────
  if (createdGroup) {
    return (
      <div className="container py-6 max-w-md">
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>"{name}" is ready!</CardTitle>
            <CardDescription>
              Share this link so others can join your group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {/* Invite link */}
            <div className="rounded-xl bg-muted p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Invite link
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono flex-1 truncate text-foreground">
                  {inviteUrl}
                </p>
                <Button
                  size="sm"
                  variant={copied ? "default" : "outline"}
                  onClick={handleCopy}
                  className="flex-shrink-0 gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Anyone with this link can join your group. You can always find it again on the group page.
            </p>

            <Button
              className="w-full gap-2"
              onClick={() => {
                router.push(`/groups/${createdGroup.id}`);
                router.refresh();
              }}
            >
              Go to your group
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Create form ────────────────────────────────────────────
  return (
    <div className="container py-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create a group</CardTitle>
          <CardDescription>
            Give your group a name, then invite people to join
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
              <Button type="submit" className="flex-1" disabled={loading || !name.trim()}>
                {loading ? "Creating…" : "Create group"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
