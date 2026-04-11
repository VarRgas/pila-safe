"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserMenu } from "@/components/layout/user-menu";
import { supabase } from "@/shared/lib/supabase";
import { useUi } from "@/shared/lib/ui-context";

type AppHeaderProps = {
  userEmail: string | null;
  userName: string | null;
};

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lancamentos", label: "Lançamentos" },
];

export function AppHeader({ userEmail, userName }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const { hideValues, theme, toggleHideValues, toggleTheme } = useUi();

  const compactUserLabel = useMemo(() => {
    if (userName?.trim()) {
      return userName.length > 18 ? `${userName.slice(0, 18)}...` : userName;
    }

    if (!userEmail) {
      return "Minha conta";
    }

    const [localPart] = userEmail.split("@");
    return localPart.length > 18 ? `${localPart.slice(0, 18)}...` : localPart;
  }, [userEmail, userName]);

  const userInitial = useMemo(
    () => userName?.charAt(0).toUpperCase() ?? userEmail?.charAt(0).toUpperCase() ?? "P",
    [userEmail, userName],
  );

  function closeMobileMenu() {
    mobileMenuRef.current?.removeAttribute("open");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <Link href="/dashboard" className="inline-flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
              P
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-lg font-semibold tracking-tight text-slate-950">
                PilaSafe
              </strong>
              <span className="hidden text-xs uppercase tracking-[0.18em] text-slate-500 sm:block">
                Controle financeiro
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 md:flex">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-slate-950 shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex md:justify-end">
          <button
            type="button"
            onClick={toggleHideValues}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            aria-label={hideValues ? "Mostrar valores" : "Ocultar valores"}
            title={hideValues ? "Mostrar valores" : "Ocultar valores"}
          >
            {hideValues ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 10.7A3 3 0 0 0 14 14" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.1A9.9 9.9 0 0 1 12 5c5 0 9 4.5 9 7s-1.3 3.6-3.3 5.1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.7 6.7C4.7 8.2 3 10.3 3 12c0 2.5 4 7 9 7 1.7 0 3.2-.4 4.6-1.1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
            title={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
          >
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
              </svg>
            )}
          </button>

          <UserMenu userEmail={userEmail} userName={userName} onLogout={handleLogout} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleHideValues}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            aria-label={hideValues ? "Mostrar valores" : "Ocultar valores"}
          >
            {hideValues ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 10.7A3 3 0 0 0 14 14" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.1A9.9 9.9 0 0 1 12 5c5 0 9 4.5 9 7s-1.3 3.6-3.3 5.1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.7 6.7C4.7 8.2 3 10.3 3 12c0 2.5 4 7 9 7 1.7 0 3.2-.4 4.6-1.1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
            aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>

          <details ref={mobileMenuRef} className="relative">
          <summary className="flex h-11 w-11 list-none items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition marker:content-none hover:border-slate-300 hover:text-slate-950">
            <span className="text-lg">≡</span>
          </summary>

          <div className="fixed inset-x-4 top-20 z-30 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.12)] sm:top-24">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                {userInitial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{compactUserLabel}</p>
                {userEmail ? <p className="truncate text-xs text-slate-500">{userEmail}</p> : null}
              </div>
            </div>

            <div className="mt-3 grid gap-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/conta"
                onClick={closeMobileMenu}
                className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  pathname === "/conta"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                Minha conta
              </Link>

              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  void handleLogout();
                }}
                className="rounded-2xl px-3 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Sair
              </button>
            </div>
          </div>
          </details>
        </div>
      </div>
    </header>
  );
}
