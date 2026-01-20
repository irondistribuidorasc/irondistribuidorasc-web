"use client";

import {
	BuildingStorefrontIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ClockIcon,
	EnvelopeIcon,
	ExclamationTriangleIcon,
	FunnelIcon,
	IdentificationIcon,
	InboxIcon,
	MagnifyingGlassIcon,
	PencilSquareIcon,
	PhoneIcon,
	ShieldCheckIcon,
	UserGroupIcon,
	UserPlusIcon,
	UsersIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import {
	Avatar,
	Button,
	Card,
	CardBody,
	Chip,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Pagination,
	Select,
	SelectItem,
	Spinner,
	Tab,
	Tabs,
	Tooltip,
	useDisclosure,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createQuickUser } from "@/app/actions/admin-order-creation";

type User = {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	docNumber: string | null;
	storeName: string | null;
	role: string;
	approved: boolean;
	createdAt: string;
};

type PaginationData = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
};

export default function AdminUsersPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
	const [pagination, setPagination] = useState<PaginationData>({
		total: 0,
		page: 1,
		limit: 20,
		totalPages: 0,
		hasNext: false,
		hasPrev: false,
	});
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"pending" | "approved" | "all">(
		"pending",
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [orderBy, setOrderBy] = useState("createdAt");
	const [order, setOrder] = useState<"asc" | "desc">("desc");

	// Modal de edição
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [editForm, setEditForm] = useState({
		name: "",
		email: "",
		phone: "",
		storeName: "",
	});
	const [saving, setSaving] = useState(false);

	// Modal de criação rápida
	const {
		isOpen: isQuickCreateOpen,
		onOpen: onQuickCreateOpen,
		onClose: onQuickCreateClose,
	} = useDisclosure();
	const [quickUserName, setQuickUserName] = useState("");
	const [creatingQuickUser, setCreatingQuickUser] = useState(false);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
			router.push("/");
		}
	}, [status, session, router]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on search
		}, 500);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const fetchUsers = useCallback(async () => {
		if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;

		setLoading(true);
		try {
			const params = new URLSearchParams({
				status: filter,
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				orderBy,
				order,
			});

			if (debouncedSearch) {
				params.append("search", debouncedSearch);
			}

			const response = await fetch(`/api/admin/users?${params}`);
			if (response.ok) {
				const data = await response.json();
				setUsers(data.users);
				setPagination(data.pagination);
			}
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setLoading(false);
		}
	}, [
		status,
		session,
		filter,
		pagination.page,
		pagination.limit,
		debouncedSearch,
		orderBy,
		order,
	]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleApprove = async (userId: string, approved: boolean) => {
		try {
			const response = await fetch("/api/admin/users", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, approved }),
			});

			if (response.ok) {
				// Refresh users list
				fetchUsers();
			}
		} catch (error) {
			console.error("Failed to update user:", error);
		}
	};

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

	const handleOpenEdit = (user: User) => {
		setEditingUser(user);
		setEditForm({
			name: user.name,
			email: user.email,
			phone: user.phone || "",
			storeName: user.storeName || "",
		});
		onOpen();
	};

	const handleSaveEdit = async () => {
		if (!editingUser) return;

		setSaving(true);
		try {
			const response = await fetch("/api/admin/users", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: editingUser.id,
					...editForm,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success("Usuário atualizado com sucesso!");
				onClose();
				fetchUsers();
			} else {
				toast.error(data.error || "Erro ao atualizar usuário");
			}
		} catch {
			toast.error("Erro inesperado ao atualizar usuário");
		} finally {
			setSaving(false);
		}
	};

	const handleCreateQuickUser = async () => {
		if (quickUserName.trim().length < 2) {
			toast.error("Digite pelo menos 2 caracteres para o nome");
			return;
		}

		setCreatingQuickUser(true);
		try {
			const result = await createQuickUser(quickUserName.trim());
			if (result.success && result.user) {
				toast.success(`Usuário "${result.user.name}" criado com sucesso!`);
				setQuickUserName("");
				onQuickCreateClose();
				fetchUsers();
			} else {
				toast.error(result.error || "Erro ao criar usuário");
			}
		} catch {
			toast.error("Erro inesperado ao criar usuário");
		} finally {
			setCreatingQuickUser(false);
		}
	};

	if (status === "loading" || status === "unauthenticated") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
				<Spinner size="lg" />
			</div>
		);
	}

	if (session?.user?.role !== "ADMIN") {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			{/* Background Pattern */}
			<div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTE4IDBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAgMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bS0xOCAxOGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHptMTggMGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHoiIGZpbGw9IiM5NDk0YjgiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvZz48L3N2Zz4=')] opacity-60" />

			<div className="mx-auto w-full max-w-6xl px-4 py-8">
				{/* Back Button */}
				<Button
					as={Link}
					href="/admin"
					variant="light"
					className="mb-6 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
				>
					<ChevronLeftIcon className="mr-1 h-4 w-4" />
					Voltar para Dashboard
				</Button>

				{/* Header Card */}
				<Card className="mb-8 overflow-hidden border-0 shadow-xl">
					<div className="relative bg-gradient-to-r from-slate-50 via-white to-slate-100 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700">
						{/* Decorative elements */}
						<div className="absolute inset-0 overflow-hidden">
							<div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl dark:bg-white/5" />
							<div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-600/10 blur-3xl dark:bg-slate-500/10" />
						</div>

						<div className="relative px-6 py-6 sm:px-8">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
										<UsersIcon className="h-7 w-7 text-white" />
									</div>
									<div>
										<h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
											Gerenciar Usuários
										</h1>
										<p className="mt-1 text-slate-600 dark:text-slate-300">
											Aprovação e gerenciamento de contas
										</p>
									</div>
								</div>

								{/* Quick Stats */}
								<div className="flex gap-3">
									<div className="rounded-xl bg-slate-100/80 px-4 py-2 backdrop-blur-sm dark:bg-white/10">
										<p className="text-xs font-medium text-emerald-700 dark:text-emerald-100">
											Total
										</p>
										<p className="text-xl font-bold text-slate-900 dark:text-white">
											{pagination.total}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Tabs Card */}
				<Card className="mb-6 overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
					<CardBody className="p-4">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 shadow-md shadow-brand-500/30">
								<FunnelIcon className="h-4 w-4 text-white" />
							</div>
							<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Filtrar por status
							</span>
						</div>
						<Tabs
							selectedKey={filter}
							onSelectionChange={(key) => {
								setFilter(key as typeof filter);
								setPagination((prev) => ({ ...prev, page: 1 }));
							}}
							color="primary"
							variant="solid"
							classNames={{
								tabList:
									"gap-2 w-full flex-wrap bg-slate-100/50 dark:bg-slate-700/50 p-1 rounded-xl",
								cursor: "bg-gradient-to-r from-brand-500 to-brand-600 shadow-md",
								tab: "px-4 py-2 font-medium",
								tabContent: "group-data-[selected=true]:text-white",
							}}
						>
							<Tab
								key="pending"
								title={
									<div className="flex items-center gap-2">
										<ClockIcon className="h-4 w-4" />
										<span>Pendentes</span>
									</div>
								}
							/>
							<Tab
								key="approved"
								title={
									<div className="flex items-center gap-2">
										<CheckCircleIcon className="h-4 w-4" />
										<span>Aprovados</span>
									</div>
								}
							/>
							<Tab
								key="all"
								title={
									<div className="flex items-center gap-2">
										<UserGroupIcon className="h-4 w-4" />
										<span>Todos</span>
									</div>
								}
							/>
						</Tabs>
					</CardBody>
				</Card>

				{/* Toolbar Card */}
				<Card className="mb-6 overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
					<CardBody className="p-4">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
							{/* Search & New Button */}
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
								<div className="flex-1 min-w-0 sm:min-w-[300px]">
									<label
										htmlFor="search-users"
										className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"
									>
										<MagnifyingGlassIcon className="h-3.5 w-3.5" />
										Buscar usuário
									</label>
									<div className="relative">
										<input
											id="search-users"
											type="text"
											className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pl-10 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:bg-slate-100 focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:bg-slate-700"
											placeholder="Nome, email, telefone..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
										<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
								</div>
								<Button
									className="bg-gradient-to-r from-emerald-500 to-teal-600 font-medium text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all hover:scale-[1.02]"
									startContent={<UserPlusIcon className="h-5 w-5" />}
									onPress={onQuickCreateOpen}
								>
									Novo Rápido
								</Button>
							</div>

							{/* Filters */}
							<div className="flex flex-wrap items-end gap-3">
								<Select
									label="Ordenar por"
									selectedKeys={[orderBy]}
									onChange={(e) => setOrderBy(e.target.value)}
									className="w-40"
									size="sm"
									classNames={{
										trigger:
											"bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600",
									}}
								>
									<SelectItem key="createdAt" value="createdAt">
										Data cadastro
									</SelectItem>
									<SelectItem key="name" value="name">
										Nome
									</SelectItem>
									<SelectItem key="email" value="email">
										Email
									</SelectItem>
								</Select>

								<Select
									label="Ordem"
									selectedKeys={[order]}
									onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
									className="w-36"
									size="sm"
									classNames={{
										trigger:
											"bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600",
									}}
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
									className="w-28"
									size="sm"
									classNames={{
										trigger:
											"bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600",
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
					</CardBody>
				</Card>

				{/* Results Counter */}
				<div className="mb-4 flex items-center gap-2">
					<Chip
						size="sm"
						variant="flat"
						className="bg-slate-100 dark:bg-slate-800"
					>
						{loading ? (
							<span className="flex items-center gap-1">
								<Spinner size="sm" /> Carregando...
							</span>
						) : (
							<span>
								Mostrando{" "}
								<strong>
									{pagination.total === 0
										? 0
										: (pagination.page - 1) * pagination.limit + 1}
									-
									{Math.min(
										pagination.page * pagination.limit,
										pagination.total,
									)}
								</strong>{" "}
								de <strong>{pagination.total}</strong> usuários
							</span>
						)}
					</Chip>
				</div>

				{/* Lista de usuários */}
				{loading ? (
					<div className="flex justify-center py-16">
						<div className="flex flex-col items-center gap-4">
							<Spinner size="lg" />
							<p className="text-sm text-slate-500 dark:text-slate-400">
								Carregando usuários...
							</p>
						</div>
					</div>
				) : users.length === 0 ? (
					<Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
						<CardBody className="py-16">
							<div className="flex flex-col items-center justify-center text-center">
								<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
									<InboxIcon className="h-8 w-8 text-slate-400" />
								</div>
								<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
									Nenhum usuário encontrado
								</h3>
								<p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
									{searchQuery
										? `Não encontramos usuários correspondentes a "${searchQuery}". Tente outra busca.`
										: filter === "pending"
											? "Não há usuários pendentes de aprovação no momento."
											: "Não há usuários cadastrados ainda."}
								</p>
								{!searchQuery && (
									<Button
										className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 font-medium text-white shadow-lg"
										startContent={<UserPlusIcon className="h-5 w-5" />}
										onPress={onQuickCreateOpen}
									>
										Cadastrar Novo Usuário
									</Button>
								)}
							</div>
						</CardBody>
					</Card>
				) : (
					<>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
							{users.map((user) => {
								const isAvulso = user.email.includes("@iron.local");
								const initials = user.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.slice(0, 2)
									.toUpperCase();

								return (
									<Card
										key={user.id}
										className="group border-0 bg-white/80 backdrop-blur-sm shadow-md transition-all hover:shadow-xl hover:scale-[1.01] dark:bg-slate-800/80"
									>
										<CardBody className="p-5">
											{/* Header com Avatar e Status */}
											<div className="flex items-start justify-between gap-4">
												<div className="flex items-center gap-4">
													<Avatar
														name={initials}
														size="lg"
														classNames={{
															base:
																user.role === "ADMIN"
																	? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30"
																	: user.approved
																		? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
																		: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30",
														}}
													/>
													<div className="min-w-0 flex-1">
														<div className="flex items-center gap-2">
															<h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
																{user.name}
															</h3>
															{isAvulso && (
																<Tooltip content="Cliente cadastrado rapidamente - email fictício">
																	<Chip
																		size="sm"
																		variant="flat"
																		color="warning"
																		startContent={
																			<ExclamationTriangleIcon className="h-3 w-3" />
																		}
																	>
																		Avulso
																	</Chip>
																</Tooltip>
															)}
														</div>
														<div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
															<EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
															<span className="truncate">{user.email}</span>
														</div>
													</div>
												</div>

												{/* Badge de Role/Status */}
												{user.role === "ADMIN" ? (
													<Chip
														variant="flat"
														color="primary"
														startContent={
															<ShieldCheckIcon className="h-4 w-4" />
														}
														classNames={{
															base: "bg-gradient-to-r from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30",
															content:
																"text-brand-700 dark:text-brand-300 font-medium",
														}}
													>
														Admin
													</Chip>
												) : user.approved ? (
													<Chip
														variant="flat"
														color="success"
														startContent={
															<CheckCircleIcon className="h-4 w-4" />
														}
														classNames={{
															base: "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30",
														}}
													>
														Aprovado
													</Chip>
												) : (
													<Chip
														variant="flat"
														color="warning"
														startContent={<XCircleIcon className="h-4 w-4" />}
														classNames={{
															base: "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30",
														}}
													>
														Pendente
													</Chip>
												)}
											</div>

											{/* Informações adicionais */}
											<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
												{user.phone && (
													<div className="flex items-center gap-1.5">
														<PhoneIcon className="h-4 w-4 text-slate-400" />
														<span>{user.phone}</span>
													</div>
												)}
												{user.storeName && (
													<div className="flex items-center gap-1.5">
														<BuildingStorefrontIcon className="h-4 w-4 text-slate-400" />
														<span>{user.storeName}</span>
													</div>
												)}
												{user.docNumber && (
													<div className="flex items-center gap-1.5">
														<IdentificationIcon className="h-4 w-4 text-slate-400" />
														<span>{user.docNumber}</span>
													</div>
												)}
											</div>

											{/* Footer com data e ações */}
											<div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-4 dark:border-slate-700/60">
												<span className="text-xs text-slate-400 flex items-center gap-1">
													<ClockIcon className="h-3.5 w-3.5" />
													{new Date(user.createdAt).toLocaleDateString("pt-BR")}
												</span>

												<div className="flex items-center gap-2">
													{user.role === "USER" && (
														<Tooltip content="Editar dados do usuário">
															<Button
																isIconOnly
																variant="flat"
																size="sm"
																onPress={() => handleOpenEdit(user)}
																className="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
															>
																<PencilSquareIcon className="h-4 w-4" />
															</Button>
														</Tooltip>
													)}

													{!user.approved && user.role === "USER" && (
														<>
															<Button
																size="sm"
																className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
																startContent={
																	<CheckCircleIcon className="h-4 w-4" />
																}
																onPress={() => handleApprove(user.id, true)}
															>
																Aprovar
															</Button>
															<Button
																size="sm"
																color="danger"
																variant="flat"
																startContent={
																	<XCircleIcon className="h-4 w-4" />
																}
																onPress={() => handleApprove(user.id, false)}
															>
																Rejeitar
															</Button>
														</>
													)}

													{user.approved && user.role === "USER" && (
														<Button
															size="sm"
															color="danger"
															variant="light"
															onPress={() => handleApprove(user.id, false)}
														>
															Revogar
														</Button>
													)}
												</div>
											</div>
										</CardBody>
									</Card>
								);
							})}
						</div>

						{/* Paginação */}
						{pagination.totalPages > 1 && (
							<div className="mt-8 flex justify-center">
								<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 px-4 py-3">
									<Pagination
										total={pagination.totalPages}
										page={pagination.page}
										onChange={handlePageChange}
										showControls
										color="primary"
										classNames={{
											cursor:
											"bg-gradient-to-r from-brand-500 to-brand-600 shadow-md",
										}}
									/>
								</Card>
							</div>
						)}
					</>
				)}

				{/* Modal de Edição */}
				<Modal
					isOpen={isOpen}
					onClose={onClose}
					size="lg"
					classNames={{
						base: "bg-white dark:bg-slate-800",
						header: "border-b border-slate-200 dark:border-slate-700",
						footer: "border-t border-slate-200 dark:border-slate-700",
					}}
				>
					<ModalContent>
						<ModalHeader>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30">
									<PencilSquareIcon className="h-5 w-5 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">Editar Usuário</h3>
									{editingUser?.email.includes("@iron.local") && (
										<p className="text-sm font-normal text-warning-600">
											⚠️ Cliente avulso - atualize o email
										</p>
									)}
								</div>
							</div>
						</ModalHeader>
						<ModalBody className="py-6">
							<div className="space-y-4">
								<Input
									label="👤 Nome"
									placeholder="Nome completo"
									value={editForm.name}
									onValueChange={(value) =>
										setEditForm((prev) => ({ ...prev, name: value }))
									}
									isRequired
									classNames={{
										inputWrapper: "bg-slate-50 dark:bg-slate-700/50",
									}}
								/>
								<Input
									label="✉️ Email"
									placeholder="email@exemplo.com"
									type="email"
									value={editForm.email}
									onValueChange={(value) =>
										setEditForm((prev) => ({ ...prev, email: value }))
									}
									isRequired
									description={
										editingUser?.email.includes("@iron.local")
											? "Substitua o email fictício por um email real"
											: undefined
									}
									classNames={{
										inputWrapper: "bg-slate-50 dark:bg-slate-700/50",
									}}
								/>
								<Input
									label="📱 Telefone"
									placeholder="(00) 00000-0000"
									value={editForm.phone}
									onValueChange={(value) =>
										setEditForm((prev) => ({ ...prev, phone: value }))
									}
									classNames={{
										inputWrapper: "bg-slate-50 dark:bg-slate-700/50",
									}}
								/>
								<Input
									label="🏪 Nome da Loja"
									placeholder="Nome da loja (opcional)"
									value={editForm.storeName}
									onValueChange={(value) =>
										setEditForm((prev) => ({ ...prev, storeName: value }))
									}
									classNames={{
										inputWrapper: "bg-slate-50 dark:bg-slate-700/50",
									}}
								/>
							</div>
						</ModalBody>
						<ModalFooter>
							<Button variant="flat" onPress={onClose}>
								Cancelar
							</Button>
							<Button
								className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md"
								onPress={handleSaveEdit}
								isLoading={saving}
							>
								Salvar Alterações
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>

				{/* Modal de Criação Rápida */}
				<Modal
					isOpen={isQuickCreateOpen}
					onClose={onQuickCreateClose}
					classNames={{
						base: "bg-white dark:bg-slate-800",
						header: "border-b border-slate-200 dark:border-slate-700",
						footer: "border-t border-slate-200 dark:border-slate-700",
					}}
				>
					<ModalContent>
						<ModalHeader>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
									<UserPlusIcon className="h-5 w-5 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">Novo Usuário Rápido</h3>
									<p className="text-sm font-normal text-slate-500">
										Cadastro simplificado apenas com o nome
									</p>
								</div>
							</div>
						</ModalHeader>
						<ModalBody className="py-6">
							<Input
								label="👤 Nome do Usuário"
								placeholder="Digite o nome completo..."
								value={quickUserName}
								onValueChange={setQuickUserName}
								autoFocus
								isRequired
								onKeyDown={(e) => {
									if (e.key === "Enter" && quickUserName.trim().length >= 2) {
										handleCreateQuickUser();
									}
								}}
								classNames={{
									inputWrapper: "bg-slate-50 dark:bg-slate-700/50",
								}}
							/>
							<div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
								<p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
									<ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
									O usuário será criado com um email temporário que pode ser
									atualizado depois através da edição.
								</p>
							</div>
						</ModalBody>
						<ModalFooter>
							<Button variant="flat" onPress={onQuickCreateClose}>
								Cancelar
							</Button>
							<Button
								className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
								onPress={handleCreateQuickUser}
								isLoading={creatingQuickUser}
								isDisabled={quickUserName.trim().length < 2}
							>
								Criar Usuário
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			</div>
		</div>
	);
}
