import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSecurityCard } from "@/components/account-security-card";
import { AppHeader } from "@/components/app-header";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  return (
    <>
      <AppHeader userEmail={user.email ?? null} />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Minha conta
                </span>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Conta e seguranca
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Gerencie os dados principais da sua conta e as acoes de seguranca do PilaSafe.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-sm"
              >
                Voltar ao dashboard
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Dados da conta
            </span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Identificacao do usuario
            </h2>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                E-mail autenticado
              </p>
              <strong className="mt-3 block text-lg font-semibold text-slate-950">{user.email}</strong>
            </div>
          </section>

          <AccountSecurityCard userEmail={user.email} />
        </div>
      </main>
    </>
  );
}
