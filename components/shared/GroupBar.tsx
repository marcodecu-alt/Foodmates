"use client";

import { ArrowLeftRight, Users } from "lucide-react";
import { useActiveGroup } from "@/lib/hooks/useActiveGroup";
import { useRouter } from "next/navigation";

interface GroupBarProps {
  groups: { id: string; name: string }[];
  initialActiveGroupId: string | null;
}

export default function GroupBar({ groups, initialActiveGroupId }: GroupBarProps) {
  const { activeGroupId, setActiveGroupId } = useActiveGroup();
  const router = useRouter();

  if (groups.length === 0) return null;

  const currentId = activeGroupId ?? initialActiveGroupId ?? groups[0]?.id;
  const currentGroup = groups.find((g) => g.id === currentId) ?? groups[0];

  function handleSwitch() {
    const currentIndex = groups.findIndex((g) => g.id === currentGroup?.id);
    const nextGroup = groups[(currentIndex + 1) % groups.length];
    setActiveGroupId(nextGroup.id);
    router.refresh();
  }

  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-background/95 border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-2">
        <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <span className="font-semibold text-sm">{currentGroup?.name}</span>
      </div>
      {groups.length > 1 && (
        <button
          onClick={handleSwitch}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2.5 py-1 rounded-full hover:bg-primary/10 border border-border/60"
        >
          <ArrowLeftRight className="h-3 w-3" />
          Switch
        </button>
      )}
    </div>
  );
}
