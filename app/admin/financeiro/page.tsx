"use client";

import { formatCurrency } from "@/src/lib/utils";
import { ChevronLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// ... imports ...

interface FinancialSummary {
  total: number;
  pix: number;
  creditCard: number;
  debitCard: number;
  cash: number;
  other: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  status: string;
}

function FinancialPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const [date, setDate] = useState(
    dateParam ? dateParam : new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    total: 0,
    pix: 0,
    creditCard: 0,
    debitCard: 0,
    cash: 0,
    other: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated") return;
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/finance?date=${date}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
          setSummary(data.summary);
        }
      } catch (error) {
        console.error("Failed to fetch financial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, status]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    router.push(`/admin/financeiro?date=${newDate}`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  const getPaymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      PIX: "Pix",
      CREDIT_CARD: "Cartão de Crédito",
      DEBIT_CARD: "Cartão de Débito",
      CASH: "Dinheiro",
      OTHER: "Outro",
    };
    return map[method] || method;
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12 dark:bg-slate-900 print:bg-white print:p-0 print:min-h-0">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
          <div>
            <Button
              as={Link}
              href="/admin"
              variant="light"
              className="mb-4 -ml-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 print:hidden"
            >
              <ChevronLeftIcon className="mr-1 h-4 w-4" />
              Voltar para Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Controle Financeiro
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Resumo de vendas e fechamento de caixa
            </p>
          </div>
          <div className="flex gap-4">
            <Input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="w-40"
            />
            <Button
              color="primary"
              startContent={<PrinterIcon className="h-5 w-5" />}
              onPress={handlePrint}
            >
              Imprimir / Fechar Caixa
            </Button>
          </div>
        </div>

        {/* Thermal Print Layout */}
        <div className="hidden print:block print:w-full print:text-black print:p-[2mm]">
          <div className="mb-2 text-center border-b border-black pb-2">
            <h1 className="text-lg font-bold uppercase leading-tight">
              Iron Distribuidora
            </h1>
            <p className="text-xs">Fechamento de Caixa</p>
            <p className="text-xs">{format(new Date(date), "dd/MM/yyyy")}</p>
          </div>

          <div className="mb-2 border-b border-black pb-2">
            <h2 className="mb-1 text-base font-bold uppercase">Resumo</h2>
            <div className="flex justify-between text-xs">
              <span>Pix:</span>
              <span>{formatCurrency(summary.pix)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Cartão:</span>
              <span>
                {formatCurrency(summary.creditCard + summary.debitCard)}
              </span>
            </div>
            <div className="flex justify-between text-[10px] pl-2">
              <span>Crédito:</span>
              <span>{formatCurrency(summary.creditCard)}</span>
            </div>
            <div className="flex justify-between text-[10px] pl-2">
              <span>Débito:</span>
              <span>{formatCurrency(summary.debitCard)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Dinheiro:</span>
              <span>{formatCurrency(summary.cash)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-black pt-1 font-bold text-sm">
              <span>TOTAL:</span>
              <span>{formatCurrency(summary.total)}</span>
            </div>
          </div>

          <div>
            <h2 className="mb-1 text-base font-bold uppercase">Transações</h2>
            <table className="w-full text-[10px] table-fixed">
              <thead>
                <tr className="border-b border-black text-left">
                  <th className="w-[15%] pb-1">Hora</th>
                  <th className="w-[25%] pb-1">Ped.</th>
                  <th className="w-[30%] pb-1">Método</th>
                  <th className="w-[30%] pb-1 text-right">Val.</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-300 border-dashed"
                  >
                    <td className="py-1 truncate">
                      {format(new Date(order.createdAt), "HH:mm")}
                    </td>
                    <td className="py-1 truncate">#{order.orderNumber}</td>
                    <td className="py-1 truncate">
                      {getPaymentMethodLabel(order.paymentMethod).substring(
                        0,
                        10
                      )}
                    </td>
                    <td className="py-1 text-right">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 text-center italic">
                      Nenhuma venda registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center text-[10px]">
            <p>Impressão: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
            <p>--------------------------------</p>
          </div>
        </div>

        {/* Screen Layout (Hidden on Print) */}
        <div className="print:hidden">
          {/* Summary Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-brand-50 dark:bg-brand-900/20">
              <CardBody>
                <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                  Total Geral
                </p>
                <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">
                  {formatCurrency(summary.total)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm font-medium text-slate-500">Pix</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(summary.pix)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm font-medium text-slate-500">Cartão</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(summary.creditCard + summary.debitCard)}
                </p>
                <p className="text-xs text-slate-400">
                  C: {formatCurrency(summary.creditCard)} | D:{" "}
                  {formatCurrency(summary.debitCard)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm font-medium text-slate-500">Dinheiro</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(summary.cash)}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader className="px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Transações do Dia
              </h2>
            </CardHeader>
            <CardBody>
              <Table aria-label="Tabela de transações">
                <TableHeader>
                  <TableColumn>PEDIDO</TableColumn>
                  <TableColumn>CLIENTE</TableColumn>
                  <TableColumn>HORÁRIO</TableColumn>
                  <TableColumn>MÉTODO</TableColumn>
                  <TableColumn align="end">VALOR</TableColumn>
                </TableHeader>
                <TableBody emptyContent="Nenhuma venda registrada neste dia.">
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "HH:mm")}
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function FinancialPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <FinancialPageContent />
    </Suspense>
  );
}
