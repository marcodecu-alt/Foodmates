"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Loader2,
  Trash2,
  ImageIcon,
  Video,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { RestaurantMedia, RecipeMedia } from "@/lib/supabase/types";

type MediaItem = RestaurantMedia | RecipeMedia;

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
};

interface MediaUploadProps {
  entityId: string;
  entityType: "restaurant" | "recipe";
  media: MediaItem[];
  userId: string;
}

export default function MediaUpload({
  entityId,
  entityType,
  media: initialMedia,
  userId,
}: MediaUploadProps) {
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCaptions, setEditingCaptions] = useState<Record<string, string>>({});
  const [savingCaption, setSavingCaption] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const table = entityType === "restaurant" ? "restaurant_media" : "recipe_media";
  const idField = entityType === "restaurant" ? "restaurant_id" : "recipe_id";

  // ── File selection → staging ───────────────────────────────────────────────

  function handleFilesSelected(files: FileList) {
    const newPending: PendingFile[] = Array.from(files).map((file) => ({
      id: `pending-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
    // Reset the input so the same file can be re-selected later
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePending(id: string) {
    setPendingFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    setError(null);

    for (const pending of pendingFiles) {
      const isVideo = pending.file.type.startsWith("video/");
      const ext = pending.file.name.split(".").pop();
      const path = `${userId}/${entityType}/${entityId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, pending.file, { contentType: pending.file.type });

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      const { data: record, error: dbError } = await supabase
        .from(table)
        .insert({
          [idField]: entityId,
          uploaded_by: userId,
          storage_path: path,
          type: isVideo ? "video" : "photo",
          caption: pending.caption.trim() || null,
        })
        .select()
        .single();

      if (!dbError && record) {
        URL.revokeObjectURL(pending.previewUrl);
        setMedia((prev) => [record as MediaItem, ...prev]);
      }
    }

    setPendingFiles([]);
    setUploading(false);
    router.refresh();
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(item: MediaItem) {
    await supabase.storage.from("media").remove([item.storage_path]);
    await supabase.from(table).delete().eq("id", item.id);
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
    router.refresh();
  }

  // ── Caption editing ────────────────────────────────────────────────────────

  function startEditCaption(item: MediaItem) {
    setEditingCaptions((prev) => ({
      ...prev,
      [item.id]: item.caption ?? "",
    }));
  }

  function cancelEditCaption(id: string) {
    setEditingCaptions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function saveCaption(item: MediaItem, caption: string) {
    setSavingCaption(item.id);
    const trimmed = caption.trim() || null;
    await supabase.from(table).update({ caption: trimmed }).eq("id", item.id);
    setMedia((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, caption: trimmed } : m))
    );
    cancelEditCaption(item.id);
    setSavingCaption(null);
  }

  // ── URL helper ─────────────────────────────────────────────────────────────

  function getPublicUrl(path: string) {
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
      />

      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="h-4 w-4" />
        Add photo or video
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* ── Staging area ── */}
      {pendingFiles.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Ready to upload
          </p>

          <div className="space-y-2">
            {pendingFiles.map((pf) => (
              <div key={pf.id} className="flex gap-3 items-start">
                {/* Preview thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {pf.file.type.startsWith("video/") ? (
                    <video
                      src={pf.previewUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={pf.previewUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Caption input */}
                <div className="flex-1 min-w-0 space-y-1">
                  <input
                    type="text"
                    placeholder="Add a caption… (optional)"
                    value={pf.caption}
                    onChange={(e) =>
                      setPendingFiles((prev) =>
                        prev.map((f) =>
                          f.id === pf.id ? { ...f, caption: e.target.value } : f
                        )
                      )
                    }
                    className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
                  />
                  <p className="text-[11px] text-muted-foreground truncate">
                    {pf.file.name}
                  </p>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removePending(pf.id)}
                  className="mt-1 h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex-shrink-0 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload{" "}
                  {pendingFiles.length === 1
                    ? "1 photo"
                    : `${pendingFiles.length} photos`}
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
                setPendingFiles([]);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Uploaded media grid ── */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map((item) => {
            const isEditing = item.id in editingCaptions;
            const isSaving = savingCaption === item.id;
            const isOwner = item.uploaded_by === userId;

            return (
              <div key={item.id} className="space-y-1">
                {/* Thumbnail */}
                <div className="relative rounded-lg overflow-hidden aspect-square bg-muted group">
                  {item.type === "video" ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Video className="h-6 w-6 text-white drop-shadow" />
                      </div>
                      <video
                        src={getPublicUrl(item.storage_path)}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </>
                  ) : (
                    <img
                      src={getPublicUrl(item.storage_path)}
                      alt={item.caption ?? ""}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Owner controls */}
                  {isOwner && (
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditCaption(item)}
                        className="h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                        title="Edit caption"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Caption row */}
                {isEditing ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editingCaptions[item.id]}
                      onChange={(e) =>
                        setEditingCaptions((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          saveCaption(item, editingCaptions[item.id]);
                        if (e.key === "Escape") cancelEditCaption(item.id);
                      }}
                      placeholder="Add a caption…"
                      className="flex-1 min-w-0 text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
                      autoFocus
                    />
                    <button
                      onClick={() =>
                        saveCaption(item, editingCaptions[item.id])
                      }
                      disabled={isSaving}
                      className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
                    >
                      {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={() => cancelEditCaption(item.id)}
                      className="h-6 w-6 rounded bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : item.caption ? (
                  <p className="text-[11px] text-muted-foreground leading-tight px-0.5 line-clamp-2">
                    {item.caption}
                  </p>
                ) : isOwner ? (
                  <button
                    onClick={() => startEditCaption(item)}
                    className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground px-0.5 leading-tight transition-colors"
                  >
                    Add caption…
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {media.length === 0 && pendingFiles.length === 0 && !uploading && (
        <div className="rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
          <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
          No photos yet
        </div>
      )}
    </div>
  );
}
