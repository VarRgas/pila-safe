"use client";

import { useMemo, useState } from "react";
import { TransactionsTable } from "@/components/transactions-table";
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

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("TODAS");

  const filteredTransactions = useMemo(() => {
    if (activeFilter === "TODAS") {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.type === activeFilter);
  }, [activeFilter, transactions]);

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
          {filteredTransactions.length} itens
        </span>
      </div>

      <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setActiveFilter(option.value)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm ${
              activeFilter === option.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <TransactionsTable transactions={filteredTransactions} />
      </div>
    </section>
  );
}
