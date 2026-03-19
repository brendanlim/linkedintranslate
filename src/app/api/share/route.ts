import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const redis = Redis.fromEnv();

// Generate a short 7-char ID
function generateId(): string {
  return crypto.randomBytes(5).toString("base64url").slice(0, 7);
}

// POST: save a translation and return a short ID
export async function POST(request: NextRequest) {
  try {
    const { q, t } = await request.json();

    if (!q || !t || typeof q !== "string" || typeof t !== "string") {
      return NextResponse.json({ error: "Missing q or t" }, { status: 400 });
    }

    const id = generateId();

    // Store for 90 days
    await redis.set(`share:${id}`, JSON.stringify({ q, t }), { ex: 90 * 24 * 60 * 60 });

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

    const data = await redis.get<string>(`share:${id}`);

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Share fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
