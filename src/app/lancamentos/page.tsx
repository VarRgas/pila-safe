import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { TransactionsPageClient } from "@/components/transactions-page-client";
import {
  getCategoryOptionsByType,
  getTransactionsByUserId,
  mapTransactionsToItems,
} from "@/modules/transactions/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";

export default async function TransactionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const transactions = await getTransactionsByUserId(user.id);
  const categoriesByType = await getCategoryOptionsByType(user.id);

  return (
    <>
      <AppHeader
        userEmail={user.email ?? null}
        userName={(user.user_metadata?.name as string | undefined) ?? null}
      />
      <TransactionsPageClient
        categoriesByType={categoriesByType}
        initialTransactions={mapTransactionsToItems(transactions)}
      />
    </>
  );
}
