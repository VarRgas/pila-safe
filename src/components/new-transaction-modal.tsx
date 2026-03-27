"use client";

import { useState } from "react";
import type { NewTransactionFormData, TransactionItem, TransactionType } from "@/shared/types/dashboard";

type NewTransactionModalProps = {
  isOpen: boolean;
  categoriesByType: Record<TransactionType, string[]>;
  onClose: () => void;
  onSubmit: (data: NewTransactionFormData) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  initialData?: TransactionItem | null;
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

const typeOptions: TransactionType[] = ["RECEITA", "DESPESA", "INVESTIMENTO"];

const typeButtonClasses = {
  RECEITA: "border-emerald-200 bg-emerald-50 text-emerald-700",
  DESPESA: "border-rose-200 bg-rose-50 text-rose-700",
  INVESTIMENTO: "border-sky-200 bg-sky-50 text-sky-700",
};

type FormErrors = Partial<Record<keyof NewTransactionFormData, string>>;

export function NewTransactionModal({
  isOpen,
  categoriesByType,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError = null,
  initialData = null,
}: NewTransactionModalProps) {
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
  const [errors, setErrors] = useState<FormErrors>({});
  const isEditMode = Boolean(initialData);

  const currentCategories = categoriesByType[formData.type];

  if (!isOpen) {
    return null;
  }

  function updateField<K extends keyof NewTransactionFormData>(field: K, value: NewTransactionFormData[K]) {
    if (field === "type") {
      const nextType = value as TransactionType;
      const nextCategories = categoriesByType[nextType];

      setFormData((current) => ({
        ...current,
        type: nextType,
        category: nextCategories.includes(current.category) ? current.category : "",
      }));

      if (errors.type || errors.category) {
        setErrors((current) => ({
          ...current,
          type: undefined,
          category: undefined,
        }));
      }

      return;
    }

    setFormData((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!formData.description.trim()) {
      nextErrors.description = "Informe uma descrição.";
    }

    if (!formData.category.trim()) {
      nextErrors.category = "Selecione uma categoria.";
    }

    if (!formData.amount || Number(formData.amount.replace(/\D/g, "")) <= 0) {
      nextErrors.amount = "Informe um valor maior que zero.";
    }

    if (!formData.date) {
      nextErrors.date = "Selecione uma data.";
    }

    return nextErrors;
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit(formData);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-2 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8">
      <div className="flex max-h-[100dvh] w-full max-w-2xl min-w-0 flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.20)] sm:max-h-[88vh] sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:gap-4 sm:px-8 sm:py-6">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {isEditMode ? "Editar lançamento" : "Novo lançamento"}
            </span>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              {isEditMode ? "Atualizar movimentação financeira" : "Adicionar movimentação financeira"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isEditMode
                ? "Revise os campos e salve as alterações deste lançamento."
                : "Preencha os campos para inserir um novo item na sua listagem."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormData(getDefaultFormData());
              setErrors({});
              onClose();
            }}
            className="shrink-0 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            Fechar
          </button>
        </div>

        <form className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6" onSubmit={handleSubmit}>
          {submitError ? (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Descrição</span>
              <input
                required
                value={formData.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white ${
                  errors.description
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50 focus:border-slate-400"
                }`}
                placeholder="Ex.: Conta de energia"
              />
              {errors.description ? (
                <span className="mt-2 block text-sm text-rose-600">{errors.description}</span>
              ) : null}
            </label>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Tipo</span>
              <div className="flex flex-wrap gap-2 md:flex-nowrap">
                {typeOptions.map((option) => {
                  const isActive = formData.type === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateField("type", option)}
                      className={`min-h-12 min-w-0 whitespace-nowrap rounded-2xl border px-3 py-3 text-sm font-semibold transition md:flex-1 ${
                        isActive
                          ? `${typeButtonClasses[option]} shadow-sm ring-2 ring-offset-1 ${
                              option === "RECEITA"
                                ? "ring-emerald-200"
                                : option === "DESPESA"
                                  ? "ring-rose-200"
                                  : "ring-sky-200"
                            }`
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="min-w-0">
              <span className="mb-2 block text-sm font-medium text-slate-700">Categoria</span>
              <select
                value={formData.category}
                onChange={(event) => updateField("category", event.target.value)}
                className={`h-12 w-full rounded-2xl border px-4 pr-10 text-sm text-slate-900 shadow-sm outline-none transition appearance-none bg-right bg-no-repeat focus:bg-white focus:ring-2 focus:ring-slate-300 ${
                  errors.category
                    ? "border-rose-300 bg-rose-50 hover:border-rose-400 focus:border-rose-400"
                    : "border-slate-200 bg-white hover:border-slate-400 focus:border-slate-400"
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {currentCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <span className="mt-2 block text-sm text-rose-600">{errors.category}</span>
              ) : null}
            </label>

            <label className="min-w-0">
              <span className="mb-2 block text-sm font-medium text-slate-700">Valor</span>
              <input
                required
                inputMode="numeric"
                type="text"
                value={formData.amount}
                onChange={(event) => updateField("amount", formatCurrencyValue(event.target.value))}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white ${
                  errors.amount
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50 focus:border-slate-400"
                }`}
                placeholder="R$ 0,00"
              />
              {errors.amount ? (
                <span className="mt-2 block text-sm text-rose-600">{errors.amount}</span>
              ) : null}
            </label>

            <label className="min-w-0">
              <span className="mb-2 block text-sm font-medium text-slate-700">Data</span>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(event) => updateField("date", event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white ${
                  errors.date
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50 focus:border-slate-400"
                }`}
              />
              {errors.date ? (
                <span className="mt-2 block text-sm text-rose-600">{errors.date}</span>
              ) : null}
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setFormData(getDefaultFormData());
                setErrors({});
                onClose();
              }}
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
            >
              {isSubmitting ? "Salvando..." : isEditMode ? "Salvar alterações" : "Salvar lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
