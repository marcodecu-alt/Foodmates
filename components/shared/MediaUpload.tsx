"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Trash2, ImageIcon, Video } from "lucide-react";
import type { RestaurantMedia, RecipeMedia } from "@/lib/supabase/types";

type MediaItem = RestaurantMedia | RecipeMedia;

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const table = entityType === "restaurant" ? "restaurant_media" : "recipe_media";
  const idField = entityType === "restaurant" ? "restaurant_id" : "recipe_id";

  async function handleUpload(files: FileList) {
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      const ext = file.name.split(".").pop();
      const path = `${userId}/${entityType}/${entityId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, { contentType: file.type });

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
        })
        .select()
        .single();

      if (!dbError && record) {
        setMedia((prev) => [record as MediaItem, ...prev]);
      }
    }

    setUploading(false);
    router.refresh();
  }

  async function handleDelete(item: MediaItem) {
    await supabase.storage.from("media").remove([item.storage_path]);
    await supabase.from(table).delete().eq("id", item.id);
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
    router.refresh();
  }

  function getPublicUrl(path: string) {
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />

      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Add photo or video
          </>
        )}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative rounded-lg overflow-hidden aspect-square bg-muted group"
            >
              {item.type === "video" ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-6 w-6 text-muted-foreground" />
                  <video
                    src={getPublicUrl(item.storage_path)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ) : (
                <img
                  src={getPublicUrl(item.storage_path)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}

              {item.uploaded_by === userId && (
                <button
                  onClick={() => handleDelete(item)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {media.length === 0 && !uploading && (
        <div className="rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
          <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
          No photos yet
        </div>
      )}
    </div>
  );
}
