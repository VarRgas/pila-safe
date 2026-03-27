import type { InputHTMLAttributes } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function AuthField({ label, error, className = "", ...props }: AuthFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className={`h-12 w-full rounded-2xl border px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
          error
            ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-slate-400 focus:ring-slate-200"
        } ${className}`}
      />
      {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
    </label>
  );
}
