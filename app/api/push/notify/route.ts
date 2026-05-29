import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

const vapidConfigured =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_EMAIL;

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function POST(req: NextRequest) {
  if (!vapidConfigured) return NextResponse.json({ ok: true }); // not set up yet

  try {
    const { groupId, senderId, senderName, content } = await req.json();

    const supabase = createClient();

    // Get group members except the sender
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .neq("user_id", senderId);

    if (!members?.length) return NextResponse.json({ ok: true });

    const memberIds = members.map((m) => m.user_id);

    // Get their push subscriptions
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("subscription, endpoint")
      .in("user_id", memberIds);

    if (!subs?.length) return NextResponse.json({ ok: true });

    const payload = JSON.stringify({
      title: senderName ?? "New message",
      body: content.length > 120 ? content.slice(0, 120) + "…" : content,
      url: "/chat",
      tag: `foodmates-chat-${groupId}`,
    });

    // Send to all subscriptions, remove expired ones
    const results = await Promise.allSettled(
      subs.map(({ subscription, endpoint }) =>
        webpush.sendNotification(subscription, payload).catch(async (err) => {
          // 410 = subscription expired, clean it up
          if (err.statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", endpoint);
          }
          throw err;
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error("[push/notify]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
