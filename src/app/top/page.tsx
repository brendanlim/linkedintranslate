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
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <a href="/" className="flex items-center gap-2.5 mb-4 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">Lt</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg text-text-secondary">
              LinkedIn Translate
            </span>
          </a>
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl tracking-tight mb-1">
            Top Translations
          </h1>
          <p className="text-text-tertiary text-sm">
            Most viral translations by engagement
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="text-text-tertiary">No translations tracked yet.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <a
                key={entry.id}
                href={`/s/${entry.id}`}
                className="block rounded-xl bg-bg-card border border-border p-4 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-lg font-bold text-text-tertiary tabular-nums shrink-0">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-text-secondary font-medium line-clamp-2">
                    &ldquo;{entry.q}&rdquo;
                  </p>
                </div>
                <p className="text-text line-clamp-3 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                  {entry.t}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
                  <span>{entry.views.toLocaleString()} views</span>
                  <span className="hidden sm:inline">&middot;</span>
                  <span>{entry.engagement.copy} copies</span>
                  <span className="hidden sm:inline">&middot;</span>
                  <span>{entry.engagement.share_link} links</span>
                  <span className="hidden sm:inline">&middot;</span>
                  <span>{entry.engagement.share_linkedin} posts</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
