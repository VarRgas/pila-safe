import { prisma } from "@/shared/lib/prisma";
import type {
  CategoryOptionsByType,
  ChartCardData,
  DashboardStatus,
  DashboardMonthOption,
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

type CategoryOptionRecord = {
  name: string;
  type: TransactionItem["type"];
};

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getCurrentMonthKey() {
  return formatDateInput(new Date()).slice(0, 7);
}

function getTodayDate() {
  return new Date(`${formatDateInput(new Date())}T23:59:59`);
}

function getNextMonthKey(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonthDate = new Date(Date.UTC(year, monthNumber, 1));

  return nextMonthDate.toISOString().slice(0, 7);
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
  return Number(amount).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

export async function getTransactionByIdForUser(userId: string, transactionId: string) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: {
      category: true,
    },
  });
}

export function getAvailableMonths(transactions: TransactionRecord[]): DashboardMonthOption[] {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return [...new Set(transactions.map((transaction) => formatDateInput(transaction.date).slice(0, 7)))]
    .sort((first, second) => second.localeCompare(first))
    .map((value) => ({
      value,
      label: formatter.format(new Date(`${value}-01T00:00:00Z`)),
    }));
}

export function filterTransactionsByMonth(transactions: TransactionRecord[], month: string | undefined) {
  if (!month) {
    return transactions;
  }

  return transactions.filter((transaction) => formatDateInput(transaction.date).startsWith(month));
}

export function filterCurrentDashboardTransactions(transactions: TransactionRecord[], month: string | undefined) {
  if (month) {
    return filterTransactionsByMonth(transactions, month);
  }

  const currentMonth = getCurrentMonthKey();
  const today = getTodayDate();

  return transactions.filter(
    (transaction) => formatDateInput(transaction.date).startsWith(currentMonth) && transaction.date <= today,
  );
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
  const categories: CategoryOptionRecord[] = await prisma.category.findMany({
    where: {
      userId,
    },
    select: {
      name: true,
      type: true,
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

  const saldo = Math.max(totals.receita - totals.despesa - totals.investimento, 0);

  const monthlyMap = new Map<string, { label: string; receita: number; despesa: number; investimento: number }>();

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount.toString());
    const monthKey = formatDateInput(transaction.date).slice(0, 7);
    const monthLabel = new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      timeZone: "UTC",
    })
      .format(transaction.date)
      .replace(".", "")
      .toUpperCase();

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        label: monthLabel,
        receita: 0,
        despesa: 0,
        investimento: 0,
      });
    }

    const currentMonth = monthlyMap.get(monthKey)!;

    if (transaction.type === "RECEITA") {
      currentMonth.receita += amount;
    }

    if (transaction.type === "DESPESA") {
      currentMonth.despesa += amount;
    }

    if (transaction.type === "INVESTIMENTO") {
      currentMonth.investimento += amount;
    }
  });

  const timelineMonths = [...monthlyMap.entries()]
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .slice(-6)
    .map(([, value]) => value);

  const normalizedTimeline =
    timelineMonths.length > 0
      ? timelineMonths
      : [{ label: "SEM", receita: 0, despesa: 0, investimento: 0 }];

  return [
    {
      kind: "timeline",
      title: "Comparativo mês a mês",
      subtitle: "Compare receitas, despesas e investimentos ao longo dos meses do período disponível.",
      labels: normalizedTimeline.map((month) => month.label),
      series: [
        {
          label: "Receitas",
          tone: "success",
          values: normalizedTimeline.map((month) => month.receita),
          formatted: normalizedTimeline.map((month) => formatAbsoluteCurrency(month.receita)),
        },
        {
          label: "Despesas",
          tone: "danger",
          values: normalizedTimeline.map((month) => month.despesa),
          formatted: normalizedTimeline.map((month) => formatAbsoluteCurrency(month.despesa)),
        },
        {
          label: "Investimentos",
          tone: "info",
          values: normalizedTimeline.map((month) => month.investimento),
          formatted: normalizedTimeline.map((month) => formatAbsoluteCurrency(month.investimento)),
        },
      ],
    },
    {
      kind: "comparison",
      title: "Fluxo do período",
      subtitle: "Veja quanto entrou, quanto saiu e quanto foi investido no período selecionado.",
      items: [
        {
          label: "Entrou",
          value: totals.receita,
          formatted: formatAbsoluteCurrency(totals.receita),
          tone: "success",
        },
        {
          label: "Gastou",
          value: totals.despesa,
          formatted: formatAbsoluteCurrency(totals.despesa),
          tone: "danger",
        },
        {
          label: "Investiu",
          value: totals.investimento,
          formatted: formatAbsoluteCurrency(totals.investimento),
          tone: "info",
        },
      ],
    },
    {
      kind: "distribution",
      title: "Destino da receita",
      subtitle: "Uma visão clara de quanto da receita virou despesa, investimento ou saldo restante.",
      totalLabel: "Receita total",
      totalValue: formatAbsoluteCurrency(totals.receita),
      items: [
        {
          label: "Despesas",
          value: totals.despesa,
          formatted: formatAbsoluteCurrency(totals.despesa),
          color: "#f43f5e",
        },
        {
          label: "Investimentos",
          value: totals.investimento,
          formatted: formatAbsoluteCurrency(totals.investimento),
          color: "#0ea5e9",
        },
        {
          label: "Saldo restante",
          value: saldo,
          formatted: formatAbsoluteCurrency(saldo),
          color: "#475569",
        },
      ],
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

export function getDashboardPeriodLabel(selectedMonth: string | undefined, availableMonths: DashboardMonthOption[]) {
  if (selectedMonth) {
    return availableMonths.find((month) => month.value === selectedMonth)?.label ?? selectedMonth;
  }

  const currentMonth = getCurrentMonthKey();

  return (
    availableMonths.find((month) => month.value === currentMonth)?.label ??
    new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${currentMonth}-01T00:00:00Z`))
  );
}

export function getDashboardStatus(transactions: TransactionRecord[]): DashboardStatus {
  const saldo = transactions.reduce((accumulator, transaction) => {
    const amount = Number(transaction.amount.toString());

    if (transaction.type === "RECEITA") {
      return accumulator + amount;
    }

    return accumulator - amount;
  }, 0);

  if (saldo > 0) {
    return "Saudável";
  }

  if (saldo === 0) {
    return "Neutro";
  }

  return "Em alerta";
}

export function buildNextMonthProjection(transactions: TransactionRecord[]) {
  const nextMonth = getNextMonthKey(getCurrentMonthKey());
  const currentBalance = transactions.reduce((accumulator, transaction) => {
    if (transaction.date > getTodayDate()) {
      return accumulator;
    }

    const amount = Number(transaction.amount.toString());

    if (transaction.type === "RECEITA") {
      return accumulator + amount;
    }

    return accumulator - amount;
  }, 0);
  const nextMonthTransactions = filterTransactionsByMonth(transactions, nextMonth);

  const totals = nextMonthTransactions.reduce(
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

  const saldo = currentBalance + totals.receita - totals.despesa - totals.investimento;
  const periodLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${nextMonth}-01T00:00:00Z`));

  return {
    periodLabel,
    currentBalance: formatAbsoluteCurrency(currentBalance),
    receita: formatAbsoluteCurrency(totals.receita),
    despesa: formatAbsoluteCurrency(totals.despesa),
    investimento: formatAbsoluteCurrency(totals.investimento),
    saldo: formatAbsoluteCurrency(saldo),
  };
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
