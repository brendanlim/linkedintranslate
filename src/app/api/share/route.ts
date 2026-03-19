import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function generateId(): string {
  return crypto.randomBytes(5).toString("base64url").slice(0, 7);
}

function cleanText(text: string): string {
  // Strip null bytes and other control characters
  return text.replace(/\0/g, "").replace(/[^\P{C}\n]/gu, "").trim();
}

// POST: save a translation and return a short ID
export async function POST(request: NextRequest) {
  try {
    const { q, t } = await request.json();

    if (!q || !t || typeof q !== "string" || typeof t !== "string") {
      return NextResponse.json({ error: "Missing q or t" }, { status: 400 });
    }

    const id = generateId();
    const cleanQ = cleanText(q);
    const cleanT = cleanText(t);

    // Store as object — Upstash SDK handles serialization
    await redis.set(`share:${id}`, { q: cleanQ, t: cleanT }, { ex: 90 * 24 * 60 * 60 });

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Share save error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// GET: retrieve a translation by short ID
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const data = await redis.get<{ q: string; t: string }>(`share:${id}`);

    if (!data || !data.q || !data.t) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      q: cleanText(data.q),
      t: cleanText(data.t),
    });
  } catch (error) {
    console.error("Share fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
