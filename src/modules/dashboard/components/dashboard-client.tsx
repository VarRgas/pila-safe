"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TransactionFormPageClient } from "@/modules/transactions/components/transaction-form-page-client";
import { SummaryCard } from "@/modules/dashboard/components/summary-card";
import { UiSelect } from "@/components/ui-select";
import { maskFinancialValue, useUi } from "@/shared/lib/ui-context";
import { supabase } from "@/shared/lib/supabase";
import type {
  CategoryOptionsByType,
  ChartCardData,
  DashboardMonthOption,
  DashboardStatus,
  SummaryCardData,
} from "@/shared/types/dashboard";

const ChartSection = dynamic(
  () => import("@/modules/dashboard/components/chart-section").then((module) => module.ChartSection),
  {
    loading: () => (
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-3xl border border-white/70 bg-white/70" />
        <div className="h-72 animate-pulse rounded-3xl border border-white/70 bg-white/70" />
      </section>
    ),
  },
);

type DashboardClientProps = {
  availableMonths: DashboardMonthOption[];
  categoriesByType: CategoryOptionsByType;
  chartCards: ChartCardData[];
  nextMonthProjection: {
    currentBalance: string;
    periodLabel: string;
    receita: string;
    despesa: string;
    investimento: string;
    saldo: string;
  };
  periodLabel: string;
  selectedMonth: string;
  statusLabel: DashboardStatus;
  summaryCards: SummaryCardData[];
};

