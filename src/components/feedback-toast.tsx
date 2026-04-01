"use client";

import { useEffect } from "react";

type FeedbackToastProps = {
  message: string;
  tone: "success" | "error";
  onClose: () => void;
};

const toneClasses = {
  success: "border-emerald-200 bg-white text-slate-900",
  error: "border-rose-200 bg-white text-slate-900",
};

const iconClasses = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
};

export function FeedbackToast({ message, tone, onClose }: FeedbackToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 3200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [onClose]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 sm:justify-end sm:px-6 lg:px-8">
      <div
        className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,0.12)] ${toneClasses[tone]}`}
        role="status"
        aria-live="polite"
      >
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${iconClasses[tone]}`} />
        <p className="flex-1 text-sm font-medium leading-6">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-sm font-semibold text-slate-400 transition hover:text-slate-700"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
