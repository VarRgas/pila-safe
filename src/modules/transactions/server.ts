import { prisma } from "@/shared/lib/prisma";
import type {
  NewTransactionFormData,
  SummaryCardData,
  TransactionItem,
} from "@/shared/types/dashboard";

type TransactionRecord = {
  id: string;
  description: string;
  amount: { toString(): string };
  type: TransactionItem["type"];
  date: Date;
  category: { name: string } | null;
};

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

function toTransactionItem(transaction: TransactionRecord): TransactionItem {
  return {
    id: transaction.id,
    description: transaction.description,
    category: transaction.category?.name ?? "Sem categoria",
    date: formatDate(transaction.date),
    amount: formatCurrency(transaction.amount.toString(), transaction.type),
    type: transaction.type,
  };
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
      change: "Disponivel no periodo",
      tone: "neutral",
    },
  ];
}

export async function createTransactionForUser(userId: string, formData: NewTransactionFormData) {
  const categoryName = formData.category.trim();

  const existingCategory = categoryName
    ? await prisma.category.findFirst({
        where: {
          name: categoryName,
          type: formData.type,
        },
      })
    : null;

  const category = existingCategory
    ? existingCategory
    : categoryName
      ? await prisma.category.create({
          data: {
            name: categoryName,
            type: formData.type,
          },
        })
      : null;

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      description: formData.description.trim(),
      amount: parseCurrencyToDecimalString(formData.amount),
      type: formData.type,
      date: new Date(`${formData.date}T12:00:00`),
      categoryId: category?.id,
    },
    include: {
      category: true,
    },
  });

  return toTransactionItem(transaction);
}
