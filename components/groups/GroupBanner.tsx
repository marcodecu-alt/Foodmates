"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_KEY = "group_banner_dismissed";

interface GroupBannerProps {
  noGroups: boolean;
  hasGroupWithMultipleMembers: boolean;
}

export default function GroupBanner({
  noGroups,
  hasGroupWithMultipleMembers,
}: GroupBannerProps) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(BANNER_KEY) === "true";
    setDismissed(isDismissed);
  }, []);

  function dismiss() {
    sessionStorage.setItem(BANNER_KEY, "true");
    setDismissed(true);
  }

  // Never show if user has a group with 2+ members
  if (hasGroupWithMultipleMembers) return null;
  // Don't show if dismissed this session
  if (dismissed) return null;
  // Show if no groups or all groups are solo
  if (!noGroups && !hasGroupWithMultipleMembers) return null;

  return (
    <div className="relative flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4">
      <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">
          Share your lists — invite a partner or friend
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Create a group to share restaurants and recipes in real time
        </p>
        <Button asChild size="sm" className="mt-2">
          <Link href="/groups/new">Create a group</Link>
        </Button>
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
