import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { DashboardClient } from "@/components/dashboard-client";
import {
  buildChartCards,
  buildSummaryCards,
  filterTransactionsByMonth,
  getDashboardPeriodLabel,
  getDashboardStatus,
  getAvailableMonths,
  getCategoryOptionsByType,
  getTransactionsByUserId,
  mapTransactionsToItems,
} from "@/modules/transactions/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";

type DashboardPageProps = {
  searchParams?: Promise<{ mes?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedMonth = resolvedSearchParams?.mes;
  const transactions = await getTransactionsByUserId(user.id);
  const filteredSummaryTransactions = filterTransactionsByMonth(transactions, selectedMonth);
  const availableMonths = getAvailableMonths(transactions);
  const periodLabel = getDashboardPeriodLabel(selectedMonth, availableMonths);
  const statusLabel = getDashboardStatus(filteredSummaryTransactions);
  const summaryCards = buildSummaryCards(filteredSummaryTransactions);
  const chartCards = buildChartCards(filteredSummaryTransactions);
  const categoriesByType = await getCategoryOptionsByType(user.id);

  return (
    <>
      <AppHeader userEmail={user.email ?? null} />
      <DashboardClient
        availableMonths={availableMonths}
        categoriesByType={categoriesByType}
        chartCards={chartCards}
        initialTransactions={mapTransactionsToItems(transactions)}
        periodLabel={periodLabel}
        selectedMonth={selectedMonth ?? ""}
        statusLabel={statusLabel}
        summaryCards={summaryCards}
      />
    </>
  );
}
