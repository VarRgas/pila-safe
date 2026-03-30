import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { DashboardClient } from "@/components/dashboard-client";
import {
  buildChartCards,
  buildSummaryCards,
  getCategoryOptionsByType,
  getTransactionsByUserId,
  mapTransactionsToItems,
} from "@/modules/transactions/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const transactions = await getTransactionsByUserId(user.id);
  const summaryCards = buildSummaryCards(transactions);
  const chartCards = buildChartCards(transactions);
  const categoriesByType = await getCategoryOptionsByType(user.id);

  return (
    <>
      <AppHeader userEmail={user.email ?? null} />
      <DashboardClient
        categoriesByType={categoriesByType}
        chartCards={chartCards}
        initialTransactions={mapTransactionsToItems(transactions)}
        summaryCards={summaryCards}
      />
    </>
  );
}
