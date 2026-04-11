"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/modules/transactions/actions/transactions";
import { FeedbackToast } from "@/components/feedback-toast";
import { NewTransactionModal } from "@/modules/transactions/components/new-transaction-modal";
import { TransactionsTable } from "@/modules/transactions/components/transactions-table";
import { UiSelect } from "@/components/ui-select";
import { supabase } from "@/shared/lib/supabase";
import type { CategoryOptionsByType, NewTransactionFormData, TransactionItem } from "@/shared/types/dashboard";

type TransactionsPageClientProps = {
  categoriesByType: CategoryOptionsByType;
  initialTransactions: TransactionItem[];
};

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

type ToastState = {
  message: string;
  tone: "success" | "error";
} | null;

function parseCurrencyValue(value: string) {
  return Number(value.replace(/[^\d,-]/g, "").replace(".", "").replace(",", ".")) || 0;
}

export function TransactionsPageClient({
  categoriesByType,
  initialTransactions,
}: TransactionsPageClientProps) {
  const router = useRouter();
  const [formResetKey, setFormResetKey] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState(categoriesByType);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [selectedMonth, setSelectedMonth] = useState("");

  const availableMonths = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    return [...new Set(transactions.map((transaction) => transaction.dateValue.slice(0, 7)))]
      .sort((first, second) => second.localeCompare(first))
      .map((monthValue) => ({
        value: monthValue,
        label: formatter.format(new Date(`${monthValue}-01T00:00:00Z`)),
      }));
  }, [transactions]);

  const visibleTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredByMonth = selectedMonth
      ? transactions.filter((transaction) => transaction.dateValue.startsWith(selectedMonth))
      : transactions;

    const filteredTransactions = normalizedSearch
      ? filteredByMonth.filter((transaction) => {
          const descriptionMatch = transaction.description.toLowerCase().includes(normalizedSearch);
          const categoryMatch = transaction.category.toLowerCase().includes(normalizedSearch);

          return descriptionMatch || categoryMatch;
        })
      : filteredByMonth;

    return [...filteredTransactions].sort((first, second) => {
      if (sortBy === "date-desc") {
        return second.dateValue.localeCompare(first.dateValue);
      }

      if (sortBy === "date-asc") {
        return first.dateValue.localeCompare(second.dateValue);
      }

      if (sortBy === "amount-desc") {
        return parseCurrencyValue(second.amountValue) - parseCurrencyValue(first.amountValue);
      }

      return parseCurrencyValue(first.amountValue) - parseCurrencyValue(second.amountValue);
    });
  }, [searchTerm, selectedMonth, sortBy, transactions]);

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

  async function handleSubmit(formData: NewTransactionFormData) {
    setIsSubmitting(true);
    setSubmitError(null);
    setToast(null);

    const result = editingTransaction
      ? await updateTransactionAction(editingTransaction.id, formData)
      : await createTransactionAction(formData);

    if (!result.success || !result.transaction) {
      setSubmitError(result.error ?? "Não foi possível salvar o lançamento.");
      setIsSubmitting(false);
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

    if (editingTransaction) {
      setEditingTransaction(null);
      setIsModalOpen(false);
    } else {
      setFormResetKey((current) => current + 1);
    }

    setIsSubmitting(false);
    router.refresh();
  }

  async function handleDelete(transaction: TransactionItem) {
    const confirmed = window.confirm(`Deseja excluir o lançamento "${transaction.description}"?`);

    if (!confirmed) {
      return;
    }

    setPendingDeleteId(transaction.id);
    setSubmitError(null);
    setToast(null);

    const result = await deleteTransactionAction(transaction.id);

    if (!result.success) {
      setToast({
        message: result.error ?? "Não foi possível excluir a movimentação.",
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

  function handleEdit(transaction: TransactionItem) {
    setEditingTransaction(transaction);
    setSubmitError(null);
    setToast(null);
    setIsModalOpen(true);
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
      <main className="app-page-shell min-h-screen px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Todos os lançamentos
                </span>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Lista completa das movimentações da sua conta
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Consulte, edite e exclua os lançamentos vinculados ao usuário autenticado em
                  uma visualização simples e organizada.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                >
                  Voltar ao dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTransaction(null);
                    setSubmitError(null);
                    setToast(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm"
                >
                  Novo lançamento
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3 sm:items-end">
              <label className="min-w-0">
                <span className="mb-2 block text-sm font-medium text-slate-700">Buscar</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por descrição ou categoria"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <UiSelect
                label="Mês"
                options={[{ label: "Todos os meses", value: "" }, ...availableMonths]}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />

              <UiSelect
                label="Ordenar por"
                options={[
                  { label: "Data mais recente", value: "date-desc" },
                  { label: "Data mais antiga", value: "date-asc" },
                  { label: "Maior valor", value: "amount-desc" },
                  { label: "Menor valor", value: "amount-asc" },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value as SortOption)}
              />
            </div>

            <div className="mt-4 text-sm text-slate-500">
              {visibleTransactions.length} lançamento(s) encontrado(s)
            </div>

            <div className="mt-6">
              <TransactionsTable
                transactions={visibleTransactions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                pendingDeleteId={pendingDeleteId}
              />
            </div>
          </section>
        </div>
      </main>

      <NewTransactionModal
        key={`${isModalOpen ? "open" : "closed"}-${editingTransaction?.id ?? `new-${formResetKey}`}`}
        isOpen={isModalOpen}
        categoriesByType={categoryOptions}
        onClose={() => {
          setSubmitError(null);
          setEditingTransaction(null);
          setIsModalOpen(false);
        }}
        onCreateCategory={handleCreateCategory}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        initialData={editingTransaction}
      />

      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
