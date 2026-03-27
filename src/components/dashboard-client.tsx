"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/app/actions/transactions";
import { ChartSection } from "@/components/chart-section";
import { FeedbackToast } from "@/components/feedback-toast";
import { NewTransactionModal } from "@/components/new-transaction-modal";
import { RecentTransactions } from "@/components/recent-transactions";
import { SummaryCard } from "@/components/summary-card";
import { TransactionsTable } from "@/components/transactions-table";
import { chartCards, transactionCategoriesByType } from "@/modules/transactions/mock-data";
import { supabase } from "@/shared/lib/supabase";
import type { NewTransactionFormData, SummaryCardData, TransactionItem } from "@/shared/types/dashboard";

type DashboardClientProps = {
  initialTransactions: TransactionItem[];
  summaryCards: SummaryCardData[];
};

type ToastState = {
  message: string;
  tone: "success" | "error";
} | null;

export function DashboardClient({ initialTransactions, summaryCards }: DashboardClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

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

    const result = editingTransaction
      ? await updateTransactionAction(editingTransaction.id, formData)
      : await createTransactionAction(formData);

    if (!result.success || !result.transaction) {
      setTransactionError(result.error ?? "Nao foi possivel salvar o lancamento.");
      setIsCreatingTransaction(false);
      return;
    }

    const savedTransaction = result.transaction;

    setTransactions((current) => {
      if (editingTransaction) {
        return current.map((transaction) =>
          transaction.id === editingTransaction.id ? savedTransaction : transaction,
        );
      }

      return [savedTransaction, ...current];
    });

    setToast({
      message: editingTransaction
        ? "Movimentação atualizada com sucesso"
        : "Movimentação criada com sucesso",
      tone: "success",
    });
    setEditingTransaction(null);
    setIsModalOpen(false);
    setIsCreatingTransaction(false);
    router.refresh();
  }

  async function handleDeleteTransaction(transaction: TransactionItem) {
    const confirmed = window.confirm(`Deseja excluir o lançamento "${transaction.description}"?`);

    if (!confirmed) {
      return;
    }

    setPendingDeleteId(transaction.id);
    setTransactionError(null);
    setToast(null);

    const result = await deleteTransactionAction(transaction.id);

    if (!result.success) {
      setToast({
        message: result.error ?? "Nao foi possivel excluir a movimentação.",
        tone: "error",
      });
      setPendingDeleteId(null);
      return;
    }

    setTransactions((current) => current.filter((item) => item.id !== transaction.id));
    setPendingDeleteId(null);
    setToast({
      message: "Movimentação excluída com sucesso",
      tone: "success",
    });
    router.refresh();
  }

  function handleEditTransaction(transaction: TransactionItem) {
    setTransactionError(null);
    setToast(null);
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }

  return (
    <>
      <main className="bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-5 text-slate-900 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <header className="rounded-3xl border border-white/70 bg-white/80 px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 md:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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

              <div className="flex flex-col gap-3 lg:min-w-[320px] lg:max-w-md">
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

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                  <Link
                    href="/lancamentos"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-sm sm:w-auto"
                  >
                    Todos os lançamentos
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTransaction(null);
                      setTransactionError(null);
                      setToast(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm sm:w-auto"
                  >
                    Novo lançamento
                  </button>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card, index) => (
              <SummaryCard key={card.title} card={card} index={index} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <ChartSection charts={chartCards} />
            <RecentTransactions transactions={recentTransactions} />
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Todos os lançamentos
                </span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Visão completa das movimentações registradas
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Edite, exclua e acompanhe os lançamentos salvos na sua conta.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingTransaction(null);
                  setTransactionError(null);
                  setToast(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-sm sm:w-auto"
              >
                Adicionar lançamento
              </button>
            </div>

            <div className="mt-6">
              <TransactionsTable
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                pendingDeleteId={pendingDeleteId}
              />
            </div>
          </section>
        </div>
      </main>

      <NewTransactionModal
        key={`${isModalOpen ? "open" : "closed"}-${editingTransaction?.id ?? "new"}`}
        isOpen={isModalOpen}
        categoriesByType={transactionCategoriesByType}
        onClose={() => {
          setTransactionError(null);
          setEditingTransaction(null);
          setIsModalOpen(false);
        }}
        onSubmit={handleAddTransaction}
        isSubmitting={isCreatingTransaction}
        submitError={transactionError}
        initialData={editingTransaction}
      />

      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
