"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Logo SVG ─── */
function Logo({ size = 28 }: { size?: number }) {
  const h = Math.round((size * 34) / 32);
  return (
    <svg width={size} height={h} viewBox="0 0 32 34" fill="none">
      <path
        d="M16 31C16 31 2 21.5 2 12C2 7 6 3 11 3C13.4 3 15.5 4.1 16 5.8C16.5 4.1 18.6 3 21 3C26 3 30 7 30 12C30 21.5 16 31 16 31Z"
        fill="#E05835"
      />
      <line x1="13" y1="9" x2="13" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="8" x2="16" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="19" y1="9" x2="19" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 13 Q16 15.5 19 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <line x1="16" y1="15" x2="16" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const TOTAL = 5;

/* ─── Bottom navigation bar (inside each slide) ─── */
function BottomBar({
  active,
  scrollTo,
}: {
  active: number;
  scrollTo: (i: number) => void;
}) {
  return (
    <div className="border-t border-border/40 flex-shrink-0">
      <div className="max-w-xl mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
        {/* Persistent brand tagline */}
        <p
          style={{ fontFamily: "var(--font-fraunces)" }}
          className="text-xs text-muted-foreground italic leading-snug"
        >
          Built for two.{" "}
          <span className="hidden sm:inline">Perfect for any group.</span>
          <span className="sm:hidden">
            <br />Perfect for any group.
          </span>
        </p>

        {/* Back · Dots · Next */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {active > 0 ? (
            <button
              onClick={() => scrollTo(active - 1)}
              className="w-7 h-7 rounded-full border border-border text-muted-foreground flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              aria-label="Previous"
            >
              <ArrowLeft className="h-3 w-3" />
            </button>
          ) : (
            <div className="w-7" />
          )}

          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-5 bg-primary" : "w-1.5 bg-border"
                )}
              />
            ))}
          </div>

          {active < TOTAL - 1 ? (
            <button
              onClick={() => scrollTo(active + 1)}
              className="w-7 h-7 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              aria-label="Next"
            >
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <div className="w-7" />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide shell: full-screen card + bottom bar ─── */
function Slide({
  children,
  active,
  scrollTo,
  bg = "bg-card",
  centerContent = false,
}: {
  children: React.ReactNode;
  active: number;
  scrollTo: (i: number) => void;
  bg?: string;
  centerContent?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-screen h-full flex-shrink-0 snap-start flex flex-col",
        bg
      )}
    >
      {/* Content area */}
      <div
        className={cn(
          "flex-1 min-h-0 flex flex-col px-6 lg:px-10 pt-8 max-w-xl mx-auto w-full",
          centerContent && "items-center justify-center text-center"
        )}
      >
        {children}
      </div>

      {/* Navigation always inside the slide */}
      <BottomBar active={active} scrollTo={scrollTo} />
    </div>
  );
}

function NumBadge({ n }: { n: string }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-primary text-primary text-[11px] font-semibold mb-5 flex-shrink-0">
      {n}
    </span>
  );
}

