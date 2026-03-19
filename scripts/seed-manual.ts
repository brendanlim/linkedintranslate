/**
 * Manually seed specific translations into the leaderboard.
 * Usage: npx tsx scripts/seed-manual.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

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
import crypto from "crypto";

const redis = Redis.fromEnv();

function generateId(): string {
  return crypto.randomBytes(5).toString("base64url").slice(0, 7);
}

const entries = [
  {
    q: "I locked eye contact with my manager while we were both peeing at the urinals",
    t: `Today was... something else.

I ducked into the office restroom, just a quick break between back-to-back calls. Standard procedure. Nothing to see here.

Or so I thought.

Mid-flow, I looked up. And there he was. My manager. Right next to me.

And we locked eyes. Directly. Unflinchingly.

For a solid ten seconds, the world stopped. No performance reviews. No project deadlines. Just two professionals, sharing an intensely human, profoundly unfiltered moment. 👀

Some might call it awkward. I call it an exercise in radical candor. A true breakthrough in transparent communication.

Sometimes, the most authentic connections are forged in the most unexpected, vulnerable spaces. It really makes you rethink what "face-to-face" meetings can achieve.

Feeling more aligned with my leadership than ever before. 🤝

#AuthenticLeadership #HumanConnection #RadicalCandor #WorkplaceCulture`,
  },
  {
    q: "I called my boss 'Mom' on a client call",
    t: `It happened at 2:47 PM on a Thursday.

Twelve people on the call. The client's entire leadership team. My boss presenting Q3 results. Everything going perfectly.

Then she asked me a question. And I said, "Sure thing, Mom."

Dead silence. Twelve cameras. Twenty-four eyes. All on me.

My boss just stared. The client's VP unmuted, paused, and said, "...that's sweet."

Here's the thing — I'm not even embarrassed anymore. Because in that moment, I revealed something powerful: I feel safe enough in my workplace to accidentally invoke maternal energy during a revenue call. 😅

That's not a mistake. That's psychological safety in action.

If your team isn't accidentally calling each other family names, are you really building culture? 🤝

#PsychologicalSafety #AuthenticWorkplace #VulnerableLeadership #CultureWins`,
  },
  {
    q: "My Tinder match turned out to be my skip-level manager",
    t: `So this happened.

Swiping through Tinder on a Sunday night. Nothing serious. Just vibes. Matched with someone. Great bio. Good energy. We start chatting.

Monday morning. All-hands meeting. My skip-level manager gets on camera.

It's her.

We both froze. I could see the exact moment she recognized my profile pic. The micro-expression. The slight jaw clench. The immediate pivot to "Q4 priorities."

Neither of us has acknowledged it. It's been three weeks. We make aggressive eye contact in every meeting now. 👀

Here's what I've learned: the algorithm works in mysterious ways. Sometimes it connects you with your soulmate. Sometimes it connects you with the person who approves your promotion.

Either way, networking has never been more efficient. 😅

#ModernNetworking #SmallWorld #AlgorithmicSerendipity #CorporateLife`,
  },
];

async function seed() {
  for (const entry of entries) {
    const id = generateId();
    await redis.set(`share:${id}`, { q: entry.q, t: entry.t }, { ex: 90 * 24 * 60 * 60 });
    await redis.zincrby("leaderboard", 10, id);
    await redis.set(`views:${id}`, 10);
    console.log(`Seeded: "${entry.q.slice(0, 50)}..." → /s/${id}`);
  }
  console.log("Done!");
}

seed();
