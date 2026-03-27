"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthField } from "@/components/auth-field";
import { AuthShell } from "@/components/auth-shell";
import { getAuthErrorMessage, supabase } from "@/shared/lib/supabase";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterErrors = Partial<Record<keyof RegisterFormData, string>>;

const defaultFormData: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { label: "Fraca", color: "bg-rose-500", text: "text-rose-600", value: 1 };
  }

  if (score <= 3) {
    return { label: "Media", color: "bg-amber-500", text: "text-amber-600", value: 2 };
  }

  return { label: "Forte", color: "bg-emerald-500", text: "text-emerald-600", value: 3 };
}

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

  function updateField<K extends keyof RegisterFormData>(field: K, value: RegisterFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
    setAuthError(null);
    setSuccessMessage(null);

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }

    if (field === "password" || field === "confirmPassword") {
      setErrors((current) => ({
        ...current,
        password: field === "password" ? undefined : current.password,
        confirmPassword: undefined,
      }));
    }
  }

  function validateForm() {
    const nextErrors: RegisterErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Informe seu nome.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Informe seu e-mail.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Informe uma senha.";
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirme sua senha.";
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "As senhas precisam ser iguais.";
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
    setSuccessMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
        },
      },
    });

    if (error) {
      setAuthError(getAuthErrorMessage(error.message));
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace("/");
      return;
    }

    setSuccessMessage("Conta criada com sucesso. Verifique seu e-mail para confirmar o cadastro.");
    setIsSubmitting(false);
  }

  return (
    <AuthShell
      eyebrow="Cadastro"
      title="Crie sua conta"
      description="Comece com um fluxo claro e organizado para acompanhar gastos, receitas e investimentos com tranquilidade."
      footer={
        <div>
          Ja possui conta?{" "}
          <Link href="/login" className="font-semibold text-slate-900 transition hover:text-emerald-700">
            Voltar ao login
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

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <AuthField
          label="Nome"
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
          value={formData.name}
          onChange={(event) => updateField("name", event.target.value)}
          error={errors.name}
        />

        <AuthField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={formData.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
        />

        <div>
          <AuthField
            label="Senha"
            type="password"
            autoComplete="new-password"
            placeholder="Crie uma senha"
            value={formData.password}
            onChange={(event) => updateField("password", event.target.value)}
            error={errors.password}
          />

          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600">Forca da senha</span>
              <span className={`text-sm font-semibold ${passwordStrength.text}`}>
                {formData.password ? passwordStrength.label : "Preencha para avaliar"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={`h-2 rounded-full ${
                    level <= passwordStrength.value && formData.password
                      ? passwordStrength.color
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <AuthField
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita sua senha"
          value={formData.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
        >
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
    </AuthShell>
  );
}
