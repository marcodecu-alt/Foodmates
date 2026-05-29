import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const city = request.nextUrl.searchParams.get("city");
  if (!q) {
    return NextResponse.json({ places: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    );
  }

  // Scope the query to the city if provided
  const textQuery = city ? `${q} in ${city}` : q;

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.photos.name,places.websiteUri,places.nationalPhoneNumber",
        },
        body: JSON.stringify({
          textQuery,
          languageCode: "en",
          includedType: "restaurant",
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Places API error:", response.status, errBody);
      return NextResponse.json(
        { error: `Places API error ${response.status}: ${errBody}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const places = (data.places ?? []).map((p: Record<string, unknown> & { id: string; displayName?: { text?: string }; formattedAddress?: string; location?: { latitude?: number; longitude?: number }; rating?: number; priceLevel?: string; photos?: { name: string }[] }) => ({
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
    }));

    return NextResponse.json({ places });
  } catch (err) {
    console.error("Places search error:", err);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}
