"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChartSection } from "@/components/chart-section";
import { DashboardFilters } from "@/components/dashboard-filters";
import { NewTransactionModal } from "@/components/new-transaction-modal";
import { RecentTransactions } from "@/components/recent-transactions";
import { SummaryCard } from "@/components/summary-card";
import { TransactionsTable } from "@/components/transactions-table";
import {
  categoryFilters,
  chartCards,
  initialTransactions,
  monthFilters,
  summaryCards,
  transactionCategoriesByType,
} from "@/modules/transactions/mock-data";
import type { NewTransactionFormData, TransactionItem } from "@/shared/types/dashboard";

function extractCurrencyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCurrencyInput(value: string, type: TransactionItem["type"]) {
  const signal = type === "RECEITA" ? "+" : "-";

  return `${signal}${(Number(extractCurrencyDigits(value)) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function DashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  function handleAddTransaction(formData: NewTransactionFormData) {
    const newTransaction: TransactionItem = {
      id: crypto.randomUUID(),
      description: formData.description,
      category: formData.category,
      date: formatDateLabel(formData.date),
      amount: formatCurrencyInput(formData.amount, formData.type),
      type: formData.type,
    };

    setTransactions((current) => [newTransaction, ...current]);
    setIsModalOpen(false);
  }

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <header className="rounded-3xl border border-white/70 bg-white/80 px-6 py-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  PilaSafe
                </span>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                  Dashboard financeiro
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Um esboço inicial para acompanhar saldo, movimentações e indicadores com
                  clareza em qualquer tela.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-[300px]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Período atual
                    </p>
                    <strong className="mt-2 block text-lg font-semibold text-slate-900">
                      Abril 2026
                    </strong>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Status
                    </p>
                    <strong className="mt-2 block text-lg font-semibold text-emerald-700">
                      Saudável
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#todos-os-lancamentos"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-sm"
                  >
                    Todos os lançamentos
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm"
                  >
                    Novo lançamento
                  </button>
                </div>
              </div>
            </div>
          </header>

          <DashboardFilters monthOptions={monthFilters} categoryOptions={categoryFilters} />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card, index) => (
              <SummaryCard key={card.title} card={card} index={index} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <ChartSection charts={chartCards} />
            <RecentTransactions transactions={recentTransactions} />
          </section>

          <section
            id="todos-os-lancamentos"
            className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Todos os lançamentos
                </span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Visão completa das movimentações mockadas
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Novos itens adicionados pelo modal aparecem aqui automaticamente.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-sm"
              >
                Adicionar lançamento
              </button>
            </div>

            <div className="mt-6">
              <TransactionsTable transactions={transactions} />
            </div>
          </section>
        </div>
      </main>

        <NewTransactionModal
          key={isModalOpen ? "open" : "closed"}
          isOpen={isModalOpen}
          categoriesByType={transactionCategoriesByType}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddTransaction}
        />
    </>
  );
}
