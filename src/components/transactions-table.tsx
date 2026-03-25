import type { TransactionItem } from "@/shared/types/dashboard";

type TransactionsTableProps = {
  transactions: TransactionItem[];
};

const typeClasses = {
  RECEITA: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  DESPESA: "border border-rose-200 bg-rose-50 text-rose-700",
  INVESTIMENTO: "border border-sky-200 bg-sky-50 text-sky-700",
};

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1.5fr_1fr_0.9fr_1fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:grid">
        <span>Descrição</span>
        <span>Categoria</span>
        <span>Data</span>
        <span className="text-right">Valor</span>
      </div>

      <div className="divide-y divide-slate-200 bg-white">
        {transactions.map((transaction) => (
          <article
            key={transaction.id}
            className="grid gap-3 px-4 py-4 transition hover:bg-slate-50 md:grid-cols-[1.5fr_1fr_0.9fr_1fr] md:items-center md:gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <strong className="font-semibold text-slate-900">{transaction.description}</strong>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] ${typeClasses[transaction.type]}`}
                >
                  {transaction.type}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:hidden">
                <p className="flex items-center justify-between gap-4 text-slate-500">
                  <span className="font-medium text-slate-400">Categoria</span>
                  <span className="text-right text-slate-600">{transaction.category}</span>
                </p>
                <p className="flex items-center justify-between gap-4 text-slate-500">
                  <span className="font-medium text-slate-400">Data</span>
                  <span className="text-right text-slate-600">{transaction.date}</span>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-400">Valor</span>
                  <strong className="text-right text-slate-900">{transaction.amount}</strong>
                </p>
              </div>
            </div>

            <span className="hidden text-sm text-slate-600 md:block">{transaction.category}</span>
            <span className="text-sm text-slate-500">{transaction.date}</span>
            <strong className="text-sm font-semibold text-slate-900 md:text-right">
              {transaction.amount}
            </strong>
          </article>
        ))}
      </div>
    </div>
  );
}
