import { NextRequest, NextResponse } from "next/server";
import type { AgeGroup } from "@/lib/types";
import { getImagePrompt, IMAGE_REGISTRY, NEGATIVE_PROMPT, PRIORITY_IMAGE_CODES } from "@/lib/images/registry";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

/**
 * Image system endpoint (spec §10, Priority 6).
 *  GET  /api/images                      → full prompt registry (admin)
 *  GET  /api/images?code=COM1&age=teens  → single resolved prompt
 *
 * When IMAGE_API_KEY + IMAGE_API_PROVIDER are configured, this is where a
 * generation call would be wired (provider-agnostic). Without them, the
 * endpoint returns the prompt text so illustrations can be produced manually
 * or in a batch, and the UI shows on-brand placeholders.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const ageParam = req.nextUrl.searchParams.get("age");
  const age: AgeGroup = ageParam === "kids" ? "KIDS_9_12" : "TEENS_13_17";

  if (code) {
    const prompt = getImagePrompt(code, age);
    if (!prompt) return NextResponse.json({ error: "Unknown item code." }, { status: 404 });
    return NextResponse.json({
      code,
      age,
      prompt,
      negativePrompt: NEGATIVE_PROMPT,
      generationEnabled: Boolean(process.env.IMAGE_API_KEY && process.env.IMAGE_API_PROVIDER),
    });
  }

  // Full registry requires admin (it's a content asset, not student-facing).
  if (!isAuthorized(req.nextUrl.searchParams.get("key"))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({
    priority: PRIORITY_IMAGE_CODES,
    negativePrompt: NEGATIVE_PROMPT,
    generationEnabled: Boolean(process.env.IMAGE_API_KEY && process.env.IMAGE_API_PROVIDER),
    registry: IMAGE_REGISTRY,
  });
}
