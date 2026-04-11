"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthField } from "@/components/auth-field";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { getAuthErrorMessage, supabase } from "@/shared/lib/supabase";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginFormData, string>>;

const defaultFormData: LoginFormData = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  function updateField<K extends keyof LoginFormData>(field: K, value: LoginFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
    setAuthError(null);

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function validateForm() {
    const nextErrors: LoginErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Informe seu e-mail.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Informe sua senha.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setAuthError(getAuthErrorMessage(error.message));
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <AuthShell
      eyebrow="Acesso"
      title="Entrar na sua conta"
      description="Acesse o PilaSafe para acompanhar seu panorama financeiro em um ambiente simples, organizado e confiavel."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold text-slate-900 transition hover:text-emerald-700">
              Criar conta
            </Link>
          </span>
          <Link href="/recuperar-senha" className="font-medium text-slate-500 transition hover:text-slate-900">
            Esqueci minha senha
          </Link>
        </div>
      }
    >
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        {authError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {authError}
          </div>
        ) : null}

        <AuthField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="você@exemplo.com"
          value={formData.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
        />

        <AuthField
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          value={formData.password}
          onChange={(event) => updateField("password", event.target.value)}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthShell>
  );
}
