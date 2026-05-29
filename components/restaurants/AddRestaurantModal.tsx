"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RestaurantSearch from "./RestaurantSearch";
import { Plus, PencilLine, Camera, X } from "lucide-react";
import { useActiveGroup } from "@/lib/hooks/useActiveGroup";
import { getOrCreatePersonalGroup } from "@/lib/hooks/useOrCreateGroup";
import StarRating from "@/components/shared/StarRating";

interface PlaceDetails {
  place_id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  price_level: number | null;
  photo_reference: string | null;
  website: string | null;
  phone: string | null;
  cuisine: string | null;
}

export default function AddRestaurantModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeGroupId, setActiveGroupId } = useActiveGroup();
  const supabase = createClient();

  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"wishlist" | "visited">("wishlist");
  const [manualMode, setManualMode] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [form, setForm] = useState<Partial<PlaceDetails> & { notes: string }>({
    notes: "",
  });

  function handlePlaceSelect(details: PlaceDetails) {
    setForm((prev) => ({ ...prev, ...details }));
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.name) {
      setError("Please enter a restaurant name");
      return;
    }
    if (!manualMode && !form.place_id) {
      setError("Please search and select a restaurant first");
      return;
    }
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Auto-create a personal group if none exists
    const groupId = activeGroupId ?? await getOrCreatePersonalGroup(setActiveGroupId);
    if (!groupId) {
      setError("Could not create a group. Please try again.");
      setLoading(false);
      return;
    }

    // Generate a unique place_id for manual entries
    const placeId = form.place_id ?? `manual_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Check for duplicate (only for Google Places entries)
    if (form.place_id) {
      const { data: existing } = await supabase
        .from("restaurants")
        .select("id")
        .eq("group_id", groupId)
        .eq("place_id", placeId)
        .maybeSingle();

      if (existing) {
        setError("This restaurant is already in your list.");
        setLoading(false);
        return;
      }
    }

    const { data: inserted, error } = await supabase
      .from("restaurants")
      .insert({
        group_id: groupId,
        added_by: user.id,
        place_id: placeId,
        name: form.name!,
        address: form.address ?? null,
        lat: form.lat ?? null,
        lng: form.lng ?? null,
        cuisine: form.cuisine ?? null,
        price_level: form.price_level ?? null,
        google_rating: form.rating ?? null,
        photo_reference: form.photo_reference ?? null,
        website: form.website ?? null,
        phone: form.phone ?? null,
        notes: form.notes || null,
        my_rating: myRating,
        status,
        visited_at: status === "visited" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error) {
      setError(error.message);
    } else {
      // Upload any queued photos
      if (pendingPhotos.length > 0 && inserted?.id) {
        for (const file of pendingPhotos) {
          const ext = file.name.split(".").pop();
          const path = `${user.id}/restaurant/${inserted.id}/${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("media")
            .upload(path, file, { contentType: file.type });
          if (!uploadErr) {
            await supabase.from("restaurant_media").insert({
              restaurant_id: inserted.id,
              uploaded_by: user.id,
              storage_path: path,
              type: "photo",
            });
          }
        }
      }

      setOpen(false);
      setForm({ notes: "" });
      setCity("");
      setStatus("wishlist");
      setManualMode(false);
      setMyRating(null);
      setPendingPhotos([]);
      router.refresh();
    }
    setLoading(false);
  }

  const content = (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="city">City / area</Label>
        <Input
          id="city"
          placeholder="e.g. London, Milan, New York…"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setForm({ notes: form.notes }); // clear selected place when city changes
          }}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>{manualMode ? "Restaurant name" : "Search restaurant"}</Label>
          <button
            type="button"
            onClick={() => {
              setManualMode(!manualMode);
              setForm({ notes: form.notes });
            }}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <PencilLine className="h-3 w-3" />
            {manualMode ? "Search instead" : "Can't find it? Add manually"}
          </button>
        </div>
        {manualMode ? (
          <div className="space-y-2">
            <Input
              placeholder="e.g. Iberica, Nobu, Dishoom…"
              value={form.name ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value, place_id: undefined }))}
              autoFocus
            />
            <Input
              placeholder="Address (optional)"
              value={form.address ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
        ) : (
          <RestaurantSearch onSelect={handlePlaceSelect} city={city} />
        )}
      </div>

      {/* Status toggle — always visible once a place is selected or not */}
      <div className="space-y-1.5">
        <Label>Add to</Label>
        <div className="flex rounded-lg bg-muted p-1 gap-1">
          <button
            type="button"
            onClick={() => setStatus("wishlist")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              status === "wishlist"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Wishlist
          </button>
          <button
            type="button"
            onClick={() => setStatus("visited")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              status === "visited"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Visited
          </button>
        </div>
      </div>

      {form.name && !manualMode && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">{form.name}</p>
          {form.address && (
            <p className="text-muted-foreground text-xs mt-0.5">{form.address}</p>
          )}
          {form.cuisine && (
            <p className="text-muted-foreground text-xs">{form.cuisine}</p>
          )}
        </div>
      )}

      {(form.name || manualMode) && (
        <>
          {/* Rating */}
          <div className="space-y-1.5">
            <Label>My rating (optional)</Label>
            <StarRating value={myRating} onChange={setMyRating} />
          </div>

          {/* Review */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Review (optional)</Label>
            <Textarea
              id="notes"
              placeholder={status === "visited" ? "How was it? Any dishes to recommend?" : "Why do you want to try this place?"}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Photos */}
          <div className="space-y-1.5">
            <Label>Photos (optional)</Label>
            <label className="flex items-center gap-2 cursor-pointer w-fit text-sm text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-xl px-4 py-2.5 hover:bg-muted/50">
              <Camera className="h-4 w-4" />
              Add photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setPendingPhotos((prev) => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
              />
            </label>
            {pendingPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {pendingPhotos.map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full"
        onClick={handleSave}
        disabled={loading || !form.name || (!manualMode && !form.place_id)}
      >
        {loading ? "Saving…" : status === "visited" ? "Save as visited" : "Save to wishlist"}
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add restaurant
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add restaurant</SheetTitle>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Dialog */}
      <div className="hidden md:block">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add restaurant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add restaurant</DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
