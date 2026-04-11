import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { DashboardClient } from "@/modules/dashboard/components/dashboard-client";
import {
  buildChartCards,
  buildNextMonthProjection,
  buildSummaryCards,
  filterCurrentDashboardTransactions,
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
  const filteredSummaryTransactions = filterCurrentDashboardTransactions(transactions, selectedMonth);
  const availableMonths = getAvailableMonths(transactions);
  const periodLabel = getDashboardPeriodLabel(selectedMonth, availableMonths);
  const statusLabel = getDashboardStatus(filteredSummaryTransactions);
  const summaryCards = buildSummaryCards(filteredSummaryTransactions);
  const chartCards = buildChartCards(filteredSummaryTransactions);
  const nextMonthProjection = buildNextMonthProjection(transactions);
  const categoriesByType = await getCategoryOptionsByType(user.id);

  return (
    <>
      <AppHeader
        userEmail={user.email ?? null}
        userName={(user.user_metadata?.name as string | undefined) ?? null}
      />
      <DashboardClient
        availableMonths={availableMonths}
        categoriesByType={categoriesByType}
        chartCards={chartCards}
        initialTransactions={mapTransactionsToItems(transactions)}
        nextMonthProjection={nextMonthProjection}
        periodLabel={periodLabel}
        selectedMonth={selectedMonth ?? ""}
        statusLabel={statusLabel}
        summaryCards={summaryCards}
      />
    </>
  );
}
