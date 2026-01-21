"use client";

import {
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
	Button,
	Card,
	CardBody,
	Input,
	Pagination,
	Spinner,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Product = {
  id: string;
  code: string;
  name: string;
  stockQuantity: number;
  minStockThreshold: number;
};

type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function StockManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Track changes: { [productId]: { stockQuantity?: number, minStockThreshold?: number } }
  const [changes, setChanges] = useState<Record<string, Partial<Product>>>({});

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
      if (debouncedSearch) params.append("search", debouncedSearch);

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
        setChanges({}); // Clear changes on refetch/page change to avoid confusion
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStockChange = (id: string, value: string) => {
    const quantity = parseInt(value);
    if (Number.isNaN(quantity) || quantity < 0) return;

    setChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], stockQuantity: quantity },
    }));
  };

  const handleThresholdChange = (id: string, value: string) => {
    const threshold = parseInt(value);
    if (Number.isNaN(threshold)) return;

    setChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], minStockThreshold: threshold },
    }));
  };

  const handleSave = async () => {
    const productIds = Object.keys(changes);
    if (productIds.length === 0) return;

    setSaving(true);

    try {
      const updates = productIds.map((id) => ({
        id,
        ...changes[id],
      }));

      const response = await fetch("/api/admin/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.successCount} produtos atualizados com sucesso`);
        if (data.errorCount > 0) {
          toast.warning(`${data.errorCount} erros ao atualizar produtos`);
        }
        setChanges({});
        fetchProducts();
      } else {
        toast.error(data.error || "Erro ao atualizar produtos");
      }
    } catch (error) {
      console.error("Error saving stock:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

	const hasChanges = Object.keys(changes).length > 0;

	return (
		<div className="space-y-4">
			{/* Header com busca e botão salvar */}
			<Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
				<CardBody className="p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<Input
							className="w-full sm:max-w-xs"
							placeholder="Buscar produto..."
							startContent={
								<MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
							}
							value={searchQuery}
							onValueChange={setSearchQuery}
							isClearable
							onClear={() => setSearchQuery("")}
							classNames={{
								inputWrapper:
									"bg-slate-100 dark:bg-slate-700/50 border-0 shadow-sm",
							}}
						/>
						<Button
							color="primary"
							isLoading={saving}
							isDisabled={!hasChanges}
							onPress={handleSave}
							className="w-full sm:w-auto bg-brand-500 font-semibold shadow-md"
						>
							Salvar Alterações ({Object.keys(changes).length})
						</Button>
					</div>
				</CardBody>
			</Card>

			{/* Contador de resultados */}
			<div className="flex items-center justify-between px-1">
				<p className="text-sm text-slate-500 dark:text-slate-400">
					{pagination.total} produto{pagination.total !== 1 ? "s" : ""}{" "}
					encontrado{pagination.total !== 1 ? "s" : ""}
				</p>
				{hasChanges && (
					<span className="text-xs font-medium text-brand-600 dark:text-brand-400">
						{Object.keys(changes).length} alteração
						{Object.keys(changes).length !== 1 ? "ões" : ""} pendente
						{Object.keys(changes).length !== 1 ? "s" : ""}
					</span>
				)}
			</div>

			{loading ? (
				<div className="flex justify-center py-12">
					<Spinner color="primary" size="lg" />
				</div>
			) : products.length === 0 ? (
				<Card className="border-0 shadow-md">
					<CardBody className="py-12 text-center text-slate-500">
						<p>Nenhum produto encontrado</p>
					</CardBody>
				</Card>
			) : (
				<>
					{/* Lista de produtos em cards */}
					<div className="space-y-3">
						{products.map((product) => {
							const currentStock =
								changes[product.id]?.stockQuantity ?? product.stockQuantity;
							const currentThreshold =
								changes[product.id]?.minStockThreshold ??
								product.minStockThreshold;
							const isLowStock = currentStock <= currentThreshold;
							const isChanged = !!changes[product.id];

							return (
								<Card
									key={product.id}
									className={`border-0 shadow-sm transition-all ${
										isChanged
											? "ring-2 ring-brand-500/50 bg-brand-50/50 dark:bg-brand-900/20"
											: "bg-white dark:bg-slate-800"
									} ${isLowStock ? "border-l-4 border-l-warning-500" : ""}`}
								>
									<CardBody className="p-4">
										{/* Cabeçalho do card: nome + badges */}
										<div className="flex items-start justify-between gap-2 mb-4">
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-slate-900 dark:text-white truncate">
													{product.name}
												</h3>
												<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
													{product.code}
												</p>
											</div>
											<div className="flex flex-wrap gap-1.5 flex-shrink-0">
												{isLowStock && (
													<span className="inline-flex items-center gap-1 text-xs font-medium text-warning-700 bg-warning-100 dark:text-warning-400 dark:bg-warning-900/30 px-2 py-1 rounded-full">
														<ExclamationTriangleIcon className="h-3 w-3" />
														Baixo
													</span>
												)}
												{isChanged && (
													<span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-100 dark:text-brand-400 dark:bg-brand-900/30 px-2 py-1 rounded-full">
														<PencilSquareIcon className="h-3 w-3" />
														Editado
													</span>
												)}
											</div>
										</div>

										{/* Campos de estoque */}
										<div className="grid grid-cols-2 gap-3">
											<div>
												<Input
													id={`stock-${product.id}`}
													type="number"
													size="sm"
													min={0}
													label="Estoque Atual"
													labelPlacement="outside"
													value={currentStock.toString()}
													onValueChange={(v) =>
														handleStockChange(product.id, v)
													}
													classNames={{
														label:
															"text-xs font-medium text-slate-500 dark:text-slate-400",
														inputWrapper:
															"bg-slate-100 dark:bg-slate-700/50 border-0 shadow-sm h-10",
														input: "text-center font-semibold",
													}}
												/>
											</div>
											<div>
												<Input
													id={`threshold-${product.id}`}
													type="number"
													size="sm"
													label="Estoque Mínimo"
													labelPlacement="outside"
													value={currentThreshold.toString()}
													onValueChange={(v) =>
														handleThresholdChange(product.id, v)
													}
													classNames={{
														label:
															"text-xs font-medium text-slate-500 dark:text-slate-400",
														inputWrapper:
															"bg-slate-100 dark:bg-slate-700/50 border-0 shadow-sm h-10",
														input: "text-center font-semibold",
													}}
												/>
											</div>
										</div>
									</CardBody>
								</Card>
							);
						})}
					</div>

					{/* Paginação */}
					{pagination.totalPages > 1 && (
						<div className="flex justify-center pt-4">
							<Pagination
								total={pagination.totalPages}
								page={pagination.page}
								onChange={(page) =>
									setPagination((prev) => ({ ...prev, page }))
								}
								color="primary"
								showControls
								classNames={{
									wrapper: "gap-1",
									item: "bg-slate-100 dark:bg-slate-700/50",
									cursor: "bg-brand-500 shadow-md",
								}}
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
}
