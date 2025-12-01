"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  Input,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
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
    if (Number.isNaN(quantity)) return;

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          className="max-w-xs"
          placeholder="Buscar produto..."
          startContent={<MagnifyingGlassIcon className="h-5 w-5" />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          isClearable
          onClear={() => setSearchQuery("")}
        />
        <Button
          color="primary"
          isLoading={saving}
          isDisabled={!hasChanges}
          onPress={handleSave}
        >
          Salvar Alterações ({Object.keys(changes).length})
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner color="primary" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center text-slate-500">
            Nenhum produto encontrado
          </CardBody>
        </Card>
      ) : (
        <>
          <Table aria-label="Gerenciador de Estoque">
            <TableHeader>
              <TableColumn>PRODUTO</TableColumn>
              <TableColumn>ESTOQUE ATUAL</TableColumn>
              <TableColumn>ESTOQUE MÍNIMO</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const currentStock =
                  changes[product.id]?.stockQuantity ?? product.stockQuantity;
                const currentThreshold =
                  changes[product.id]?.minStockThreshold ??
                  product.minStockThreshold;
                const isLowStock = currentStock <= currentThreshold;
                const isChanged = !!changes[product.id];

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold">{product.name}</span>
                        <span className="text-xs text-slate-500">
                          {product.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        size="sm"
                        className="w-32"
                        value={currentStock.toString()}
                        onValueChange={(v) => handleStockChange(product.id, v)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        size="sm"
                        className="w-32"
                        value={currentThreshold.toString()}
                        onValueChange={(v) =>
                          handleThresholdChange(product.id, v)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isLowStock && (
                          <span className="text-xs font-medium text-warning-600 bg-warning-50 px-2 py-1 rounded-full border border-warning-200">
                            Estoque Baixo
                          </span>
                        )}
                        {isChanged && (
                          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full border border-primary-200">
                            Modificado
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                total={pagination.totalPages}
                page={pagination.page}
                onChange={(page) =>
                  setPagination((prev) => ({ ...prev, page }))
                }
                color="primary"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
