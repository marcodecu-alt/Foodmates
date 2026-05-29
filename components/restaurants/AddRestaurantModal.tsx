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
import { Plus } from "lucide-react";
import { useActiveGroup } from "@/lib/hooks/useActiveGroup";
import { getOrCreatePersonalGroup } from "@/lib/hooks/useOrCreateGroup";

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
    if (!form.name || !form.place_id) {
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

    // Check for duplicate
    const { data: existing } = await supabase
      .from("restaurants")
      .select("id")
      .eq("group_id", groupId)
      .eq("place_id", form.place_id!)
      .maybeSingle();

    if (existing) {
      setError("This restaurant is already in your list.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("restaurants").insert({
      group_id: groupId,
      added_by: user.id,
      place_id: form.place_id!,
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
      status,
      visited_at: status === "visited" ? new Date().toISOString() : null,
    });

    if (error) {
      setError(error.message);
    } else {
      setOpen(false);
      setForm({ notes: "" });
      setCity("");
      setStatus("wishlist");
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
        <Label>Search restaurant</Label>
        <RestaurantSearch onSelect={handlePlaceSelect} city={city} />
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

      {form.name && (
        <>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">{form.name}</p>
            {form.address && (
              <p className="text-muted-foreground text-xs mt-0.5">
                {form.address}
              </p>
            )}
            {form.cuisine && (
              <p className="text-muted-foreground text-xs">{form.cuisine}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder={status === "visited" ? "How was it?" : "Why do you want to try this place?"}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
            />
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full"
        onClick={handleSave}
        disabled={loading || !form.name}
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
