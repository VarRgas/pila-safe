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

const typeDescriptions = {
  RECEITA: "Entradas e ganhos",
  DESPESA: "Saidas e contas",
  INVESTIMENTO: "Aportes e reserva",
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
  const formRef = useRef<HTMLFormElement>(null);

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
      const isMobileViewport = window.innerWidth < 640;
      const openUpwards =
        !isMobileViewport && rect.bottom + estimatedHeight > viewportHeight - 12 && rect.top > estimatedHeight;

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

  function handleClose() {
    setFormData(getDefaultFormData());
    setCategoryQuery("");
    setErrors({});
    setNewCategoryError(null);
    setIsCategoryOpen(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[30px] border border-white/70 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:max-h-[90vh] sm:rounded-[30px]">
        <div className="flex justify-center border-b border-slate-100 px-4 pb-2 pt-3 sm:hidden">
          <span className="h-1.5 w-14 rounded-full bg-slate-200" />
        </div>

        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/88 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isEditMode ? "Editar lançamento" : "Novo lançamento"}
              </span>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                {isEditMode ? "Atualizar movimentação" : "Adicionar movimentação"}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Fechar modal"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        <form
          ref={formRef}
          className="flex-1 overflow-y-auto px-4 py-3 pb-24 sm:px-6 sm:py-5 sm:pb-5"
          onSubmit={handleSubmit}
          onPointerDown={(event) => event.stopPropagation()}
          style={{ overscrollBehavior: "contain", scrollbarGutter: "stable" }}
        >
          {submitError ? (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Descrição</span>
              <input
                required
                value={formData.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:bg-white ${
                  errors.description
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50 focus:border-slate-400"
                }`}
                placeholder="Ex.: Conta de energia"
              />
              {errors.description ? (
                <span className="mt-1.5 block text-sm text-rose-600">{errors.description}</span>
              ) : null}
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
                      className={`rounded-2xl border px-3 py-2.5 text-left transition ${
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
                      <span className="block text-sm font-semibold">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2 min-w-0">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Categoria</span>
              <div ref={categoryFieldRef} className="relative" onFocus={() => setIsCategoryOpen(true)}>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(true)}
                  className={`flex h-11 w-full items-center justify-between rounded-2xl border px-4 pr-10 text-left text-sm text-slate-900 shadow-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-300 sm:hidden ${
                    errors.category
                      ? "border-rose-300 bg-rose-50 hover:border-rose-400 focus:border-rose-400"
                      : "border-slate-200 bg-slate-50 hover:border-slate-400 focus:border-slate-400"
                  }`}
                >
                  <span className={`truncate ${formData.category ? "text-slate-900" : "text-slate-400"}`}>
                    {formData.category || "Selecione ou busque uma categoria"}
                  </span>
                </button>

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
                  className={`hidden h-11 w-full rounded-2xl border px-4 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-300 sm:block ${
                    errors.category
                      ? "border-rose-300 bg-rose-50 hover:border-rose-400 focus:border-rose-400"
                      : "border-slate-200 bg-slate-50 hover:border-slate-400 focus:border-slate-400"
                  }`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ▾
                </span>
              </div>

              {errors.category ? <span className="mt-1.5 block text-sm text-rose-600">{errors.category}</span> : null}
              {newCategoryError ? <span className="mt-1.5 block text-sm text-rose-600">{newCategoryError}</span> : null}
            </div>

            <label className="min-w-0">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Valor</span>
              <input
                required
                inputMode="numeric"
                type="text"
                value={formData.amount}
                onChange={(event) => updateField("amount", formatCurrencyValue(event.target.value))}
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:bg-white ${
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
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:bg-white ${
                  errors.date
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50 focus:border-slate-400"
                }`}
              />
              {errors.date ? <span className="mt-1.5 block text-sm text-rose-600">{errors.date}</span> : null}
            </label>
          </div>
        </form>

        <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-white/88 sm:px-6">
          <div className="flex gap-3 sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 sm:max-w-36 sm:flex-none"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isSubmitting}
              className="inline-flex min-h-11 flex-[1.2] items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:max-w-56 sm:flex-none"
            >
              {isSubmitting ? "Salvando..." : isEditMode ? "Salvar alterações" : "Salvar lançamento"}
            </button>
          </div>
        </div>
      </div>

      {isCategoryOpen
        ? createPortal(
            <div
              ref={categoryDropdownRef}
              className="fixed z-[60] overflow-hidden rounded-t-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.12)] sm:rounded-2xl"
              style={categoryDropdownStyle}
            >
              <div className="border-b border-slate-100 p-3">
                <div className="mb-3 flex justify-center sm:hidden">
                  <span className="h-1.5 w-14 rounded-full bg-slate-200" />
                </div>
                <div className="mb-3 sm:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Categoria
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">Selecionar ou criar</h3>
                </div>
                <input
                  value={categoryQuery}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    const exactMatch = currentCategories.find(
                      (category) => category.toLowerCase() === nextValue.trim().toLowerCase(),
                    );

                    setCategoryQuery(nextValue);
                    setNewCategoryError(null);
                    updateField("category", exactMatch ?? "");
                  }}
                  placeholder="Buscar ou criar categoria"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:text-sm"
                />
              </div>

              <div className="max-h-[min(55vh,26rem)] overflow-y-auto p-2 sm:max-h-60">
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
