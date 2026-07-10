"use client";

import type { ChartCardData } from "@/shared/types/dashboard";
import { maskFinancialValue, useUi } from "@/shared/lib/ui-context";

type ChartSectionProps = {
  charts: ChartCardData[];
  className?: string;
};

const timelineToneClasses = {
  success: "bg-emerald-400",
  danger: "bg-rose-500",
  info: "bg-sky-500",
};

export function ChartSection({ charts, className = "" }: ChartSectionProps) {
  const { hideValues } = useUi();

  return (
    <section className={`grid gap-4 ${className}`.trim()}>
      {charts.map((chart) => {
        const allValues = chart.series.flatMap((serie) => serie.values);
        const maxValue = Math.max(...allValues, 0);

        return (
          <article
            key={chart.title}
            className="min-w-0 rounded-[1.6rem] bg-white/68 p-4 ring-1 ring-slate-200/60 sm:rounded-3xl sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">{chart.title}</h2>
                <p className="text-sm text-slate-500">{chart.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                {chart.series.map((serie) => (
                  <span key={serie.label} className="inline-flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${timelineToneClasses[serie.tone]}`} />
                    {serie.label}
                  </span>
                ))}
              </div>
            </div>

            {maxValue === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Ainda não há movimentações suficientes para montar este gráfico.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[360px] rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-200/70 sm:min-w-[520px] sm:p-4">
                  <div
                    className="grid h-36 gap-x-2 sm:h-64 sm:gap-x-5"
                    style={{
                      gridTemplateColumns: `40px repeat(${chart.labels.length}, minmax(0, 1fr))`,
                    }}
                  >
                    <div className="relative">
                      {[0, 25, 50, 75, 100].map((tick) => (
                        <div
                          key={tick}
                          className="absolute left-0 right-0 flex -translate-y-1/2 items-center justify-end pr-2"
                          style={{ bottom: `${tick}%` }}
                        >
                          <span className="text-[9px] text-slate-400 sm:text-[10px]">
                            {hideValues
                              ? "••••"
                              : Math.round((maxValue * tick) / 100).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {chart.labels.map((label, monthIndex) => (
                      <div
                        key={label}
                        className="grid min-w-0 grid-rows-[1fr_auto_auto] gap-2 rounded-2xl px-2 py-2 sm:gap-3 sm:px-3"
                      >
                        <div className="relative flex h-full items-end justify-center gap-1.5 border-b border-slate-200 sm:gap-2">
                          {[0, 25, 50, 75, 100].map((tick) => (
                            <div
                              key={tick}
                              className="absolute inset-x-0 border-t border-dashed border-slate-200"
                              style={{ bottom: `${tick}%` }}
                            />
                          ))}

                          {chart.series.map((serie) => {
                            const value = serie.values[monthIndex] ?? 0;
                            const height = maxValue === 0 ? 0 : Math.max(4, (value / maxValue) * 100);

                            return (
                              <div
                                key={serie.label}
                                className="relative z-10 flex h-full w-4 items-end justify-center sm:w-5"
                              >
                                <div
                                  className={`w-full rounded-t-md ${timelineToneClasses[serie.tone]}`}
                                  style={{ height: `${height}%` }}
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-3 gap-1 text-center">
                          {chart.series.map((serie) => (
                            <span
                              key={serie.label}
                              className={`truncate text-[9px] font-medium sm:text-[10px] ${
                                serie.tone === "success"
                                  ? "text-emerald-700"
                                  : serie.tone === "danger"
                                    ? "text-rose-700"
                                    : "text-sky-700"
                              }`}
                            >
                              {maskFinancialValue(serie.formatted[monthIndex], hideValues)}
                            </span>
                          ))}
                        </div>

                        <div className="text-center text-[10px] font-semibold text-slate-500 sm:text-xs">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
