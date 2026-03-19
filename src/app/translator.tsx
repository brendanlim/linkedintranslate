"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function gtag(...args: any[]) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag(...args);
  }
}

function trackEvent(eventName: string, params?: Record<string, string>) {
  gtag("event", eventName, params);
}

// ── URL compression: encode input+output into a compact base64 string ──

async function encodeShareUrl(origin: string, q: string, t: string): Promise<string> {
  const json = JSON.stringify({ q, t });
  const bytes = new TextEncoder().encode(json);
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  const compressed = new Uint8Array(buf);
  let b64 = btoa(String.fromCharCode(...compressed));
  b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${origin}?s=${b64}`;
}

async function decodeShareParam(s: string): Promise<{ q: string; t: string } | null> {
  try {
    // Restore standard base64
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const raw = atob(b64);
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    const ds = new DecompressionStream("deflate-raw");
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buf = await new Response(ds.readable).arrayBuffer();
    const json = new TextDecoder().decode(buf);
    const data = JSON.parse(json);
    if (data.q && data.t) return data;
    return null;
  } catch {
    return null;
  }
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

const MAX_LENGTH = 300;

const LOADING_PHRASES = [
  "Optimizing Vibe...",
  "Synergizing...",
  "Disrupting...",
  "Unlocking Potential...",
  "Circling Back...",
  "Crushing It...",
  "Moving the Needle...",
  "Pivoting...",
  "Building in Public...",
  "Failing Forward...",
  "Being Authentic...",
  "Growth Mindset...",
  "Adding Emojis...",
  "Leaning In...",
  "Unpacking This...",
  "Doubling Down...",
  "Living My Truth...",
  "Personal Branding...",
  "Ideating...",
  "Maximizing Impact...",
  "Hustle Mode...",
  "Connecting Dots...",
  "Aligning Values...",
  "Thinking Bigger...",
  "Manifesting...",
  "Taking Ownership...",
  "Leveling Up...",
  "Staying Humble...",
  "Adding Hashtags...",
  "Being Vulnerable...",
];

const ALL_EXAMPLES = [
  // Relationships & personal life colliding with work
  "My wife's boyfriend says I need a better job",
  "My wife left me for my coworker and I sit next to him",
  "My therapist fired me as a client",
  "My dog has more LinkedIn followers than me",
  "I cried during a salary negotiation and got less money",
  "My parents still don't understand what I do for a living",
  "I called my boss 'Mom' on a client call",
  "My dad got me this job and everyone knows it",
  "My ex works in HR and rejected my internal transfer",
  "I named a production server after my ex",
  "My Uber driver gave me better career advice than my mentor",
  "My landlord makes more from my apartment than I make at my job",
  "I got dumped via a Google Calendar invite",
  "My kid told his class my job is 'being on the computer'",
  "My Tinder match turned out to be my skip-level manager",

  // Absurd situations
  "I got arrested at the company holiday party",
  "I live in my car but tell people I'm doing van life",
  "I threw up on a client during a business dinner",
  "I showed up drunk to a job interview and got the job",
  "I crashed the company car into the CEO's car",
  "I accidentally shared my screen with Tinder open",
  "I started a fight in the office kitchen over a sandwich",
  "I got escorted out by security on bring-your-kid-to-work day",
  "I set off the fire alarm making ramen in the server room",
  "I fell asleep on camera and my boss watched for 20 minutes",
  "I accidentally joined a competitor's all-hands via leaked Zoom link",
  "My emotional support animal bit the VP of Engineering",
  "I got stuck in the elevator with the CEO and panicked and lied about my role",
  "I wore a costume to work and it wasn't Halloween",
  "I microwaved fish and the CEO called an emergency meeting about it",

  // Career disasters
  "I got fired on my first day",
  "I got fired over a LinkedIn post",
  "My intern makes more than me",
  "HR scheduled a meeting about me and I wasn't invited",
  "I've been on a PIP for three months",
  "I lost the company $2 million on a typo",
  "I've been lying about having a degree for 8 years",
  "I've been on 47 interviews and got zero offers",
  "I rage-quit during an all-hands meeting",
  "I peaked at my internship",

  // Fraud & deception
  "I automated my job and told no one",
  "I've been using ChatGPT to do my entire job",
  "I've been 'working from home' from Cancun",
  "My side hustle makes more than my actual job",
  "I use my work laptop exclusively for personal stuff",
  "I've been expensing personal Ubers for a year",
  "I faked a reference and they actually called",
  "I invented a fake conference to get travel money",
  "I was the anonymous Glassdoor reviewer",
  "I blamed the WiFi but I was actually napping",

  // Embarrassing moments
  "I reply-all'd a complaint about my manager",
  "I accidentally emailed my resignation to everyone",
  "I accidentally liked my ex's LinkedIn post from 2019",
  "I forgot to mute and my dog crashed the earnings call",
  "I submitted my two weeks notice via meme",
  "I said 'per my last email' and meant it violently",
  "I CC'd the wrong client on a roast about them",
  "I broke production on a Friday at 4:59 PM",
  "I formatted my hard drive instead of my presentation",
  "I accidentally sent my salary to the entire team",

  // Dark humor & existential
  "I don't have imposter syndrome, I'm actually unqualified",
  "I don't know what my company actually does",
  "My greatest weakness is actually my greatest weakness",
  "I was the reason for a new company policy",
  "I asked for a raise after breaking the build 4 times",
  "I Googled 'how to quit' on my work computer",
  "I told everyone I left for a startup but it was a layoff",
  "I've been quietly quitting before it had a name",
  "My LinkedIn says 'open to work' but I'm not trying",
  "A psychic told me to change careers and I'm considering it",
  "I have more Slack notifications than friends",
  "My company went bankrupt and I found out on Twitter",
  "I'm the highest paid person on my team and I do the least",
  "I've been employee of the month at 3 companies that no longer exist",
  "My retirement plan is hoping something goes viral",
];

function TranslatorApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [examples, setExamples] = useState<string[]>([]);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // Init theme from localStorage (default: light)
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  useEffect(() => {
    shuffleExamples();
  }, []);

  // Cycle loading phrases while translating
  useEffect(() => {
    if (!loading) return;
    setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    const interval = setInterval(() => {
      setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  function shuffleExamples() {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    setExamples(shuffled.slice(0, 4));
  }

  useEffect(() => {
    // Support both legacy ?q=&t= and new compressed ?s= format
    const s = searchParams.get("s");
    const legacyQ = searchParams.get("q");
    const legacyT = searchParams.get("t");

    if (s) {
      decodeShareParam(s).then((data) => {
        if (data) {
          setInput(data.q);
          setOutput(data.t);
          trackEvent("shared_link_arrival", { content_length: data.t.length.toString() });
        }
      });
    } else if (legacyQ) {
      setInput(legacyQ);
      if (legacyT) {
        setOutput(legacyT);
        trackEvent("shared_link_arrival", { content_length: legacyT.length.toString() });
      }
    }
  }, [searchParams]);

  const handleTranslate = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setOutput(data.translation);
      trackEvent("translate", { input_length: trimmed.length.toString() });

      // Update URL with short link
      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: trimmed, t: data.translation }),
        });
        const shareData = await res.json();
        if (shareData.id) {
          window.history.replaceState(null, "", `/s/${shareData.id}`);
        }
      } catch {
        // Silent fail — URL just won't update
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [input, router]);

  function copyToClipboard(text: string): boolean {
    // Try modern API first
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text);
      });
      return true;
    }
    return fallbackCopy(text);
  }

  function fallbackCopy(text: string): boolean {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  function handleCopy() {
    if (!output) return;
    copyToClipboard(output);
    setCopied(true);
    trackEvent("copy_translation");
    setTimeout(() => setCopied(false), 2000);
  }

  async function getShortUrl(): Promise<string> {
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: input.trim(), t: output }),
      });
      const data = await res.json();
      if (data.id) {
        return `${window.location.origin}/s/${data.id}`;
      }
    } catch {
      // Fall back to compressed URL
    }
    return await encodeShareUrl(window.location.origin, input.trim(), output);
  }

  async function handleShareLink() {
    if (!output) return;

    // Use the current URL if we already have a short link, otherwise build a fallback
    const currentPath = window.location.pathname;
    const immediateUrl = currentPath.startsWith("/s/")
      ? window.location.href
      : `${window.location.origin}?q=${encodeURIComponent(input.trim())}&t=${encodeURIComponent(output)}`;

    // Copy immediately (synchronous from user gesture — required on mobile)
    copyToClipboard(immediateUrl);
    setLinkCopied(true);
    trackEvent("share_link");
    setTimeout(() => setLinkCopied(false), 2500);

    // Then try to get a short URL and re-copy it
    try {
      const shortUrl = await getShortUrl();
      if (shortUrl !== immediateUrl) {
        copyToClipboard(shortUrl);
      }
    } catch {
      // Already copied the fallback URL, so this is fine
    }
  }

  async function handleShareLinkedIn() {
    if (!output) return;
    try {
      const shortUrl = await getShortUrl();
      const postText = `${output}\n\n— Translated with ${shortUrl}`;
      const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
      window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=600,height=700");
      trackEvent("share_linkedin");
    } catch (err) {
      console.error("LinkedIn share failed:", err);
    }
  }

  const charPercent = Math.min((input.length / MAX_LENGTH) * 100, 100);
  const isNearLimit = input.length > MAX_LENGTH * 0.85;
  const isAtLimit = input.length >= MAX_LENGTH;

  return (
    <div className="relative z-10 flex flex-col min-h-screen items-center pt-[12vh] px-5">
      {/* Theme toggle — top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 text-text-tertiary hover:text-text-secondary transition-colors rounded-lg hover:bg-bg-card"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Logo + Title — centered above the input like Google */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tight">Li</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-text tracking-tight">
            LinkedIn Translate
          </h1>
        </div>
        <p className="text-text-tertiary text-sm">
          What actually happened?
        </p>
      </div>

      {/* The Main Input Card — the star of the show */}
      <div className="w-full max-w-2xl">
        <div className="input-card rounded-2xl bg-bg-card border border-border overflow-hidden transition-all duration-300 focus-within:border-accent/40">
          <div className="p-5">
            <textarea
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= MAX_LENGTH) {
                  setInput(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
              placeholder="I got fired for falling asleep during a board meeting..."
              className="w-full min-h-[100px] resize-none text-text text-lg leading-relaxed bg-transparent placeholder:text-text-tertiary/70 font-[family-name:var(--font-body)]"
              maxLength={MAX_LENGTH}
            />
          </div>

          {/* Input footer */}
          <div className="px-5 py-3 flex items-center justify-between border-t border-border-subtle">
            <div className="flex items-center gap-2.5">
              <div className="relative w-[18px] h-[18px]">
                <svg className="w-[18px] h-[18px] -rotate-90" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />
                  <circle
                    cx="10" cy="10" r="8" fill="none"
                    strokeWidth="2" strokeLinecap="round"
                    className={isAtLimit ? "text-error" : isNearLimit ? "text-amber-400" : "text-text-tertiary"}
                    strokeDasharray={`${charPercent * 0.5027} 50.27`}
                    style={{ transition: "stroke-dasharray 0.15s ease" }}
                  />
                </svg>
              </div>
              <span className={`text-xs tabular-nums ${isAtLimit ? "text-error" : isNearLimit ? "text-amber-400" : "text-text-tertiary"}`}>
                {input.length}/{MAX_LENGTH}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-[11px] text-text-tertiary/50 font-mono">
                {"\u2318"}+Enter
              </span>
              <button
                onClick={handleTranslate}
                disabled={loading || !input.trim()}
                className="btn-glow inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-accent to-cyan-500 text-white rounded-full text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:brightness-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="animate-pulse-glow">{loadingPhrase}</span>
                  </>
                ) : (
                  "Translate"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Example chips — 2x2 grid + shuffle inline */}
        <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-2xl">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => { setInput(example); trackEvent("suggestion_chip", { example }); }}
              className="px-3.5 py-1.5 text-xs text-text-tertiary bg-transparent border border-border-subtle rounded-full hover:border-border hover:text-text-secondary transition-all duration-200 max-w-[calc(50%-4px)] truncate"
            >
              {example}
            </button>
          ))}
          <button
            onClick={shuffleExamples}
            className="px-3.5 py-1.5 text-xs text-text-tertiary bg-transparent border border-border-subtle rounded-full hover:border-border hover:text-text-secondary transition-all duration-200"
            title="More examples"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Output — slides in below when there's a result */}
      {(output || error || loading) && (
        <div className="w-full max-w-2xl mt-8 animate-fade-up">
          <div className="rounded-2xl bg-bg-card border border-border overflow-hidden">
            {/* Output header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-border-subtle">
              <span className="text-xs text-text-tertiary uppercase tracking-widest font-medium">
                LinkedIn Version
              </span>
              {output && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:bg-bg-card-hover rounded-lg transition-all"
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleShareLink}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:bg-bg-card-hover rounded-lg transition-all"
                  >
                    {linkCopied ? <CheckIcon /> : <ShareIcon />}
                    {linkCopied ? "Copied" : "Link"}
                  </button>
                  <button
                    onClick={handleShareLinkedIn}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#70b5f9] hover:text-[#9ccbfc] hover:bg-bg-card-hover rounded-lg transition-all"
                  >
                    <LinkedInIcon />
                    Post
                  </button>
                </div>
              )}
            </div>

            {/* Output body */}
            <div className="p-5 relative group">
              {error ? (
                <div className="text-error text-sm bg-error/10 rounded-xl p-4 border border-error/20">
                  {error}
                </div>
              ) : output ? (
                <>
                  <div
                    className="text-text text-base leading-relaxed whitespace-pre-wrap cursor-text select-all font-[family-name:var(--font-body)]"
                    onClick={(e) => {
                      const sel = window.getSelection();
                      const range = document.createRange();
                      range.selectNodeContents(e.currentTarget);
                      sel?.removeAllRanges();
                      sel?.addRange(range);
                    }}
                  >
                    {output}
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-bg-card border border-border rounded-lg shadow-lg hover:bg-bg-card-hover transition-colors"
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="shimmer h-4 rounded-full w-full" />
                  <div className="shimmer h-4 rounded-full w-11/12" />
                  <div className="shimmer h-4 rounded-full w-4/5" />
                  <div className="shimmer h-4 rounded-full w-full" style={{ animationDelay: "0.1s" }} />
                  <div className="shimmer h-4 rounded-full w-3/4" style={{ animationDelay: "0.2s" }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="w-full py-6 mt-auto text-center">
        <p className="text-xs text-text-tertiary/50">
          For entertainment purposes only. &copy; 2026 Brendan G. Lim
        </p>
      </div>
    </div>
  );
}

export default function Translator() {
  return (
    <Suspense>
      <TranslatorApp />
    </Suspense>
  );
}
