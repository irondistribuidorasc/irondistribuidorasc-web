"use client";

import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
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
  Tooltip,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch]);

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
      console.error("Failed to delete product:", error);
      toast.error("Erro ao excluir produto");
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  if (editingProduct) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Editar Produto</h2>
          <Button variant="light" onPress={() => setEditingProduct(null)}>
            Cancelar
          </Button>
        </div>
        <ProductForm
          initialData={editingProduct}
          onSuccess={() => {
            setEditingProduct(null);
            fetchProducts();
          }}
        />
      </div>
    );
  }

  const filteredProducts = products.filter((product) => {
    if (showLowStock) {
      return product.stockQuantity <= product.minStockThreshold;
    }
    return true;
  });

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
          color={showLowStock ? "warning" : "default"}
          variant={showLowStock ? "solid" : "flat"}
          onPress={() => setShowLowStock(!showLowStock)}
        >
          {showLowStock ? "Mostrando Estoque Baixo" : "Filtrar Estoque Baixo"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner color="danger" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center text-slate-500">
            Nenhum produto encontrado
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table aria-label="Lista de produtos">
              <TableHeader>
                <TableColumn>CÓDIGO</TableColumn>
                <TableColumn>NOME</TableColumn>
                <TableColumn>MARCA</TableColumn>
                <TableColumn>PREÇO</TableColumn>
                <TableColumn>ESTOQUE</TableColumn>
                <TableColumn>AÇÕES</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.code}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">
                          {product.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {product.model}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(product.price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            product.stockQuantity <= product.minStockThreshold
                              ? "text-warning-600"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                        {product.stockQuantity <= product.minStockThreshold && (
                          <Tooltip content="Estoque Baixo">
                            <span className="flex h-2 w-2 rounded-full bg-warning ring-2 ring-warning-200" />
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip content="Editar">
                          <span
                            className="cursor-pointer text-lg text-default-400 active:opacity-50"
                            onClick={() => setEditingProduct(product)}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Excluir">
                          <span
                            className="cursor-pointer text-lg text-danger active:opacity-50"
                            onClick={() => handleDelete(product.id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </span>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="flex flex-col gap-4 md:hidden">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`border ${
                  product.stockQuantity <= product.minStockThreshold
                    ? "border-warning-200 bg-warning-50 dark:bg-warning-900/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <CardBody className="gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.code} - {product.model}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold">
                        Estoque: {product.stockQuantity}
                      </span>
                      {product.stockQuantity <= product.minStockThreshold && (
                        <span className="text-xs text-warning-600 font-medium">
                          Estoque Baixo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {product.brand}
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(product.price)}
                    </p>
                  </div>

                  <div className="flex justify-end gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<PencilIcon className="h-4 w-4" />}
                      onPress={() => setEditingProduct(product)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      startContent={<TrashIcon className="h-4 w-4" />}
                      onPress={() => handleDelete(product.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                total={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="danger"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
