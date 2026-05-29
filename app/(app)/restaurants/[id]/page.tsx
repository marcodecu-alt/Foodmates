import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Globe, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatusToggle from "@/components/shared/StatusToggle";
import MediaUpload from "@/components/shared/MediaUpload";
import type { Restaurant, RestaurantMedia } from "@/lib/supabase/types";
import RefreshPhotoButton from "@/components/restaurants/RefreshPhotoButton";
import RestaurantPhoto from "@/components/restaurants/RestaurantPhoto";
import DeleteRestaurantButton from "@/components/restaurants/DeleteRestaurantButton";
import ReviewSection from "@/components/shared/ReviewSection";
import type { Review } from "@/components/shared/ReviewSection";

export default async function RestaurantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [
    { data: restaurant },
    { data: media },
    { data: { user } },
    { data: reviewsRaw },
  ] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", params.id).single(),
    supabase
      .from("restaurant_media")
      .select("*")
      .eq("restaurant_id", params.id)
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
    supabase
      .from("reviews")
      .select("id, user_id, rating, notes, profiles:user_id(display_name, username)")
      .eq("entity_id", params.id)
      .eq("entity_type", "restaurant"),
  ]);

  if (!restaurant) notFound();

  const reviews = (reviewsRaw ?? []) as unknown as Review[];

  const r = restaurant as Restaurant;

  return (
    <div className="container py-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to restaurants
        </Link>
        <DeleteRestaurantButton restaurantId={r.id} />
      </div>

      {/* Photo */}
      <div className="rounded-xl overflow-hidden h-56 bg-muted flex items-center justify-center mb-4">
        {r.photo_reference ? (
          <RestaurantPhoto photoReference={r.photo_reference} alt={r.name} />
        ) : (
          <span className="text-6xl">🍽️</span>
        )}
      </div>

      {!r.photo_reference && (
        <div className="mb-4">
          <RefreshPhotoButton restaurantId={r.id} placeId={r.place_id} />
        </div>
      )}

      {/* Header */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{r.name}</h1>
          <StatusToggle id={r.id} type="restaurant" currentStatus={r.status} />
        </div>

        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
          {r.cuisine && <Badge variant="secondary">{r.cuisine}</Badge>}
          {r.google_rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {r.google_rating}
            </span>
          )}
          {r.price_level && (
            <span>{"$".repeat(r.price_level)}</span>
          )}
        </div>

        {r.address && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            {r.address}
          </div>
        )}

        {r.website && (
          <a
            href={r.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Globe className="h-4 w-4" />
            Website
          </a>
        )}

        {r.phone && (
          <a
            href={`tel:${r.phone}`}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Phone className="h-4 w-4" />
            {r.phone}
          </a>
        )}
      </div>

      {/* Review */}
      <div className="mb-6">
        <ReviewSection
          entityId={r.id}
          entityType="restaurant"
          currentUserId={user!.id}
          initialReviews={reviews}
        />
      </div>

      {/* Media */}
      <div className="space-y-3">
        <h2 className="font-semibold">Photos &amp; videos</h2>
        <MediaUpload
          entityId={r.id}
          entityType="restaurant"
          media={(media ?? []) as RestaurantMedia[]}
          userId={user!.id}
        />
      </div>
    </div>
  );
}
