import type { Metadata } from "next";
import Translator from "./translator";

const siteUrl = "https://linkedintranslate.com";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; t?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q || "";
  const t = params.t || "";

  if (q && t) {
    const truncatedInput = q.slice(0, 80) + (q.length > 80 ? "..." : "");
    const truncatedOutput = t.slice(0, 150) + (t.length > 150 ? "..." : "");
    const title = `"${truncatedInput}" → LinkedIn Translate`;
    const description = truncatedOutput;
    const ogUrl = `${siteUrl}/api/og?q=${encodeURIComponent(q)}&t=${encodeURIComponent(t)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}?q=${encodeURIComponent(q)}&t=${encodeURIComponent(t)}`,
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

  return {};
}

export default function Home() {
  return <Translator />;
}
