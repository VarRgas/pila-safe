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

export type ChartMetricItem = {
  label: string;
  value: number;
  formatted: string;
  tone: "success" | "danger" | "info";
};

export type ChartDistributionItem = {
  label: string;
  value: number;
  formatted: string;
  color: string;
};

export type ChartCardData =
  | {
      kind: "comparison";
      title: string;
      subtitle: string;
      items: ChartMetricItem[];
    }
  | {
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
    }
  | {
      kind: "distribution";
      title: string;
      subtitle: string;
      items: ChartDistributionItem[];
      totalLabel: string;
      totalValue: string;
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
};

export type NewTransactionFormData = {
  description: string;
  type: TransactionType;
  category: string;
  amount: string;
  date: string;
};
