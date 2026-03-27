import type { TransactionItem } from "@/shared/types/dashboard";
import { TransactionsTable } from "@/components/transactions-table";

type RecentTransactionsProps = {
  transactions: TransactionItem[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            Lançamentos recentes
          </h2>
          <p className="text-sm text-slate-500">Últimas movimentações exibidas no dashboard.</p>
        </div>

        <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {transactions.length} itens
        </span>
      </div>

      <div className="mt-6">
        <TransactionsTable transactions={transactions} />
      </div>
    </section>
  );
}