export function DashboardClient({
  availableMonths,
  categoriesByType,
  chartCards,
  nextMonthProjection,
  periodLabel,
  selectedMonth,
  statusLabel,
  summaryCards,
}: DashboardClientProps) {
  const router = useRouter();
  const { hideValues } = useUi();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentCategoriesByType, setCurrentCategoriesByType] = useState(categoriesByType);

  const primaryCharts = useMemo(
    () => chartCards.filter((chart) => chart.kind === "timeline"),
    [chartCards],
  );
  const secondaryCharts = useMemo(
    () => chartCards.filter((chart) => chart.kind !== "timeline"),
    [chartCards],
  );
  const balanceCard = useMemo(
    () => summaryCards.find((card) => card.title === "Saldo") ?? summaryCards[summaryCards.length - 1],
    [summaryCards],
  );
  const supportingCards = useMemo(
    () => summaryCards.filter((card) => card.title !== "Saldo"),
    [summaryCards],
  );

  useEffect(() => {
    setCurrentCategoriesByType(categoriesByType);
  }, [categoriesByType]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  function handleMonthChange(month: string) {
    const params = new URLSearchParams();

    if (month) {
      params.set("mes", month);
    }

    const query = params.toString();
    router.replace(query ? `/dashboard?${query}` : "/dashboard");
  }

  return (
    <>
      <main className="app-page-shell px-4 py-4 pb-24 text-slate-900 sm:px-6 sm:py-6 sm:pb-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
          <section className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] xl:items-start">
            <header className="overflow-hidden rounded-[1.8rem] bg-slate-950 px-5 py-5 text-white shadow-[0_14px_40px_rgba(15,23,42,0.16)] sm:px-6 sm:py-6">
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      PilaSafe
                    </span>
                    <strong className="mt-3 block text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                      {maskFinancialValue(balanceCard.amount, hideValues)}
                    </strong>
                    <p className="mt-2 text-sm text-slate-300">{balanceCard.change}</p>
                  </div>

                  <Link
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setIsCreateModalOpen(true);
                    }}
                    className="hidden min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 sm:inline-flex"
                  >
                    Novo lançamento
                  </Link>
                </div>

                <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2 sm:gap-4">
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                    <span className="text-slate-400">Período</span>
                    <strong className="text-right font-medium text-white">{periodLabel}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 sm:justify-end">
                    <span className="text-slate-400">Status</span>
                    <span className="font-medium text-white">{statusLabel}</span>
                  </div>
                </div>
              </div>
            </header>

            <aside className="px-1 py-0 sm:px-2 xl:py-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Resumo do período
                </span>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  Visão do dashboard
                </h2>
              </div>

              <div className="mt-4 grid gap-3">
                <UiSelect
                  label="Mês do resumo"
                  options={[{ label: "Todos os meses", value: "" }, ...availableMonths]}
                  value={selectedMonth}
                  onChange={handleMonthChange}
                />

                <div className="grid gap-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
                    <span>Entradas, saídas e investimentos</span>
                    <span className="text-slate-400">Resumo atual</span>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section className="rounded-[1.6rem] bg-white/58 px-4 py-2 ring-1 ring-slate-200/60 sm:grid sm:grid-cols-3 sm:gap-3 sm:bg-transparent sm:px-0 sm:py-0 sm:ring-0 xl:grid-cols-3">
            {supportingCards.map((card, index) => (
              <SummaryCard key={card.title} card={card} index={index} />
            ))}
          </section>

          <section>
            <article className="overflow-hidden rounded-[1.6rem] bg-white/64 px-4 py-4 ring-1 ring-slate-200/60 sm:px-5 sm:py-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Próximo mês
                </span>
                <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                      Projeção de fechamento
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Visão prevista para {nextMonthProjection.periodLabel} com base nos lançamentos futuros cadastrados.
                    </p>
                  </div>

                    <div className="inline-flex w-fit text-sm text-slate-600">
                      Saldo atual: <strong className="ml-1 font-semibold text-slate-950">{maskFinancialValue(nextMonthProjection.currentBalance, hideValues)}</strong>
                    </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_minmax(340px,0.95fr)] xl:items-start">
                  <div className="grid gap-2.5">
                    <div className="flex items-center justify-between gap-4 border-t border-slate-200/80 pt-3">
                      <p className="text-sm text-slate-600">Receita prevista</p>
                      <strong className="text-base font-semibold tracking-tight text-emerald-700 sm:text-lg">
                        {maskFinancialValue(nextMonthProjection.receita, hideValues)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-slate-200/80 pt-3">
                      <p className="text-sm text-slate-600">Despesa prevista</p>
                      <strong className="text-base font-semibold tracking-tight text-rose-700 sm:text-lg">
                        {maskFinancialValue(nextMonthProjection.despesa, hideValues)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-slate-200/80 pt-3">
                      <p className="text-sm text-slate-600">Investimento previsto</p>
                      <strong className="text-base font-semibold tracking-tight text-sky-700 sm:text-lg">
                        {maskFinancialValue(nextMonthProjection.investimento, hideValues)}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Saldo projetado
                    </span>
                    <strong
                       className={`mt-3 block text-3xl font-semibold tracking-tight sm:text-4xl ${
                          nextMonthProjection.saldo.includes("-")
                            ? "text-rose-700"
                          : nextMonthProjection.saldo.includes("R$ 0,00")
                            ? "text-slate-950"
                            : "text-emerald-700"
                      }`}
                      >
                       {maskFinancialValue(nextMonthProjection.saldo, hideValues)}
                      </strong>
                    <p className="mt-2 text-sm text-slate-600">Fechamento previsto do mês.</p>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-rose-400"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Receita prevista
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Despesa prevista
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Investimento previsto
                      </span>
                    </div>
                  </div>
              </div>
            </article>
          </section>

          <section className="grid gap-3">
            <ChartSection charts={secondaryCharts} className="xl:grid-cols-2" />
          </section>

          <section className="grid gap-3">
            <ChartSection charts={primaryCharts} />
          </section>
        </div>
      </main>

      <Link
        href="#"
        onClick={(event) => {
          event.preventDefault();
          setIsCreateModalOpen(true);
        }}
        className="fixed bottom-5 right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:bg-slate-800 sm:hidden"
        aria-label="Novo lançamento"
      >
        +
      </Link>

      {isCreateModalOpen ? (
        <TransactionFormPageClient
          mode="modal"
          categoriesByType={currentCategoriesByType}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(transaction) => {
            setCurrentCategoriesByType((current) => {
              if (transaction.category === "Sem categoria" || current[transaction.type].includes(transaction.category)) {
                return current;
              }

              return {
                ...current,
                [transaction.type]: [...current[transaction.type], transaction.category].sort((first, second) =>
                  first.localeCompare(second),
                ),
              };
            });
            setIsCreateModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
