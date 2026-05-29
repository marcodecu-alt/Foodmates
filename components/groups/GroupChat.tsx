"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/contexts/notifications";

export interface ChatMember {
  id: string;
  username: string;
  display_name: string | null;
}

export interface ChatMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles: ChatMember | null;
}

interface Props {
  groupId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
  members: ChatMember[];
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayLabel(d: string) {
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function GroupChat({
  groupId,
  currentUserId,
  initialMessages,
  members,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = useRef(createClient());
  const membersMap = useRef(new Map(members.map((m) => [m.id, m])));
  const initialCount = useRef(initialMessages.length);
  const { markGroupRead } = useNotifications();

  useEffect(() => {
    membersMap.current = new Map(members.map((m) => [m.id, m]));
  }, [members]);

  // Mark this group's messages as read whenever chat is visible
  useEffect(() => {
    markGroupRead(groupId);
  }, [groupId, markGroupRead]);

  // Scroll to bottom — instant on first load, smooth for new messages
  useEffect(() => {
    if (!bottomRef.current) return;
    const isFirstLoad = messages.length <= initialCount.current;
    bottomRef.current.scrollIntoView({
      behavior: isFirstLoad ? "instant" : "smooth",
    });
  }, [messages]);

  // Realtime subscription for incoming messages
  useEffect(() => {
    const channel = supabase.current
      .channel(`chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const raw = payload.new as {
            id: string;
            group_id: string;
            sender_id: string;
            content: string;
            created_at: string;
          };

          setMessages((prev) => {
            // Skip duplicates (optimistic message already added)
            if (prev.some((m) => m.id === raw.id)) return prev;
            return [
              ...prev,
              {
                ...raw,
                profiles: membersMap.current.get(raw.sender_id) ?? null,
              },
            ];
          });

          // If it's someone else's message, mark as read (we can see it)
          if (raw.sender_id !== currentUserId) {
            markGroupRead(groupId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.current.removeChannel(channel);
    };
  }, [groupId, currentUserId, markGroupRead]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setDraft("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }

    // Optimistic insert
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        group_id: groupId,
        sender_id: currentUserId,
        content,
        created_at: new Date().toISOString(),
        profiles: membersMap.current.get(currentUserId) ?? null,
      },
    ]);

    const { data, error } = await supabase.current
      .from("messages")
      .insert({ group_id: groupId, sender_id: currentUserId, content })
      .select("id, group_id, sender_id, content, created_at")
      .single();

    if (error) {
      // Revert optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(content);
    } else if (data) {
      // Swap temp with real
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...data,
                profiles: membersMap.current.get(currentUserId) ?? null,
              }
            : m
        )
      );
    }

    setSending(false);
    textareaRef.current?.focus();
  }

  // Group messages by calendar day for date separators
  const grouped: { dateKey: string; msgs: ChatMessage[] }[] = [];
  for (const msg of messages) {
    const key = new Date(msg.created_at).toDateString();
    const last = grouped[grouped.length - 1];
    if (!last || last.dateKey !== key) {
      grouped.push({ dateKey: key, msgs: [msg] });
    } else {
      last.msgs.push(msg);
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1 opacity-60">
              Say hello to your group!
            </p>
          </div>
        ) : (
          <div>
            {grouped.map(({ dateKey, msgs }) => (
              <div key={dateKey}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] text-muted-foreground font-medium px-1 flex-shrink-0">
                    {dayLabel(msgs[0].created_at)}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Messages for this day */}
                <div className="space-y-0.5">
                  {msgs.map((msg, i) => {
                    const isOwn = msg.sender_id === currentUserId;
                    const prevSame =
                      i > 0 && msgs[i - 1].sender_id === msg.sender_id;
                    const name =
                      msg.profiles?.display_name ??
                      msg.profiles?.username ??
                      "?";
                    const initial = name[0].toUpperCase();

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-2",
                          isOwn ? "flex-row-reverse" : "flex-row",
                          prevSame ? "mt-0.5" : "mt-3"
                        )}
                      >
                        {/* Avatar (only first in a sequence from same sender) */}
                        <div className="w-7 flex-shrink-0">
                          {!isOwn && !prevSame && (
                            <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[11px] font-bold">
                              {initial}
                            </div>
                          )}
                        </div>

                        <div
                          className={cn(
                            "flex flex-col max-w-[75%]",
                            isOwn ? "items-end" : "items-start"
                          )}
                        >
                          {/* Sender name */}
                          {!isOwn && !prevSame && (
                            <span className="text-[11px] text-muted-foreground font-medium mb-1 pl-0.5">
                              {name}
                            </span>
                          )}

                          {/* Bubble + timestamp */}
                          <div
                            className={cn(
                              "flex items-end gap-1.5",
                              isOwn ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <div
                              className={cn(
                                "px-3 py-2 text-sm leading-relaxed break-words",
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                                  : "bg-card border border-border text-foreground rounded-2xl rounded-bl-sm"
                              )}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0 mb-1">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <form
        onSubmit={handleSend}
        className="border-t border-border bg-card px-3 py-3 flex gap-2 items-end"
      >
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            e.target.style.height = "44px";
            e.target.style.height =
              Math.min(e.target.scrollHeight, 96) + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground leading-relaxed transition-colors"
          style={{ minHeight: "44px", maxHeight: "96px" }}
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className={cn(
            "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200",
            draft.trim()
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
