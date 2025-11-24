"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
	Button,
	Input,
	Pagination,
	Select,
	SelectItem,
	Spinner,
	Tab,
	Tabs,
} from "@heroui/react";
import { AdminOrdersTable } from "@/src/components/admin/AdminOrdersTable";
import type { Order, OrderStatus } from "@/types/order";
import {
	MagnifyingGlassIcon,
	ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

type PaginationData = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
};

export default function AdminPedidosPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [orders, setOrders] = useState<Order[]>([]);
	const [pagination, setPagination] = useState<PaginationData>({
		total: 0,
		page: 1,
		limit: 20,
		totalPages: 0,
		hasNext: false,
		hasPrev: false,
	});
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [orderBy, setOrderBy] = useState("createdAt");
	const [order, setOrder] = useState<"asc" | "desc">("desc");

	// Redirect non-admin users
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login?callbackUrl=/admin/pedidos");
		} else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
			router.push("/");
		}
	}, [status, session, router]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setPagination((prev) => ({ ...prev, page: 1 }));
		}, 500);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Fetch orders
	const fetchOrders = useCallback(async () => {
		if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;

		setLoading(true);
		try {
			const params = new URLSearchParams({
				status: statusFilter,
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				orderBy,
				order,
			});

			if (debouncedSearch) {
				params.append("search", debouncedSearch);
			}

			const response = await fetch(`/api/admin/orders?${params}`);
			if (response.ok) {
				const data = await response.json();
				setOrders(data.orders);
				setPagination(data.pagination);
			}
		} catch (error) {
			console.error("Failed to fetch orders:", error);
		} finally {
			setLoading(false);
		}
	}, [
		status,
		session,
		statusFilter,
		pagination.page,
		pagination.limit,
		debouncedSearch,
		orderBy,
		order,
	]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }));
	};

	const handleLimitChange = (value: string) => {
		setPagination((prev) => ({
			...prev,
			limit: Number.parseInt(value),
			page: 1,
		}));
	};

	if (status === "loading" || status === "unauthenticated") {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (session?.user?.role !== "ADMIN") {
		return null;
	}

	return (
		<div className="min-h-screen bg-white px-4 py-12 dark:bg-slate-900">
			<div className="mx-auto w-full max-w-7xl">
				{/* Header */}
				<div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
							<ShoppingBagIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
							Gerenciar Pedidos
						</h1>
						<p className="text-slate-600 dark:text-slate-400">
							Visualize e gerencie todos os pedidos da plataforma
						</p>
					</div>
					<Button
						as={Link}
						href="/admin"
						color="danger"
						variant="flat"
						className="font-medium"
					>
						← Voltar ao Admin
					</Button>
				</div>

				{/* Status Filter Tabs */}
				<Tabs
					selectedKey={statusFilter}
					onSelectionChange={(key) => {
						setStatusFilter(key as typeof statusFilter);
						setPagination((prev) => ({ ...prev, page: 1 }));
					}}
					color="danger"
					variant="bordered"
					className="mb-6"
					classNames={{
						tabList: "overflow-x-auto w-full justify-start",
					}}
				>
					<Tab key="all" title="Todos" />
					<Tab key="PENDING" title="Pendentes" />
					<Tab key="CONFIRMED" title="Confirmados" />
					<Tab key="PROCESSING" title="Processando" />
					<Tab key="SHIPPED" title="Enviados" />
					<Tab key="DELIVERED" title="Entregues" />
					<Tab key="CANCELLED" title="Cancelados" />
				</Tabs>

				{/* Toolbar */}
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<Input
						className="max-w-xs"
						placeholder="Buscar por pedido, cliente, email..."
						startContent={<MagnifyingGlassIcon className="h-5 w-5" />}
						value={searchQuery}
						onValueChange={setSearchQuery}
						isClearable
						onClear={() => setSearchQuery("")}
					/>

					<div className="flex gap-2">
						<Select
							label="Ordenar por"
							selectedKeys={[orderBy]}
							onChange={(e) => setOrderBy(e.target.value)}
							className="w-40"
							size="sm"
						>
							<SelectItem key="createdAt" value="createdAt">
								Data
							</SelectItem>
							<SelectItem key="orderNumber" value="orderNumber">
								Nº Pedido
							</SelectItem>
							<SelectItem key="total" value="total">
								Valor
							</SelectItem>
							<SelectItem key="customerName" value="customerName">
								Cliente
							</SelectItem>
						</Select>

						<Select
							label="Ordem"
							selectedKeys={[order]}
							onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
							className="w-32"
							size="sm"
						>
							<SelectItem key="desc" value="desc">
								Decrescente
							</SelectItem>
							<SelectItem key="asc" value="asc">
								Crescente
							</SelectItem>
						</Select>

						<Select
							label="Por página"
							selectedKeys={[pagination.limit.toString()]}
							onChange={(e) => handleLimitChange(e.target.value)}
							className="w-24"
							size="sm"
						>
							<SelectItem key="10" value="10">
								10
							</SelectItem>
							<SelectItem key="20" value="20">
								20
							</SelectItem>
							<SelectItem key="50" value="50">
								50
							</SelectItem>
							<SelectItem key="100" value="100">
								100
							</SelectItem>
						</Select>
					</div>
				</div>

				{/* Results Counter */}
				<div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
					{loading ? (
						"Carregando..."
					) : (
						<>
							Mostrando{" "}
							{pagination.total === 0
								? 0
								: (pagination.page - 1) * pagination.limit + 1}
							-{Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
							de {pagination.total} pedidos
						</>
					)}
				</div>

				{/* Orders Table */}
				<AdminOrdersTable
					orders={orders}
					isLoading={loading}
					onStatusChange={fetchOrders}
				/>

				{/* Pagination */}
				{pagination.totalPages > 1 && !loading && (
					<div className="mt-8 flex justify-center">
						<Pagination
							total={pagination.totalPages}
							page={pagination.page}
							onChange={handlePageChange}
							showControls
							color="danger"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
