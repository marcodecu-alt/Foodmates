"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const next = searchParams.get("next") ?? "/home";
  const [mode, setMode] = useState<Mode>(
    searchParams.get("tab") === "signup" ? "signup" : "signin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  const supabase = createClient();

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError(error.message);
      } else if (data.session) {
        // Email confirmation is disabled — signed in immediately
        router.push(next);
        router.refresh();
      } else {
        // Email confirmation is enabled — ask user to check inbox
        setSignupDone(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Wrong email or password"
            : error.message
        );
      } else {
        router.push(next);
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  if (signupDone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2.5 mb-3">
              <svg width="32" height="34" viewBox="0 0 32 34" fill="none">
                <path d="M16 31C16 31 2 21.5 2 12C2 7 6 3 11 3C13.4 3 15.5 4.1 16 5.8C16.5 4.1 18.6 3 21 3C26 3 30 7 30 12C30 21.5 16 31 16 31Z" fill="#E05835"/>
                <line x1="13" y1="9" x2="13" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="16" y1="8" x2="16" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="19" y1="9" x2="19" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M13 13 Q16 15.5 19 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <line x1="16" y1="15" x2="16" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span style={{fontFamily: "var(--font-fraunces)"}} className="text-2xl font-bold text-foreground">Foodmates</span>
            </div>
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-4">
            <div className="text-4xl">📬</div>
            <h2 className="text-xl font-semibold">Check your inbox</h2>
            <p className="text-muted-foreground text-sm">
              We sent a confirmation link to <strong>{email}</strong>.
              <br />
              Click it to activate your account.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSignupDone(false);
                switchMode("signin");
              }}
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <svg width="32" height="34" viewBox="0 0 32 34" fill="none">
              <path d="M16 31C16 31 2 21.5 2 12C2 7 6 3 11 3C13.4 3 15.5 4.1 16 5.8C16.5 4.1 18.6 3 21 3C26 3 30 7 30 12C30 21.5 16 31 16 31Z" fill="#E05835"/>
              <line x1="13" y1="9" x2="13" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="16" y1="8" x2="16" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="19" y1="9" x2="19" y2="13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M13 13 Q16 15.5 19 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="16" y1="15" x2="16" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span style={{fontFamily: "var(--font-fraunces)"}} className="text-2xl font-bold text-foreground">Foodmates</span>
          </div>
          <p className="text-muted-foreground text-sm text-center">Your private culinary space —<br/>even better when shared.</p>
          <Link href="/" className="text-xs text-primary hover:underline mt-1">
            ← See how it works
          </Link>
        </div>

        {/* Password reset success banner */}
        {resetSuccess && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 text-center">
            Password updated! Sign in with your new password.
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-5">
          {/* Tabs */}
          <div className="flex rounded-xl bg-muted p-1 gap-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="rounded-xl border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 6 : undefined}
                className="rounded-xl border-border bg-background"
              />
            </div>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-xl border-border bg-background"
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full rounded-xl h-11 font-semibold"
              disabled={loading}
            >
              {loading
                ? "Please wait…"
                : mode === "signin"
                ? "Sign in"
                : "Create account"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl h-11 border-border"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
