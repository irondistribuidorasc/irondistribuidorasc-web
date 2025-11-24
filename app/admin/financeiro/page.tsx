"use client";

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
import { formatCurrency } from "@/src/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PrinterIcon } from "@heroicons/react/24/outline";

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
		dateParam ? dateParam : new Date().toISOString().split("T")[0],
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
		<div className="min-h-screen bg-white px-4 py-12 dark:bg-slate-900 print:bg-white print:p-0">
			<div className="mx-auto w-full max-w-6xl">
				<div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
					<div>
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

				{/* Print Header */}
				<div className="hidden mb-8 print:block">
					<h1 className="text-2xl font-bold text-black">
						Fechamento de Caixa - {format(new Date(date), "dd/MM/yyyy")}
					</h1>
				</div>

				{/* Summary Cards */}
				<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
					<Card className="bg-brand-50 dark:bg-brand-900/20 print:border print:border-gray-300 print:shadow-none">
						<CardBody>
							<p className="text-sm font-medium text-brand-600 dark:text-brand-400">
								Total Geral
							</p>
							<p className="text-2xl font-bold text-brand-700 dark:text-brand-300">
								{formatCurrency(summary.total)}
							</p>
						</CardBody>
					</Card>
					<Card className="print:border print:border-gray-300 print:shadow-none">
						<CardBody>
							<p className="text-sm font-medium text-slate-500">Pix</p>
							<p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
								{formatCurrency(summary.pix)}
							</p>
						</CardBody>
					</Card>
					<Card className="print:border print:border-gray-300 print:shadow-none">
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
					<Card className="print:border print:border-gray-300 print:shadow-none">
						<CardBody>
							<p className="text-sm font-medium text-slate-500">Dinheiro</p>
							<p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
								{formatCurrency(summary.cash)}
							</p>
						</CardBody>
					</Card>
				</div>

				{/* Orders Table */}
				<Card className="print:shadow-none print:border-none">
					<CardHeader className="px-6 py-4">
						<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
							Transações do Dia
						</h2>
					</CardHeader>
					<CardBody>
						<Table
							aria-label="Tabela de transações"
							className="print:border print:border-gray-300"
						>
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
