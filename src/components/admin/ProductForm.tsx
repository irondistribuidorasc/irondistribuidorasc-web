"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Switch,
} from "@heroui/react";
import { brandOptions, categoryOptions } from "@/src/data/products";
import { toast } from "sonner";

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
};

interface ProductFormProps {
  initialData?: Product | null;
  onSuccess: () => void;
}

export default function ProductForm({
  initialData,
  onSuccess,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Product>({
    code: initialData?.code || "",
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    category: initialData?.category || "",
    model: initialData?.model || "",
    price: initialData?.price || 0,
    inStock: initialData?.inStock ?? true,
    imageUrl: initialData?.imageUrl || "/logo-iron.png",
    description: initialData?.description || "",
    tags: initialData?.tags || [],
    popularity: initialData?.popularity || 0,
  });

  const handleChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(initialData ? "Produto atualizado!" : "Produto criado!");
        onSuccess();
        if (!initialData) {
          // Reset form if creating
          setFormData({
            code: "",
            name: "",
            brand: "",
            category: "",
            model: "",
            price: 0,
            inStock: true,
            imageUrl: "/logo-iron.png",
            description: "",
            tags: [],
            popularity: 0,
          });
        }
      } else {
        const error = await response.json();
        toast.error(`Erro: ${error.error || "Falha ao salvar produto"}`);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Código"
          placeholder="Ex: DISP-SAM-A01"
          value={formData.code}
          onValueChange={(v) => handleChange("code", v)}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.nativeEvent.stopPropagation();
            }
          }}
          isRequired
        />
        <Input
          label="Nome"
          placeholder="Ex: Display Samsung A01"
          value={formData.name}
          onValueChange={(v) => handleChange("name", v)}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.nativeEvent.stopPropagation();
            }
          }}
          isRequired
        />
        <Select
          label="Marca"
          placeholder="Selecione a marca"
          selectedKeys={formData.brand ? [formData.brand] : []}
          onChange={(e) => handleChange("brand", e.target.value)}
          isRequired
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
          onChange={(e) => handleChange("category", e.target.value)}
          isRequired
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
          onValueChange={(v) => handleChange("model", v)}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.nativeEvent.stopPropagation();
            }
          }}
          isRequired
        />
        <Input
          label="Preço"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.price.toString()}
          onValueChange={(v) => handleChange("price", parseFloat(v))}
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
        />
        <Input
          label="URL da Imagem"
          placeholder="/logo-iron.png"
          value={formData.imageUrl}
          onValueChange={(v) => handleChange("imageUrl", v)}
        />
        <Input
          label="Popularidade"
          type="number"
          value={formData.popularity?.toString() || "0"}
          onValueChange={(v) => handleChange("popularity", parseInt(v))}
        />
      </div>

      <Textarea
        label="Descrição"
        placeholder="Descrição detalhada do produto"
        value={formData.description || ""}
        onValueChange={(v) => handleChange("description", v)}
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.nativeEvent.stopPropagation();
          }
        }}
      />

      <div className="flex items-center gap-2">
        <Switch
          isSelected={formData.inStock}
          onValueChange={(v) => handleChange("inStock", v)}
          color="danger"
        >
          Em Estoque
        </Switch>
      </div>

      <div className="flex justify-end gap-2">
        <Button color="danger" type="submit" isLoading={loading}>
          {initialData ? "Atualizar Produto" : "Criar Produto"}
        </Button>
      </div>
    </form>
  );
}
