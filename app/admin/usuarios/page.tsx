"use client";

import {
	BuildingStorefrontIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ClockIcon,
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
	useDisclosure,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { logger } from "@/src/lib/logger";
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
			logger.error("Failed to fetch users", { error });
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
			logger.error("Failed to update user", { error });
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
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-content1 via-background to-default-100">
				<Spinner size="lg" />
			</div>
		);
	}

	if (session?.user?.role !== "ADMIN") {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-content1 via-background to-default-100">
			<div className="fixed inset-0 -z-10 bg-[url('/patterns/dots.svg')] opacity-60" />

			<div className="mx-auto w-full max-w-6xl px-4 py-8">
				{/* Back Button */}
				<Button
					as={Link}
					href="/admin"
					variant="light"
					className="mb-6 -ml-2 text-default-400 hover:text-default-600 transition-colors"
				>
					<ChevronLeftIcon className="mr-1 h-4 w-4" />
					Voltar para Dashboard
				</Button>

				{/* Header Card */}
				<Card className="mb-8 overflow-hidden border-0 shadow-xl">
					<div className="relative bg-gradient-to-r from-content1 via-background to-content1">
						{/* Decorative elements */}
						<div className="absolute inset-0 overflow-hidden">
							<div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl dark:bg-white/5" />
							<div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-600/10 blur-3xl" />
						</div>

						<div className="relative px-6 py-6 sm:px-8">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30">
										<UsersIcon className="h-7 w-7 text-white" />
									</div>
									<div>
										<h1 className="text-2xl font-bold text-foreground sm:text-3xl">
											Gerenciar Usuários
										</h1>
										<p className="mt-1 text-default-500">
											Aprovação e gerenciamento de contas
										</p>
									</div>
								</div>

								{/* Quick Stats */}
								<div className="flex gap-3">
									<div className="rounded-xl bg-default-100/80 px-4 py-2 backdrop-blur-sm">
										<p className="text-xs font-medium text-default-400">
											Total
										</p>
										<p className="text-xl font-bold text-foreground">
											{pagination.total}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Toolbar Card - Unified */}
				<Card className="mb-6 overflow-hidden border-0 shadow-lg bg-background/80 backdrop-blur-sm">
					<CardBody className="p-4">
						<div className="flex flex-col gap-4">
							{/* Row 1: Search, Filter Chips, and New Button */}
							<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
								{/* Search */}
								<div className="flex-1 max-w-sm">
									<Input
										placeholder="Buscar por nome, email, telefone..."
										value={searchQuery}
										onValueChange={setSearchQuery}
										startContent={<MagnifyingGlassIcon className="h-4 w-4 text-default-400" />}
										isClearable
										onClear={() => setSearchQuery("")}
										size="sm"
										classNames={{
											inputWrapper: "bg-default-100 border-divider",
										}}
									/>
								</div>

								{/* Status Filter Chips */}
								<div className="flex items-center gap-2">
									<FunnelIcon className="h-4 w-4 text-default-400 hidden sm:block" />
									<div className="flex gap-1.5 p-1 rounded-xl bg-default-100/80">
										<button
											type="button"
											onClick={() => {
												setFilter("pending");
												setPagination((prev) => ({ ...prev, page: 1 }));
											}}
											className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
												filter === "pending"
													? "bg-warning-500 text-white shadow-md"
													: "text-default-500 hover:bg-default-200"
											}`}
										>
											<ClockIcon className="h-4 w-4" />
											<span className="hidden sm:inline">Pendentes</span>
										</button>
										<button
											type="button"
											onClick={() => {
												setFilter("approved");
												setPagination((prev) => ({ ...prev, page: 1 }));
											}}
											className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
												filter === "approved"
													? "bg-success-500 text-white shadow-md"
													: "text-default-500 hover:bg-default-200"
											}`}
										>
											<CheckCircleIcon className="h-4 w-4" />
											<span className="hidden sm:inline">Aprovados</span>
										</button>
										<button
											type="button"
											onClick={() => {
												setFilter("all");
												setPagination((prev) => ({ ...prev, page: 1 }));
											}}
											className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
												filter === "all"
													? "bg-brand-500 text-white shadow-md"
													: "text-default-500 hover:bg-default-200"
											}`}
										>
											<UserGroupIcon className="h-4 w-4" />
											<span className="hidden sm:inline">Todos</span>
										</button>
									</div>
								</div>

								{/* New Button */}
								<Button
									className="bg-brand-600 font-medium text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all"
									startContent={<UserPlusIcon className="h-5 w-5" />}
									onPress={onQuickCreateOpen}
								>
									Novo Rápido
								</Button>
							</div>

							{/* Row 2: Sorting and Pagination Options */}
							<div className="flex flex-wrap items-center gap-3 pt-3 border-t border-divider/60">
								<Select
									label="Ordenar por"
									selectedKeys={[orderBy]}
									onChange={(e) => setOrderBy(e.target.value)}
									className="w-36"
									size="sm"
									classNames={{
										trigger:
											"bg-default-100 border-divider",
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
									className="w-32"
									size="sm"
									classNames={{
										trigger:
											"bg-default-100 border-divider",
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
									className="w-24"
									size="sm"
									classNames={{
										trigger:
											"bg-default-100 border-divider",
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

								{/* Results count inline */}
								<div className="ml-auto">
									<Chip
										size="sm"
										variant="flat"
										className="bg-default-100"
									>
										{loading ? (
											<span className="flex items-center gap-1">
												<Spinner size="sm" /> Carregando...
											</span>
										) : (
											<span>
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
												de <strong>{pagination.total}</strong>
											</span>
										)}
									</Chip>
								</div>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Lista de usuários */}
				{loading ? (
					<div className="flex justify-center py-16">
						<div className="flex flex-col items-center gap-4">
							<Spinner size="lg" />
							<p className="text-sm text-default-400">
								Carregando usuários...
							</p>
						</div>
					</div>
				) : users.length === 0 ? (
					<Card className="overflow-hidden border-0 shadow-lg bg-background/80 backdrop-blur-sm">
						<CardBody className="py-16">
							<div className="flex flex-col items-center justify-center text-center">
								<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-default-100">
									<InboxIcon className="h-8 w-8 text-default-400" />
								</div>
								<h3 className="text-lg font-semibold text-default-600">
									Nenhum usuário encontrado
								</h3>
								<p className="mt-2 text-sm text-default-400 max-w-md">
									{searchQuery
										? `Não encontramos usuários correspondentes a "${searchQuery}". Tente outra busca.`
										: filter === "pending"
											? "Não há usuários pendentes de aprovação no momento."
											: "Não há usuários cadastrados ainda."}
								</p>
								{!searchQuery && (
									<Button
										className="mt-6 bg-brand-600 font-medium text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700"
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
						<div className="space-y-3">
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
										className="group border-0 bg-background/80 backdrop-blur-sm shadow-md transition-all hover:shadow-xl"
									>
										<CardBody className="p-4">
											{/* Header: Avatar + Info + Status Badge */}
											<div className="flex items-start gap-3">
												<Avatar
													name={initials}
													size="lg"
													classNames={{
														base: "bg-brand-500 text-white shadow-lg shadow-brand-500/20 flex-shrink-0",
													}}
												/>
												<div className="min-w-0 flex-1">
													{/* Nome e badges */}
													<div className="flex flex-wrap items-center gap-2">
														<h3 className="font-semibold text-foreground">
															{user.name}
														</h3>
														{isAvulso && (
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
														)}
														{/* Status badge inline no mobile */}
														<span className="ml-auto">
															{user.role === "ADMIN" ? (
																<Chip
																	size="sm"
																	variant="flat"
																	startContent={
																		<ShieldCheckIcon className="h-3 w-3" />
																	}
																	classNames={{
																		base: "bg-brand-100 dark:bg-brand-900/30",
																		content:
																			"text-brand-700 dark:text-brand-300 font-medium text-xs",
																	}}
																>
																	Admin
																</Chip>
															) : user.approved ? (
																<Chip
																	size="sm"
																	variant="flat"
																	color="success"
																	startContent={
																		<CheckCircleIcon className="h-3 w-3" />
																	}
																>
																	Aprovado
																</Chip>
															) : (
																<Chip
																	size="sm"
																	variant="flat"
																	color="warning"
																	startContent={
																		<XCircleIcon className="h-3 w-3" />
																	}
																>
																	Pendente
																</Chip>
															)}
														</span>
													</div>
													{/* Email */}
													<p className="mt-1 text-sm text-default-400 truncate">
														{user.email}
													</p>
												</div>
											</div>

											{/* Informações adicionais - Grid vertical no mobile */}
											{(user.phone || user.storeName || user.docNumber) && (
												<div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-default-100 p-3 text-sm">
													{user.phone && (
														<div className="flex items-center gap-2 text-default-500">
															<PhoneIcon className="h-4 w-4 text-default-400 flex-shrink-0" />
															<span>{user.phone}</span>
														</div>
													)}
													{user.docNumber && (
														<div className="flex items-center gap-2 text-default-500">
															<IdentificationIcon className="h-4 w-4 text-default-400 flex-shrink-0" />
															<span>{user.docNumber}</span>
														</div>
													)}
													{user.storeName && (
														<div className="flex items-center gap-2 text-default-500">
															<BuildingStorefrontIcon className="h-4 w-4 text-default-400 flex-shrink-0" />
															<span>{user.storeName}</span>
														</div>
													)}
												</div>
											)}

											{/* Footer: Data + Ações */}
											<div className="mt-3 flex flex-col gap-3 border-t border-divider/60 pt-3">
												{/* Data e botão editar */}
												<div className="flex items-center justify-between">
													<span className="text-xs text-default-400 flex items-center gap-1">
														<ClockIcon className="h-3.5 w-3.5" />
														{new Date(user.createdAt).toLocaleDateString(
															"pt-BR",
														)}
													</span>
													{user.role === "USER" && (
														<Button
															isIconOnly
															variant="flat"
															size="sm"
															onPress={() => handleOpenEdit(user)}
															className="bg-default-100 text-default-500 hover:bg-default-200"
														>
															<PencilSquareIcon className="h-4 w-4" />
														</Button>
													)}
												</div>

												{/* Botões de ação - Full width no mobile */}
												{user.role === "USER" && (
													<div className="flex gap-2">
														{!user.approved ? (
															<>
																<Button
																	size="sm"
																	className="flex-1 bg-brand-600 text-white shadow-md shadow-brand-500/20 hover:bg-brand-700"
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
																	className="flex-1"
																	startContent={
																		<XCircleIcon className="h-4 w-4" />
																	}
																	onPress={() => handleApprove(user.id, false)}
																>
																	Rejeitar
																</Button>
															</>
														) : (
															<Button
																size="sm"
																color="danger"
																variant="light"
																className="ml-auto"
																onPress={() => handleApprove(user.id, false)}
															>
																Revogar Acesso
															</Button>
														)}
													</div>
												)}
											</div>
										</CardBody>
									</Card>
								);
							})}
						</div>

						{/* Paginação */}
						{pagination.totalPages > 1 && (
							<div className="mt-8 flex justify-center">
								<Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm px-4 py-3">
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
						base: "bg-background",
						header: "border-b border-divider",
						footer: "border-t border-divider",
					}}
				>
					<ModalContent>
						<ModalHeader>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
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
									label="Nome"
									placeholder="Nome completo"
									value={editForm.name}
									onValueChange={(value) =>
										setEditForm((prev) => ({ ...prev, name: value }))
									}
									isRequired
									classNames={{
										inputWrapper: "bg-default-100",
									}}
								/>
								<Input
									label="Email"
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
										inputWrapper: "bg-default-100",
									}}
								/>
								<Input
									label="Telefone"
									placeholder="(00) 00000-0000"
									value={editForm.phone}
									onValueChange={(value) =>
										setEditForm((prev) => ({ ...prev, phone: value }))
									}
									classNames={{
										inputWrapper: "bg-default-100",
									}}
								/>
								<Input
									label="Nome da Loja"
									placeholder="Nome da loja (opcional)"
									value={editForm.storeName}
									onValueChange={(value) =>
										setEditForm((prev) => ({ ...prev, storeName: value }))
									}
									classNames={{
										inputWrapper: "bg-default-100",
									}}
								/>
							</div>
						</ModalBody>
						<ModalFooter>
							<Button variant="flat" onPress={onClose}>
								Cancelar
							</Button>
							<Button
								className="bg-brand-600 text-white shadow-md shadow-brand-500/20 hover:bg-brand-700"
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
						base: "bg-background",
						header: "border-b border-divider",
						footer: "border-t border-divider",
					}}
				>
					<ModalContent>
						<ModalHeader>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
									<UserPlusIcon className="h-5 w-5 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">Novo Usuário Rápido</h3>
									<p className="text-sm font-normal text-default-400">
										Cadastro simplificado apenas com o nome
									</p>
								</div>
							</div>
						</ModalHeader>
						<ModalBody className="py-6">
							<Input
								label="Nome do Usuário"
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
									inputWrapper: "bg-default-100",
								}}
							/>
							<div className="mt-2 rounded-lg bg-default-100 px-3 py-2">
								<p className="text-xs text-default-500 flex items-start gap-2">
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
								className="bg-brand-600 text-white shadow-md shadow-brand-500/20 hover:bg-brand-700"
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
