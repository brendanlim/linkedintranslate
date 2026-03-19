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

const ALL_EXAMPLES = [
  "I got fired on my first day",
  "I lied on my resume about knowing Python",
  "I fell asleep during my own presentation",
  "I've been using ChatGPT to do my entire job",
  "I got caught watching Netflix during a Zoom call",
  "I accidentally sent a meme to the CEO",
  "I haven't updated my skills since 2019",
  "I cried in the bathroom after a standup",
  "I took credit for my intern's work",
  "I ghosted a recruiter after three rounds",
  "I said I had 'other offers' but I didn't",
  "I've been 'working from home' from Cancun",
  "I don't know what my job title actually means",
  "I broke production on a Friday at 4:59 PM",
  "I copy-paste everything from Stack Overflow",
  "I said I was a 'self-starter' but I need constant help",
  "I've been in the wrong meeting for 30 minutes",
  "I reply-all'd a complaint about my manager",
  "My 'side project' is just my full-time job",
  "I automated my job and told no one",
  "I padded my resume with fake volunteer work",
  "I got rejected from a job I was overqualified for",
  "I have no idea what a KPI is",
  "I said I was 'detail-oriented' then typo'd my name",
  "I spent my L&D budget on a masterclass about cheese",
  "I scheduled a meeting that could've been a Slack message",
  "I put 'proficient in Excel' but I only know SUM",
  "I called my boss 'Mom' on a client call",
  "I missed a deadline because I was doom-scrolling",
  "I blamed the WiFi but I was actually napping",
  "I got walked out by security for a parking dispute",
  "I was the reason for a new company policy",
  "I pretend to take notes but I'm just doodling",
  "I got demoted but told everyone it was a 'lateral move'",
  "I've been on a PIP for three months",
  "I tanked a sales pitch by forgetting the client's name",
  "I accidentally shared my screen with Tinder open",
  "I don't know what my company actually does",
  "My LinkedIn says 'open to work' but I'm not trying",
  "I used company funds for DoorDash",
  "I've attended 400 webinars and learned nothing",
  "I said I left for 'growth' but I was actually fired",
  "I printed my resignation letter on the company printer",
  "I faked a reference and they actually called",
  "I took a mental health day to play Elden Ring",
  "I put 'team player' on my resume but I hate teams",
  "I CC'd the wrong client on a roast about them",
  "I was the office microwave fish person",
  "I said I speak 'conversational Spanish' but I can't",
  "I've been expensing personal Ubers for a year",
  "I don't have imposter syndrome, I'm actually unqualified",
  "I rage-quit during an all-hands meeting",
  "I wrote a passive-aggressive Slack message to the whole channel",
  "My 'extensive network' is just LinkedIn connections I've never met",
  "I peaked at my internship",
  "I told my team I'm 'heads down' but I'm scrolling TikTok",
  "I plagiarized my entire performance review",
  "I've been faking enthusiasm in standups for months",
  "I spent my signing bonus before I even started",
  "I claimed 10 years of experience in a 5-year-old technology",
  "I wore pajama bottoms to an in-person client meeting",
  "I've been secretly interviewing during my lunch breaks",
  "I accidentally deployed my personal blog to the company server",
  "I said I was 'passionate about synergy' in an interview",
  "I got caught playing Wordle during a board presentation",
  "My greatest weakness is actually my greatest weakness",
  "I used the company Slack to plan my side hustle",
  "I've been marking emails as unread to avoid responding",
  "I said I was networking but I was at happy hour",
  "I invented a fake conference to get travel reimbursement",
  "I submitted my two weeks notice via meme",
  "I panic-merged to main without a code review",
  "I told HR the team-building event gave me food poisoning to skip it",
  "I've never once read the company handbook",
  "I blamed a production outage on 'cosmic rays'",
  "I went viral for the wrong reasons on the company Twitter",
  "I optimized a process that nobody asked me to touch",
  "I've been double-booked in meetings and attending neither",
  "I used the wrong template and pitched to our own company",
  "I said 'per my last email' and meant it violently",
  "My quarterly goals are copy-pasted from last quarter",
  "I accidentally liked my ex's LinkedIn post from 2019",
  "I've been quietly quitting before it had a name",
  "I burned through three mentors in six months",
  "I got caught using a fake background on Zoom",
  "I said I was 'leveraging AI' but I just asked ChatGPT",
  "I told the interviewer my hobby was 'continuous learning' but it's not",
  "I spent the team offsite budget on escape rooms",
  "I formatted my hard drive instead of my presentation",
  "I was the anonymous Glassdoor reviewer",
  "I asked for a raise after breaking the build 4 times",
  "I attended a conference just for the free swag",
  "I turned down a promotion because I didn't want more meetings",
  "I've been BCC'ing myself on emails for blackmail material",
  "I named a production server after my ex",
  "I deleted a shared Google doc and blamed IT",
  "I showed up to the wrong office on my first day",
  "I accidentally sent my salary expectations to the entire team",
  "I told everyone I left for a startup but it was a layoff",
  "I forgot to mute and my dog's barking crashed the earnings call",
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

  function shuffleExamples() {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    setExamples(shuffled.slice(0, 4));
  }

  useEffect(() => {
    const sharedInput = searchParams.get("q");
    const sharedOutput = searchParams.get("t");
    if (sharedInput) setInput(sharedInput);
    if (sharedOutput) {
      setOutput(sharedOutput);
      trackEvent("shared_link_arrival", { content_length: sharedOutput.length.toString() });
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

      const params = new URLSearchParams();
      params.set("q", trimmed);
      params.set("t", data.translation);
      router.replace(`?${params.toString()}`, { scroll: false });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [input, router]);

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    trackEvent("copy_translation");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShareLink() {
    if (!output) return;
    const params = new URLSearchParams();
    params.set("q", input.trim());
    params.set("t", output);
    const shareUrl = `${window.location.origin}?${params.toString()}`;
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    trackEvent("share_link");
    setTimeout(() => setLinkCopied(false), 2500);
  }

  function handleShareLinkedIn() {
    if (!output) return;
    const postText = `${output}\n\n— Translated with linkedintranslate.com`;
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=600,height=700");
    trackEvent("share_linkedin");
  }

  const charPercent = Math.min((input.length / MAX_LENGTH) * 100, 100);
  const isNearLimit = input.length > MAX_LENGTH * 0.85;
  const isAtLimit = input.length >= MAX_LENGTH;

  return (
    <div className="relative z-10 flex flex-col min-h-screen items-center justify-center px-5">
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
                    <span className="animate-pulse-glow">Optimizing Vibe...</span>
                  </>
                ) : (
                  "Translate"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Example chips — 2 rows: 2 per row */}
        <div className="mt-5 grid grid-cols-2 gap-2 max-w-2xl items-center">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => { setInput(example); trackEvent("suggestion_chip", { example }); }}
              className="px-3.5 py-1.5 text-xs text-text-tertiary bg-transparent border border-border-subtle rounded-full hover:border-border hover:text-text-secondary transition-all duration-200 truncate"
            >
              {example}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-center">
          <button
            onClick={shuffleExamples}
            className="p-1.5 text-text-tertiary hover:text-text-secondary transition-colors rounded-full"
            title="More examples"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Footer — pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center flex flex-col gap-1">
        <p className="text-xs text-text-tertiary/50">
          For entertainment purposes only.
        </p>
        <p className="text-xs text-text-tertiary/40">
          &copy; 2026 Brendan G. Lim
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
