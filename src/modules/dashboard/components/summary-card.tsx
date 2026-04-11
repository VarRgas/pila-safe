"use client";

import type { SummaryCardData } from "@/shared/types/dashboard";
import { maskFinancialValue, useUi } from "@/shared/lib/ui-context";

const toneClasses = {
  success: {
    accent: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
  },
  danger: {
    accent: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700",
  },
  info: {
    accent: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700",
  },
  neutral: {
    accent: "bg-slate-900",
    badge: "bg-slate-100 text-slate-700",
  },
};

type SummaryCardProps = {
  card: SummaryCardData;
  index: number;
};

export function SummaryCard({ card, index }: SummaryCardProps) {
  const tone = toneClasses[card.tone];
  const isBalanceCard = card.title === "Saldo";
  const { hideValues } = useUi();
  const isNegativeBalance = isBalanceCard && card.amount.includes("-");
  const isZeroBalance = isBalanceCard && /R\$\s?0([,.]0+)?/.test(card.amount);

  return (
    <article
      className="group relative overflow-hidden rounded-[1.4rem] border border-white/70 bg-white/85 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(15,23,42,0.10)] sm:rounded-3xl sm:p-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-slate-100">
        <div className={`h-full w-24 rounded-r-full ${tone.accent}`} />
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal">
            {card.title}
          </p>
          <strong
            className={`mt-2 block text-lg font-semibold tracking-tight sm:mt-3 sm:text-2xl ${
              isBalanceCard
                ? `${isNegativeBalance ? "text-rose-700" : isZeroBalance ? "text-slate-950" : "text-emerald-700"} sm:whitespace-nowrap`
                : "text-slate-950"
            }`}
          >
            {maskFinancialValue(card.amount, hideValues)}
          </strong>
          {isBalanceCard ? (
            <span
              className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold sm:mt-3 sm:px-3 sm:text-xs ${tone.badge}`}
            >
              {card.change}
            </span>
          ) : null}
        </div>

        {!isBalanceCard ? (
          <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${tone.badge}`}>
            {card.change}
          </span>
        ) : null}
      </div>
    </article>
  );
}
