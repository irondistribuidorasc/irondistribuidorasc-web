"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OrdersList } from "@/src/components/pedido/OrdersList";
import type { Order } from "@/types/order";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@heroui/react";

export default function MeusPedidosPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login?callbackUrl=/meus-pedidos");
			return;
		}

		if (status === "authenticated") {
			loadOrders();
		}
	}, [status, router]);

	async function loadOrders() {
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

	if (status === "loading" || isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex min-h-[400px] items-center justify-center">
					<Spinner size="lg" color="primary" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-8 text-center dark:border-red-700 dark:bg-red-900/20">
					<p className="text-red-600 dark:text-red-400">{error}</p>
					<button
						onClick={loadOrders}
						className="mt-4 rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
					>
						Tentar novamente
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
					<ShoppingBagIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
					Meus Pedidos
				</h1>
				<p className="text-slate-600 dark:text-slate-400">
					Acompanhe o histórico e status dos seus pedidos
				</p>
			</div>

			{orders.length === 0 ? (
				<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800">
					<ShoppingBagIcon className="mb-4 h-16 w-16 text-slate-400 dark:text-slate-600" />
					<h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
						Nenhum pedido encontrado
					</h2>
					<p className="mb-6 max-w-md text-slate-600 dark:text-slate-400">
						Você ainda não realizou nenhum pedido. Explore nossos produtos e
						faça seu primeiro pedido!
					</p>
					<a
						href="/produtos"
						className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
					>
						Ver Produtos
					</a>
				</div>
			) : (
				<OrdersList orders={orders} />
			)}
		</div>
	);
}
