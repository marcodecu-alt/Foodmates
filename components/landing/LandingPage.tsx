"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Link2, BookOpen, UtensilsCrossed } from "lucide-react";

/* ─── Logo ─── */
function Logo({ size = 28 }: { size?: number }) {
  const h = Math.round((size * 34) / 32);
  return (
    <svg width={size} height={h} viewBox="0 0 32 34" fill="none">
      <path d="M16 31C16 31 2 21.5 2 12C2 7 6 3 11 3C13.4 3 15.5 4.1 16 5.8C16.5 4.1 18.6 3 21 3C26 3 30 7 30 12C30 21.5 16 31 16 31Z" fill="#E05835" />
      <line x1="13" y1="9" x2="13" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="8" x2="16" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="19" y1="9" x2="19" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 13 Q16 15.5 19 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <line x1="16" y1="15" x2="16" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NumBadge({ n, dark }: { n: string; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold flex-shrink-0 ${dark ? "border-white/70 text-white" : "border-primary text-primary"}`}>
      {n}
    </span>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function InstagramIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
}
function TikTokIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.28a8.29 8.29 0 004.85 1.56V7.38a4.85 4.85 0 01-1.08-.69z" /></svg>;
}

/* ─── Slide content components ─── */
function SlideHero() {
  return (
    <div className="relative h-full overflow-hidden">
      {/* Full-bleed background photo */}
      <img
        src="/images/hero.png"
        alt="Couple cooking"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />
      {/* Gradient: light scrim at top, heavy at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/80" />

      {/* Top badge */}
      <div className="absolute top-6 left-6">
        <NumBadge n="01" dark />
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-7">
        <h2 style={{ fontFamily: "var(--font-fraunces)" }} className="text-[1.9rem] font-bold leading-tight text-white">
          Your private<br />culinary space
        </h2>
        <p style={{ fontFamily: "var(--font-fraunces)" }} className="text-base text-orange-200 italic mt-1.5 leading-snug font-medium">
          Made for couples.<br />Perfect for any group.
        </p>
        <p className="text-sm text-white/75 leading-relaxed mt-2">
          Save, organize and discover restaurants and recipes — all in one private space.
        </p>
        <div className="mt-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-lg w-fit">
            <p className="text-xs font-semibold text-foreground">What are we cooking tonight? 🍳</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideSave() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 pt-6 pb-4">
        <NumBadge n="02" />
        <h2 style={{ fontFamily: "var(--font-fraunces)" }} className="text-[1.9rem] font-bold leading-tight text-foreground mt-4">
          Save from<br />anywhere
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Clip recipes from any website, Instagram or blog in one tap.
        </p>
        <div className="flex gap-2 mt-4">
          {[
            <Link2 className="h-4 w-4 text-muted-foreground" key="link" />,
            <InstagramIcon key="ig" />,
            <TikTokIcon key="tt" />,
            <svg key="web" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-muted-foreground"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
          ].map((icon, i) => (
            <div key={i} className="w-10 h-10 rounded-xl border border-border bg-muted/30 flex items-center justify-center">{icon}</div>
          ))}
        </div>
      </div>

      {/* Big food photo with save card floating over */}
      <div className="flex-1 min-h-0 mx-5 mb-5 rounded-2xl overflow-hidden relative shadow-md">
        <img
          src="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=700&q=85&auto=format&fit=crop"
          alt="Carbonara"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Floating save card */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white rounded-2xl p-3 shadow-xl flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=100&q=80&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">Spaghetti alla Carbonara</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">15 min · Easy</p>
            </div>
            <div className="flex items-center gap-1.5 bg-primary text-white rounded-xl px-3 py-2 flex-shrink-0">
              <Logo size={11} />
              <span className="text-[11px] font-semibold">Save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ORGANIZE_ITEMS = [
  { name: "Padella Borough Market", sub: "London", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=85&auto=format&fit=crop" },
  { name: "10 Greek Street", sub: "London", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=85&auto=format&fit=crop" },
  { name: "Cacio e Pepe", sub: "20 min · Easy", img: "https://images.unsplash.com/photo-1551183053-bf91798d047b?w=300&q=85&auto=format&fit=crop" },
  { name: "Tiramisù", sub: "30 min · Medium", img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&q=85&auto=format&fit=crop" },
];

function SlideOrganize() {
  return (
    <div className="flex flex-col h-full p-5 bg-[#FAF6F2]">
      <NumBadge n="03" />
      <h2 style={{ fontFamily: "var(--font-fraunces)" }} className="text-[1.9rem] font-bold leading-tight text-foreground mt-4">
        Organize what<br />you love
      </h2>
      <div className="flex gap-2 mt-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-primary text-white">
          <UtensilsCrossed className="h-3 w-3" />Restaurants
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full border border-border text-muted-foreground bg-white">
          <BookOpen className="h-3 w-3" />Recipes
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 mt-3 flex-1 content-start">
        {ORGANIZE_ITEMS.map((item) => (
          <div key={item.name} className="rounded-2xl bg-white overflow-hidden shadow-sm border border-border/40">
            <div className="h-24 overflow-hidden relative">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center">
                <HeartIcon className="h-3 w-3 text-primary" />
              </div>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[11px] font-bold text-foreground leading-tight">{item.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&auto=format&fit=crop&crop=face",
];

function SlideShare() {
  return (
    <div className="relative h-full overflow-hidden">
      {/* Full-bleed restaurant photo */}
      <img
        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=85&auto=format&fit=crop"
        alt="Restaurant"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/80" />

      {/* Top: badge + avatar stack */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <NumBadge n="04" dark />
        <div className="flex items-center">
          {AVATARS.map((src, i) => (
            <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm" style={{ marginLeft: i > 0 ? "-8px" : "0" }}>
              <img src={src} alt="Member" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center text-white text-xs font-bold ml-1.5">+</div>
        </div>
      </div>

      {/* Middle: chat bubble */}
      <div className="absolute left-6" style={{ top: "42%" }}>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 shadow-xl max-w-[200px]">
          <p className="text-xs font-semibold text-foreground">&ldquo;Let&apos;s go here this Saturday?&rdquo; ♥</p>
        </div>
        <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow mt-2 ml-auto">
          <img src={AVATARS[1]} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Bottom: text */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-7">
        <h2 style={{ fontFamily: "var(--font-fraunces)" }} className="text-[1.9rem] font-bold leading-tight text-white">
          Share and decide<br />together
        </h2>
        <p className="text-sm text-white/75 leading-relaxed mt-2">
          Invite your partner, friends or family and plan meals together.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   Main carousel
════════════════════════════════════════════════════ */
const SLIDES = [SlideHero, SlideSave, SlideOrganize, SlideShare];
const TOTAL = SLIDES.length;

export default function LandingPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const signupHref = next ? `/login?tab=signup&next=${encodeURIComponent(next)}` : "/login?tab=signup";

  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(375);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setContainerW(el.offsetWidth));
    obs.observe(el);
    setContainerW(el.offsetWidth);
    return () => obs.disconnect();
  }, []);

  const PEEK = 28;   // px of adjacent card visible on each side
  const GAP = 12;    // px gap between cards
  const cardW = Math.max(100, containerW - PEEK * 2);
  const translateX = PEEK - current * (cardW + GAP);

  const goTo = useCallback((i: number) => {
    setCurrent(Math.max(0, Math.min(TOTAL - 1, i)));
  }, []);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 5) isDragging.current = true;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!isDragging.current) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 48) goTo(dx > 0 ? current + 1 : current - 1);
  }

  return (
    <div className="bg-[#F0EBE3] min-h-dvh flex flex-col items-center justify-center">
    <div className="bg-[#FAF6F2] w-full max-w-[430px] h-dvh md:h-[88vh] md:max-h-[860px] flex flex-col overflow-hidden md:rounded-3xl md:shadow-2xl">

      {/* ── Header ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 h-14 bg-[#FAF6F2]">
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <span style={{ fontFamily: "var(--font-fraunces)" }} className="text-xl font-bold text-foreground">Foodmates</span>
        </div>
      </header>

      {/* ── Carousel ── */}
      <main
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Track */}
        <div
          className="flex h-full"
          style={{
            gap: GAP,
            transform: `translateX(${translateX}px)`,
            transition: "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            willChange: "transform",
          }}
        >
          {SLIDES.map((Slide, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-full py-2"
              style={{ width: cardW }}
              onClick={() => i !== current && goTo(i)}
            >
              <div
                className="h-full rounded-3xl overflow-hidden shadow-lg transition-all duration-450"
                style={{
                  opacity: i === current ? 1 : 0.55,
                  transform: i === current ? "scale(1)" : "scale(0.97)",
                  transition: "opacity 0.45s ease, transform 0.45s ease",
                }}
              >
                <Slide />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop arrows */}
        {current > 0 && (
          <button
            onClick={() => goTo(current - 1)}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md items-center justify-center hover:shadow-lg z-10 transition-shadow"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        {current < TOTAL - 1 && (
          <button
            onClick={() => goTo(current + 1)}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md items-center justify-center hover:shadow-lg z-10 transition-shadow"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        )}
      </main>

      {/* ── Footer: dots + CTA ── */}
      <footer className="flex-shrink-0 flex flex-col items-center gap-4 px-5 pt-3 pb-6 bg-[#FAF6F2]">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: 8,
                height: 8,
                background: i === current ? "#E05835" : "rgba(0,0,0,0.18)",
              }}
            />
          ))}
        </div>

        {/* CTA row */}
        <div className="flex items-center gap-3 w-full max-w-sm">
          <Link
            href={loginHref}
            className="flex-1 py-3.5 rounded-2xl border border-foreground/20 text-center text-sm font-semibold text-foreground hover:bg-foreground/5 transition-colors"
          >
            Log in
          </Link>
          <Link
            href={signupHref}
            className="flex-1 py-3.5 rounded-2xl bg-primary text-white text-center text-sm font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors shadow-sm"
          >
            Sign up
          </Link>
        </div>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <span>🔒</span> Private by default. Always.
        </p>
      </footer>

    </div>
    </div>
  );
}
