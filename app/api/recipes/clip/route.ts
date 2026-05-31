import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Given raw HTML, extract the recipe and return ONLY valid JSON matching this schema — no markdown, no explanation:
{
  "title": string,
  "description": string | null,
  "cover_photo_url": string | null,
  "ingredients": [{"name": string, "amount": string, "unit": string}],
  "steps": [{"order": number, "text": string}],
  "prep_time": number | null,
  "cook_time": number | null,
  "servings": number | null,
  "cuisine": string | null,
  "tags": string[]
}
For cover_photo_url: look for the og:image meta tag, twitter:image meta tag, JSON-LD image property, or the main recipe photo image src. Return the full absolute URL. If no image is found, return null.
If a field cannot be found, use null. Never invent steps or ingredients.`;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let html = "";
  try {
    const response = await fetch(body.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    html = await response.text();
    // Trim HTML to stay within token limits — keep first 60k chars
    if (html.length > 60000) {
      html = html.slice(0, 60000);
    }
  } catch {
    return NextResponse.json(
      {
        recipe: buildEmptyRecipe(),
        confidence: "low",
        cover_photo_url: null,
        error: "Could not fetch the page. Please fill in the details manually.",
      },
      { status: 200 }
    );
  }

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Extract the recipe from this HTML:\n\n${html}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences
    const jsonText = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    const parsed = JSON.parse(jsonText);

    // Separate cover_photo_url from the recipe fields
    const { cover_photo_url, ...recipe } = parsed;

    // Determine confidence: low if most fields are null
    const nullCount = [
      recipe.description,
      recipe.ingredients?.length > 0 ? "ok" : null,
      recipe.steps?.length > 0 ? "ok" : null,
      recipe.prep_time,
      recipe.cook_time,
    ].filter((v) => v === null).length;

    const confidence = nullCount >= 3 ? "low" : "high";

    return NextResponse.json({ recipe, confidence, cover_photo_url: cover_photo_url ?? null });
  } catch (err) {
    console.error("Recipe clip error:", err);
    return NextResponse.json({
      recipe: buildEmptyRecipe(),
      confidence: "low",
      cover_photo_url: null,
      error:
        "Could not extract recipe automatically. Please fill in the details.",
    });
  }
}

function buildEmptyRecipe() {
  return {
    title: "",
    description: null,
    ingredients: [],
    steps: [],
    prep_time: null,
    cook_time: null,
    servings: null,
    cuisine: null,
    tags: [],
  };
}