/* ════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════ */
export default function LandingPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollTo(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActive(i);
  }

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.max(0, Math.min(TOTAL - 1, i)));
  }

  const nav = { active, scrollTo };

  return (
    <div className="h-[100dvh] overflow-hidden">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex h-full overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >

        {/* ──────────────── SLIDE 1 · Hero ──────────────── */}
        <Slide {...nav}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8 flex-shrink-0">
            <Logo size={26} />
            <span
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="text-xl font-bold text-foreground"
            >
              Foodmates
            </span>
          </div>

          <NumBadge n="01" />

          <h2
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-4xl lg:text-5xl font-bold leading-tight text-foreground flex-shrink-0"
          >
            Your private
            <br />culinary space
          </h2>

          <p
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-base text-primary italic mt-2 leading-snug flex-shrink-0"
          >
            Made for couples.
            <br />Perfect for any group.
          </p>

          <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-shrink-0">
            Save, organize and discover restaurants and recipes — all in one private space.
          </p>

          {/* Illustration */}
          <div className="mt-5 rounded-2xl overflow-hidden bg-[#EAD8C8] flex-1 min-h-0 relative flex flex-col items-center justify-center">
            <div className="flex gap-4 text-5xl select-none">
              <span>👩‍🍳</span>
              <span>👨‍🍳</span>
            </div>
            <div className="text-5xl select-none mt-1">🍝</div>
            <div className="absolute bottom-4 left-4">
              <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 text-xs font-medium shadow-sm">
                Where are we eating tonight? 🍴
              </div>
            </div>
          </div>
        </Slide>

        {/* ──────────────── SLIDE 2 · Save ──────────────── */}
        <Slide {...nav}>
          <NumBadge n="02" />

          <h2
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-4xl lg:text-5xl font-bold leading-tight text-foreground flex-shrink-0"
          >
            Save from
            <br />anywhere
          </h2>

          <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-shrink-0">
            Clip recipes from any website, Instagram, TikTok or blog in one click.
          </p>

          <div className="flex gap-2 mt-4 flex-shrink-0">
            {[
              { icon: "🔗", label: "Link" },
              { icon: "📸", label: "Instagram" },
              { icon: "🎵", label: "TikTok" },
              { icon: "🌐", label: "Web" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                title={label}
                className="w-11 h-11 rounded-xl border border-border bg-muted/40 flex items-center justify-center text-xl"
              >
                {icon}
              </div>
            ))}
          </div>

          {/* Browser mockup */}
          <div className="mt-5 rounded-xl border border-border bg-background overflow-hidden flex-1 min-h-0 flex flex-col shadow-sm">
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border bg-muted/40 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-red-400/80" />
              <div className="w-2 h-2 rounded-full bg-amber-400/80" />
              <div className="w-2 h-2 rounded-full bg-green-400/80" />
              <div className="flex-1 ml-2 bg-background rounded text-[10px] text-muted-foreground px-2 py-0.5 truncate">
                www.giallozafferano.it/ricette/carbonara
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-primary text-white text-xs font-semibold rounded-lg px-3 py-2 w-fit">
                <Logo size={14} />
                <span>Save to Foodmates</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-lg bg-[#EAD8C8] flex items-center justify-center text-2xl flex-shrink-0">
                  🍝
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Spaghetti alla Carbonara</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">15 min · Easy</p>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        {/* ──────────────── SLIDE 3 · Organize ──────────────── */}
        <Slide {...nav}>
          <NumBadge n="03" />

          <h2
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-4xl lg:text-5xl font-bold leading-tight text-foreground flex-shrink-0"
          >
            Organize what
            <br />you love
          </h2>

          <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-shrink-0">
            Keep all your restaurants and recipes beautifully organized and easy to find.
          </p>

          <div className="flex gap-2 mt-4 flex-shrink-0">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary text-white flex items-center gap-1.5">
              🍽️ Restaurants
            </span>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-border text-muted-foreground flex items-center gap-1.5">
              📖 Recipes
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 flex-1 min-h-0 content-start overflow-hidden">
            {[
              { name: "Padella Borough", sub: "London", emoji: "🍕" },
              { name: "10 Greek Street", sub: "London", emoji: "🥗" },
              { name: "Cacio e Pepe", sub: "20 min · Easy", emoji: "🍝" },
              { name: "Tiramisù", sub: "30 min · Medium", emoji: "🍮" },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-border bg-background overflow-hidden"
              >
                <div className="h-14 bg-[#EAD8C8] flex items-center justify-center text-2xl">
                  {item.emoji}
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-[11px] font-semibold text-foreground leading-tight line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Slide>

        {/* ──────────────── SLIDE 4 · Share ──────────────── */}
        <Slide {...nav}>
          <NumBadge n="04" />

          <h2
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-4xl lg:text-5xl font-bold leading-tight text-foreground flex-shrink-0"
          >
            Share and decide
            <br />together
          </h2>

          <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-shrink-0">
            Create a space for just you two, or invite your partner, friends or family.
          </p>

          <div className="flex items-center mt-5 flex-shrink-0">
            {["👩🏻", "👨🏼", "👩🏾"].map((emoji, i) => (
              <div
                key={i}
                className={cn(
                  "w-11 h-11 rounded-full bg-[#EAD8C8] border-2 border-card flex items-center justify-center text-xl",
                  i > 0 ? "-ml-2" : ""
                )}
              >
                {emoji}
              </div>
            ))}
            <div className="w-9 h-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-sm font-medium ml-2">
              +
            </div>
          </div>

          <div className="mt-4 bg-[#F0F6F2] rounded-2xl rounded-tl-sm px-4 py-3 w-fit max-w-[220px] flex-shrink-0">
            <p className="text-xs font-medium text-foreground leading-snug">
              &ldquo;Let&apos;s go here this Saturday?&rdquo; ♥
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background overflow-hidden flex-1 min-h-0">
            <div className="h-28 bg-gradient-to-br from-[#C8B8A2] to-[#A89282] flex items-center justify-center">
              <span className="text-5xl">🏛️</span>
            </div>
            <div className="p-3">
              <p
                className="text-sm font-semibold text-foreground leading-tight"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                L&apos;Antica Pizzeria
                <br />da Michele
              </p>
              <p className="text-xs text-muted-foreground mt-1">Naples</p>
            </div>
          </div>
        </Slide>

        {/* ──────────────── SLIDE 5 · Login / Sign up ──────────────── */}
        <Slide {...nav} bg="bg-[#FBEEE6]" centerContent>
          <Logo size={56} />

          <h1
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mt-6"
          >
            Built for two.
            <br />Perfect for
            <br />any group.
          </h1>

          <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-xs">
            Your private culinary space — save restaurants and recipes you love, together.
          </p>

          <div className="flex gap-3 mt-8 w-full max-w-xs">
            <Link
              href="/login"
              className="flex-1 py-3.5 rounded-xl border border-foreground/80 text-foreground text-sm font-semibold text-center hover:bg-foreground/5 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login?tab=signup"
              className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold text-center hover:bg-primary/90 transition-colors"
            >
              Sign up
            </Link>
          </div>

          <p className="text-[11px] text-muted-foreground mt-5 flex items-center gap-1.5">
            <span>🔒</span> Private by default. Always.
          </p>
        </Slide>

      </div>
    </div>
  );
}
