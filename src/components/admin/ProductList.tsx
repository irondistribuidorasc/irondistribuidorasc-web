
"use client";

import { useCallback, useEffect, useState } from "react";
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
  Chip,
} from "@heroui/react";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ProductForm from "./ProductForm";
import { toast } from "sonner";

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
          <Button
            variant="light"
            onPress={() => setEditingProduct(null)}
          >
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          className="max-w-xs"
          placeholder="Buscar produto..."
          startContent={<MagnifyingGlassIcon className="h-5 w-5" />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          isClearable
          onClear={() => setSearchQuery("")}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center text-slate-500">
            Nenhum produto encontrado
          </CardBody>
        </Card>
      ) : (
        <>
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
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{product.name}</span>
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
                    <Chip
                      color={product.inStock ? "success" : "danger"}
                      size="sm"
                      variant="flat"
                    >
                      {product.inStock ? "Em Estoque" : "Sem Estoque"}
                    </Chip>
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

          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
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
