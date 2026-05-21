"use client";

import type { SummaryCardData } from "@/shared/types/dashboard";
import { maskFinancialValue, useUi } from "@/shared/lib/ui-context";

const toneClasses = {
  success: "bg-emerald-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  neutral: "bg-slate-900",
};

type SummaryCardProps = {
  card: SummaryCardData;
  index: number;
};

export function SummaryCard({ card }: SummaryCardProps) {
  const { hideValues } = useUi();

  return (
    <article className="dashboard-summary-card flex items-center justify-between gap-4 border-b border-slate-200/80 py-3 last:border-b-0 sm:block sm:rounded-2xl sm:border-b-0 sm:px-4 sm:py-4 sm:ring-1 sm:ring-slate-200/70">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
          {card.title}
        </p>
        <strong className="mt-1 block text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
          {maskFinancialValue(card.amount, hideValues)}
        </strong>
      </div>

      <div className="flex items-center gap-2 sm:mt-2 sm:justify-between">
        <span className={`inline-flex h-2 w-2 shrink-0 rounded-full ${toneClasses[card.tone]}`} />
        <span className="text-right text-sm text-slate-500 sm:text-left">{card.change}</span>
      </div>
    </article>
  );
}
