import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

const VALID_ACTIONS = ["copy", "share_link", "share_linkedin"] as const;
type Action = (typeof VALID_ACTIONS)[number];

const ACTION_WEIGHTS: Record<Action, number> = {
  copy: 2,
  share_link: 3,
  share_linkedin: 5,
};

export async function POST(request: NextRequest) {
  try {
    const { id, action } = await request.json();

    if (!id || typeof id !== "string" || !/^[a-zA-Z0-9_-]{4,12}$/.test(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await Promise.all([
      redis.hincrby(`engagement:${id}`, action, 1),
      redis.zincrby("leaderboard", ACTION_WEIGHTS[action as Action], id),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
