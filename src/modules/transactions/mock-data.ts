import type {
  ChartCardData,
  FilterOption,
  SummaryCardData,
  TransactionItem,
  TransactionType,
} from "@/shared/types/dashboard";

export const summaryCards: SummaryCardData[] = [
  {
    title: "Receita",
    amount: "R$ 12.480,00",
    change: "+8,4% no mes",
    tone: "success",
  },
  {
    title: "Despesa",
    amount: "R$ 4.215,00",
    change: "-2,1% no mes",
    tone: "danger",
  },
  {
    title: "Investimento",
    amount: "R$ 2.860,00",
    change: "+5,7% no mes",
    tone: "info",
  },
  {
    title: "Saldo",
    amount: "R$ 5.405,00",
    change: "Disponivel no periodo",
    tone: "neutral",
  },
];

export const monthFilters: FilterOption[] = [
  { label: "Abril 2026", active: true },
  { label: "Marco 2026" },
  { label: "Fevereiro 2026" },
];

export const categoryFilters: FilterOption[] = [
  { label: "Todas", active: true },
  { label: "Moradia" },
  { label: "Alimentacao" },
  { label: "Investimentos" },
];

export const chartCards: ChartCardData[] = [
  {
    title: "Fluxo mensal",
    subtitle: "Entradas e saidas nas ultimas semanas",
    bars: [68, 82, 74, 91, 63, 79, 88],
    tone: "success",
  },
  {
    title: "Distribuicao por categoria",
    subtitle: "Peso visual dos gastos do periodo",
    bars: [48, 72, 54, 66],
    tone: "info",
  },
];

export const initialTransactions: TransactionItem[] = [
  {
    id: "1",
    description: "Salario principal",
    category: "Receita",
    date: "05 Abr 2026",
    amount: "+R$ 8.500,00",
    type: "RECEITA",
  },
  {
    id: "2",
    description: "Aluguel",
    category: "Moradia",
    date: "06 Abr 2026",
    amount: "-R$ 1.850,00",
    type: "DESPESA",
  },
  {
    id: "3",
    description: "Tesouro Selic",
    category: "Investimentos",
    date: "08 Abr 2026",
    amount: "-R$ 1.200,00",
    type: "INVESTIMENTO",
  },
  {
    id: "4",
    description: "Freelance UX",
    category: "Receita extra",
    date: "11 Abr 2026",
    amount: "+R$ 1.980,00",
    type: "RECEITA",
  },
  {
    id: "5",
    description: "Supermercado",
    category: "Alimentacao",
    date: "12 Abr 2026",
    amount: "-R$ 465,00",
    type: "DESPESA",
  },
];

export const transactionCategoriesByType: Record<TransactionType, string[]> = {
  RECEITA: ["Salário", "Receita extra", "Resgate de investimentos", "Outros"],
  DESPESA: [
    "Moradia",
    "Alimentação",
    "Transporte",
    "Lazer",
    "Cartão de crédito",
    "Saúde",
    "Outros",
  ],
  INVESTIMENTO: [
    "Tesouro Direto",
    "CDB",
    "Ações",
    "Fundos imobiliários",
    "Cripto",
    "Reserva de emergência",
    "Outros",
  ],
};
