import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("id");
  if (!placeId) {
    return NextResponse.json({ error: "Missing place id" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "id,displayName,formattedAddress,location,rating,priceLevel,photos.name,websiteUri,nationalPhoneNumber,types",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const p = await response.json();

    // Infer cuisine from types
    const cuisineTypes = [
      "restaurant",
      "cafe",
      "bar",
      "bakery",
      "meal_takeaway",
    ];
    const cuisine =
      p.types
        ?.find(
          (t: string) =>
            !cuisineTypes.includes(t) &&
            !t.startsWith("establishment") &&
            !t.startsWith("point_of_interest") &&
            !t.startsWith("food")
        )
        ?.replace(/_/g, " ") ?? null;

    return NextResponse.json({
      place_id: p.id,
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? "",
      lat: p.location?.latitude ?? null,
      lng: p.location?.longitude ?? null,
      rating: p.rating ?? null,
      price_level: p.priceLevel
        ? parseInt(p.priceLevel.replace("PRICE_LEVEL_", ""), 10)
        : null,
      photo_reference: p.photos?.[0]?.name ?? null,
      website: p.websiteUri ?? null,
      phone: p.nationalPhoneNumber ?? null,
      cuisine,
    });
  } catch (err) {
    console.error("Places details error:", err);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}
