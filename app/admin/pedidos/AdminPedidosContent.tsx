"use client";

import {
	ArrowLeftIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyDollarIcon,
	DocumentTextIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	ShoppingBagIcon,
	TruckIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import {
	Button,
	Card,
	CardBody,
	Chip,
	Pagination,
	Select,
	SelectItem,
	Spinner,
	Tab,
	Tabs,
} from "@heroui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { AdminOrdersTable } from "@/src/components/admin/AdminOrdersTable";
import type { Order, OrderStatus } from "@/types/order";

type PaginationData = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
};

const statusConfig = {
	all: { label: "Todos", icon: DocumentTextIcon, color: "default" },
	PENDING: { label: "Pendentes", icon: ClockIcon, color: "warning" },
	CONFIRMED: { label: "Confirmados", icon: CheckCircleIcon, color: "primary" },
	PROCESSING: {
		label: "Processando",
		icon: CurrencyDollarIcon,
		color: "secondary",
	},
	SHIPPED: { label: "Enviados", icon: TruckIcon, color: "primary" },
	DELIVERED: { label: "Entregues", icon: CheckCircleIcon, color: "success" },
	CANCELLED: { label: "Cancelados", icon: XCircleIcon, color: "danger" },
};

const validStatuses = [
	"PENDING",
	"CONFIRMED",
	"PROCESSING",
	"SHIPPED",
	"DELIVERED",
	"CANCELLED",
] as const;

