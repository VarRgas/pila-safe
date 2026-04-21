import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { TransactionFormPageClient } from "@/modules/transactions/components/transaction-form-page-client";
import { getCategoryOptionsByType } from "@/modules/transactions/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase-server";

type NewTransactionPageProps = {
  searchParams: Promise<{ voltar?: string }>;
};

export default async function NewTransactionPage({ searchParams }: NewTransactionPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const backHref = params.voltar?.startsWith("/") ? params.voltar : "/lancamentos";
  const categoriesByType = await getCategoryOptionsByType(user.id);

  return (
    <>
      <AppHeader
        userEmail={user.email ?? null}
        userName={(user.user_metadata?.name as string | undefined) ?? null}
      />
      <TransactionFormPageClient
        categoriesByType={categoriesByType}
        backHref={backHref}
        redirectTo={backHref}
      />
    </>
  );
}
