import { createBrowserClient } from "@supabase/ssr";

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseBrowserClient();

export function getAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "E-mail ou senha invalidos.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "Ja existe uma conta com este e-mail.";
  }

  if (normalizedMessage.includes("password should be at least")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  return "Nao foi possivel concluir a operacao agora. Tente novamente.";
}
