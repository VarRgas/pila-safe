import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { TransactionFormPageClient } from "@/modules/transactions/components/transaction-form-page-client";
import {
  getCategoryOptionsByType,
  getTransactionByIdForUser,
  mapTransactionsToItems,
} from "@/modules/transactions/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";

type EditTransactionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ voltar?: string }>;
};

export default async function EditTransactionPage({ params, searchParams }: EditTransactionPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const routeParams = await params;
  const query = await searchParams;
  const transaction = await getTransactionByIdForUser(user.id, routeParams.id);

  if (!transaction) {
    notFound();
  }

  const categoriesByType = await getCategoryOptionsByType(user.id);
  const [initialData] = mapTransactionsToItems([transaction]);
  const backHref = query.voltar?.startsWith("/") ? query.voltar : "/lancamentos";

  return (
    <>
      <AppHeader
        userEmail={user.email ?? null}
        userName={(user.user_metadata?.name as string | undefined) ?? null}
      />
      <TransactionFormPageClient
        categoriesByType={categoriesByType}
        initialData={initialData}
        backHref={backHref}
        redirectTo={backHref}
      />
    </>
  );
}
