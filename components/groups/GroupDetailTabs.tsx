"use client";

import { useState } from "react";
import { MessageCircle, Users, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/contexts/notifications";
import GroupChat, { type ChatMessage, type ChatMember } from "./GroupChat";
import InviteLink from "./InviteLink";
import { Badge } from "@/components/ui/badge";

interface Member extends ChatMember {
  role: string;
  joined_at: string;
}

interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

interface Props {
  group: Group;
  members: Member[];
  initialMessages: ChatMessage[];
  currentUserId: string;
}

type Tab = "chat" | "members";

export default function GroupDetailTabs({
  group,
  members,
  initialMessages,
  currentUserId,
}: Props) {
  const [tab, setTab] = useState<Tab>("members");
  const { unreadCounts } = useNotifications();
  const unread = unreadCounts[group.id] ?? 0;

  const chatMembers: ChatMember[] = members.map(({ id, username, display_name }) => ({
    id,
    username,
    display_name,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* ── Tab bar ── */}
      <div className="flex border-b border-border bg-card px-2 flex-shrink-0">
        {(["chat", "members"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "chat" ? (
              <MessageCircle className="h-4 w-4" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {t === "chat" ? "Chat" : "Members"}
            {t === "chat" && unread > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        ))}

        {/* Group name on right */}
        <div className="ml-auto flex items-center pr-2">
          <span className="text-sm font-semibold text-foreground truncate max-w-[160px]">
            {group.name}
          </span>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">
        {tab === "chat" && (
          <GroupChat
            groupId={group.id}
            currentUserId={currentUserId}
            initialMessages={initialMessages}
            members={chatMembers}
          />
        )}

        {tab === "members" && (
          <div className="overflow-y-auto h-full px-4 py-5 space-y-5 max-w-lg">
            {/* Invite link */}
            <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <h2 className="font-semibold text-sm">Invite link</h2>
              <InviteLink inviteCode={group.invite_code} />
              <p className="text-xs text-muted-foreground">
                Share this link to invite people to the group.
              </p>
            </section>

            {/* Members list */}
            <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <h2 className="font-semibold text-sm">
                Members ({members.length})
              </h2>
              <ul className="space-y-2">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 py-1"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {(m.display_name ?? m.username)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">
                        {m.display_name ?? m.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{m.username}
                      </p>
                    </div>
                    {m.role === "owner" && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <BadgeCheck className="h-3 w-3" />
                        Owner
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
