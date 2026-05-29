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
  try {
    const { groupId, newUserId, newUserName, groupName } = await req.json();
    const supabase = createClient();

    // Get all existing members except the person who just joined
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .neq("user_id", newUserId);

    if (!members?.length) return NextResponse.json({ ok: true });

    const memberIds = members.map((m) => m.user_id);

    if (!vapidConfigured) return NextResponse.json({ ok: true });

    // Get their push subscriptions
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("subscription, endpoint")
      .in("user_id", memberIds);

    if (!subs?.length) return NextResponse.json({ ok: true });

    const payload = JSON.stringify({
      title: `${newUserName} joined ${groupName}! 🎉`,
      body: "A new member has joined your group.",
      url: "/groups",
      tag: `foodmates-join-${groupId}`,
    });

    await Promise.allSettled(
      subs.map(({ subscription, endpoint }) =>
        webpush.sendNotification(subscription, payload).catch(async (err) => {
          if (err.statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", endpoint);
          }
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/notify-join]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
