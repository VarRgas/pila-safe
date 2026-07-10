export type SummaryTone = "success" | "danger" | "info" | "neutral";

export type SummaryCardData = {
  title: string;
  amount: string;
  change: string;
  tone: SummaryTone;
};

export type DashboardMonthOption = {
  value: string;
  label: string;
};

export type DashboardStatus = "Saudável" | "Neutro" | "Em alerta";

export type FilterOption = {
  label: string;
  active?: boolean;
};

export type ChartCardData = {
  kind: "timeline";
  title: string;
  subtitle: string;
  labels: string[];
  series: Array<{
    label: string;
    tone: "success" | "danger" | "info";
    values: number[];
    formatted: string[];
  }>;
};

export type TransactionType = "RECEITA" | "DESPESA" | "INVESTIMENTO";

export type CategoryOptionsByType = Record<TransactionType, string[]>;

export type TransactionItem = {
  id: string;
  description: string;
  category: string;
  date: string;
  dateValue: string;
  amount: string;
  amountValue: string;
  type: TransactionType;
  isFuture: boolean;
};

export type NewTransactionFormData = {
  description: string;
  type: TransactionType;
  category: string;
  amount: string;
  date: string;
  isFuture: boolean;
};
