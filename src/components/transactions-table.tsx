import type { TransactionItem } from "@/shared/types/dashboard";

type TransactionsTableProps = {
  transactions: TransactionItem[];
  onEdit?: (transaction: TransactionItem) => void;
  onDelete?: (transaction: TransactionItem) => void;
  pendingDeleteId?: string | null;
};

const typeClasses = {
  RECEITA: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  DESPESA: "border border-rose-200 bg-rose-50 text-rose-700",
  INVESTIMENTO: "border border-sky-200 bg-sky-50 text-sky-700",
};

export function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
  pendingDeleteId = null,
}: TransactionsTableProps) {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div
        className={`hidden gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:grid ${
          hasActions ? "md:grid-cols-[1.5fr_1fr_0.9fr_1fr_0.9fr]" : "md:grid-cols-[1.5fr_1fr_0.9fr_1fr]"
        }`}
      >
        <span>Descrição</span>
        <span>Categoria</span>
        <span>Data</span>
        <span className="text-right">Valor</span>
        {hasActions ? <span className="text-right">Ações</span> : null}
      </div>

      <div className="divide-y divide-slate-200 bg-white">
        {transactions.map((transaction) => (
          <article
            key={transaction.id}
            className={`grid gap-3 px-4 py-4 transition hover:bg-slate-50 md:items-center md:gap-4 ${
              hasActions ? "md:grid-cols-[1.5fr_1fr_0.9fr_1fr_0.9fr]" : "md:grid-cols-[1.5fr_1fr_0.9fr_1fr]"
            }`}
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
              <div className="mt-3 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm md:hidden">
                <p className="flex items-center justify-between gap-4 text-slate-500">
                  <span className="font-medium text-slate-400">Categoria</span>
                  <span className="max-w-[60%] text-right text-slate-600">{transaction.category}</span>
                </p>
                <p className="flex items-center justify-between gap-4 text-slate-500">
                  <span className="font-medium text-slate-400">Data</span>
                  <span className="text-right text-slate-600">{transaction.date}</span>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-400">Valor</span>
                  <strong className="text-right text-slate-900">{transaction.amount}</strong>
                </p>
                {hasActions ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {onEdit ? (
                      <button
                        type="button"
                        onClick={() => onEdit(transaction)}
                        className="inline-flex min-h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                        aria-label={`Editar ${transaction.description}`}
                        title="Editar"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10-4-4L4 16v4Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="m12 6 4 4" />
                        </svg>
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        type="button"
                        onClick={() => onDelete(transaction)}
                        disabled={pendingDeleteId === transaction.id}
                        className="inline-flex min-h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Excluir ${transaction.description}`}
                        title="Excluir"
                      >
                        {pendingDeleteId === transaction.id ? (
                          "..."
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v6" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1 12h10l1-12" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V4h6v3" />
                          </svg>
                        )}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <span className="hidden text-sm text-slate-600 md:block">{transaction.category}</span>
            <span className="text-sm text-slate-500">{transaction.date}</span>
            <strong className="text-sm font-semibold text-slate-900 md:text-right">
              {transaction.amount}
            </strong>
            {hasActions ? (
              <div className="hidden justify-end gap-2 md:flex">
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(transaction)}
                    className="inline-flex min-h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                    aria-label={`Editar ${transaction.description}`}
                    title="Editar"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10-4-4L4 16v4Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="m12 6 4 4" />
                    </svg>
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(transaction)}
                    disabled={pendingDeleteId === transaction.id}
                    className="inline-flex min-h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Excluir ${transaction.description}`}
                    title="Excluir"
                  >
                    {pendingDeleteId === transaction.id ? (
                      "..."
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v6" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1 12h10l1-12" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V4h6v3" />
                      </svg>
                    )}
                  </button>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
