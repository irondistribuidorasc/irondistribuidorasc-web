"use client";

import { Stepper } from "@/src/components/ui/Stepper";
import { type CustomerDetails, useCart } from "@/src/contexts/CartContext";
import {
  type Brand,
  brandOptions,
  type Category,
  categoryOptions,
  type Product,
  products,
} from "@/src/data/products";
import { buildOrderWhatsAppMessage, getWhatsAppUrl } from "@/src/lib/whatsapp";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { useMemo, useState } from "react";

const steps = ["Tipo de peça", "Marca", "Produtos", "Resumo"];

type StepKey = 0 | 1 | 2 | 3;

export function PedidoWizard() {
  const [activeStep, setActiveStep] = useState<StepKey>(0);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [showErrors, setShowErrors] = useState(false);

  const {
    items,
    totalItems,
    customer,
    addItem,
    updateQuantity,
    removeItem,
    updateCustomer,
  } = useCart();

  const filteredProducts = useMemo(() => {
    if (!selectedBrand || !selectedCategory) return [];
    return products.filter(
      (product) =>
        product.brand === selectedBrand && product.category === selectedCategory
    );
  }, [selectedBrand, selectedCategory]);

  const handleNext = () =>
    setActiveStep((prev) => Math.min((prev + 1) as StepKey, 3) as StepKey);
  const handlePrev = () =>
    setActiveStep((prev) => Math.max((prev - 1) as StepKey, 0) as StepKey);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setSelectedBrand(undefined);
  };

  const canContinue = useMemo(() => {
    if (activeStep === 0) return Boolean(selectedCategory);
    if (activeStep === 1) return Boolean(selectedBrand);
    if (activeStep === 2) return true;
    return true;
  }, [activeStep, selectedCategory, selectedBrand]);

  const isCustomerInfoValid = Boolean(
    customer.name.trim() && customer.city.trim() && customer.state.trim()
  );
  const canFinalize = items.length > 0 && isCustomerInfoValid;

  const handleCustomerChange =
    (field: keyof CustomerDetails) => (value: string) => {
      updateCustomer({ [field]: value });
    };

  const handleFinalize = () => {
    setShowErrors(true);
    if (!canFinalize) return;

    const message = buildOrderWhatsAppMessage(items, customer);
    const url = getWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {categoryOptions.map((category) => (
              <Card
                key={category.key}
                isPressable
                onPress={() => handleSelectCategory(category.key)}
                className={
                  selectedCategory === category.key
                    ? "border border-brand-500 bg-brand-50"
                    : "border border-slate-200"
                }
              >
                <CardBody className="space-y-2">
                  <p className="text-base font-semibold text-slate-900">
                    {category.label}
                  </p>
                  <p className="text-sm text-slate-500">
                    {category.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        );
      case 1:
        return (
          <Select
            label="Marca"
            placeholder="Selecione a marca"
            selectedKeys={selectedBrand ? [selectedBrand] : []}
            onChange={(event) => setSelectedBrand(event.target.value as Brand)}
          >
            {brandOptions.map((brand) => (
              <SelectItem key={brand.key} value={brand.key}>
                {brand.label}
              </SelectItem>
            ))}
          </Select>
        );
      case 2:
        return (
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <Card className="border border-dashed border-slate-300 bg-slate-50">
                <CardBody>
                  <p className="text-sm text-slate-500">
                    Nenhum produto cadastrado para esta combinação ainda. Entre
                    em contato pelo WhatsApp.
                  </p>
                </CardBody>
              </Card>
            ) : (
              filteredProducts.map((product) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  onAdd={() => addItem(product)}
                />
              ))
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <Card className="border border-slate-200">
              <CardHeader className="flex items-center justify-between">
                <p className="text-base font-semibold text-slate-900">
                  Itens adicionados ({totalItems})
                </p>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Seu carrinho está vazio. Volte e adicione produtos antes de
                    finalizar.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {items.map(({ product, quantity }) => (
                      <li
                        key={product.id}
                        className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.brand} · {product.model.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="light"
                            size="sm"
                            onPress={() =>
                              updateQuantity(
                                product.id,
                                Math.max(0, quantity - 1)
                              )
                            }
                            isDisabled={quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {quantity}
                          </span>
                          <Button
                            variant="light"
                            size="sm"
                            onPress={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                          >
                            +
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            color="danger"
                            onPress={() => removeItem(product.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>

            <Card className="border border-slate-200">
              <CardHeader>
                <p className="text-base font-semibold text-slate-900">
                  Dados do cliente
                </p>
              </CardHeader>
              <Divider />
              <CardBody className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Nome do responsável"
                  placeholder="Digite o nome"
                  value={customer.name}
                  onValueChange={handleCustomerChange("name")}
                  isInvalid={showErrors && !customer.name.trim()}
                  errorMessage={
                    showErrors && !customer.name.trim()
                      ? "Informe o nome do responsável."
                      : undefined
                  }
                />
                <Input
                  label="Cidade"
                  placeholder="Itapema"
                  value={customer.city}
                  onValueChange={handleCustomerChange("city")}
                  isInvalid={showErrors && !customer.city.trim()}
                  errorMessage={
                    showErrors && !customer.city.trim()
                      ? "Informe a cidade."
                      : undefined
                  }
                />
                <Input
                  label="Estado (UF)"
                  placeholder="SC"
                  value={customer.state}
                  onValueChange={handleCustomerChange("state")}
                  isInvalid={showErrors && !customer.state.trim()}
                  errorMessage={
                    showErrors && !customer.state.trim()
                      ? "Informe o estado (UF)."
                      : undefined
                  }
                  maxLength={2}
                />
                <Textarea
                  label="Observações"
                  placeholder="Ponto de referência, horário para contato..."
                  value={customer.notes}
                  onValueChange={handleCustomerChange("notes")}
                  minRows={3}
                  className="md:col-span-2"
                />
              </CardBody>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                color="danger"
                className="bg-brand-600 text-white sm:w-auto"
                onPress={handleFinalize}
                isDisabled={items.length === 0}
              >
                Finalizar pedido no WhatsApp
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <Stepper steps={steps} currentStep={activeStep} />

      <Card className="border border-slate-200">
        <CardHeader>
          <p className="text-base font-semibold text-slate-900">
            {steps[activeStep]}
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-6">{renderStepContent()}</CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="light"
          onPress={handlePrev}
          isDisabled={activeStep === 0}
          className="sm:w-auto"
        >
          Voltar
        </Button>
        <Button
          color="danger"
          className="bg-brand-600 text-white sm:w-auto"
          onPress={handleNext}
          isDisabled={!canContinue || activeStep === 3}
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}

type ProductItemProps = {
  product: Product;
  onAdd: () => void;
};

function ProductItem({ product, onAdd }: ProductItemProps) {
  const isAvailable = product.inStock;
  const restockLabel = product.restockDate
    ? new Date(product.restockDate).toLocaleDateString("pt-BR")
    : undefined;

  return (
    <Card className="border border-slate-200">
      <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">
            {product.name}
          </p>
          <p className="text-sm text-slate-500">
            {product.brand} · {product.model.toUpperCase()}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
          <Chip color={isAvailable ? "success" : "warning"} variant="flat">
            {isAvailable
              ? "Disponível"
              : restockLabel
              ? `Reposição em ${restockLabel}`
              : "Em reposição"}
          </Chip>
          <Button
            color="danger"
            className="bg-brand-600 text-white"
            isDisabled={!isAvailable}
            onPress={onAdd}
          >
            Adicionar ao carrinho
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
