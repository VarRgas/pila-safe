"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthField } from "@/components/auth-field";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { getAuthErrorMessage, supabase } from "@/shared/lib/supabase";

type ResetRequestFormData = {
  email: string;
};

type ResetRequestErrors = Partial<Record<keyof ResetRequestFormData, string>>;

const defaultFormData: ResetRequestFormData = {
  email: "",
};

export function RequestPasswordResetForm() {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<ResetRequestErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function updateField(value: string) {
    setFormData({ email: value });
    setErrorMessage(null);
    setSuccessMessage(null);

    if (errors.email) {
      setErrors({ email: undefined });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.email.trim()) {
      setErrors({ email: "Informe seu e-mail." });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const redirectTo = `${window.location.origin}/redefinir-senha`;

    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo,
    });

    if (error) {
      setErrorMessage(getAuthErrorMessage(error.message));
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Enviamos um e-mail com instruções para redefinir sua senha.");
    setIsSubmitting(false);
  }

  return (
    <AuthShell
      eyebrow="Recuperação"
      title="Redefinir sua senha"
      description="Informe seu e-mail para receber um link seguro de redefinição de senha."
      footer={
        <div>
          Lembrou sua senha?{" "}
          <Link href="/login" className="font-semibold text-slate-900 transition hover:text-emerald-700">
            Voltar ao login
          </Link>
        </div>
      }
    >
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <AuthField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="você@exemplo.com"
          value={formData.email}
          onChange={(event) => updateField(event.target.value)}
          error={errors.email}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
        >
          {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
        </button>
      </form>
    </AuthShell>
  );
}
