"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  createTransactionAction,
  updateTransactionAction,
} from "@/modules/transactions/actions/transactions";
import type {
  CategoryOptionsByType,
  NewTransactionFormData,
  TransactionItem,
  TransactionType,
} from "@/shared/types/dashboard";

type TransactionFormPageClientProps = {
  categoriesByType: CategoryOptionsByType;
  initialData?: TransactionItem | null;
  backHref: string;
  redirectTo: string;
};

type FormErrors = Partial<Record<keyof NewTransactionFormData, string>>;

const typeOptions: TransactionType[] = ["RECEITA", "DESPESA", "INVESTIMENTO"];

const typeButtonClasses = {
  RECEITA: "border-emerald-200 bg-emerald-50 text-emerald-700",
  DESPESA: "border-rose-200 bg-rose-50 text-rose-700",
  INVESTIMENTO: "border-sky-200 bg-sky-50 text-sky-700",
};

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultFormData(): NewTransactionFormData {
  return {
    description: "",
    type: "DESPESA",
    category: "",
    amount: "",
    date: getTodayDateValue(),
  };
}

export function TransactionFormPageClient({
  categoriesByType,
  initialData = null,
  backHref,
  redirectTo,
}: TransactionFormPageClientProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const categoryFieldRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<NewTransactionFormData>(() =>
    initialData
      ? {
          description: initialData.description,
          type: initialData.type,
          category: initialData.category === "Sem categoria" ? "" : initialData.category,
          amount: initialData.amountValue,
          date: initialData.dateValue,
        }
      : getDefaultFormData(),
  );
  const [categoryOptions, setCategoryOptions] = useState(categoriesByType);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const currentCategories = categoryOptions[formData.type];

  const isEditMode = Boolean(initialData);

  const normalizedCategory = useMemo(() => formData.category.trim().toLowerCase(), [formData.category]);
  const filteredCategories = useMemo(() => {
    if (!normalizedCategory) {
      return currentCategories.slice(0, 6);
    }

    return currentCategories
      .filter((category) => category.toLowerCase().includes(normalizedCategory))
      .slice(0, 6);
  }, [currentCategories, normalizedCategory]);
  const exactCategoryMatch = currentCategories.find(
    (category) => category.toLowerCase() === normalizedCategory,
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (categoryFieldRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsCategoryOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function updateField<K extends keyof NewTransactionFormData>(field: K, value: NewTransactionFormData[K]) {
    if (field === "type") {
      const nextType = value as TransactionType;
      const nextCategories = categoryOptions[nextType];

      setFormData((current) => ({
        ...current,
        type: nextType,
        category: nextCategories.includes(current.category) ? current.category : "",
      }));
      setIsCategoryOpen(false);
      setErrors((current) => ({ ...current, type: undefined, category: undefined }));
      return;
    }

    setFormData((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }

    if (submitError) {
      setSubmitError(null);
    }
  }

  function formatCurrencyValue(value: string) {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    return (Number(digits) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!formData.description.trim()) {
      nextErrors.description = "Informe uma descrição.";
    }

    if (!formData.category.trim()) {
      if (exactCategoryMatch) {
        setFormData((current) => ({ ...current, category: exactCategoryMatch }));
      } else {
        nextErrors.category = "Selecione uma categoria.";
      }
    }

    if (!formData.amount || Number(formData.amount.replace(/\D/g, "")) <= 0) {
      nextErrors.amount = "Informe um valor maior que zero.";
    }

    if (!formData.date) {
      nextErrors.date = "Selecione uma data.";
    }

    return nextErrors;
  }

  async function handleCreateCategory() {
    const normalizedName = formData.category.trim();

    if (!normalizedName) {
      setErrors((current) => ({ ...current, category: "Informe uma categoria." }));
      return;
    }

    setIsCreatingCategory(true);

    const result = await createCategoryAction(formData.type, normalizedName);

    if (!result.success || !result.categoryName) {
      setSubmitError(result.error ?? "Não foi possível criar a categoria.");
      setIsCreatingCategory(false);
      return;
    }

    setCategoryOptions((current) => ({
      ...current,
      [formData.type]: [...current[formData.type], result.categoryName!].sort((first, second) =>
        first.localeCompare(second),
      ),
    }));
    setFormData((current) => ({ ...current, category: result.categoryName! }));
    setIsCategoryOpen(false);
    setIsCreatingCategory(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = isEditMode && initialData
      ? await updateTransactionAction(initialData.id, formData)
      : await createTransactionAction(formData);

    if (!result.success) {
      setSubmitError(result.error ?? "Não foi possível salvar o lançamento.");
      setIsSubmitting(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="app-page-shell min-h-screen px-3 py-3 text-slate-900 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-6">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="rounded-[1.4rem] border border-white/70 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:rounded-3xl sm:p-6"
        >
          <div className="mb-4 sm:mb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isEditMode ? "Editar lançamento" : "Novo lançamento"}
              </span>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950 sm:mt-2 sm:text-3xl">
                {isEditMode ? "Atualize a movimentação" : "Adicionar movimentação"}
              </h1>
            </div>
          </div>

          {submitError ? (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Descrição</span>
              <input
                required
                value={formData.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={`w-full rounded-2xl border px-4 py-2 text-sm text-slate-900 outline-none transition focus:bg-white ${
                  errors.description
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50 focus:border-slate-400"
                }`}
                placeholder="Ex.: Conta de energia"
              />
              {errors.description ? <span className="mt-1.5 block text-sm text-rose-600">{errors.description}</span> : null}
            </label>

            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {typeOptions.map((option) => {
                  const isActive = formData.type === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateField("type", option)}
                      className={`rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${
                        isActive
                          ? `${typeButtonClasses[option]} shadow-sm ring-2 ring-offset-1 ${
                              option === "RECEITA"
                                ? "ring-emerald-200"
                                : option === "DESPESA"
                                  ? "ring-rose-200"
                                  : "ring-sky-200"
                            }`
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2" ref={categoryFieldRef}>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Categoria</span>
              <div className="relative">
                <input
                  value={formData.category}
                  onChange={(event) => {
                    updateField("category", event.target.value);
                    setIsCategoryOpen(true);
                  }}
                  onFocus={() => setIsCategoryOpen(true)}
                  placeholder="Selecione ou busque uma categoria"
                  className={`w-full rounded-2xl border px-4 py-2 pr-10 text-sm text-slate-900 outline-none transition focus:bg-white ${
                    errors.category
                      ? "border-rose-300 bg-rose-50 focus:border-rose-400"
                      : "border-slate-200 bg-slate-50 focus:border-slate-400"
                  }`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ▾
                </span>
              </div>

              {isCategoryOpen ? (
                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                  {filteredCategories.length > 0 ? (
                    <div className="max-h-52 overflow-y-auto p-2">
                      {filteredCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            updateField("category", category);
                            setIsCategoryOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                            formData.category === category
                              ? "bg-slate-900 text-white"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                          }`}
                        >
                          <span>{category}</span>
                          {formData.category === category ? <span className="text-[11px]">Selecionada</span> : null}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">Nenhuma categoria encontrada.</div>
                  )}
                </div>
              ) : null}

              {errors.category ? <span className="mt-1.5 block text-sm text-rose-600">{errors.category}</span> : null}

              {formData.category.trim() && !exactCategoryMatch ? (
                <button
                  type="button"
                  onClick={() => void handleCreateCategory()}
                  disabled={isCreatingCategory}
                  className="mt-1 inline-flex items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:mt-2 sm:px-3 sm:py-2 sm:text-sm"
                >
                  {isCreatingCategory ? "Salvando categoria..." : `Criar categoria "${formData.category.trim()}"`}
                </button>
              ) : null}
            </div>

            <label className="min-w-0">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Valor</span>
              <input
                required
                inputMode="numeric"
                type="text"
                value={formData.amount}
                onChange={(event) => updateField("amount", formatCurrencyValue(event.target.value))}
                className={`w-full rounded-2xl border px-4 py-2 text-sm text-slate-900 outline-none transition focus:bg-white ${
                  errors.amount
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50 focus:border-slate-400"
                }`}
                placeholder="R$ 0,00"
              />
              {errors.amount ? <span className="mt-1.5 block text-sm text-rose-600">{errors.amount}</span> : null}
            </label>

            <label className="min-w-0">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Data</span>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(event) => updateField("date", event.target.value)}
                className={`w-full rounded-2xl border px-4 py-2 text-sm text-slate-900 outline-none transition focus:bg-white ${
                  errors.date
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50 focus:border-slate-400"
                }`}
              />
              {errors.date ? <span className="mt-1.5 block text-sm text-rose-600">{errors.date}</span> : null}
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:mt-6 sm:flex sm:flex-row sm:justify-end sm:pt-5">
            <Link
              href={backHref}
              className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:min-h-11 sm:py-2.5"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:min-h-11 sm:py-2.5"
            >
              {isSubmitting ? "Salvando..." : isEditMode ? "Salvar alterações" : "Salvar lançamento"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
