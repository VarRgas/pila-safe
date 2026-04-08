"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserMenu } from "@/components/user-menu";
import { supabase } from "@/shared/lib/supabase";

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

        <div className="hidden md:flex md:justify-end">
          <UserMenu userEmail={userEmail} userName={userName} onLogout={handleLogout} />
        </div>

        <details ref={mobileMenuRef} className="relative md:hidden">
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
    </header>
  );
}
