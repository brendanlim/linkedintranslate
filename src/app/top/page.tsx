import { redis } from "@/lib/redis";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Translations",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

interface LeaderboardEntry {
  id: string;
  score: number;
  views: number;
  engagement: { copy: number; share_link: number; share_linkedin: number };
  q: string;
  t: string;
}

export default async function TopPage() {
  const raw = await redis.zrange("leaderboard", 0, 49, {
    rev: true,
    withScores: true,
  });

  // raw is [member, score, member, score, ...]
  const ids: { id: string; score: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    ids.push({ id: raw[i] as string, score: raw[i + 1] as number });
  }

  // Batch fetch all data with a pipeline
  const entries: LeaderboardEntry[] = [];
  if (ids.length > 0) {
    const pipe = redis.pipeline();
    for (const { id } of ids) {
      pipe.get(`share:${id}`);
      pipe.get(`views:${id}`);
      pipe.hgetall(`engagement:${id}`);
    }
    const results = await pipe.exec();

    for (let i = 0; i < ids.length; i++) {
      const data = results[i * 3] as { q: string; t: string } | null;
      const views = (results[i * 3 + 1] as number) || 0;
      const eng = (results[i * 3 + 2] as Record<string, string>) || {};

      if (data?.q && data?.t) {
        entries.push({
          id: ids[i].id,
          score: ids[i].score,
          views,
          engagement: {
            copy: parseInt(eng.copy || "0", 10),
            share_link: parseInt(eng.share_link || "0", 10),
            share_linkedin: parseInt(eng.share_linkedin || "0", 10),
          },
          q: data.q,
          t: data.t,
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto px-5 py-12">
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-tight mb-2">
            Top Translations
          </h1>
          <p className="text-text-tertiary text-sm">
            Most viral translations by engagement score
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="text-text-tertiary">No translations tracked yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, i) => (
              <a
                key={entry.id}
                href={`/s/${entry.id}`}
                className="block rounded-xl bg-bg-card border border-border p-5 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-text-tertiary w-8 shrink-0 text-right tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-tertiary mb-1 truncate">
                      &ldquo;{entry.q}&rdquo;
                    </p>
                    <p className="text-text line-clamp-3 text-sm leading-relaxed whitespace-pre-wrap">
                      {entry.t}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-tertiary">
                      <span title="Engagement score">
                        Score: {entry.score}
                      </span>
                      <span>{entry.views.toLocaleString()} views</span>
                      <span>{entry.engagement.copy} copies</span>
                      <span>{entry.engagement.share_link} links</span>
                      <span>{entry.engagement.share_linkedin} LinkedIn posts</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
