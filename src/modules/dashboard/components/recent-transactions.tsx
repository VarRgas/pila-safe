"use client";

import { useMemo, useState } from "react";
import { TransactionsTable } from "@/modules/transactions/components/transactions-table";
import { maskFinancialValue, useUi } from "@/shared/lib/ui-context";
import type { TransactionItem, TransactionType } from "@/shared/types/dashboard";

type RecentTransactionsProps = {
  transactions: TransactionItem[];
};

type FilterOption = "TODAS" | TransactionType;

const filterOptions: Array<{ label: string; value: FilterOption }> = [
  { label: "Todas", value: "TODAS" },
  { label: "Receita", value: "RECEITA" },
  { label: "Despesa", value: "DESPESA" },
  { label: "Investimento", value: "INVESTIMENTO" },
];

const typeClasses = {
  RECEITA: "text-emerald-700",
  DESPESA: "text-rose-700",
  INVESTIMENTO: "text-sky-700",
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("TODAS");
  const { hideValues } = useUi();

  const filteredTransactions = useMemo(() => {
    if (activeFilter === "TODAS") {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.type === activeFilter);
  }, [activeFilter, transactions]);

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Histórico recente
          </span>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            Lançamentos recentes
          </h2>
        </div>

        <span className="inline-flex w-fit text-xs font-semibold text-slate-500">
          {filteredTransactions.length} itens
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setActiveFilter(option.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
              activeFilter === option.value
                ? "bg-slate-900 text-white"
                : "text-slate-600 ring-1 ring-slate-200 hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 md:hidden">
        <div className="divide-y divide-slate-200/80">
          {filteredTransactions.map((transaction) => (
            <article key={transaction.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold tracking-tight text-slate-950">
                    {transaction.description}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">{transaction.category}</span>
                    <span className="text-slate-300">•</span>
                    <span>{transaction.date}</span>
                  </div>
                </div>

                <span className={`shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] ${typeClasses[transaction.type]}`}>
                  {transaction.type}
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-3">
                <strong className="block text-base font-semibold tracking-tight text-slate-950">
                  {maskFinancialValue(transaction.amount, hideValues)}
                </strong>

                <span className="text-xs text-slate-500">
                  {transaction.type === "RECEITA"
                    ? "Entrada"
                    : transaction.type === "DESPESA"
                      ? "Saida"
                      : "Investimento"}
                </span>
              </div>
            </article>
          ))}

          {filteredTransactions.length === 0 ? (
            <div className="py-5 text-sm text-slate-500">Nenhum lançamento encontrado para este filtro.</div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 hidden md:block">
        <TransactionsTable transactions={filteredTransactions} />
      </div>
    </section>
  );
}
