"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReviewProfile {
  display_name: string | null;
  username: string;
}

export interface Review {
  id: string;
  user_id: string;
  rating: number | null;
  notes: string | null;
  profiles: ReviewProfile | null;
}

interface ReviewSectionProps {
  entityId: string;
  entityType: "restaurant" | "recipe";
  currentUserId: string;
  initialReviews: Review[];
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ReviewSection({
  entityId,
  entityType,
  currentUserId,
  initialReviews,
}: ReviewSectionProps) {
  const router = useRouter();
  const supabase = createClient();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [ratingDraft, setRatingDraft] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const myReview = reviews.find((r) => r.user_id === currentUserId) ?? null;
  const otherReviews = reviews.filter((r) => r.user_id !== currentUserId);

  // ── Editing ──────────────────────────────────────────────────────────────

  function startEdit() {
    setDraft(myReview?.notes ?? "");
    setRatingDraft(myReview?.rating ?? null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraft("");
    setRatingDraft(null);
  }

  async function save() {
    setSaving(true);

    const { data, error } = await supabase
      .from("reviews")
      .upsert(
        {
          entity_id: entityId,
          entity_type: entityType,
          user_id: currentUserId,
          rating: ratingDraft,
          notes: draft.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "entity_id,entity_type,user_id" }
      )
      .select("id, user_id, rating, notes")
      .single();

    if (!error && data) {
      const existingProfile = myReview?.profiles ?? null;
      const updated: Review = { ...data, profiles: existingProfile };
      setReviews((prev) => {
        const exists = prev.some((r) => r.user_id === currentUserId);
        return exists
          ? prev.map((r) => (r.user_id === currentUserId ? updated : r))
          : [...prev, updated];
      });
      setEditing(false);
      router.refresh();
    }

    setSaving(false);
  }

  async function deleteReview() {
    if (!myReview) return;
    setSaving(true);
    await supabase.from("reviews").delete().eq("id", myReview.id);
    setReviews((prev) => prev.filter((r) => r.user_id !== currentUserId));
    setEditing(false);
    setSaving(false);
    router.refresh();
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          Reviews
          {reviews.length > 0 && (
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              ({reviews.length})
            </span>
          )}
        </h2>
        {!editing && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={startEdit}
              className="h-8 gap-1.5 text-muted-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              {myReview ? "Edit mine" : "Add mine"}
            </Button>
            {myReview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteReview}
                disabled={saving}
                className="h-8 gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <div className="rounded-xl border border-border p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Your review
          </p>
          <StarRating value={ratingDraft} onChange={setRatingDraft} />
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write your notes or review…"
            rows={3}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
              disabled={saving}
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {!editing && (
        <>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews yet.{" "}
              <button
                onClick={startEdit}
                className="text-primary hover:underline font-medium"
              >
                Add yours
              </button>
            </p>
          ) : (
            <div className="space-y-3">
              {myReview && (
                <ReviewCard review={myReview} label="You" />
              )}
              {otherReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  label={
                    review.profiles?.display_name ??
                    review.profiles?.username ??
                    "Someone"
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── ReviewCard ─────────────────────────────────────────────────────────────

function ReviewCard({ review, label }: { review: Review; label: string }) {
  if (review.rating == null && !review.notes) return null;

  return (
    <div className="rounded-xl bg-muted px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {review.rating != null && (
          <StarRating
            value={review.rating}
            onChange={() => {}}
            readonly
            size="sm"
          />
        )}
      </div>
      {review.notes && (
        <p className="text-sm text-foreground/80 leading-relaxed">
          {review.notes}
        </p>
      )}
    </div>
  );
}
