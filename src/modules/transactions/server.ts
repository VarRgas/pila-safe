import { prisma } from "@/shared/lib/prisma";
import type {
  CategoryOptionsByType,
  ChartCardData,
  NewTransactionFormData,
  SummaryCardData,
  TransactionItem,
} from "@/shared/types/dashboard";

const defaultCategoriesByType: CategoryOptionsByType = {
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

type TransactionRecord = {
  id: string;
  description: string;
  amount: { toString(): string };
  type: TransactionItem["type"];
  date: Date;
  category?: { name: string } | null;
};

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatCurrencyInput(amount: string) {
  return Number(amount).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function extractCurrencyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function parseCurrencyToDecimalString(value: string) {
  return (Number(extractCurrencyDigits(value)) / 100).toFixed(2);
}

function formatCurrency(amount: string, type: TransactionItem["type"]) {
  const signal = type === "RECEITA" ? "+" : "-";

  return `${signal}${Number(amount).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatAbsoluteCurrency(amount: number) {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeBars(values: number[]) {
  const safeValues = values.map((value) => Math.max(value, 0));
  const maxValue = Math.max(...safeValues, 0);

  if (maxValue === 0) {
    return safeValues.map(() => 12);
  }

  return safeValues.map((value) => Math.max(12, Math.round((value / maxValue) * 100)));
}

function toTransactionItem(transaction: TransactionRecord): TransactionItem {
  return {
    id: transaction.id,
    description: transaction.description,
    category: transaction.category?.name ?? "Sem categoria",
    date: formatDate(transaction.date),
    dateValue: formatDateInput(transaction.date),
    amount: formatCurrency(transaction.amount.toString(), transaction.type),
    amountValue: formatCurrencyInput(transaction.amount.toString()),
    type: transaction.type,
  };
}

async function createDefaultCategoriesForUser(userId: string) {
  await prisma.category.createMany({
    data: Object.entries(defaultCategoriesByType).flatMap(([type, names]) =>
      names.map((name) => ({
        userId,
        name,
        type: type as TransactionItem["type"],
      })),
    ),
    skipDuplicates: true,
  });
}

async function resolveCategoryId(userId: string, type: TransactionItem["type"], categoryName: string) {
  const normalizedCategoryName = categoryName.trim();

  if (!normalizedCategoryName) {
    return null;
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      userId,
      name: normalizedCategoryName,
      type,
    },
  });

  if (existingCategory) {
    return existingCategory.id;
  }

  const category = await prisma.category.create({
    data: {
      userId,
      name: normalizedCategoryName,
      type,
    },
  });

  return category.id;
}

export async function getTransactionsByUserId(userId: string) {
  return prisma.transaction.findMany({
    where: {
      userId,
    },
    include: {
      category: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export function mapTransactionsToItems(transactions: TransactionRecord[]) {
  return transactions.map(toTransactionItem);
}

export async function createCategoryForUser(userId: string, type: TransactionItem["type"], name: string) {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return null;
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      userId,
      type,
      name: normalizedName,
    },
  });

  if (existingCategory) {
    return existingCategory.name;
  }

  const category = await prisma.category.create({
    data: {
      userId,
      type,
      name: normalizedName,
    },
  });

  return category.name;
}

export async function getCategoryOptionsByType(userId: string): Promise<CategoryOptionsByType> {
  const categories = await prisma.category.findMany({
    where: {
      userId,
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  if (categories.length === 0) {
    await createDefaultCategoriesForUser(userId);

    return defaultCategoriesByType;
  }

  return {
    RECEITA: categories.filter((category) => category.type === "RECEITA").map((category) => category.name),
    DESPESA: categories.filter((category) => category.type === "DESPESA").map((category) => category.name),
    INVESTIMENTO: categories
      .filter((category) => category.type === "INVESTIMENTO")
      .map((category) => category.name),
  };
}

export function buildChartCards(transactions: TransactionRecord[]): ChartCardData[] {
  const monthlyMap = new Map<string, { label: string; receita: number; saida: number }>();
  const categoryTotals = new Map<string, number>();

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount.toString());
    const monthKey = formatDateInput(transaction.date).slice(0, 7);
    const monthLabel = new Intl.DateTimeFormat("pt-BR", {
      month: "short",
    }).format(transaction.date);

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        label: monthLabel.replace(".", ""),
        receita: 0,
        saida: 0,
      });
    }

    const currentMonth = monthlyMap.get(monthKey)!;

    if (transaction.type === "RECEITA") {
      currentMonth.receita += amount;
    } else {
      currentMonth.saida += amount;
    }

    const categoryName = transaction.category?.name ?? "Sem categoria";
    categoryTotals.set(categoryName, (categoryTotals.get(categoryName) ?? 0) + amount);
  });

  const recentMonths = [...monthlyMap.entries()]
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .slice(-6)
    .map(([, value]) => value);

  const categoryDistribution: Array<[string, number]> = [...categoryTotals.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5);

  const monthBars = recentMonths.length > 0 ? recentMonths : [{ label: "sem", receita: 0, saida: 0 }];
  const categoryBars: Array<[string, number]> =
    categoryDistribution.length > 0 ? categoryDistribution : [["Sem", 0]];

  return [
    {
      title: "Fluxo mensal",
      subtitle: "Entradas e saídas consolidadas dos últimos meses",
      bars: normalizeBars(monthBars.map((month) => month.receita + month.saida)),
      labels: monthBars.map((month) => month.label),
      tone: "success",
    },
    {
      title: "Categorias com maior peso",
      subtitle: "Distribuição das movimentações por categoria",
      bars: normalizeBars(categoryBars.map(([, total]) => total)),
      labels: categoryBars.map(([name]) => name.slice(0, 3)),
      tone: "info",
    },
  ];
}

export function buildSummaryCards(transactions: TransactionRecord[]): SummaryCardData[] {
  const totals = transactions.reduce(
    (accumulator, transaction) => {
      const amount = Number(transaction.amount.toString());

      if (transaction.type === "RECEITA") {
        accumulator.receita += amount;
      }

      if (transaction.type === "DESPESA") {
        accumulator.despesa += amount;
      }

      if (transaction.type === "INVESTIMENTO") {
        accumulator.investimento += amount;
      }

      return accumulator;
    },
    {
      receita: 0,
      despesa: 0,
      investimento: 0,
    },
  );

  const saldo = totals.receita - totals.despesa - totals.investimento;

  return [
    {
      title: "Receita",
      amount: formatAbsoluteCurrency(totals.receita),
      change: "Total em receitas",
      tone: "success",
    },
    {
      title: "Despesa",
      amount: formatAbsoluteCurrency(totals.despesa),
      change: "Total em despesas",
      tone: "danger",
    },
    {
      title: "Investimento",
      amount: formatAbsoluteCurrency(totals.investimento),
      change: "Total investido",
      tone: "info",
    },
    {
      title: "Saldo",
      amount: formatAbsoluteCurrency(saldo),
      change: "Disponível no período",
      tone: "neutral",
    },
  ];
}

export async function createTransactionForUser(userId: string, formData: NewTransactionFormData) {
  const categoryId = await resolveCategoryId(userId, formData.type, formData.category);

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      description: formData.description.trim(),
      amount: parseCurrencyToDecimalString(formData.amount),
      type: formData.type,
      date: new Date(`${formData.date}T12:00:00`),
      categoryId,
    },
    include: {
      category: true,
    },
  });

  return toTransactionItem(transaction);
}

export async function updateTransactionForUser(
  userId: string,
  transactionId: string,
  formData: NewTransactionFormData,
) {
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!existingTransaction) {
    return null;
  }

  const categoryId = await resolveCategoryId(userId, formData.type, formData.category);

  const transaction = await prisma.transaction.update({
    where: {
      id: transactionId,
    },
    data: {
      description: formData.description.trim(),
      amount: parseCurrencyToDecimalString(formData.amount),
      type: formData.type,
      date: new Date(`${formData.date}T12:00:00`),
      categoryId,
    },
    include: {
      category: true,
    },
  });

  return toTransactionItem(transaction);
}

export async function deleteTransactionForUser(userId: string, transactionId: string) {
  const result = await prisma.transaction.deleteMany({
    where: {
      id: transactionId,
      userId,
    },
  });

  return result.count > 0;
}
