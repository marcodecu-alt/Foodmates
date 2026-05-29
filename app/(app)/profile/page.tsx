"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";
  const next = searchParams.get("next") ?? "/";

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setCurrentProfile] = useState<{
    username: string;
    display_name: string | null;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const client = supabase;
    async function loadProfile() {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user) return;

      const { data } = await client
        .from("profiles")
        .select("username, display_name")
        .eq("id", user.id)
        .single();

      if (data) {
        setCurrentProfile(data);
        setUsername(data.username || "");
        setDisplayName(data.display_name || "");
      }
    }
    loadProfile();
    // supabase client is stable — intentionally not in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username: username.trim().toLowerCase(),
        display_name: displayName.trim() || null,
      });

    if (error) {
      if (error.code === "23505") {
        setError("That username is already taken");
      } else {
        setError(error.message);
      }
    } else {
      router.push(next);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>{isSetup ? "Set up your profile" : "Edit profile"}</CardTitle>
            <CardDescription>
              {isSetup
                ? "Choose a username to get started"
                : "Update your display name and username"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="e.g. marco"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                  }
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Display name (optional)</Label>
                <Input
                  id="displayName"
                  placeholder="e.g. Marco"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving…" : isSetup ? "Get started" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
