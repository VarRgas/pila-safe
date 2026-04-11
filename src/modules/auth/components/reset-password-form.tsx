"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthField } from "@/components/auth-field";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { supabase } from "@/shared/lib/supabase";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

type ResetPasswordErrors = Partial<Record<keyof ResetPasswordFormData, string>>;

const defaultFormData: ResetPasswordFormData = {
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
    return { label: "Média", color: "bg-amber-500", text: "text-amber-600", value: 2 };
  }

  return { label: "Forte", color: "bg-emerald-500", text: "text-emerald-600", value: 3 };
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error || !data.session) {
        setErrorMessage("O link de redefinição é inválido ou expirou.");
        setIsReady(false);
        return;
      }

      setIsReady(true);
    }

    void prepareRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || session) {
        setErrorMessage(null);
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function updateField<K extends keyof ResetPasswordFormData>(field: K, value: ResetPasswordFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrorMessage(null);
    setSuccessMessage(null);

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function validateForm() {
    const nextErrors: ResetPasswordErrors = {};

    if (!formData.password.trim()) {
      nextErrors.password = "Informe a nova senha.";
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirme a nova senha.";
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
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.updateUser({ password: formData.password });

    if (error) {
      setErrorMessage("Não foi possível atualizar sua senha agora.");
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Senha atualizada com sucesso. Redirecionando para o login...");
    await supabase.auth.signOut();

    window.setTimeout(() => {
      router.replace("/login");
    }, 1400);
  }

  return (
    <AuthShell
      eyebrow="Nova senha"
      title="Defina uma nova senha"
      description="Escolha uma nova senha para voltar a acessar sua conta com segurança."
      footer={
        <div>
          Precisa de outro link?{" "}
          <Link
            href="/recuperar-senha"
            className="font-semibold text-slate-900 transition hover:text-emerald-700"
          >
            Solicitar nova redefinição
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

        {!isReady ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Validando seu link de recuperação...
          </div>
        ) : (
          <>
            <div>
              <AuthField
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                placeholder="Digite sua nova senha"
                value={formData.password}
                onChange={(event) => updateField("password", event.target.value)}
                error={errors.password}
              />

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-600">Força da senha</span>
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
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              placeholder="Repita sua nova senha"
              value={formData.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              error={errors.confirmPassword}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
            >
              {isSubmitting ? "Salvando..." : "Salvar nova senha"}
            </button>
          </>
        )}
      </form>
    </AuthShell>
  );
}
