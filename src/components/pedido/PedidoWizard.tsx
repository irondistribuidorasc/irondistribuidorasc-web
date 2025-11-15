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
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const { data: session } = useSession();
  const [profileSyncStatus, setProfileSyncStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const lastSyncedPayloadRef = useRef<string>("");
  const resetStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

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
      const nextValue =
        field === "state" ? value.toUpperCase().slice(0, 2) : value;
      updateCustomer({ [field]: nextValue });
    };

  useEffect(() => {
    if (!session?.user) {
      lastSyncedPayloadRef.current = "";
      return;
    }

    const profilePayload = {
      name: customer.name,
      phone: customer.phone,
      docNumber: customer.docNumber,
      addressLine1: customer.addressLine1,
      addressLine2: customer.addressLine2,
      city: customer.city,
      state: customer.state.toUpperCase(),
      postalCode: customer.postalCode,
    };

    if (!Object.values(profilePayload).some(Boolean)) {
      return;
    }

    const payloadString = JSON.stringify(profilePayload);
    if (payloadString === lastSyncedPayloadRef.current) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const debounceId = setTimeout(async () => {
      setProfileSyncStatus("saving");
      try {
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: payloadString,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to sync profile");
        }

        if (!isMounted) {
          return;
        }

        lastSyncedPayloadRef.current = payloadString;
        setProfileSyncStatus("saved");
        if (resetStatusTimeoutRef.current) {
          clearTimeout(resetStatusTimeoutRef.current);
        }
        resetStatusTimeoutRef.current = setTimeout(() => {
          setProfileSyncStatus("idle");
        }, 2000);
      } catch {
        if (!isMounted || controller.signal.aborted) {
          return;
        }
        setProfileSyncStatus("error");
      }
    }, 800);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(debounceId);
    };
  }, [customer, session?.user]);

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
                    ? "border border-brand-500 bg-brand-50 dark:bg-brand-600/20"
                    : "border border-slate-200 dark:border-slate-800"
                }
              >
                <CardBody className="space-y-2">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {category.label}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
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
              <Card className="border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70">
                <CardBody>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
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
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex items-center justify-between">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Itens adicionados ({totalItems})
                </p>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Seu carrinho está vazio. Volte e adicione produtos antes de
                    finalizar.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {items.map(({ product, quantity }) => (
                      <li
                        key={product.id}
                        className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
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

            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
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
                  autoComplete="name"
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.nativeEvent.stopPropagation();
                    }
                  }}
                />
                <Input
                  label="Telefone para contato"
                  placeholder="(48) 9 9999-9999"
                  value={customer.phone}
                  onValueChange={handleCustomerChange("phone")}
                  autoComplete="tel"
                />
                <Input
                  label="Documento (CPF/CNPJ)"
                  placeholder="000.000.000-00"
                  value={customer.docNumber}
                  onValueChange={handleCustomerChange("docNumber")}
                  autoComplete="off"
                />
                <Input
                  label="Endereço"
                  placeholder="Rua, número"
                  value={customer.addressLine1}
                  onValueChange={handleCustomerChange("addressLine1")}
                  autoComplete="street-address"
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.nativeEvent.stopPropagation();
                    }
                  }}
                />
                <Input
                  label="Complemento"
                  placeholder="Sala, bloco, ponto de referência"
                  value={customer.addressLine2}
                  onValueChange={handleCustomerChange("addressLine2")}
                  autoComplete="address-line2"
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.nativeEvent.stopPropagation();
                    }
                  }}
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
                  autoComplete="address-level2"
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.nativeEvent.stopPropagation();
                    }
                  }}
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
                  autoComplete="address-level1"
                />
                <Input
                  label="CEP"
                  placeholder="88000-000"
                  value={customer.postalCode}
                  onValueChange={handleCustomerChange("postalCode")}
                  autoComplete="postal-code"
                />
                <Textarea
                  label="Observações"
                  placeholder="Ponto de referência, horário para contato..."
                  value={customer.notes}
                  onValueChange={handleCustomerChange("notes")}
                  minRows={3}
                  className="md:col-span-2"
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.nativeEvent.stopPropagation();
                    }
                  }}
                />
                {session?.user && (
                  <p className="md:col-span-2 text-xs text-slate-500">
                    {profileSyncStatus === "saving" &&
                      "Salvando dados na sua conta..."}
                    {profileSyncStatus === "saved" &&
                      "Dados sincronizados para futuros pedidos."}
                    {profileSyncStatus === "error" &&
                      "Não conseguimos salvar automaticamente. Tente novamente em instantes."}
                    {profileSyncStatus === "idle" &&
                      "Campos preenchidos aqui ficam salvos para os próximos pedidos."}
                  </p>
                )}
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

      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
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
    <Card className="border border-slate-200 dark:border-slate-800">
      <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {product.name}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
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
