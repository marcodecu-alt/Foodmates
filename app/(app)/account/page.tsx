"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User, Mail, Pencil, Check } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", user.id)
        .single();

      if (data) {
        setUsername(data.username ?? "");
        setDisplayName(data.display_name ?? "");
        setDraftName(data.display_name ?? "");
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveName() {
    setSaving(true);
    setSaveError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: draftName.trim() || null })
      .eq("id", user.id);

    if (error) {
      setSaveError(error.message);
    } else {
      setDisplayName(draftName.trim());
      setEditingName(false);
    }
    setSaving(false);
  }

  async function handleSignOut() {
    setSignOutLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = (displayName || username || email)
    .split(/[\s@]/)[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container max-w-lg py-8 px-4">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
          <span style={{ fontFamily: "var(--font-fraunces)" }} className="text-2xl font-bold text-primary">
            {initials}
          </span>
        </div>
        <div className="text-center">
          <p style={{ fontFamily: "var(--font-fraunces)" }} className="text-xl font-bold text-foreground">
            {displayName || username || "—"}
          </p>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
      </div>

      {/* Info cards */}
      <div className="space-y-3">

        {/* Email */}
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Email</p>
            <p className="text-sm text-foreground font-medium truncate">{email}</p>
          </div>
        </div>

        {/* Display name */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Display name</p>
              {editingName ? (
                <Input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="h-7 text-sm mt-0.5 border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 bg-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                />
              ) : (
                <p className="text-sm text-foreground font-medium">{displayName || "—"}</p>
              )}
            </div>
            {editingName ? (
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Check className="h-4 w-4 text-primary" />
              </button>
            ) : (
              <button
                onClick={() => { setDraftName(displayName); setEditingName(true); }}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          {saveError && <p className="text-xs text-destructive mt-2 pl-12">{saveError}</p>}
        </div>

        {/* Username */}
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-muted-foreground">@</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Username</p>
            <p className="text-sm text-foreground font-medium">@{username}</p>
          </div>
        </div>

      </div>

      {/* Sign out */}
      <Button
        variant="outline"
        className="w-full mt-8 rounded-2xl h-12 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive gap-2"
        onClick={handleSignOut}
        disabled={signOutLoading}
      >
        <LogOut className="h-4 w-4" />
        {signOutLoading ? "Signing out…" : "Sign out"}
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Foodmates · Your private culinary space
      </p>
    </div>
  );
}