export function AdminPedidosContent() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
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

	// Inicializa statusFilter baseado na URL
	const getInitialStatus = (): OrderStatus | "all" => {
		const urlStatus = searchParams.get("status");
		return urlStatus &&
			validStatuses.includes(urlStatus as (typeof validStatuses)[number])
			? (urlStatus as OrderStatus)
			: "all";
	};
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">(
		getInitialStatus,
	);

	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [orderBy, setOrderBy] = useState("createdAt");
	const [order, setOrder] = useState<"asc" | "desc">("desc");

	// Sincroniza statusFilter com a URL quando ela muda
	useEffect(() => {
		const urlStatusParam = searchParams.get("status");
		if (
			urlStatusParam &&
			validStatuses.includes(urlStatusParam as (typeof validStatuses)[number])
		) {
			setStatusFilter(urlStatusParam as OrderStatus);
		} else if (!urlStatusParam) {
			setStatusFilter("all");
		}
	}, [searchParams]);

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
			limit: Number.parseInt(value, 10),
			page: 1,
		}));
	};

	if (status === "loading" || status === "unauthenticated") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
				<div className="text-center">
					<Spinner size="lg" color="primary" />
					<p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
						Carregando pedidos...
					</p>
				</div>
			</div>
		);
	}

	if (session?.user?.role !== "ADMIN") {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
			{/* Background Pattern */}
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Qzk0OTQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 dark:opacity-20" />

			<div className="relative px-4 py-8">
				<div className="mx-auto w-full max-w-7xl">
					{/* Header Card */}
					<div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-50 via-white to-slate-100 p-6 shadow-2xl dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 md:p-8">
						{/* Decorative Elements */}
						<div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/20 blur-3xl" />
						<div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl" />

						<div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
									<ShoppingBagIcon className="h-7 w-7 text-white" />
								</div>
								<div>
									<h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
										Gerenciar Pedidos
									</h1>
									<p className="mt-1 text-slate-600 dark:text-slate-400">
										Visualize e gerencie todos os pedidos
									</p>
								</div>
							</div>

							<div className="flex flex-wrap gap-3">
								<Button
									as={Link}
									href="/admin/pedidos/novo"
									className="bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 [&]:text-white"
									startContent={<PlusIcon className="h-5 w-5 text-white" />}
								>
									<span className="text-white">Novo Pedido</span>
								</Button>
								<Button
									as={Link}
									href="/admin"
									variant="flat"
									className="bg-slate-100 font-medium text-slate-700 shadow-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 [&]:text-slate-700 dark:[&]:text-white"
									startContent={
										<ArrowLeftIcon className="h-4 w-4 text-slate-700 dark:text-white" />
									}
								>
									<span className="text-slate-700 dark:text-white">Voltar</span>
								</Button>
							</div>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
						<Card className="border-none bg-gradient-to-br from-amber-50 to-orange-50 shadow-md dark:from-amber-900/20 dark:to-orange-900/20">
							<CardBody className="flex flex-row items-center gap-3 p-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
									<ClockIcon className="h-5 w-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Pendentes
									</p>
									<p className="text-xl font-bold text-slate-800 dark:text-slate-100">
										{orders.filter((o) => o.status === "PENDING").length}
									</p>
								</div>
							</CardBody>
						</Card>

						<Card className="border-none bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md dark:from-blue-900/20 dark:to-cyan-900/20">
							<CardBody className="flex flex-row items-center gap-3 p-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
									<TruckIcon className="h-5 w-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Em Trânsito
									</p>
									<p className="text-xl font-bold text-slate-800 dark:text-slate-100">
										{orders.filter((o) => o.status === "SHIPPED").length}
									</p>
								</div>
							</CardBody>
						</Card>

						<Card className="border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md dark:from-emerald-900/20 dark:to-teal-900/20">
							<CardBody className="flex flex-row items-center gap-3 p-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
									<CheckCircleIcon className="h-5 w-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Entregues
									</p>
									<p className="text-xl font-bold text-slate-800 dark:text-slate-100">
										{orders.filter((o) => o.status === "DELIVERED").length}
									</p>
								</div>
							</CardBody>
						</Card>

						<Card className="border-none bg-gradient-to-br from-brand-50 to-brand-100 shadow-md dark:from-brand-900/20 dark:to-brand-900/30">
							<CardBody className="flex flex-row items-center gap-3 p-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-md">
									<DocumentTextIcon className="h-5 w-5 text-white" />
								</div>
								<div>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										Total
									</p>
									<p className="text-xl font-bold text-slate-800 dark:text-slate-100">
										{pagination.total}
									</p>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Main Content Card */}
					<Card className="border-none bg-white/80 shadow-xl backdrop-blur-sm dark:bg-slate-800/80">
						<CardBody className="p-0">
							{/* Status Filter Tabs */}
							<div className="border-b border-slate-200 px-6 pt-6 dark:border-slate-700">
								<Tabs
									selectedKey={statusFilter}
									onSelectionChange={(key) => {
										const newStatus = key as typeof statusFilter;
										setStatusFilter(newStatus);
										setPagination((prev) => ({ ...prev, page: 1 }));
										// Atualiza a URL
										const params = new URLSearchParams(searchParams.toString());
										if (newStatus === "all") {
											params.delete("status");
										} else {
											params.set("status", newStatus);
										}
										router.push(
											`/admin/pedidos${params.toString() ? `?${params.toString()}` : ""}`,
										);
									}}
									color="primary"
									variant="underlined"
									classNames={{
										tabList:
											"gap-6 w-full relative rounded-none p-0 overflow-x-auto",
										cursor:
											"w-full bg-gradient-to-r from-brand-500 to-brand-600",
										tab: "max-w-fit px-0 h-12",
										tabContent:
											"group-data-[selected=true]:text-brand-600 dark:group-data-[selected=true]:text-brand-400",
									}}
								>
									{Object.entries(statusConfig).map(([key, config]) => (
										<Tab
											key={key}
											title={
												<div className="flex items-center gap-2">
													<config.icon className="h-4 w-4" />
													<span>{config.label}</span>
												</div>
											}
										/>
									))}
								</Tabs>
							</div>

							{/* Toolbar */}
							<div className="flex flex-col gap-4 border-b border-slate-200 p-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
								<div className="relative">
									<input
										type="text"
										className="w-full rounded-xl bg-slate-100 px-4 py-2 pl-10 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-80"
										placeholder="Buscar por pedido, cliente, email..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
									<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
									{searchQuery && (
										<button
											type="button"
											onClick={() => setSearchQuery("")}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
											aria-label="Limpar busca"
										>
											<svg
												className="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									)}
								</div>

								<div className="flex flex-wrap gap-2">
									<Select
										label="Ordenar por"
										selectedKeys={[orderBy]}
										onChange={(e) => setOrderBy(e.target.value)}
										className="w-36"
										size="sm"
										classNames={{
											trigger: "bg-slate-100 dark:bg-slate-700/50 shadow-sm",
										}}
									>
										<SelectItem key="createdAt" value="createdAt">
											📅 Data
										</SelectItem>
										<SelectItem key="orderNumber" value="orderNumber">
											# Pedido
										</SelectItem>
										<SelectItem key="total" value="total">
											💰 Valor
										</SelectItem>
										<SelectItem key="customerName" value="customerName">
											👤 Cliente
										</SelectItem>
									</Select>

									<Select
										label="Ordem"
										selectedKeys={[order]}
										onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
										className="w-32"
										size="sm"
										classNames={{
											trigger: "bg-slate-100 dark:bg-slate-700/50 shadow-sm",
										}}
									>
										<SelectItem key="desc" value="desc">
											↓ Decrescente
										</SelectItem>
										<SelectItem key="asc" value="asc">
											↑ Crescente
										</SelectItem>
									</Select>

									<Select
										label="Por página"
										selectedKeys={[pagination.limit.toString()]}
										onChange={(e) => handleLimitChange(e.target.value)}
										className="w-24"
										size="sm"
										classNames={{
											trigger: "bg-slate-100 dark:bg-slate-700/50 shadow-sm",
										}}
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
							<div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 dark:border-slate-700">
								<div className="text-sm text-slate-600 dark:text-slate-400">
									{loading ? (
										<span className="flex items-center gap-2">
											<Spinner size="sm" />
											Carregando...
										</span>
									) : (
										<>
											Mostrando{" "}
											<span className="font-semibold text-slate-800 dark:text-slate-200">
												{pagination.total === 0
													? 0
													: (pagination.page - 1) * pagination.limit + 1}
												-
												{Math.min(
													pagination.page * pagination.limit,
													pagination.total,
												)}
											</span>{" "}
											de{" "}
											<span className="font-semibold text-slate-800 dark:text-slate-200">
												{pagination.total}
											</span>{" "}
											pedidos
										</>
									)}
								</div>
								{statusFilter !== "all" && (
									<Chip
										variant="flat"
										color={
											statusConfig[statusFilter].color as
												| "warning"
												| "primary"
												| "secondary"
												| "success"
												| "danger"
												| "default"
										}
										size="sm"
										onClose={() => setStatusFilter("all")}
									>
										Filtro: {statusConfig[statusFilter].label}
									</Chip>
								)}
							</div>

							{/* Orders Table */}
							<div className="p-6">
								<AdminOrdersTable
									orders={orders}
									isLoading={loading}
									onStatusChange={fetchOrders}
								/>
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && !loading && (
								<div className="flex justify-center border-t border-slate-200 p-6 dark:border-slate-700">
									<Pagination
										total={pagination.totalPages}
										page={pagination.page}
										onChange={handlePageChange}
										showControls
										color="primary"
										classNames={{
											wrapper: "gap-2",
											item: "bg-slate-100 dark:bg-slate-700/50",
											cursor:
												"bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25",
										}}
									/>
								</div>
							)}
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
}
