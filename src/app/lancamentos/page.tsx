import { redirect } from "next/navigation";
import Link from "next/link";
import { TransactionsTable } from "@/components/transactions-table";
import { getTransactionsByUserId, mapTransactionsToItems } from "@/modules/transactions/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";

export default async function TransactionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const transactions = await getTransactionsByUserId(user.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Todos os lancamentos
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Lista simples de movimentacoes mockadas
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Esta pagina fica pronta para futura integracao com API, mantendo a estrutura
                visual do frontend organizada e reutilizavel.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-sm"
            >
              Voltar ao dashboard
            </Link>
          </div>

          <div className="mt-6">
            <TransactionsTable transactions={mapTransactionsToItems(transactions)} />
          </div>
        </section>
      </div>
    </main>
  );
}
