import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Users, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatusToggle from "@/components/shared/StatusToggle";
import MediaUpload from "@/components/shared/MediaUpload";
import type { Recipe, RecipeMedia } from "@/lib/supabase/types";
import ReviewSection from "@/components/shared/ReviewSection";
import type { Review } from "@/components/shared/ReviewSection";

export default async function RecipeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [
    { data: recipe },
    { data: media },
    {
      data: { user },
    },
    { data: reviewsRaw },
    { data: memberStatusesRaw },
  ] = await Promise.all([
    supabase.from("recipes").select("*").eq("id", params.id).single(),
    supabase
      .from("recipe_media")
      .select("*")
      .eq("recipe_id", params.id)
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
    supabase
      .from("reviews")
      .select(
        "id, user_id, rating, notes, profiles:user_id(display_name, username)"
      )
      .eq("entity_id", params.id)
      .eq("entity_type", "recipe"),
    supabase
      .from("recipe_member_status")
      .select("user_id, status, profiles:user_id(display_name, username)")
      .eq("recipe_id", params.id),
  ]);

  if (!recipe) notFound();

  const reviews = (reviewsRaw ?? []) as unknown as Review[];
  const memberStatuses = (memberStatusesRaw ?? []) as unknown as {
    user_id: string;
    status: string;
    profiles: { display_name: string | null; username: string | null } | null;
  }[];

  const myStatus =
    memberStatuses.find((ms) => ms.user_id === user!.id)?.status ?? null;

  const r = recipe as Recipe;
  const ingredients = r.ingredients as
    | { name: string; amount: string; unit: string }[]
    | null;
  const steps = r.steps as { order: number; text: string }[] | null;
  // Get cover photo from media
  const coverPhoto = (media ?? [])[0];
  const coverUrl = coverPhoto
    ? supabase.storage.from("media").getPublicUrl(coverPhoto.storage_path).data
        .publicUrl
    : r.cover_photo_url ?? null;

  return (
    <div className="container py-6 max-w-2xl">
      <Link
        href="/recipes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to recipes
      </Link>

      {/* Cover photo */}
      <div className="rounded-xl overflow-hidden h-56 bg-muted flex items-center justify-center mb-4">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={r.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">🍳</span>
        )}
      </div>

      {/* Header */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{r.title}</h1>
          <StatusToggle
            id={r.id}
            type="recipe"
            currentStatus={myStatus}
            userId={user!.id}
          />
        </div>

        {/* Per-member status pills */}
        {memberStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {memberStatuses.map((ms) => {
              const isMe = ms.user_id === user!.id;
              const name = isMe
                ? "You"
                : ms.profiles?.display_name ??
                  ms.profiles?.username ??
                  "Member";
              const isCooked = ms.status === "cooked";
              return (
                <span
                  key={ms.user_id}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    isCooked
                      ? "bg-green-100 text-green-700"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {isCooked ? "✓" : "★"} {name}{" "}
                  <span className="font-normal opacity-70">
                    {isCooked ? "Cooked" : "Wishlist"}
                  </span>
                </span>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          {r.cuisine && <Badge variant="secondary">{r.cuisine}</Badge>}
          {r.tags?.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {r.prep_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Prep: {r.prep_time}min
            </span>
          )}
          {r.cook_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Cook: {r.cook_time}min
            </span>
          )}
          {r.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {r.servings} servings
            </span>
          )}
        </div>

        {r.source_url && (
          <a
            href={r.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            View original recipe
          </a>
        )}
      </div>

      {r.description && (
        <p className="text-muted-foreground text-sm mb-4">{r.description}</p>
      )}

      {/* Ingredients */}
      {ingredients && ingredients.length > 0 && (
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3">
            Ingredients
            {r.servings && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (serves {r.servings})
              </span>
            )}
          </h2>
          <ul className="space-y-1">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-muted-foreground min-w-[80px]">
                  {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                </span>
                <span>{ing.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Steps */}
      {steps && steps.length > 0 && (
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3">Instructions</h2>
          <ol className="space-y-4">
            {steps.map((step) => (
              <li key={step.order} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                  {step.order}
                </span>
                <p className="leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Review */}
      <div className="mb-6">
        <ReviewSection
          entityId={r.id}
          entityType="recipe"
          currentUserId={user!.id}
          initialReviews={reviews}
        />
      </div>

      {/* Media */}
      <div className="space-y-3">
        <h2 className="font-semibold">Photos &amp; videos</h2>
        <MediaUpload
          entityId={r.id}
          entityType="recipe"
          media={(media ?? []) as RecipeMedia[]}
          userId={user!.id}
        />
      </div>
    </div>
  );
}
