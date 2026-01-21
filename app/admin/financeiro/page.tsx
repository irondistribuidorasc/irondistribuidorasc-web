"use client";

import {
	ArrowTrendingUpIcon,
	BanknotesIcon,
	CalendarDaysIcon,
	ChevronLeftIcon,
	ClockIcon,
	CreditCardIcon,
	CurrencyDollarIcon,
	DevicePhoneMobileIcon,
	HashtagIcon,
	InboxIcon,
	PrinterIcon,
	UserIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Spinner,
} from "@heroui/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { formatCurrency } from "@/src/lib/utils";

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

// Retorna data atual no formato YYYY-MM-DD usando timezone local
function getLocalDateString(): string {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

// Converte string YYYY-MM-DD para Date usando timezone local
// new Date("YYYY-MM-DD") interpreta como UTC, causando data errada em UTC-3
function parseLocalDate(dateString: string): Date {
	const [year, month, day] = dateString.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function FinancialPageContent() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const dateParam = searchParams.get("date");

	const [date, setDate] = useState(
		dateParam ? dateParam : getLocalDateString(),
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
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
				<div className="flex flex-col items-center gap-4">
					<Spinner size="lg" />
					<p className="text-sm text-slate-500 dark:text-slate-400">
						Carregando dados financeiros...
					</p>
				</div>
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

	const getPaymentMethodEmoji = (method: string) => {
		const map: Record<string, string> = {
			PIX: "⚡",
			CREDIT_CARD: "💳",
			DEBIT_CARD: "💳",
			CASH: "💵",
			OTHER: "💰",
		};
		return map[method] || "💰";
	};

	const formattedDate = format(parseLocalDate(date), "EEEE, d 'de' MMMM", {
		locale: ptBR,
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 print:!bg-white print:!bg-none print:!p-0 print:!m-0 print:!min-h-0">
			{/* Print-specific styles */}
			<style jsx global>{`
				@media print {
					html, body, #__next, main {
						background: white !important;
						background-color: white !important;
						background-image: none !important;
						min-height: auto !important;
						margin: 0 !important;
						padding: 0 !important;
					}
					.dark {
						color-scheme: light !important;
					}
				}
			`}</style>
			{/* Background Pattern - Hidden on print */}
			<div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTE4IDBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAgMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bS0xOCAxOGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHptMTggMGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHoiIGZpbGw9IiM5NDk0YjgiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvZz48L3N2Zz4=')] opacity-60 print:hidden" />

			<div className="mx-auto w-full max-w-6xl px-4 py-8">
				{/* Back Button - Hidden on print */}
				<div className="print:hidden">
					<Button
						as={Link}
						href="/admin"
						variant="light"
						className="mb-6 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
					>
						<ChevronLeftIcon className="mr-1 h-4 w-4" />
						Voltar para Dashboard
					</Button>
				</div>

				{/* Header Card - Hidden on print */}
				<Card className="mb-8 overflow-hidden border-0 shadow-xl print:hidden">
					<div className="relative bg-gradient-to-r from-slate-50 via-white to-slate-100 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700">
						{/* Decorative elements */}
						<div className="absolute inset-0 overflow-hidden">
							<div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl dark:bg-white/5" />
							<div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-600/10 blur-3xl dark:bg-slate-500/10" />
						</div>

						<div className="relative px-6 py-6 sm:px-8">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
								<div className="flex items-center gap-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30">
										<BanknotesIcon className="h-7 w-7 text-white" />
									</div>
									<div>
										<h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
											Controle Financeiro
										</h1>
										<p className="mt-1 text-slate-600 dark:text-slate-300">
											Resumo de vendas e fechamento de caixa
										</p>
									</div>
								</div>

								{/* Date Selector & Actions */}
								<div className="flex flex-wrap items-center gap-3">
									<div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-4 py-2.5 backdrop-blur-sm dark:bg-white/10">
										<CalendarDaysIcon className="h-5 w-5 text-slate-700 dark:text-white" />
										<input
											type="date"
											value={date}
											onChange={handleDateChange}
											className="bg-transparent text-slate-700 font-medium outline-none cursor-pointer [color-scheme:light] dark:text-white dark:[color-scheme:dark]"
										/>
									</div>
									<Button
										className="bg-white text-slate-700 font-medium shadow-lg hover:bg-slate-50 hover:shadow-xl transition-all"
										startContent={<PrinterIcon className="h-5 w-5" />}
										onPress={handlePrint}
									>
										Imprimir / Fechar Caixa
									</Button>
								</div>
							</div>

							{/* Date Display */}
							<div className="mt-4 text-sm text-slate-500 dark:text-slate-400 capitalize">
								📅 {formattedDate}
							</div>
						</div>
					</div>
				</Card>

				{/* Thermal Print Layout - Only visible on print */}
				<div className="hidden print:block print:w-full print:text-black print:p-[2mm]">
					<div className="mb-2 text-center border-b border-black pb-2">
						<h1 className="text-lg font-bold uppercase leading-tight">
							Iron Distribuidora
						</h1>
						<p className="text-xs">Fechamento de Caixa</p>
						<p className="text-xs">
							{format(parseLocalDate(date), "dd/MM/yyyy")}
						</p>
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
											{new Date(order.createdAt).toLocaleTimeString("pt-BR", {
												hour: "2-digit",
												minute: "2-digit",
												timeZone: "America/Sao_Paulo",
											})}
										</td>
										<td className="py-1 truncate">#{order.orderNumber}</td>
										<td className="py-1 truncate">
											{getPaymentMethodLabel(order.paymentMethod).substring(
												0,
												10,
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
						{/* Total Card - Highlighted */}
						<Card className="overflow-hidden border-0 shadow-lg bg-brand-500">
							<CardBody className="p-5">
								<div className="flex items-center gap-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
										<ArrowTrendingUpIcon className="h-6 w-6 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-white/80">
											Total Geral
										</p>
										<p className="text-2xl font-bold text-white">
											{formatCurrency(summary.total)}
										</p>
									</div>
								</div>
								<div className="mt-3 pt-3 border-t border-white/20">
									<p className="text-xs text-white/80">
										{orders.length} transaç{orders.length !== 1 ? "ões" : "ão"}{" "}
										no dia
									</p>
								</div>
							</CardBody>
						</Card>

						{/* Pix Card */}
						<Card className="overflow-hidden border border-slate-200 shadow-sm bg-white dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-all">
							<CardBody className="p-5">
								<div className="flex items-center gap-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
										<DevicePhoneMobileIcon className="h-6 w-6 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
											⚡ Pix
										</p>
										<p className="text-xl font-bold text-slate-900 dark:text-slate-100">
											{formatCurrency(summary.pix)}
										</p>
									</div>
								</div>
							</CardBody>
						</Card>

						{/* Card Card */}
						<Card className="overflow-hidden border border-slate-200 shadow-sm bg-white dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-all">
							<CardBody className="p-5">
								<div className="flex items-center gap-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
										<CreditCardIcon className="h-6 w-6 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
											💳 Cartão
										</p>
										<p className="text-xl font-bold text-slate-900 dark:text-slate-100">
											{formatCurrency(summary.creditCard + summary.debitCard)}
										</p>
									</div>
								</div>
								<div className="mt-3 flex gap-2 text-xs">
									<Chip
										size="sm"
										variant="flat"
										className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
									>
										C: {formatCurrency(summary.creditCard)}
									</Chip>
									<Chip
										size="sm"
										variant="flat"
										className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
									>
										D: {formatCurrency(summary.debitCard)}
									</Chip>
								</div>
							</CardBody>
						</Card>

						{/* Cash Card */}
						<Card className="overflow-hidden border border-slate-200 shadow-sm bg-white dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-all">
							<CardBody className="p-5">
								<div className="flex items-center gap-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
										<WalletIcon className="h-6 w-6 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
											💵 Dinheiro
										</p>
										<p className="text-xl font-bold text-slate-900 dark:text-slate-100">
											{formatCurrency(summary.cash)}
										</p>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Orders Table */}
					<Card className="overflow-hidden border border-slate-200 shadow-sm bg-white dark:border-slate-800 dark:bg-slate-900">
						<CardHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
									<CurrencyDollarIcon className="h-5 w-5 text-white" />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
										Transações do Dia
									</h2>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{orders.length} venda{orders.length !== 1 ? "s" : ""}{" "}
										registrada{orders.length !== 1 ? "s" : ""}
									</p>
								</div>
							</div>
						</CardHeader>
						<CardBody className="p-0">
							{orders.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
										<InboxIcon className="h-8 w-8 text-slate-400" />
									</div>
									<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
										Nenhuma venda registrada
									</h3>
									<p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
										Não há transações para este dia. Selecione outra data para
										visualizar.
									</p>
								</div>
							) : (
								<>
									{/* Table Header */}
									<div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50/80 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
										<div className="col-span-2 flex items-center gap-1">
											<HashtagIcon className="h-3.5 w-3.5" />
											Pedido
										</div>
										<div className="col-span-3 flex items-center gap-1">
											<UserIcon className="h-3.5 w-3.5" />
											Cliente
										</div>
										<div className="col-span-2 flex items-center gap-1">
											<ClockIcon className="h-3.5 w-3.5" />
											Horário
										</div>
										<div className="col-span-3 flex items-center gap-1">
											<CreditCardIcon className="h-3.5 w-3.5" />
											Método
										</div>
										<div className="col-span-2 flex items-center justify-end gap-1">
											<CurrencyDollarIcon className="h-3.5 w-3.5" />
											Valor
										</div>
									</div>

									{/* Table Body */}
									<div className="divide-y divide-slate-100 dark:divide-slate-700">
										{orders.map((order) => (
											<div
												key={order.id}
												className="group grid grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
											>
												{/* Pedido */}
												<div className="col-span-2 flex items-center">
													<span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
														#{order.orderNumber}
													</span>
												</div>

												{/* Cliente */}
												<div className="col-span-3 flex items-center">
													<span className="text-sm text-slate-600 dark:text-slate-400 truncate">
														{order.customerName}
													</span>
												</div>

												{/* Horário */}
												<div className="col-span-2 flex items-center">
													<span className="text-sm text-slate-500 dark:text-slate-400">
														{new Date(order.createdAt).toLocaleTimeString(
															"pt-BR",
															{
																hour: "2-digit",
																minute: "2-digit",
																timeZone: "America/Sao_Paulo",
															},
														)}
													</span>
												</div>

												{/* Método */}
												<div className="col-span-3 flex items-center">
													<Chip
														size="sm"
														variant="flat"
														className="bg-slate-100 dark:bg-slate-700"
													>
														{getPaymentMethodEmoji(order.paymentMethod)}{" "}
														{getPaymentMethodLabel(order.paymentMethod)}
													</Chip>
												</div>

												{/* Valor */}
												<div className="col-span-2 flex items-center justify-end">
													<span className="font-semibold text-brand-600 dark:text-brand-400">
														{formatCurrency(order.total)}
													</span>
												</div>
											</div>
										))}
									</div>

									{/* Total Footer */}
									<div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<BanknotesIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
												<span className="font-semibold text-slate-700 dark:text-slate-300">
													Total do Dia
												</span>
											</div>
											<span className="text-xl font-bold text-brand-600 dark:text-brand-400">
												{formatCurrency(summary.total)}
											</span>
										</div>
									</div>
								</>
							)}
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
				<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
					<div className="flex flex-col items-center gap-4">
						<Spinner size="lg" />
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Carregando...
						</p>
					</div>
				</div>
			}
		>
			<FinancialPageContent />
		</Suspense>
	);
}
