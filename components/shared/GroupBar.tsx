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
    <div className="md:hidden sticky top-0 z-30 bg-background/95 border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Foodmates branding */}
      <div className="flex flex-col items-center pt-3 pb-2 gap-0.5">
        <div className="flex items-center gap-2">
          <svg width="26" height="28" viewBox="0 0 32 34" fill="none">
            <path d="M16 31C16 31 2 21.5 2 12C2 7 6 3 11 3C13.4 3 15.5 4.1 16 5.8C16.5 4.1 18.6 3 21 3C26 3 30 7 30 12C30 21.5 16 31 16 31Z" fill="#E05835"/>
            <line x1="13" y1="9" x2="13" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="8" x2="16" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="19" y1="9" x2="19" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M13 13 Q16 15.5 19 13" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <line x1="16" y1="15" x2="16" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{fontFamily: "var(--font-fraunces)"}} className="text-xl font-bold text-foreground">Foodmates</span>
        </div>
        <p className="text-xs text-muted-foreground">Your private culinary space</p>
      </div>

      {/* Divider + group row */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/40">
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
    </div>
  );
}
