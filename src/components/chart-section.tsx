import type { ChartCardData } from "@/shared/types/dashboard";

type ChartSectionProps = {
  charts: ChartCardData[];
};

const barTones = {
  success: "from-emerald-400 to-emerald-600",
  info: "from-sky-400 to-sky-600",
};

export function ChartSection({ charts }: ChartSectionProps) {
  return (
    <section className="grid gap-6">
      {charts.map((chart) => (
        <article
          key={chart.title}
          className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                {chart.title}
              </h2>
              <p className="text-sm text-slate-500">{chart.subtitle}</p>
            </div>

            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Dados reais
            </span>
          </div>

          <div className="mt-6 grid min-h-64 grid-cols-7 items-end gap-3 rounded-2xl bg-slate-50 p-4">
            {chart.bars.map((value, index) => (
              <div key={`${chart.title}-${index}`} className="flex h-full flex-col justify-end gap-3">
                <div className="overflow-hidden rounded-full bg-white shadow-inner">
                  <div
                    className={`w-full rounded-full bg-gradient-to-t ${barTones[chart.tone]} transition-transform duration-200 hover:scale-[1.02]`}
                    style={{ height: `${value}%` }}
                  />
                </div>
                <span className="text-center text-xs font-medium text-slate-400">
                  {chart.labels?.[index] ?? `S${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
