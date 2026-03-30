"use server";

import { revalidatePath } from "next/cache";
import {
  createCategoryForUser,
  createTransactionForUser,
  deleteTransactionForUser,
  updateTransactionForUser,
} from "@/modules/transactions/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";
import type { NewTransactionFormData, TransactionItem, TransactionType } from "@/shared/types/dashboard";

type CreateTransactionActionResult = {
  success: boolean;
  error?: string;
  transaction?: TransactionItem;
};

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function revalidateTransactionPages() {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/lancamentos");
}

export async function createTransactionAction(
  formData: NewTransactionFormData,
): Promise<CreateTransactionActionResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      error: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  const transaction = await createTransactionForUser(userId, formData);

  revalidateTransactionPages();

  return {
    success: true,
    transaction,
  };
}

export async function updateTransactionAction(
  transactionId: string,
  formData: NewTransactionFormData,
): Promise<CreateTransactionActionResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      error: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  const transaction = await updateTransactionForUser(userId, transactionId, formData);

  if (!transaction) {
    return {
      success: false,
      error: "Não foi possível editar este lançamento.",
    };
  }

  revalidateTransactionPages();

  return {
    success: true,
    transaction,
  };
}

export async function deleteTransactionAction(transactionId: string) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      error: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  const deleted = await deleteTransactionForUser(userId, transactionId);

  if (!deleted) {
    return {
      success: false,
      error: "Não foi possível excluir este lançamento.",
    };
  }

  revalidateTransactionPages();

  return {
    success: true,
  };
}

export async function createCategoryAction(type: TransactionType, name: string) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      error: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  const categoryName = await createCategoryForUser(userId, type, name);

  if (!categoryName) {
    return {
      success: false,
      error: "Informe um nome válido para a categoria.",
    };
  }

  revalidateTransactionPages();

  return {
    success: true,
    categoryName,
  };
}
