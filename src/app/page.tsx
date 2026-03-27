import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import {
  buildSummaryCards,
  getTransactionsByUserId,
  mapTransactionsToItems,
} from "@/modules/transactions/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const transactions = await getTransactionsByUserId(user.id);
  const summaryCards = buildSummaryCards(transactions);

  return (
    <DashboardClient
      userEmail={user.email ?? null}
      initialTransactions={mapTransactionsToItems(transactions)}
      summaryCards={summaryCards}
    />
  );
}
