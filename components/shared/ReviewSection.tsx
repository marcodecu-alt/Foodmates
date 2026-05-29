"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";

interface ReviewSectionProps {
  entityId: string;
  table: "restaurants" | "recipes";
  notes: string | null;
  myRating: number | null;
}

export default function ReviewSection({
  entityId,
  table,
  notes: initialNotes,
  myRating: initialRating,
}: ReviewSectionProps) {
  const router = useRouter();
  const supabase = createClient();

  const [notes, setNotes] = useState(initialNotes);
  const [myRating, setMyRating] = useState(initialRating);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialNotes ?? "");
  const [ratingDraft, setRatingDraft] = useState(initialRating);
  const [saving, setSaving] = useState(false);

  // No content and not editing → show "Add review" prompt
  const hasContent = notes || myRating !== null;

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from(table)
      .update({ notes: draft.trim() || null, my_rating: ratingDraft })
      .eq("id", entityId);

    if (!error) {
      setNotes(draft.trim() || null);
      setMyRating(ratingDraft);
      setEditing(false);
      router.refresh();
    }
    setSaving(false);
  }

  async function deleteReview() {
    setSaving(true);
    const { error } = await supabase
      .from(table)
      .update({ notes: null, my_rating: null })
      .eq("id", entityId);

    if (!error) {
      setNotes(null);
      setMyRating(null);
      setDraft("");
      setRatingDraft(null);
      setEditing(false);
      router.refresh();
    }
    setSaving(false);
  }

  function startEdit() {
    setDraft(notes ?? "");
    setRatingDraft(myRating);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(notes ?? "");
    setRatingDraft(myRating);
    setEditing(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">My review</h2>
        {!editing && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={startEdit}
              className="h-8 gap-1.5 text-muted-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              {hasContent ? "Edit" : "Add"}
            </Button>
            {hasContent && (
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

      {editing ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Rating</p>
            <StarRating value={ratingDraft} onChange={setRatingDraft} />
          </div>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write your notes or review…"
            rows={4}
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
      ) : hasContent ? (
        <div className="rounded-xl bg-muted p-4 space-y-2">
          {myRating !== null && (
            <StarRating value={myRating} onChange={() => {}} readonly size="sm" />
          )}
          {notes && <p className="text-sm text-muted-foreground">{notes}</p>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No review yet. Click <span className="font-medium">Add</span> to write one.
        </p>
      )}
    </div>
  );
}
