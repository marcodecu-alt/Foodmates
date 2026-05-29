"use client";

import Link from "next/link";
import { Menu, Link2, BookOpen, UtensilsCrossed } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Logo
───────────────────────────────────────────────────────────── */
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

function NumBadge({ n }: { n: string }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary text-primary text-xs font-bold tracking-wide flex-shrink-0">
      {n}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Small SVG icons used in Panel 02
───────────────────────────────────────────────────────────── */
function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.28a8.29 8.29 0 004.85 1.56V7.38a4.85 4.85 0 01-1.08-.69z" />
    </svg>
  );
}

function BrowserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-muted-foreground">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 01 — Hero
───────────────────────────────────────────────────────────── */
function PanelHero() {
  return (
    <section className="flex flex-col gap-4 px-6 py-7 md:px-8 md:py-8 md:h-full bg-[#FAF6F2]">
      <NumBadge n="01" />

      <div className="flex-shrink-0">
        <h2
          style={{ fontFamily: "var(--font-fraunces)" }}
          className="text-[2rem] lg:text-[2.25rem] font-bold leading-tight text-foreground"
        >
          Your private
          <br />culinary space
        </h2>
        <p
          style={{ fontFamily: "var(--font-fraunces)" }}
          className="text-base text-primary italic mt-2 leading-snug font-medium"
        >
          Made for couples.
          <br />Perfect for any group.
        </p>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed flex-shrink-0">
        Save, organize and discover restaurants and recipes — all in one private space.
      </p>

      {/* Photo */}
      <div className="flex-1 min-h-[220px] md:min-h-0 rounded-2xl overflow-hidden relative">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=82&auto=format&fit=crop"
          alt="Couple cooking together"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {/* Chat bubble */}
        <div className="absolute bottom-4 left-4 right-4 flex">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-lg">
            <p className="text-xs font-semibold text-foreground">Where are we eating tonight? 🍴</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 02 — Save from anywhere
───────────────────────────────────────────────────────────── */
function PanelSave() {
  return (
    <section className="flex flex-col gap-4 px-6 py-7 md:px-8 md:py-8 md:h-full bg-white border-t md:border-t-0 border-[#EDE0D8]">
      <NumBadge n="02" />

      <div className="flex-shrink-0">
        <h2
          style={{ fontFamily: "var(--font-fraunces)" }}
          className="text-[2rem] lg:text-[2.25rem] font-bold leading-tight text-foreground"
        >
          Save from
          <br />anywhere
        </h2>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed flex-shrink-0">
        Clip recipes from any website, Instagram, TikTok or blog in one click.
      </p>

      {/* Source icons */}
      <div className="flex gap-2 flex-shrink-0">
        {[
          { icon: <Link2 className="h-4 w-4 text-muted-foreground" />, label: "Link" },
          { icon: <InstagramIcon />, label: "Instagram" },
          { icon: <TikTokIcon />, label: "TikTok" },
          { icon: <BrowserIcon />, label: "Browser" },
        ].map(({ icon, label }) => (
          <div
            key={label}
            title={label}
            className="w-11 h-11 rounded-xl border border-border bg-muted/30 flex items-center justify-center"
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Browser mockup */}
      <div className="flex-1 min-h-[200px] md:min-h-0 rounded-xl border border-border overflow-hidden flex flex-col shadow-sm bg-white">
        {/* Chrome bar */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border bg-[#F5F4F2] flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-red-400/80" />
          <div className="w-2 h-2 rounded-full bg-amber-400/80" />
          <div className="w-2 h-2 rounded-full bg-green-400/80" />
          <div className="flex-1 ml-2 bg-white rounded-md text-[10px] text-muted-foreground px-2 py-1 truncate border border-border/40">
            www.giallozafferano.it/ricette/carbonara
          </div>
        </div>

        {/* Page content + overlay */}
        <div className="flex-1 flex flex-col p-4 gap-3 relative overflow-hidden">
          {/* Faint page lines */}
          <div className="absolute inset-0 pt-4 px-4 space-y-2 pointer-events-none opacity-[0.07]">
            <div className="h-3 rounded bg-foreground w-3/4" />
            <div className="h-2.5 rounded bg-foreground w-1/2" />
            <div className="h-2.5 rounded bg-foreground w-5/6" />
            <div className="h-20 rounded bg-foreground mt-2" />
          </div>

          {/* Floating "Save to Foodmates" button */}
          <div className="relative z-10 flex-shrink-0">
            <div className="flex items-center gap-2 bg-primary text-white text-xs font-semibold rounded-xl px-3.5 py-2 w-fit shadow-md">
              <Logo size={13} />
              <span>Save to Foodmates</span>
            </div>
          </div>

          {/* Detected recipe */}
          <div className="relative z-10 flex gap-3 items-center flex-shrink-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=120&q=80&auto=format&fit=crop"
                alt="Spaghetti alla Carbonara"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">Spaghetti alla Carbonara</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">15 min · Easy</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 03 — Organize what you love
───────────────────────────────────────────────────────────── */
const ORGANIZE_ITEMS = [
  {
    name: "Padella Borough\nMarket",
    sub: "London",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=220&q=80&auto=format&fit=crop",
  },
  {
    name: "10 Greek Street",
    sub: "London",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=220&q=80&auto=format&fit=crop",
  },
  {
    name: "Cacio e Pepe",
    sub: "20 min · Easy",
    img: "https://images.unsplash.com/photo-1551183053-bf91798d047b?w=220&q=80&auto=format&fit=crop",
  },
  {
    name: "Tiramisù",
    sub: "30 min · Medium",
    img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=220&q=80&auto=format&fit=crop",
  },
];

function PanelOrganize() {
  return (
    <section className="flex flex-col gap-4 px-6 py-7 md:px-8 md:py-8 md:h-full bg-[#FAF6F2] border-t md:border-t-0 border-[#EDE0D8]">
      <NumBadge n="03" />

      <div className="flex-shrink-0">
        <h2
          style={{ fontFamily: "var(--font-fraunces)" }}
          className="text-[2rem] lg:text-[2.25rem] font-bold leading-tight text-foreground"
        >
          Organize what
          <br />you love
        </h2>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed flex-shrink-0">
        Keep all your restaurants and recipes beautifully organized and easy to find.
      </p>

      {/* Tab pills */}
      <div className="flex gap-2 flex-shrink-0">
        <span className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-primary text-white">
          <UtensilsCrossed className="h-3 w-3" />
          Restaurants
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full border border-border text-muted-foreground bg-white">
          <BookOpen className="h-3 w-3" />
          Recipes
        </span>
      </div>

      {/* 2×2 card grid */}
      <div className="grid grid-cols-2 gap-2 flex-1 content-start">
        {ORGANIZE_ITEMS.map((item) => (
          <div key={item.name} className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
            <div className="h-[68px] overflow-hidden">
              <img
                src={item.img}
                alt={item.name.replace("\n", " ")}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="px-2.5 py-2 flex items-start justify-between gap-1">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground leading-tight whitespace-pre-line">
                  {item.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
              <HeartIcon className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 04 — Share and decide together
───────────────────────────────────────────────────────────── */
const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&auto=format&fit=crop&crop=face",
];

function PanelShare() {
  return (
    <section className="flex flex-col gap-4 px-6 py-7 md:px-8 md:py-8 md:h-full bg-white border-t md:border-t-0 border-[#EDE0D8]">
      <NumBadge n="04" />

      <div className="flex-shrink-0">
        <h2
          style={{ fontFamily: "var(--font-fraunces)" }}
          className="text-[2rem] lg:text-[2.25rem] font-bold leading-tight text-foreground"
        >
          Share and decide
          <br />together
        </h2>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed flex-shrink-0">
        Create a space for just you two, or invite your partner, friends or family.
      </p>

      {/* Avatar stack */}
      <div className="flex items-center flex-shrink-0">
        {AVATARS.map((src, i) => (
          <div
            key={i}
            className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-sm"
            style={{ marginLeft: i > 0 ? "-10px" : "0" }}
          >
            <img src={src} alt="Member" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
        <div className="w-9 h-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-sm font-medium ml-2">
          +
        </div>
      </div>

      {/* Chat bubble */}
      <div className="flex items-end gap-2 flex-shrink-0">
        <div className="bg-[#F0F6F2] rounded-2xl rounded-bl-sm px-4 py-3 flex-1 max-w-[200px]">
          <p className="text-xs font-medium text-foreground leading-snug">
            &ldquo;Let&apos;s go here this Saturday?&rdquo; ♥
          </p>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
          <img src={AVATARS[1]} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      </div>

      {/* Restaurant card */}
      <div className="flex-1 min-h-[160px] md:min-h-0 rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="h-[120px] md:h-[35%] overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=82&auto=format&fit=crop"
            alt="L'Antica Pizzeria da Michele"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-3 flex items-start justify-between gap-2">
          <div>
            <p
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="text-sm font-semibold text-foreground leading-tight"
            >
              L&apos;Antica Pizzeria
              <br />da Michele
            </p>
            <p className="text-xs text-muted-foreground mt-1">Naples</p>
          </div>
          {/* Action buttons */}
          <div className="flex gap-1 flex-shrink-0 mt-0.5">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
              <HeartIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="bg-[#FAF6F2] min-h-dvh flex flex-col">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 bg-[#FAF6F2]/95 backdrop-blur-md border-b border-[#EDE0D8] flex items-center justify-between px-5 h-14 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <span
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-xl font-bold text-foreground"
          >
            Foodmates
          </span>
        </div>
        <button
          className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5 text-foreground/60" />
        </button>
      </header>

      {/* ── Feature panels ──
          Desktop: 4 equal columns, fixed viewport height, each scrolls independently
          Mobile:  stacked vertically, natural scroll
      ── */}
      <main className="flex-1 md:flex md:flex-row md:divide-x md:divide-[#EDE0D8] md:overflow-hidden md:h-[calc(100dvh-56px-72px)]">
        {/* On desktop, each column scrolls independently */}
        <div className="md:flex-1 md:overflow-y-auto md:min-w-0">
          <PanelHero />
        </div>
        <div className="md:flex-1 md:overflow-y-auto md:min-w-0">
          <PanelSave />
        </div>
        <div className="md:flex-1 md:overflow-y-auto md:min-w-0">
          <PanelOrganize />
        </div>
        <div className="md:flex-1 md:overflow-y-auto md:min-w-0">
          <PanelShare />
        </div>
      </main>

      {/* ── Sticky footer / CTA ── */}
      <footer className="sticky bottom-0 z-50 bg-[#FAF6F2]/95 backdrop-blur-md border-t border-[#EDE0D8] flex-shrink-0 h-[72px] flex items-center">
        <div className="w-full px-5 flex items-center justify-between gap-4">

          {/* Left: tagline (hidden on very small screens) */}
          <div className="min-w-0">
            <p
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="text-sm font-bold text-foreground leading-tight truncate hidden sm:block"
            >
              Built for two. Perfect for any group.
            </p>
            <p className="text-xs text-muted-foreground hidden md:block mt-0.5">
              Your space. Your taste. Your people.
            </p>
            {/* Mobile: just show logo */}
            <div className="sm:hidden flex items-center gap-1.5">
              <Logo size={18} />
              <span style={{ fontFamily: "var(--font-fraunces)" }} className="text-sm font-bold text-foreground">
                Foodmates
              </span>
            </div>
          </div>

          {/* Right: CTA buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl border border-foreground/25 text-foreground text-sm font-semibold hover:bg-foreground/5 transition-colors whitespace-nowrap"
            >
              Log in
            </Link>
            <Link
              href="/login?tab=signup"
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors whitespace-nowrap shadow-sm"
            >
              Sign up
            </Link>
          </div>

        </div>
      </footer>
    </div>
  );
}
