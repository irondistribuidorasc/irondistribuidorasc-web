"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
	Button,
	Card,
	CardBody,
	Input,
	Pagination,
	Select,
	SelectItem,
	Spinner,
	Tab,
	Tabs,
} from "@heroui/react";
import {
	MagnifyingGlassIcon,
	ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

type User = {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	docNumber: string | null;
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
			<div className="mx-auto w-full max-w-6xl">
				<div className="mb-8">
					<Button
						as={Link}
						href="/admin"
						variant="light"
						className="mb-4 -ml-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
					>
						<ChevronLeftIcon className="mr-1 h-4 w-4" />
						Voltar para Dashboard
					</Button>
					<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
						Gerenciar Usuários
					</h1>
					<p className="mt-2 text-slate-600 dark:text-slate-400">
						Aprovação e gerenciamento de contas
					</p>
				</div>

				{/* Tabs de filtro */}
				<Tabs
					selectedKey={filter}
					onSelectionChange={(key) => {
						setFilter(key as typeof filter);
						setPagination((prev) => ({ ...prev, page: 1 }));
					}}
					color="danger"
					variant="bordered"
					className="mb-6"
				>
					<Tab key="pending" title="Pendentes de Aprovação" />
					<Tab key="approved" title="Aprovados" />
					<Tab key="all" title="Todos" />
				</Tabs>

				{/* Barra de ferramentas */}
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<Input
						className="max-w-xs"
						placeholder="Buscar por nome, email, telefone..."
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

				{/* Contador de resultados */}
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
							de {pagination.total} usuários
						</>
					)}
				</div>

				{/* Lista de usuários */}
				{loading ? (
					<div className="flex justify-center py-12">
						<Spinner size="lg" />
					</div>
				) : users.length === 0 ? (
					<Card>
						<CardBody className="py-12 text-center">
							<p className="text-slate-600 dark:text-slate-400">
								{searchQuery
									? "Nenhum usuário encontrado para esta busca"
									: "Nenhum usuário encontrado"}
							</p>
						</CardBody>
					</Card>
				) : (
					<>
						<div className="space-y-4">
							{users.map((user) => (
								<Card
									key={user.id}
									className="border border-slate-200 dark:border-slate-800"
								>
									<CardBody className="space-y-4">
										<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
											<div className="flex-1">
												<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
													{user.name}
												</h3>
												<p className="text-sm text-slate-600 dark:text-slate-400">
													{user.email}
												</p>
												{user.phone && (
													<p className="text-sm text-slate-500 dark:text-slate-500">
														Tel: {user.phone}
													</p>
												)}
												{user.docNumber && (
													<p className="text-sm text-slate-500 dark:text-slate-500">
														Doc: {user.docNumber}
													</p>
												)}
												<p className="mt-2 text-xs text-slate-400">
													Cadastrado em:{" "}
													{new Date(user.createdAt).toLocaleDateString("pt-BR")}
												</p>
											</div>

											<div className="flex gap-2">
												{!user.approved && user.role === "USER" && (
													<>
														<Button
															color="success"
															onPress={() => handleApprove(user.id, true)}
														>
															Aprovar
														</Button>
														<Button
															color="danger"
															variant="flat"
															onPress={() => handleApprove(user.id, false)}
														>
															Rejeitar
														</Button>
													</>
												)}
												{user.approved && user.role === "USER" && (
													<>
														<span className="rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
															✓ Aprovado
														</span>
														<Button
															color="danger"
															variant="bordered"
															size="sm"
															onPress={() => handleApprove(user.id, false)}
														>
															Revogar Acesso
														</Button>
													</>
												)}
												{user.role === "ADMIN" && (
													<span className="rounded-md bg-brand-100 px-3 py-2 text-sm font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
														Administrador
													</span>
												)}
											</div>
										</div>
									</CardBody>
								</Card>
							))}
						</div>

						{/* Paginação */}
						{pagination.totalPages > 1 && (
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
					</>
				)}
			</div>
		</div>
	);
}
