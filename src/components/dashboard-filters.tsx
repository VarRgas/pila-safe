import type { FilterOption } from "@/shared/types/dashboard";

type DashboardFiltersProps = {
  monthOptions: FilterOption[];
  categoryOptions: FilterOption[];
};

function FilterPill({ option }: { option: FilterOption }) {
  return (
    <button
      type="button"
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm ${
        option.active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
      }`}
    >
      {option.label}
    </button>
  );
}

export function DashboardFilters({
  monthOptions,
  categoryOptions,
}: DashboardFiltersProps) {
  return (
    <section className="grid gap-4 rounded-3xl border border-white/70 bg-white/75 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur sm:p-5 lg:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Filtrar por mes
        </p>
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {monthOptions.map((option) => (
            <FilterPill key={option.label} option={option} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Filtrar por categoria
        </p>
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {categoryOptions.map((option) => (
            <FilterPill key={option.label} option={option} />
          ))}
        </div>
      </div>
    </section>
  );
}
