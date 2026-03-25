import type { SummaryCardData } from "@/shared/types/dashboard";

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

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(15,23,42,0.10)]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-slate-100">
        <div className={`h-full w-24 rounded-r-full ${tone.accent}`} />
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{card.title}</p>
          <strong
            className={`mt-3 block text-2xl font-semibold tracking-tight text-slate-950 ${
              isBalanceCard ? "whitespace-nowrap" : ""
            }`}
          >
            {card.amount}
          </strong>
          {isBalanceCard ? (
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}
            >
              {card.change}
            </span>
          ) : null}
        </div>

        {!isBalanceCard ? (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
            {card.change}
          </span>
        ) : null}
      </div>
    </article>
  );
}
