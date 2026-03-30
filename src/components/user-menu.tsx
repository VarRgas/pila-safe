"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

type UserMenuProps = {
  userEmail: string | null;
  onLogout: () => Promise<void> | void;
};

function getUserLabel(userEmail: string | null) {
  if (!userEmail) {
    return "Minha conta";
  }

  const [localPart] = userEmail.split("@");

  return localPart.length > 18 ? `${localPart.slice(0, 18)}...` : localPart;
}

function getUserInitial(userEmail: string | null) {
  return userEmail?.charAt(0).toUpperCase() ?? "P";
}

export function UserMenu({ userEmail, onLogout }: UserMenuProps) {
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const compactLabel = useMemo(() => getUserLabel(userEmail), [userEmail]);
  const userInitial = useMemo(() => getUserInitial(userEmail), [userEmail]);

  function closeMenu() {
    detailsRef.current?.removeAttribute("open");
  }

  function navigateToSecurity() {
    closeMenu();
    router.push("/conta#seguranca");
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary className="flex min-h-12 max-w-[240px] list-none items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition marker:content-none hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
          {userInitial}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900">{compactLabel}</span>
          <span className="block truncate text-xs text-slate-500">Conta e segurança</span>
        </span>

        <span className="text-slate-400 transition group-open:rotate-180">▾</span>
      </summary>

      <div className="absolute right-0 top-full z-30 mt-3 w-64 rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_16px_45px_rgba(15,23,42,0.12)]">
        <div className="border-b border-slate-100 px-3 py-3">
          <p className="text-sm font-semibold text-slate-900">{compactLabel}</p>
          {userEmail ? <p className="mt-1 truncate text-xs text-slate-500">{userEmail}</p> : null}
        </div>

        <div className="mt-2 grid gap-1">
          <Link
            href="/conta"
            onClick={closeMenu}
            className="rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
          >
            Minha conta
          </Link>

          <button
            type="button"
            onClick={navigateToSecurity}
            className="rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
          >
            Segurança
          </button>

          <button
            type="button"
            onClick={() => {
              closeMenu();
              void onLogout();
            }}
            className="rounded-2xl px-3 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
          >
            Sair
          </button>
        </div>
      </div>
    </details>
  );
}
