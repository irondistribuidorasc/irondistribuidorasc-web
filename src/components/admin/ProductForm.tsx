"use client";

import { brandOptions, categoryOptions } from "@/src/data/products";
import { logger } from "@/src/lib/logger";
import { type ProductSchema, productSchema } from "@/src/lib/schemas";
import { Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";
import ImageUpload from "./ImageUpload";

type Product = {
  id?: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  price: number;
  inStock: boolean;
  imageUrl: string;
  description?: string;
  tags?: string[];
  popularity?: number;
  stockQuantity?: number;
  minStockThreshold?: number;
};

interface ProductFormProps {
  initialData?: Product | null;
  onSuccess: () => void;
}

export default function ProductForm({
  initialData,
  onSuccess,
}: ProductFormProps) {
  const defaultValues: ProductSchema = {
    code: initialData?.code || "",
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    category: (initialData?.category || "") as ProductSchema["category"],
    model: initialData?.model || "",
    price: initialData?.price || 0,
    imageUrl: initialData?.imageUrl || "/logo-iron.png",
    description: initialData?.description || "",
    tags: initialData?.tags || [],
    popularity: initialData?.popularity || 0,
    stockQuantity: initialData?.stockQuantity || 0,
    minStockThreshold: initialData?.minStockThreshold || 10,
  };

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductSchema>({
    resolver: zodResolver(
      productSchema as ZodType<ProductSchema, ProductSchema>,
    ),
    defaultValues,
  });

  const watchedValues = useWatch({ control }) as Partial<ProductSchema> | undefined;
  const formData: ProductSchema = {
    ...defaultValues,
    ...watchedValues,
  };

  const onSubmit = async (data: ProductSchema) => {
    try {
      const url = initialData
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(initialData ? "Produto atualizado!" : "Produto criado!");
        onSuccess();
        if (!initialData) {
          reset();
        }
      } else {
        const error = await response.json();
        toast.error(`Erro: ${error.error || "Falha ao salvar produto"}`);
      }
    } catch (error) {
      logger.error("Error saving product", { error });
      toast.error("Erro ao salvar produto");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Código"
          placeholder="Ex: DISP-SAM-A01"
          value={formData.code}
          onValueChange={(v) => setValue("code", v)}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.nativeEvent.stopPropagation();
            }
          }}
          isRequired
          isInvalid={!!errors.code}
          errorMessage={errors.code?.message}
        />
        <Input
          label="Nome"
          placeholder="Ex: Display Samsung A01"
          value={formData.name}
          onValueChange={(v) => setValue("name", v)}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.nativeEvent.stopPropagation();
            }
          }}
          isRequired
          isInvalid={!!errors.name}
          errorMessage={errors.name?.message}
        />
        <Select
          label="Marca"
          placeholder="Selecione a marca"
          selectedKeys={formData.brand ? [formData.brand] : []}
          onChange={(e) => setValue("brand", e.target.value)}
          isRequired
          isInvalid={!!errors.brand}
          errorMessage={errors.brand?.message}
        >
          {brandOptions.map((brand) => (
            <SelectItem key={brand.key} value={brand.key}>
              {brand.label}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="Categoria"
          placeholder="Selecione a categoria"
          selectedKeys={formData.category ? [formData.category] : []}
          onChange={(e) => setValue("category", e.target.value as ProductSchema["category"])}
          isRequired
          isInvalid={!!errors.category}
          errorMessage={errors.category?.message}
        >
          {categoryOptions.map((cat) => (
            <SelectItem key={cat.key} value={cat.key}>
              {cat.label}
            </SelectItem>
          ))}
        </Select>
        <Input
          label="Modelo"
          placeholder="Ex: A01"
          value={formData.model}
          onValueChange={(v) => setValue("model", v)}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.nativeEvent.stopPropagation();
            }
          }}
          isRequired
          isInvalid={!!errors.model}
          errorMessage={errors.model?.message}
        />
        <Input
          label="Preço"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.price.toString()}
          onValueChange={(v) => setValue("price", parseFloat(v) || 0)}
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">R$</span>
            </div>
          }
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.nativeEvent.stopPropagation();
            }
          }}
          isRequired
          isInvalid={!!errors.price}
          errorMessage={errors.price?.message}
        />
        <div className="col-span-1 md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-default-600">
            Imagem do Produto
          </label>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => setValue("imageUrl", url)}
            disabled={isSubmitting}
            altText={formData.name || "Imagem do produto"}
          />
        </div>
        <Input
          label="Popularidade"
          type="number"
          value={formData.popularity?.toString() || "0"}
          onValueChange={(v) => setValue("popularity", parseInt(v) || 0)}
        />
        <Input
          label="Quantidade em Estoque"
          type="number"
          value={formData.stockQuantity?.toString() || "0"}
          onValueChange={(v) => setValue("stockQuantity", parseInt(v) || 0)}
          isRequired
          isInvalid={!!errors.stockQuantity}
          errorMessage={errors.stockQuantity?.message}
        />
        <Input
          label="Alerta de Estoque Mínimo"
          type="number"
          value={formData.minStockThreshold?.toString() || "10"}
          onValueChange={(v) => setValue("minStockThreshold", parseInt(v) || 0)}
          description="Avise-me quando o estoque estiver abaixo deste valor"
          isRequired
        />
      </div>

      <Textarea
        label="Descrição"
        placeholder="Descrição detalhada do produto"
        value={formData.description || ""}
        onValueChange={(v) => setValue("description", v)}
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.nativeEvent.stopPropagation();
          }
        }}
      />

      <div className="flex justify-end gap-2">
        <Button color="primary" type="submit" isLoading={isSubmitting}>
          {initialData ? "Atualizar Produto" : "Criar Produto"}
        </Button>
      </div>
    </form>
  );
}
