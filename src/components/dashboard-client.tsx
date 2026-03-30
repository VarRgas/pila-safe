"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  NewTransactionFormData,
  SummaryCardData,
  TransactionItem,
} from "@/shared/types/dashboard";

type DashboardClientProps = {
  categoriesByType: CategoryOptionsByType;
  chartCards: ChartCardData[];
  initialTransactions: TransactionItem[];
  summaryCards: SummaryCardData[];
};

type ToastState = {
  message: string;
  tone: "success" | "error";
} | null;

export function DashboardClient({
  categoriesByType,
  chartCards,
  initialTransactions,
  summaryCards,
}: DashboardClientProps) {
  const router = useRouter();
  const [categoryOptions, setCategoryOptions] = useState(categoriesByType);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

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
    setIsModalOpen(false);
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

  return (
    <>
      <main className="bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-5 pb-24 text-slate-900 sm:px-6 sm:py-6 sm:pb-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <header className="rounded-3xl border border-white/70 bg-white/80 px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 md:px-8">
            <div className="grid gap-5 lg:flex lg:items-center lg:justify-between">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:block">
                <div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    PilaSafe
                  </span>
                  <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
                    Dashboard financeiro
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                    Um esboço inicial para acompanhar saldo, movimentações e indicadores com
                    clareza em qualquer tela.
                  </p>
                </div>

                <div className="sm:hidden">
                  <div className="min-w-[132px] rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-right">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      Período atual
                    </p>
                    <strong className="mt-1 block text-sm font-semibold text-slate-900">
                      Abril 2026
                    </strong>
                    <div className="mt-2 border-t border-slate-200 pt-2">
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                        Status
                      </p>
                      <strong className="mt-1 block text-sm font-semibold text-emerald-700">
                        Saudável
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:min-w-[320px] lg:max-w-md">
                <div className="hidden sm:grid sm:gap-3 sm:grid-cols-2">
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

                <div className="hidden sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 lg:justify-end">
                  <Link
                    href="/lancamentos"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-sm"
                  >
                    Todos os lançamentos
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setTransactionError(null);
                      setToast(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm"
                  >
                    Novo lançamento
                  </button>
                </div>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {summaryCards.map((card, index) => (
              <SummaryCard key={card.title} card={card} index={index} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
            <RecentTransactions transactions={recentTransactions} />
            <ChartSection charts={chartCards} />
          </section>
        </div>
      </main>

      <NewTransactionModal
        key={`${isModalOpen ? "open" : "closed"}-new`}
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
