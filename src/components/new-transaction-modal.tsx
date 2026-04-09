"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  CategoryOptionsByType,
  NewTransactionFormData,
  TransactionItem,
  TransactionType,
} from "@/shared/types/dashboard";

type NewTransactionModalProps = {
  isOpen: boolean;
  categoriesByType: CategoryOptionsByType;
  onClose: () => void;
  onSubmit: (data: NewTransactionFormData) => Promise<void> | void;
  onCreateCategory?: (type: TransactionType, name: string) => Promise<string | null>;
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
  onCreateCategory,
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
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState(() =>
    initialData?.category === "Sem categoria" ? "" : initialData?.category ?? "",
  );
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);
  const [categoryDropdownStyle, setCategoryDropdownStyle] = useState<React.CSSProperties>({});
  const isEditMode = Boolean(initialData);
  const categoryFieldRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const currentCategories = categoriesByType[formData.type];
  const normalizedCategoryQuery = categoryQuery.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalizedCategoryQuery) {
      return currentCategories;
    }

    return currentCategories.filter((category) =>
      category.toLowerCase().includes(normalizedCategoryQuery),
    );
  }, [currentCategories, normalizedCategoryQuery]);
  const exactCategoryMatch = currentCategories.find(
    (category) => category.toLowerCase() === normalizedCategoryQuery,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.touchAction = "none";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.body.style.touchAction = previousBodyTouchAction;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isCategoryOpen) {
      return;
    }

    function updateDropdownPosition() {
      const inputWrapper = categoryFieldRef.current;

      if (!inputWrapper) {
        return;
      }

      const rect = inputWrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const estimatedHeight = 260;
      const openUpwards = rect.bottom + estimatedHeight > viewportHeight - 12 && rect.top > estimatedHeight;

      setCategoryDropdownStyle({
        left: rect.left,
        top: openUpwards ? rect.top - 8 : rect.bottom + 8,
        width: rect.width,
        transform: openUpwards ? "translateY(-100%)" : undefined,
      });
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (categoryFieldRef.current?.contains(target) || categoryDropdownRef.current?.contains(target)) {
        return;
      }

      setIsCategoryOpen(false);
      setNewCategoryError(null);

      if (formData.category) {
        setCategoryQuery(formData.category);
      }
    }

    updateDropdownPosition();

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [formData.category, isCategoryOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleCreateCategory() {
    if (!onCreateCategory) {
      return;
    }

    const normalizedName = categoryQuery.trim();

    if (!normalizedName) {
      setNewCategoryError("Informe um nome para a categoria.");
      return;
    }

    setIsCreatingCategory(true);
    setNewCategoryError(null);

    const createdCategoryName = await onCreateCategory(formData.type, normalizedName);

    if (!createdCategoryName) {
      setNewCategoryError("Não foi possível salvar a categoria.");
      setIsCreatingCategory(false);
      return;
    }

    setFormData((current) => ({ ...current, category: createdCategoryName }));
    setCategoryQuery(createdCategoryName);
    setIsCategoryOpen(false);
    setIsCreatingCategory(false);
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
      setCategoryQuery(nextCategories.includes(formData.category) ? formData.category : "");
      setIsCategoryOpen(false);
      setNewCategoryError(null);

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
      if (exactCategoryMatch) {
        setFormData((current) => ({ ...current, category: exactCategoryMatch }));
        return nextErrors;
      }

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
    <div className="fixed inset-0 z-50 flex touch-pan-y items-end justify-center overflow-x-hidden bg-slate-950/45 p-2 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8">
      <div className="flex max-h-[100dvh] w-full max-w-2xl min-w-0 touch-pan-y flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.20)] sm:max-h-[88vh] sm:rounded-[28px]">
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

        <form
          className="flex-1 touch-pan-y overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-8 sm:py-6"
          onSubmit={handleSubmit}
          onPointerDown={(event) => event.stopPropagation()}
          style={{ overscrollBehavior: "contain", scrollbarGutter: "stable" }}
        >
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

            <div className="min-w-0">
              <span className="mb-2 block text-sm font-medium text-slate-700">Categoria</span>
              <div
                ref={categoryFieldRef}
                className="relative"
                onFocus={() => setIsCategoryOpen(true)}
              >
                <input
                  value={categoryQuery}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    const exactMatch = currentCategories.find(
                      (category) => category.toLowerCase() === nextValue.trim().toLowerCase(),
                    );

                    setCategoryQuery(nextValue);
                    setNewCategoryError(null);
                    setIsCategoryOpen(true);
                    updateField("category", exactMatch ?? "");
                  }}
                  onFocus={() => setIsCategoryOpen(true)}
                  placeholder="Selecione ou busque uma categoria"
                  className={`h-12 w-full rounded-2xl border px-4 pr-10 text-base text-slate-900 shadow-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-300 sm:text-sm ${
                    errors.category
                      ? "border-rose-300 bg-rose-50 hover:border-rose-400 focus:border-rose-400"
                      : "border-slate-200 bg-white hover:border-slate-400 focus:border-slate-400"
                  }`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ▾
                </span>
              </div>

              {errors.category ? (
                <span className="mt-2 block text-sm text-rose-600">{errors.category}</span>
              ) : null}
              {newCategoryError ? (
                <span className="mt-2 block text-sm text-rose-600">{newCategoryError}</span>
              ) : null}
            </div>

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

      {isCategoryOpen
        ? createPortal(
            <div
              ref={categoryDropdownRef}
              className="fixed z-[60] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.12)]"
              style={categoryDropdownStyle}
            >
              <div className="max-h-60 overflow-y-auto p-2">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setCategoryQuery(category);
                        updateField("category", category);
                        setIsCategoryOpen(false);
                        setNewCategoryError(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition ${
                        formData.category === category
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                      }`}
                    >
                      <span>{category}</span>
                      {formData.category === category ? <span className="text-xs">Selecionada</span> : null}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-sm text-slate-500">Nenhuma categoria encontrada.</div>
                )}

                {onCreateCategory && normalizedCategoryQuery && !exactCategoryMatch ? (
                  <button
                    type="button"
                    onClick={() => void handleCreateCategory()}
                    disabled={isCreatingCategory}
                    className="mt-2 flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>Criar categoria &quot;{categoryQuery.trim()}&quot;</span>
                    <span className="text-xs text-slate-500">
                      {isCreatingCategory ? "Salvando..." : "Nova"}
                    </span>
                  </button>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
