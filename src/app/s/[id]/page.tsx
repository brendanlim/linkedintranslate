import { redis } from "@/lib/redis";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ShareRedirect from "./redirect";
const siteUrl = "https://linkedintranslate.com";

function cleanText(text: string): string {
  return text.replace(/\0/g, "").replace(/[^\P{C}\n]/gu, "").trim();
}

async function getShareData(
  id: string
): Promise<{ q: string; t: string } | null> {
  try {
    const raw = await redis.get<{ q: string; t: string } | string>(`share:${id}`);
    if (!raw) return null;
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!data.q || !data.t) return null;
    return { q: cleanText(data.q), t: cleanText(data.t) };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getShareData(id);

  if (!data) return {};

  const truncatedInput =
    data.q.slice(0, 80) + (data.q.length > 80 ? "..." : "");
  const truncatedOutput =
    data.t.slice(0, 150) + (data.t.length > 150 ? "..." : "");
  const title = `"${truncatedInput}" → LinkedIn Translate`;
  const description = truncatedOutput;
  const ogUrl = `${siteUrl}/api/og?q=${encodeURIComponent(data.q)}&t=${encodeURIComponent(data.t)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/s/${id}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getShareData(id);

  if (!data) {
    redirect("/");
  }

  // Track view + update leaderboard (fire-and-forget)
  redis.incr(`views:${id}`).catch(() => {});
  redis.zincrby("leaderboard", 1, id).catch(() => {});

  return <ShareRedirect q={data.q} t={data.t} />;
}
