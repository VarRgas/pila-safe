"use server";

import { revalidatePath } from "next/cache";
import { createTransactionForUser } from "@/modules/transactions/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";
import type { NewTransactionFormData, TransactionItem } from "@/shared/types/dashboard";

type CreateTransactionActionResult = {
  success: boolean;
  error?: string;
  transaction?: TransactionItem;
};

export async function createTransactionAction(
  formData: NewTransactionFormData,
): Promise<CreateTransactionActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Sua sessao expirou. Entre novamente para continuar.",
    };
  }

  const transaction = await createTransactionForUser(user.id, formData);

  revalidatePath("/");
  revalidatePath("/lancamentos");

  return {
    success: true,
    transaction,
  };
}
