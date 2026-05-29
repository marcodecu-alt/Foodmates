import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Given raw HTML, extract the recipe and return ONLY valid JSON matching this schema — no markdown, no explanation:
{
  "title": string,
  "description": string | null,
  "ingredients": [{"name": string, "amount": string, "unit": string}],
  "steps": [{"order": number, "text": string}],
  "prep_time": number | null,
  "cook_time": number | null,
  "servings": number | null,
  "cuisine": string | null,
  "tags": string[]
}
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
          "Mozilla/5.0 (compatible; Foodmates/1.0; recipe-clipper)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    html = await response.text();
    // Trim HTML to stay within token limits — keep first 50k chars
    if (html.length > 50000) {
      html = html.slice(0, 50000);
    }
  } catch {
    return NextResponse.json(
      {
        recipe: buildEmptyRecipe(),
        confidence: "low",
        error: "Could not fetch the page. Please fill in the details manually.",
      },
      { status: 200 }
    );
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
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

    const recipe = JSON.parse(jsonText);

    // Determine confidence: low if most fields are null
    const nullCount = [
      recipe.description,
      recipe.ingredients?.length > 0 ? "ok" : null,
      recipe.steps?.length > 0 ? "ok" : null,
      recipe.prep_time,
      recipe.cook_time,
    ].filter((v) => v === null).length;

    const confidence = nullCount >= 3 ? "low" : "high";

    return NextResponse.json({ recipe, confidence });
  } catch (err) {
    console.error("Recipe clip error:", err);
    return NextResponse.json({
      recipe: buildEmptyRecipe(),
      confidence: "low",
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
