"use client";

import {
	CheckCircleIcon,
	ClockIcon,
	CubeIcon,
	ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { Card, CardBody, Spinner } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { OrdersList } from "@/src/components/pedido/OrdersList";
import { formatCurrency } from "@/src/lib/utils";
import type { Order } from "@/types/order";

export default function MeusPedidosPage() {
	const router = useRouter();
	const { status } = useSession();
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchOrders() {
			try {
				setIsLoading(true);
				setError(null);

				const response = await fetch("/api/orders");

				if (!response.ok) {
					throw new Error("Falha ao carregar pedidos");
				}

				const data = await response.json();
				setOrders(data);
			} catch (err) {
				console.error("Error loading orders:", err);
				setError("Não foi possível carregar seus pedidos. Tente novamente.");
			} finally {
				setIsLoading(false);
			}
		}

		if (status === "unauthenticated") {
			router.push("/login?callbackUrl=/meus-pedidos");
			return;
		}

		if (status === "authenticated") {
			fetchOrders();
		}
	}, [status, router]);

	const handleRetry = () => {
		window.location.reload();
	};

	// Estatísticas dos pedidos
	const stats = useMemo(() => {
		const total = orders.length;
		const pending = orders.filter(
			(o) =>
				o.status === "PENDING" ||
				o.status === "CONFIRMED" ||
				o.status === "PROCESSING",
		).length;
		const delivered = orders.filter((o) => o.status === "DELIVERED").length;
		const totalValue = orders.reduce((sum, o) => sum + o.total, 0);

		return { total, pending, delivered, totalValue };
	}, [orders]);

	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900">
				<div className="container mx-auto px-4 py-8">
					<div className="flex min-h-[400px] items-center justify-center">
						<Spinner size="lg" color="primary" />
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-slate-50 dark:bg-slate-900">
				<div className="container mx-auto px-4 py-8">
					<div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
						<p className="text-red-600 dark:text-red-400">{error}</p>
						<button
							type="button"
							onClick={handleRetry}
							className="mt-4 rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
						>
							Tentar novamente
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900">
			<div className="container mx-auto px-4 py-8 lg:py-12">
				{/* Header */}
				<div className="mb-8 lg:mb-10">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100 lg:text-3xl">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 lg:h-12 lg:w-12">
									<ShoppingBagIcon className="h-5 w-5 text-white lg:h-6 lg:w-6" />
								</div>
								Meus Pedidos
							</h1>
							<p className="mt-2 text-slate-600 dark:text-slate-400">
								Acompanhe o histórico e status dos seus pedidos
							</p>
						</div>
						{orders.length > 0 && (
							<Link
								href="/produtos"
								className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
							>
								Novo Pedido
							</Link>
						)}
					</div>

					{/* Stats Cards */}
					{orders.length > 0 && (
						<div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
							<Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
								<CardBody className="flex flex-row items-center gap-3 p-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
										<CubeIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
											Total de Pedidos
										</p>
										<p className="text-xl font-bold text-slate-900 dark:text-slate-100">
											{stats.total}
										</p>
									</div>
								</CardBody>
							</Card>

							<Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
								<CardBody className="flex flex-row items-center gap-3 p-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
										<ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
											Em Andamento
										</p>
										<p className="text-xl font-bold text-slate-900 dark:text-slate-100">
											{stats.pending}
										</p>
									</div>
								</CardBody>
							</Card>

							<Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
								<CardBody className="flex flex-row items-center gap-3 p-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
										<CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
											Entregues
										</p>
										<p className="text-xl font-bold text-slate-900 dark:text-slate-100">
											{stats.delivered}
										</p>
									</div>
								</CardBody>
							</Card>

							<Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
								<CardBody className="flex flex-row items-center gap-3 p-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
										<ShoppingBagIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
											Valor Total
										</p>
										<p className="text-lg font-bold text-slate-900 dark:text-slate-100">
											{formatCurrency(stats.totalValue)}
										</p>
									</div>
								</CardBody>
							</Card>
						</div>
					)}
				</div>

				{/* Orders */}
				{orders.length === 0 ? (
					<Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
						<CardBody className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
							<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
								<ShoppingBagIcon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
							</div>
							<h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
								Nenhum pedido encontrado
							</h2>
							<p className="mb-6 max-w-md text-slate-600 dark:text-slate-400">
								Você ainda não realizou nenhum pedido. Explore nossos produtos e
								faça seu primeiro pedido!
							</p>
							<Link
								href="/produtos"
								className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
							>
								Ver Produtos
							</Link>
						</CardBody>
					</Card>
				) : (
					<OrdersList orders={orders} />
				)}
			</div>
		</div>
	);
}
