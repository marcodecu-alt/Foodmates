"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, UtensilsCrossed, BookOpen, Users, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import GroupSelector from "@/components/groups/GroupSelector";
import { useNotifications } from "@/lib/contexts/notifications";

interface AppNavProps {
  groups: { id: string; name: string }[];
}

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/account", label: "Account", icon: User },
];

export default function AppNav({ groups }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalUnread } = useNotifications();

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 mr-3">
            <svg width="26" height="28" viewBox="0 0 32 34" fill="none">
              <path d="M16 31C16 31 2 21.5 2 12C2 7 6 3 11 3C13.4 3 15.5 4.1 16 5.8C16.5 4.1 18.6 3 21 3C26 3 30 7 30 12C30 21.5 16 31 16 31Z" fill="#E05835"/>
              <line x1="13" y1="9" x2="13" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="16" y1="8" x2="16" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="19" y1="9" x2="19" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M13 13 Q16 15.5 19 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="16" y1="15" x2="16" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span style={{fontFamily: "var(--font-fraunces)"}} className="font-bold text-xl text-foreground">Foodmates</span>
          </Link>

          <GroupSelector groups={groups} />

          <nav className="flex items-center gap-1 ml-auto">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {label}
                {href === "/chat" && totalUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-1">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                pathname === href || (href !== "/home" && pathname.startsWith(href))
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {href === "/chat" && totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                )}
              </div>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
