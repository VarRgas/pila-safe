export type SummaryTone = "success" | "danger" | "info" | "neutral";

export type SummaryCardData = {
  title: string;
  amount: string;
  change: string;
  tone: SummaryTone;
};

export type FilterOption = {
  label: string;
  active?: boolean;
};

export type ChartCardData = {
  title: string;
  subtitle: string;
  bars: number[];
  tone: "success" | "info";
};

export type TransactionType = "RECEITA" | "DESPESA" | "INVESTIMENTO";

export type TransactionItem = {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: string;
  type: TransactionType;
};

export type NewTransactionFormData = {
  description: string;
  type: TransactionType;
  category: string;
  amount: string;
  date: string;
};
