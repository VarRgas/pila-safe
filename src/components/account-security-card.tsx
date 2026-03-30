"use client";

import { useState } from "react";
import { supabase } from "@/shared/lib/supabase";

type AccountSecurityCardProps = {
  userEmail: string;
};

export function AccountSecurityCard({ userEmail }: AccountSecurityCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleResetPassword() {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const redirectTo = `${window.location.origin}/login`;

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo,
    });

    if (error) {
      setErrorMessage("Não foi possível enviar o e-mail de redefinição agora.");
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Enviamos um e-mail com instrucoes para redefinir sua senha.");
    setIsSubmitting(false);
  }

  return (
    <section
      id="seguranca"
      className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Segurança
          </span>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Redefinição de senha
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Envie um e-mail seguro de redefinição para atualizar sua senha usando o fluxo do
            Supabase Auth.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleResetPassword()}
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Enviando..." : "Redefinir senha por e-mail"}
        </button>
      </div>

      {successMessage ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
