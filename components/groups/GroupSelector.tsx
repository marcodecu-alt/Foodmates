"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveGroup } from "@/lib/hooks/useActiveGroup";

interface GroupSelectorProps {
  groups: { id: string; name: string }[];
}

export default function GroupSelector({ groups }: GroupSelectorProps) {
  const router = useRouter();
  const { activeGroupId, setActiveGroupId } = useActiveGroup();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Auto-select first group if none selected
  useEffect(() => {
    if (!activeGroupId && groups.length > 0) {
      setActiveGroupId(groups[0].id);
    }
  }, [activeGroupId, groups, setActiveGroupId]);

  // Render a fixed-size placeholder until client-side state is ready
  if (!mounted) {
    return <div className="w-[180px] h-8" />;
  }

  if (groups.length === 0) {
    return (
      <button
        onClick={() => router.push("/groups/new")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Create a group
      </button>
    );
  }

  return (
    <Select
      value={activeGroupId ?? ""}
      onValueChange={(id) => {
        if (id === "__new__") { router.push("/groups/new"); return; }
        setActiveGroupId(id);
        router.refresh();
      }}
    >
      <SelectTrigger className="w-[180px] h-8 text-sm border-dashed">
        <SelectValue placeholder="Select group" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((g) => (
          <SelectItem key={g.id} value={g.id}>
            {g.name}
          </SelectItem>
        ))}
        <SelectItem value="__new__" onSelect={() => router.push("/groups/new")}>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Plus className="h-3.5 w-3.5" />
            New group
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
