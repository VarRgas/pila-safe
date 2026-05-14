"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
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
  backHref?: string;
  redirectTo?: string;
  mode?: "page" | "modal";
  onClose?: () => void;
  onSuccess?: (transaction: TransactionItem) => void;
};

type FormErrors = Partial<Record<keyof NewTransactionFormData, string>>;

const typeOptions: TransactionType[] = ["RECEITA", "DESPESA", "INVESTIMENTO"];

const typeButtonClasses = {
  RECEITA: "border-emerald-200 bg-emerald-50 text-emerald-700",
  DESPESA: "border-rose-200 bg-rose-50 text-rose-700",
  INVESTIMENTO: "border-sky-200 bg-sky-50 text-sky-700",
};

const weekdayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

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

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateLabel(value: string) {
  const parsedDate = parseDateValue(value);

  if (!parsedDate) {
    return "Selecionar data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const days: Array<{ key: string; value: string; label: number; isCurrentMonth: boolean }> = [];

  const leadingDays = firstDayOfMonth.getDay();

  for (let index = leadingDays - 1; index >= 0; index -= 1) {
    const date = new Date(year, month, -index);
    days.push({
      key: `prev-${date.toISOString()}`,
      value: toDateInputValue(date),
      label: date.getDate(),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day += 1) {
    const date = new Date(year, month, day);
    days.push({
      key: `current-${date.toISOString()}`,
      value: toDateInputValue(date),
      label: day,
      isCurrentMonth: true,
    });
  }

  const trailingDays = 42 - days.length;

  for (let day = 1; day <= trailingDays; day += 1) {
    const date = new Date(year, month + 1, day);
    days.push({
      key: `next-${date.toISOString()}`,
      value: toDateInputValue(date),
      label: date.getDate(),
      isCurrentMonth: false,
    });
  }

  return days;
}

export function TransactionFormPageClient({
  categoriesByType,
  initialData = null,
  backHref,
  redirectTo,
  mode = "page",
  onClose,
  onSuccess,
}: TransactionFormPageClientProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const categoryFieldRef = useRef<HTMLDivElement>(null);
  const dateFieldRef = useRef<HTMLDivElement>(null);
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseDateValue(initialData?.dateValue ?? "") ?? new Date());

  const currentCategories = categoryOptions[formData.type];

  const isEditMode = Boolean(initialData);
  const isModalMode = mode === "modal";

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

      if (dateFieldRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsCategoryOpen(false);
      setIsDatePickerOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isModalMode) {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isModalMode]);

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
      setIsDatePickerOpen(false);
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

    if (!result.success || !result.transaction) {
      setSubmitError(result.error ?? "Não foi possível salvar o lançamento.");
      setIsSubmitting(false);
      return;
    }

    if (isModalMode) {
      onSuccess?.(result.transaction);
      onClose?.();
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
    }
  }

  const formContent = (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-[1.4rem] border border-white/70 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:rounded-3xl sm:p-6"
      >
        <div className="mb-4 sm:mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isEditMode ? "Editar lançamento" : "Novo lançamento"}
              </span>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950 sm:mt-2 sm:text-3xl">
                {isEditMode ? "Atualize a movimentação" : "Adicionar movimentação"}
              </h1>
            </div>

            {isModalMode ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Fechar modal"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            ) : null}
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

          <div className="min-w-0" ref={dateFieldRef}>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Data</span>
            <button
              type="button"
              onClick={() => {
                setViewDate(parseDateValue(formData.date) ?? new Date());
                setIsDatePickerOpen((current) => !current);
              }}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-2 text-left text-sm text-slate-900 outline-none transition ${
                errors.date
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <span>{formatDateLabel(formData.date)}</span>
              <span className="text-slate-400">▾</span>
            </button>

            {isDatePickerOpen ? (
              <div className="mt-2 overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                    aria-label="Mês anterior"
                  >
                    ←
                  </button>
                  <strong className="text-sm font-semibold capitalize text-slate-950">
                    {formatMonthLabel(viewDate)}
                  </strong>
                  <button
                    type="button"
                    onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                    aria-label="Próximo mês"
                  >
                    →
                  </button>
                </div>

                <div className="px-4 pb-4 pt-3">
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {weekdayLabels.map((label, index) => (
                      <span key={`${label}-${index}`}>{label}</span>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {getCalendarDays(viewDate).map((day) => {
                      const isSelected = formData.date === day.value;

                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => {
                            updateField("date", day.value);
                            setIsDatePickerOpen(false);
                          }}
                          className={`inline-flex h-10 items-center justify-center rounded-xl text-sm transition ${
                            isSelected
                              ? "bg-slate-900 font-semibold text-white"
                              : day.isCurrentMonth
                                ? "text-slate-900 hover:bg-slate-50"
                                : "text-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        setViewDate(today);
                        updateField("date", toDateInputValue(today));
                        setIsDatePickerOpen(false);
                      }}
                      className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(false)}
                      className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {errors.date ? <span className="mt-1.5 block text-sm text-rose-600">{errors.date}</span> : null}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:mt-6 sm:flex sm:flex-row sm:justify-end sm:pt-5">
          {isModalMode ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:min-h-11 sm:py-2.5"
            >
              Cancelar
            </button>
          ) : (
            <Link
              href={backHref ?? "/lancamentos"}
              className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:min-h-11 sm:py-2.5"
            >
              Cancelar
            </Link>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:min-h-11 sm:py-2.5"
          >
            {isSubmitting ? "Salvando..." : isEditMode ? "Salvar alterações" : "Salvar lançamento"}
          </button>
        </div>
      </form>
    </>
  );

  if (isModalMode) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
        <div className="flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-[28px] sm:max-h-[90vh] sm:rounded-[30px]">
          <div className="flex justify-center px-4 pb-2 pt-3 sm:hidden">
            <span className="h-1.5 w-14 rounded-full bg-white/40" />
          </div>
          {formContent}
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <main className="app-page-shell min-h-screen px-3 py-3 text-slate-900 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:gap-6">{formContent}</div>
    </main>
  );
}
