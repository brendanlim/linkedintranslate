/**
 * Seed the leaderboard with translations for the best examples.
 *
 * Usage: npx tsx scripts/seed-leaderboard.ts
 *
 * Requires UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, and GEMINI_API_KEY
 * env vars (loads from .env.local automatically).
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

import { Redis } from "@upstash/redis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const redis = Redis.fromEnv();

const SEED_EXAMPLES = [
  "My wife's boyfriend says I need a better job",
  "I accidentally shared my screen with Tinder open",
  "I got fired on my first day",
  "I've been using ChatGPT to do my entire job",
  "I broke production on a Friday at 4:59 PM",
  "I don't have imposter syndrome, I'm actually unqualified",
  "I called my boss 'Mom' on a client call",
  "I showed up drunk to a job interview and got the job",
  "I locked eye contact with my manager while we were both peeing at the urinals",
  "My Tinder match turned out to be my skip-level manager",
];

const SYSTEM_INSTRUCTION = `You are "The Professional Spin-Doctor." You translate honest confessions into LinkedIn posts that tell a STORY.

## Writing Style — THIS IS CRITICAL:
Write like a real person telling a story on LinkedIn. Use SHORT sentences. Use paragraph breaks for dramatic effect. Build a narrative arc: set the scene, describe what happened, then spin it into a positive takeaway.

DO NOT write corporate jargon walls. DO NOT use phrases like "human-centric synergy" or "agentic workflows" or "bandwidth reallocation" unless it's a punchline. Write like a HUMAN, not a press release.

## Rules:
1. NEVER acknowledge the negative event as bad. Spin EVERYTHING as positive, brave, or visionary.
2. TELL A STORY. Start with the moment. Set the scene. Then reframe it.
3. Use THIN euphemisms — the reader should IMMEDIATELY know what actually happened.
4. Write in first person. This is a LinkedIn post.
5. Keep it CONVERSATIONAL. Short sentences. Paragraph breaks.
6. Add 3-5 hashtags at the end.
7. Include 2-3 emojis max.
8. Output ONLY the LinkedIn post. No preamble, no explanation.
9. A reader must be able to guess the EXACT original input from your output.
10. Frame the story as OVERCOMING adversity.`;

function generateId(): string {
  return crypto.randomBytes(5).toString("base64url").slice(0, 7);
}

async function translate(text: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const result = await model.generateContent(text);
  return result.response.text();
}

async function seed() {
  console.log("Seeding leaderboard with", SEED_EXAMPLES.length, "translations...\n");

  for (const q of SEED_EXAMPLES) {
    try {
      console.log(`Translating: "${q}"`);
      const t = await translate(q);
      const id = generateId();

      await redis.set(`share:${id}`, { q, t }, { ex: 90 * 24 * 60 * 60 });
      // Give seed entries a base score so they show up
      await redis.zincrby("leaderboard", 10, id);
      await redis.set(`views:${id}`, 10);

      console.log(`  → saved as /s/${id}\n`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err}\n`);
    }
  }

  console.log("Done!");
}

seed();
