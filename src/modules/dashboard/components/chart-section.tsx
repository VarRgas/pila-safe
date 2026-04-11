"use client";

import type { ChartCardData } from "@/shared/types/dashboard";
import { maskFinancialValue, useUi } from "@/shared/lib/ui-context";

type ChartSectionProps = {
  charts: ChartCardData[];
  className?: string;
};

const comparisonToneClasses = {
  success: {
    badge: "bg-emerald-50 text-emerald-700",
    gradient: "from-emerald-400 to-emerald-600",
  },
  danger: {
    badge: "bg-rose-50 text-rose-700",
    gradient: "from-rose-400 to-rose-600",
  },
  info: {
    badge: "bg-sky-50 text-sky-700",
    gradient: "from-sky-400 to-sky-600",
  },
};

const timelineToneClasses = {
  success: "bg-emerald-400",
  danger: "bg-rose-500",
  info: "bg-sky-500",
};

function normalizeWidths(values: number[]) {
  const maxValue = Math.max(...values, 0);

  if (maxValue === 0) {
    return values.map(() => 0);
  }

  return values.map((value) => Math.max(8, Math.round((value / maxValue) * 100)));
}

function renderCenterValue(value: string, hideValues: boolean) {
  const maskedValue = maskFinancialValue(value, hideValues);

  if (hideValues || !maskedValue.startsWith("R$")) {
    return (
      <strong className="mt-2 whitespace-nowrap text-base font-semibold tracking-tight text-slate-950 sm:text-lg md:text-base lg:text-lg xl:text-xl">
        {maskedValue}
      </strong>
    );
  }

  return (
    <div className="mt-2 flex flex-col items-center leading-none">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">R$</span>
      <strong className="mt-1 whitespace-nowrap text-base font-semibold tracking-tight text-slate-950 sm:text-lg md:text-base lg:text-lg">
        {maskedValue.replace("R$", "").trim()}
      </strong>
    </div>
  );
}

export function ChartSection({ charts, className = "" }: ChartSectionProps) {
  const { hideValues } = useUi();

  return (
    <section className={`grid gap-6 ${className}`.trim()}>
      {charts.map((chart) => {
        if (chart.kind === "timeline") {
          const allValues = chart.series.flatMap((serie) => serie.values);
          const maxValue = Math.max(...allValues, 0);

          return (
            <article
              key={chart.title}
              className="min-w-0 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6"
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
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Ainda não há movimentações suficientes para montar este gráfico.
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <div className="min-w-[400px] rounded-2xl border border-slate-200 bg-slate-50 p-2.5 sm:min-w-[560px] sm:p-4">
                    <div
                      className="grid h-48 gap-x-3 sm:h-72 sm:gap-x-5"
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
        }

        if (chart.kind === "comparison") {
          const widths = normalizeWidths(chart.items.map((item) => item.value));

          return (
            <article
              key={chart.title}
              className="min-w-0 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">{chart.title}</h2>
                  <p className="text-sm text-slate-500">{chart.subtitle}</p>
                </div>

                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Dados reais
                </span>
              </div>

              {chart.items.every((item) => item.value === 0) ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Ainda não há movimentações suficientes para montar este gráfico.
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {chart.items.map((item, index) => {
                    const toneClass = comparisonToneClasses[item.tone];

                    return (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-slate-600">{item.label}</span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass.badge}`}>
                            {maskFinancialValue(item.formatted, hideValues)}
                          </span>
                        </div>

                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white shadow-inner">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${toneClass.gradient}`}
                            style={{ width: `${widths[index]}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        }

        const total = chart.items.reduce((sum, item) => sum + item.value, 0);

        return (
          <article
            key={chart.title}
            className="min-w-0 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">{chart.title}</h2>
                <p className="text-sm text-slate-500">{chart.subtitle}</p>
              </div>

              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Dados reais
              </span>
            </div>

            {total === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Ainda não há movimentações suficientes para montar este gráfico.
              </div>
            ) : (
              <div className="mt-6 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                <div className="flex h-44 items-center justify-center">
                  <div className="relative h-40 w-40 rounded-full bg-slate-100 p-3">
                    <div
                      className="h-full w-full rounded-full"
                      style={{
                        background: `conic-gradient(${chart.items
                          .map((item, index) => {
                            const previous = chart.items
                              .slice(0, index)
                              .reduce((sum, current) => sum + current.value, 0);
                            const start = (previous / total) * 360;
                            const end = ((previous + item.value) / total) * 360;

                            return `${item.color} ${start}deg ${end}deg`;
                          })
                          .join(", ")})`,
                      }}
                    />
                    <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white px-4 text-center shadow-inner sm:inset-7">
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                        {chart.totalLabel}
                      </span>
                      {renderCenterValue(chart.totalValue, hideValues)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {chart.items.map((item) => {
                    const percentage = total === 0 ? 0 : Math.round((item.value / total) * 100);

                    return (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                          </div>
                          <div className="text-right">
                            <strong className="block text-sm font-semibold text-slate-950">
                              {maskFinancialValue(item.formatted, hideValues)}
                            </strong>
                            <span className="text-xs text-slate-500">{percentage}% do total</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
