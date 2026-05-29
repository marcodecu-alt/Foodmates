"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface NotificationsContextValue {
  unreadCounts: Record<string, number>; // groupId → unread count
  totalUnread: number;
  markGroupRead: (groupId: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadCounts: {},
  totalUnread: 0,
  markGroupRead: () => {},
});

export function useNotifications() {
  return useContext(NotificationsContext);
}

interface Props {
  children: React.ReactNode;
  groups: { id: string; name: string }[];
  currentUserId: string;
}

export function NotificationsProvider({
  children,
  groups,
  currentUserId,
}: Props) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const supabase = useRef(createClient());
  const groupMap = useRef(new Map(groups.map((g) => [g.id, g.name])));

  // Keep groupMap in sync
  useEffect(() => {
    groupMap.current = new Map(groups.map((g) => [g.id, g.name]));
  }, [groups]);

  // Request notification permission once (with a short delay so it's not jarring)
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    const t = setTimeout(() => Notification.requestPermission(), 4000);
    return () => clearTimeout(t);
  }, []);

  // Subscribe to new messages across all user's groups
  useEffect(() => {
    if (!groups.length) return;

    const supabaseClient = supabase.current;
    const channel = supabaseClient.channel("notifications-messages");

    for (const group of groups) {
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${group.id}`,
        },
        (payload) => {
          const msg = payload.new as {
            id: string;
            sender_id: string;
            group_id: string;
            content: string;
          };

          // Ignore own messages
          if (msg.sender_id === currentUserId) return;

          // Increment unread count
          setUnreadCounts((prev) => ({
            ...prev,
            [msg.group_id]: (prev[msg.group_id] ?? 0) + 1,
          }));

          // Browser notification only when tab is not visible
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted" &&
            document.hidden
          ) {
            const groupName =
              groupMap.current.get(msg.group_id) ?? "a group";
            new Notification(`New message in ${groupName}`, {
              body: msg.content,
              tag: `foodmates-${msg.group_id}`, // groups notifications together
              icon: "/favicon.ico",
            });
          }
        }
      );
    }

    channel.subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
    // Depend on a stable string of group IDs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.map((g) => g.id).join(","), currentUserId]);

  function markGroupRead(groupId: string) {
    setUnreadCounts((prev) => {
      if (!prev[groupId]) return prev;
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  }

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <NotificationsContext.Provider
      value={{ unreadCounts, totalUnread, markGroupRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
