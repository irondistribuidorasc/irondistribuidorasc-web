"use client";

import {
	ArchiveBoxIcon,
	ChevronLeftIcon,
	CubeIcon,
	CurrencyDollarIcon,
	ExclamationTriangleIcon,
	HashtagIcon,
	InboxIcon,
	MagnifyingGlassIcon,
	PencilIcon,
	TagIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Pagination,
	Spinner,
	Tooltip,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { logger } from "@/src/lib/logger";
import ProductForm from "./ProductForm";

type Product = {
	id: string;
	code: string;
	name: string;
	brand: string;
	category: string;
	model: string;
	price: number;
	inStock: boolean;
	imageUrl: string;
	stockQuantity: number;
	minStockThreshold: number;
};

type PaginationData = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export default function ProductList() {
	const [products, setProducts] = useState<Product[]>([]);
	const [pagination, setPagination] = useState<PaginationData>({
		total: 0,
		page: 1,
		limit: 10,
		totalPages: 0,
	});
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [showLowStock, setShowLowStock] = useState(false);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setPagination((prev) => ({ ...prev, page: 1 }));
		}, 500);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
			});

			if (debouncedSearch) {
				params.append("search", debouncedSearch);
			}

			if (showLowStock) {
				params.append("lowStock", "true");
			}

			const response = await fetch(`/api/admin/products?${params}`);
			if (response.ok) {
				const data = await response.json();
				setProducts(data.products);
				setPagination(data.pagination);
			}
		} catch (error) {
			logger.error("Failed to fetch products", {
				error: error instanceof Error ? error.message : String(error),
			});
		} finally {
			setLoading(false);
		}
	}, [pagination.page, pagination.limit, debouncedSearch, showLowStock]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const handleDelete = (id: string) => {
		toast("Tem certeza que deseja excluir este produto?", {
			action: {
				label: "Excluir",
				onClick: () => performDelete(id),
			},
			cancel: {
				label: "Cancelar",
				onClick: () => {},
			},
		});
	};

	const performDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/admin/products/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Produto excluído com sucesso");
				fetchProducts();
			} else {
				toast.error("Erro ao excluir produto");
			}
		} catch (error) {
			logger.error("Failed to delete product", {
				error: error instanceof Error ? error.message : String(error),
			});
			toast.error("Erro ao excluir produto");
		}
	};

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }));
	};

	if (editingProduct) {
		return (
		<Card className="overflow-hidden border-0 shadow-lg bg-background/80 backdrop-blur-sm">
			<CardHeader className="border-b border-divider bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 dark:from-blue-900/20 dark:to-cyan-900/20">
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30">
								<PencilIcon className="h-5 w-5 text-white" />
							</div>
							<div>
							<h2 className="text-lg font-semibold text-foreground">
								Editar Produto
							</h2>
							<p className="text-xs text-default-400">
									{editingProduct.name}
								</p>
							</div>
						</div>
						<Button
							variant="flat"
							startContent={<ChevronLeftIcon className="h-4 w-4" />}
							onPress={() => setEditingProduct(null)}
						className="bg-default-100"
					>
						Voltar à Lista
						</Button>
					</div>
				</CardHeader>
				<CardBody className="p-6">
					<ProductForm
						initialData={editingProduct}
						onSuccess={() => {
							setEditingProduct(null);
							fetchProducts();
						}}
					/>
				</CardBody>
			</Card>
		);
	}

	// O filtro de estoque baixo já é aplicado no backend
	const filteredProducts = products;

	return (
		<div className="space-y-6">
			{/* Toolbar */}
		<Card className="overflow-hidden border-0 shadow-lg bg-background/80 backdrop-blur-sm">
			<CardBody className="p-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div className="flex-1 min-w-0 md:max-w-sm">
						<label
							htmlFor="search-products"
							className="mb-2 flex items-center gap-2 text-xs font-medium text-default-400"
							>
								<MagnifyingGlassIcon className="h-3.5 w-3.5" />
								Buscar produto
							</label>
							<div className="relative">
								<input
									id="search-products"
									type="text"
									className="w-full rounded-xl border border-divider bg-content1 px-4 py-2 pl-10 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-default-400 hover:bg-default-100 focus:ring-2 focus:ring-brand-500"
									placeholder="Nome, código, marca..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-default-400" />
								{searchQuery && (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-500"
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
							className={
								showLowStock
									? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
									: "bg-default-100 text-default-600"
							}
							startContent={
								showLowStock ? (
									<XMarkIcon className="h-4 w-4" />
								) : (
									<ExclamationTriangleIcon className="h-4 w-4" />
								)
							}
							onPress={() => {
								setShowLowStock(!showLowStock);
								setPagination((prev) => ({ ...prev, page: 1 }));
							}}
						>
							{showLowStock ? "Limpar Filtro" : "⚠️ Estoque Baixo"}
						</Button>
					</div>
				</CardBody>
			</Card>

			{/* Results Counter */}
			<div className="flex items-center gap-2">
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
							<strong>{pagination.total}</strong> produto
							{pagination.total !== 1 ? "s" : ""} encontrado
							{pagination.total !== 1 ? "s" : ""}
						</span>
					)}
				</Chip>
				{showLowStock && (
					<Chip
						size="sm"
						variant="flat"
						color="warning"
						startContent={<ExclamationTriangleIcon className="h-3 w-3" />}
					>
						Filtro: Estoque Baixo
					</Chip>
				)}
			</div>

			{loading ? (
				<div className="flex justify-center py-16">
					<div className="flex flex-col items-center gap-4">
						<Spinner size="lg" color="secondary" />
					<p className="text-sm text-default-400">
						Carregando produtos...
						</p>
					</div>
				</div>
			) : products.length === 0 ? (
			<Card className="overflow-hidden border-0 shadow-lg bg-background/80 backdrop-blur-sm">
				<CardBody className="py-16">
					<div className="flex flex-col items-center justify-center text-center">
						<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-default-100">
							<InboxIcon className="h-8 w-8 text-default-400" />
						</div>
						<h3 className="text-lg font-semibold text-default-600">
							Nenhum produto encontrado
						</h3>
						<p className="mt-2 text-sm text-default-400 max-w-md">
								{searchQuery
									? `Não encontramos produtos correspondentes a "${searchQuery}".`
									: showLowStock
										? "Não há produtos com estoque baixo. Ótima notícia! 🎉"
										: "Comece adicionando seu primeiro produto."}
							</p>
						</div>
					</CardBody>
				</Card>
			) : (
				<>
					{/* Desktop Table View - Now as Cards */}
					<div className="hidden md:block">
					<Card className="overflow-hidden border-0 shadow-lg bg-background/80 backdrop-blur-sm">
						{/* Table Header */}
						<div className="grid grid-cols-12 gap-4 border-b border-divider bg-default-50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-default-400">
								<div className="col-span-2 flex items-center gap-1">
									<HashtagIcon className="h-3.5 w-3.5" />
									Código
								</div>
								<div className="col-span-4 flex items-center gap-1">
									<CubeIcon className="h-3.5 w-3.5" />
									Produto
								</div>
								<div className="col-span-1 flex items-center gap-1">
									<TagIcon className="h-3.5 w-3.5" />
									Marca
								</div>
								<div className="col-span-2 flex items-center gap-1">
									<CurrencyDollarIcon className="h-3.5 w-3.5" />
									Preço
								</div>
								<div className="col-span-2 flex items-center gap-1">
									<ArchiveBoxIcon className="h-3.5 w-3.5" />
									Estoque
								</div>
								<div className="col-span-1 text-center">Ações</div>
							</div>

							{/* Table Body */}
							<div className="divide-y divide-divider">
								{filteredProducts.map((product) => {
									const isLowStock =
										product.stockQuantity <= product.minStockThreshold;
									return (
										<div
											key={product.id}
											className={`group grid grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-default-100/50 ${
												isLowStock ? "bg-amber-50/50 dark:bg-amber-900/10" : ""
											}`}
										>
											{/* Código */}
											<div className="col-span-2 flex items-center">
												<span className="font-mono text-sm text-default-500">
													{product.code}
												</span>
											</div>

											{/* Nome & Modelo */}
											<div className="col-span-4 flex flex-col justify-center">
											<span className="font-medium text-foreground">
												{product.name}
											</span>
											<span className="text-xs text-default-400">
													{product.model}
												</span>
											</div>

										{/* Marca */}
										<div className="col-span-1 flex items-center">
											<Chip
												size="sm"
												variant="flat"
												className="bg-default-100"
											>
												{product.brand}
												</Chip>
											</div>

										{/* Preço */}
										<div className="col-span-2 flex items-center">
											<span className="font-semibold text-foreground">
													{new Intl.NumberFormat("pt-BR", {
														style: "currency",
														currency: "BRL",
													}).format(product.price)}
												</span>
											</div>

											{/* Estoque */}
											<div className="col-span-2 flex items-center gap-2">
												<span
													className={`font-bold ${
														isLowStock
															? "text-amber-600 dark:text-amber-400"
															: "text-emerald-600 dark:text-emerald-400"
													}`}
												>
													{product.stockQuantity}
												</span>
												{isLowStock && (
													<Tooltip content="Estoque abaixo do mínimo">
														<span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-900" />
													</Tooltip>
												)}
											</div>

											{/* Ações */}
											<div className="col-span-1 flex items-center justify-center gap-1">
												<Tooltip content="Editar produto">
													<Button
														isIconOnly
														size="sm"
														variant="flat"
														className="bg-default-100 text-default-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
														onPress={() => setEditingProduct(product)}
													>
														<PencilIcon className="h-4 w-4" />
													</Button>
												</Tooltip>
												<Tooltip content="Excluir produto" color="danger">
													<Button
														isIconOnly
														size="sm"
														variant="flat"
														className="bg-default-100 text-default-500 hover:bg-error-100 hover:text-error-600 dark:hover:bg-error-900/30 dark:hover:text-error-400"
														onPress={() => handleDelete(product.id)}
													>
														<TrashIcon className="h-4 w-4" />
													</Button>
												</Tooltip>
											</div>
										</div>
									);
								})}
							</div>
						</Card>
					</div>

					{/* Mobile Card View */}
					<div className="flex flex-col gap-4 md:hidden">
						{filteredProducts.map((product) => {
							const isLowStock =
								product.stockQuantity <= product.minStockThreshold;
							return (
								<Card
									key={product.id}
									className={`overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl ${
										isLowStock
											? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
											: "bg-background/80 backdrop-blur-sm"
									}`}
								>
									<CardBody className="p-4">
										{/* Header */}
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0 flex-1">
												<p className="font-semibold text-foreground truncate">
													{product.name}
												</p>
												<div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-default-400">
													<span className="flex items-center gap-1 font-mono">
														<HashtagIcon className="h-3 w-3" />
														{product.code}
													</span>
													<span>•</span>
													<span>{product.model}</span>
												</div>
											</div>
											{isLowStock && (
												<Chip
													size="sm"
													color="warning"
													variant="flat"
													startContent={
														<ExclamationTriangleIcon className="h-3 w-3" />
													}
												>
													Baixo
												</Chip>
											)}
										</div>

										{/* Info Row */}
										<div className="mt-4 flex items-center justify-between">
											<div className="flex items-center gap-3">
											<Chip
												size="sm"
												variant="flat"
												className="bg-default-100"
											>
												{product.brand}
											</Chip>
											<span
													className={`flex items-center gap-1 text-sm font-bold ${
														isLowStock
															? "text-amber-600 dark:text-amber-400"
															: "text-emerald-600 dark:text-emerald-400"
													}`}
												>
													<ArchiveBoxIcon className="h-4 w-4" />
													{product.stockQuantity} un.
												</span>
											</div>
											<span className="text-lg font-bold text-foreground">
												{new Intl.NumberFormat("pt-BR", {
													style: "currency",
													currency: "BRL",
												}).format(product.price)}
											</span>
										</div>

										{/* Actions */}
										<div className="mt-4 flex justify-end gap-2 border-t border-divider pt-4">
											<Button
												size="sm"
												variant="flat"
												startContent={<PencilIcon className="h-4 w-4" />}
												className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
												onPress={() => setEditingProduct(product)}
											>
												Editar
											</Button>
											<Button
												size="sm"
												variant="flat"
												startContent={<TrashIcon className="h-4 w-4" />}
												className="bg-error-50 text-error-600 dark:bg-error-900/20 dark:text-error-400"
												onPress={() => handleDelete(product.id)}
											>
												Excluir
											</Button>
										</div>
									</CardBody>
								</Card>
							);
						})}
					</div>

					{/* Pagination */}
					{pagination.totalPages > 1 && (
						<div className="flex justify-center mt-6">
							<Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm px-4 py-3">
								<Pagination
									total={pagination.totalPages}
									page={pagination.page}
									onChange={handlePageChange}
									color="secondary"
									showControls
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
		</div>
	);
}
