"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, createTransactionAction } from "@/app/actions/transactions";
import { ChartSection } from "@/components/chart-section";
import { FeedbackToast } from "@/components/feedback-toast";
import { NewTransactionModal } from "@/components/new-transaction-modal";
import { RecentTransactions } from "@/components/recent-transactions";
import { SummaryCard } from "@/components/summary-card";
import { supabase } from "@/shared/lib/supabase";
import type {
  CategoryOptionsByType,
  ChartCardData,
  DashboardMonthOption,
  DashboardStatus,
  NewTransactionFormData,
  SummaryCardData,
  TransactionItem,
} from "@/shared/types/dashboard";

type DashboardClientProps = {
  availableMonths: DashboardMonthOption[];
  categoriesByType: CategoryOptionsByType;
  chartCards: ChartCardData[];
  initialTransactions: TransactionItem[];
  periodLabel: string;
  selectedMonth: string;
  statusLabel: DashboardStatus;
  summaryCards: SummaryCardData[];
};

type ToastState = {
  message: string;
  tone: "success" | "error";
} | null;

export function DashboardClient({
  availableMonths,
  categoriesByType,
  chartCards,
  initialTransactions,
  periodLabel,
  selectedMonth,
  statusLabel,
  summaryCards,
}: DashboardClientProps) {
  const router = useRouter();
  const [formResetKey, setFormResetKey] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState(categoriesByType);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);
  const primaryCharts = useMemo(
    () => chartCards.filter((chart) => chart.kind === "timeline"),
    [chartCards],
  );
  const secondaryCharts = useMemo(
    () => chartCards.filter((chart) => chart.kind !== "timeline"),
    [chartCards],
  );

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  useEffect(() => {
    setCategoryOptions(categoriesByType);
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

  async function handleAddTransaction(formData: NewTransactionFormData) {
    setIsCreatingTransaction(true);
    setTransactionError(null);
    setToast(null);

    const result = await createTransactionAction(formData);

    if (!result.success || !result.transaction) {
      setTransactionError(result.error ?? "Não foi possível salvar o lançamento.");
      setIsCreatingTransaction(false);
      return;
    }

    const savedTransaction = result.transaction;

    setTransactions((current) => {
      return [savedTransaction, ...current];
    });

    setToast({
      message: "Movimentação criada com sucesso",
      tone: "success",
    });
    setFormResetKey((current) => current + 1);
    setIsCreatingTransaction(false);
    router.refresh();
  }

  async function handleCreateCategory(type: TransactionItem["type"], name: string) {
    const result = await createCategoryAction(type, name);

    if (!result.success || !result.categoryName) {
      setToast({
        message: result.error ?? "Não foi possível criar a categoria.",
        tone: "error",
      });
      return null;
    }

    setCategoryOptions((current) => ({
      ...current,
      [type]: [...current[type], result.categoryName!].sort((first, second) => first.localeCompare(second)),
    }));
    setToast({
      message: "Categoria criada com sucesso",
      tone: "success",
    });

    return result.categoryName;
  }

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
      <main className="app-page-shell px-4 py-5 pb-24 text-slate-900 sm:px-6 sm:py-6 sm:pb-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <header className="rounded-3xl border border-white/70 bg-white/80 px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 md:px-8">
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                PilaSafe
              </span>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
                Dashboard financeiro
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Uma visão rápida da sua saúde financeira, com indicadores e movimentações mais
                recentes em um só lugar.
              </p>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="col-span-2 xl:col-span-4">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] xl:px-5 xl:py-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr] xl:flex-1 xl:items-center xl:gap-4">
                    <label className="w-full min-w-0">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Mês do resumo</span>
                      <select
                        value={selectedMonth}
                        onChange={(event) => handleMonthChange(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="">Todos os meses</option>
                        {availableMonths.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                        </option>
                      ))}
                    </select>
                    </label>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                        Período atual
                      </p>
                      <strong className="mt-1.5 block text-sm font-semibold text-slate-900 sm:text-base">
                        {periodLabel}
                      </strong>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                        Status
                      </p>
                      <span
                        className={`mt-2 inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                          statusLabel === "Saudável"
                            ? "bg-emerald-50 text-emerald-700"
                            : statusLabel === "Neutro"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {summaryCards.map((card, index) => (
              <SummaryCard key={card.title} card={card} index={index} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <ChartSection charts={secondaryCharts} />
            <div className="hidden xl:block">
              <RecentTransactions transactions={recentTransactions} />
            </div>
          </section>

          <section className="grid gap-4">
            <ChartSection charts={primaryCharts} />
          </section>

          <section className="xl:hidden">
            <RecentTransactions transactions={recentTransactions} />
          </section>
        </div>
      </main>

      <NewTransactionModal
        key={`${isModalOpen ? "open" : "closed"}-new-${formResetKey}`}
        isOpen={isModalOpen}
        categoriesByType={categoryOptions}
        onClose={() => {
          setTransactionError(null);
          setIsModalOpen(false);
        }}
        onCreateCategory={handleCreateCategory}
        onSubmit={handleAddTransaction}
        isSubmitting={isCreatingTransaction}
        submitError={transactionError}
      />

      <button
        type="button"
        onClick={() => {
          setTransactionError(null);
          setToast(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-5 right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:bg-slate-800 sm:hidden"
        aria-label="Novo lançamento"
      >
        +
      </button>

      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
