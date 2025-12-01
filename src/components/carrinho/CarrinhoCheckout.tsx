"use client";

import { type CustomerDetails, useCart } from "@/src/contexts/CartContext";
import { logger } from "@/src/lib/logger";
import { maskCEP, maskCPFOrCNPJ, maskPhone } from "@/src/lib/masks";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PROFILE_SYNC_DEBOUNCE_MS = 800;
const STATUS_RESET_DELAY_MS = 2000;

const VALID_STATES = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

export function CarrinhoCheckout() {
  const router = useRouter();
  const {
    items,
    totalItems,
    customer,
    updateQuantity,
    removeItem,
    updateCustomer,
    clearCart,
  } = useCart();
  const { data: session } = useSession();
  const [showErrors, setShowErrors] = useState(false);
  const [profileSyncStatus, setProfileSyncStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [focusedField, setFocusedField] = useState<
    keyof CustomerDetails | null
  >(null);
  const lastSyncedPayloadRef = useRef<string>("");
  const resetStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const editedFieldsRef = useRef<Set<keyof CustomerDetails>>(new Set());
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const isStateValid = VALID_STATES.has(customer.state.toUpperCase());
  const isCustomerInfoValid = Boolean(
    customer.name.trim() &&
      customer.city.trim() &&
      customer.state.trim() &&
      isStateValid
  );
  const canFinalize = items.length > 0 && isCustomerInfoValid;

  // Initialize editing mode based on validity of customer info
  const [isEditingCustomer, setIsEditingCustomer] = useState(
    !isCustomerInfoValid
  );

  // Update editing mode if customer info becomes invalid externally (though less likely here)
  // or just on mount if we want to force it.
  // Actually, let's keep it simple: if it starts valid, show summary. If not, show form.
  // We don't need a useEffect for this unless we want to auto-switch, which might be annoying.

  const handleCustomerChange =
    (field: keyof CustomerDetails) => (value: string) => {
      // Marcar campo como editado pelo usuário
      editedFieldsRef.current.add(field);

      let nextValue = value;

      // Aplicar máscaras específicas por campo apenas quando o valor aumenta
      const currentValue = customer[field];
      const isDeleting = value.length < currentValue.length;

      if (field === "state") {
        nextValue = value.toUpperCase().slice(0, 2);
      } else if (!isDeleting) {
        // Aplicar máscaras apenas quando não está deletando
        if (field === "phone") {
          nextValue = maskPhone(value);
        } else if (field === "docNumber") {
          nextValue = maskCPFOrCNPJ(value);
        } else if (field === "postalCode") {
          nextValue = maskCEP(value);
        }
      }

      updateCustomer({ [field]: nextValue });
    };

  const handleFieldFocus = (field: keyof CustomerDetails) => {
    setFocusedField(field);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };

  const getAutoCompleteValue = (
    field: keyof CustomerDetails,
    defaultValue: string
  ) => {
    // Desabilitar autocomplete se campo foi editado ou está em foco
    if (editedFieldsRef.current.has(field) || focusedField === field) {
      return "off";
    }
    return defaultValue;
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
        }, STATUS_RESET_DELAY_MS);
      } catch (error) {
        if (!isMounted || controller.signal.aborted) {
          return;
        }
        logger.error("Profile sync failed", {
          error,
          userId: session?.user?.email,
          hasPayload: Boolean(payloadString),
        });
        setProfileSyncStatus("error");
      }
    }, PROFILE_SYNC_DEBOUNCE_MS);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(debounceId);
    };
  }, [customer, session?.user]);

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const isApproved = session?.user?.approved === true;

  const handleFinalize = async () => {
    try {
      setIsCreatingOrder(true);

      // Criar pedido no banco de dados
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.product.id,
          productCode: item.product.code,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        customer: {
          name: customer.name,
          email: session?.user?.email || "",
          phone: customer.phone,
          docNumber: customer.docNumber,
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2,
          city: customer.city,
          state: customer.state.toUpperCase(),
          postalCode: customer.postalCode,
        },
        notes: customer.notes,
      };

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao criar pedido");
      }

      const order = await response.json();

      // Limpar carrinho após sucesso
      clearCart();

      logger.info("Order created successfully", { orderId: order.id });
      router.push(`/pedido-confirmado/${order.id}`);
    } catch (error) {
      logger.error("Failed to create order", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // Aqui poderíamos mostrar um toast de erro
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePreFinalize = () => {
    setShowErrors(true);

    if (!isApproved) {
      router.push("/conta-pendente");
      return;
    }

    if (!canFinalize) return;

    onOpen();
  };

  const getStateErrorMessage = () => {
    if (!showErrors) return undefined;
    if (!customer.state.trim()) return "Informe o estado (UF).";
    if (!VALID_STATES.has(customer.state.toUpperCase())) return "UF inválida.";
    return undefined;
  };

  const handleSaveCustomer = () => {
    setShowErrors(true);
    if (isCustomerInfoValid) {
      setIsEditingCustomer(false);
      setShowErrors(false); // Reset errors when successfully saved
    }
  };

  return (
    <div className="space-y-6">
      {/* Dados do cliente - Agora no topo */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader className="flex items-center justify-between">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Dados do cliente
          </p>
          {!isEditingCustomer && (
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onPress={() => setIsEditingCustomer(true)}
            >
              Trocar
            </Button>
          )}
        </CardHeader>
        <Divider />
        <CardBody>
          {!isEditingCustomer ? (
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {customer.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {customer.phone} • {customer.docNumber}
                </p>
              </div>
              <div className="space-y-1 md:text-right">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {customer.addressLine1}
                  {customer.addressLine2 ? `, ${customer.addressLine2}` : ""}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {customer.city} - {customer.state}, {customer.postalCode}
                </p>
              </div>
              {customer.notes && (
                <div className="mt-2 w-full rounded-md bg-slate-50 p-3 dark:bg-slate-800/50 md:mt-0 md:w-auto md:max-w-xs">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Observações:
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {customer.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nome do responsável"
                placeholder="Digite o nome"
                value={customer.name}
                onValueChange={handleCustomerChange("name")}
                onFocus={() => handleFieldFocus("name")}
                onBlur={handleFieldBlur}
                isInvalid={showErrors && !customer.name.trim()}
                errorMessage={
                  showErrors && !customer.name.trim()
                    ? "Informe o nome do responsável."
                    : undefined
                }
                autoComplete={getAutoCompleteValue("name", "name")}
                isRequired
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.nativeEvent.stopPropagation();
                  }
                }}
              />
              <Input
                label="Telefone para contato"
                placeholder="(00) 0 0000-0000"
                value={customer.phone}
                onValueChange={handleCustomerChange("phone")}
                onFocus={() => handleFieldFocus("phone")}
                onBlur={handleFieldBlur}
                autoComplete={getAutoCompleteValue("phone", "tel")}
                maxLength={16}
              />
              <Input
                label="Documento (CPF/CNPJ)"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={customer.docNumber}
                onValueChange={handleCustomerChange("docNumber")}
                onFocus={() => handleFieldFocus("docNumber")}
                onBlur={handleFieldBlur}
                autoComplete={getAutoCompleteValue("docNumber", "off")}
                maxLength={18}
              />
              <Input
                label="Endereço"
                placeholder="Rua, número"
                value={customer.addressLine1}
                onValueChange={handleCustomerChange("addressLine1")}
                onFocus={() => handleFieldFocus("addressLine1")}
                onBlur={handleFieldBlur}
                autoComplete={getAutoCompleteValue(
                  "addressLine1",
                  "street-address"
                )}
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
                onFocus={() => handleFieldFocus("addressLine2")}
                onBlur={handleFieldBlur}
                autoComplete={getAutoCompleteValue(
                  "addressLine2",
                  "address-line2"
                )}
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
                onFocus={() => handleFieldFocus("city")}
                onBlur={handleFieldBlur}
                isInvalid={showErrors && !customer.city.trim()}
                errorMessage={
                  showErrors && !customer.city.trim()
                    ? "Informe a cidade."
                    : undefined
                }
                autoComplete={getAutoCompleteValue("city", "address-level2")}
                isRequired
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
                onFocus={() => handleFieldFocus("state")}
                onBlur={handleFieldBlur}
                isInvalid={
                  showErrors &&
                  (!customer.state.trim() ||
                    !VALID_STATES.has(customer.state.toUpperCase()))
                }
                errorMessage={getStateErrorMessage()}
                maxLength={2}
                autoComplete={getAutoCompleteValue("state", "address-level1")}
                isRequired
              />
              <Input
                label="CEP"
                placeholder="00000-000"
                value={customer.postalCode}
                onValueChange={handleCustomerChange("postalCode")}
                onFocus={() => handleFieldFocus("postalCode")}
                onBlur={handleFieldBlur}
                autoComplete={getAutoCompleteValue("postalCode", "postal-code")}
                maxLength={9}
              />
              <Textarea
                label="Observações"
                placeholder="Ponto de referência, horário para contato..."
                value={customer.notes}
                onValueChange={handleCustomerChange("notes")}
                onFocus={() => handleFieldFocus("notes")}
                onBlur={handleFieldBlur}
                minRows={3}
                className="md:col-span-2"
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.nativeEvent.stopPropagation();
                  }
                }}
              />
              <div className="flex flex-col justify-between gap-4 md:col-span-2 md:flex-row md:items-center">
                {session?.user && (
                  <p className="text-xs text-slate-500">
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
                <Button
                  color="primary"
                  onPress={handleSaveCustomer}
                  className="w-full md:w-auto"
                >
                  Salvar dados
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Itens do carrinho */}
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader className="flex items-center justify-between">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Itens do carrinho ({totalItems})
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Seu carrinho está vazio. Adicione produtos da{" "}
                <Link
                  href="/produtos"
                  className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  página de produtos
                </Link>{" "}
                antes de finalizar.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={product.imageUrl || "/logo-iron.png"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {product.brand} · {product.model.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() =>
                            updateQuantity(
                              product.id,
                              Math.max(0, quantity - 1)
                            )
                          }
                          isDisabled={quantity <= 1}
                          aria-label="Diminuir quantidade"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {quantity}
                        </span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          aria-label="Aumentar quantidade"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => removeItem(product.id)}
                        aria-label="Remover item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Botão finalizar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          color="danger"
          size="lg"
          className="bg-brand-600 text-white sm:w-auto"
          onPress={handlePreFinalize}
          isDisabled={!canFinalize && isApproved}
        >
          {isApproved ? "Fechar pedido" : "Aguardando aprovação"}
        </Button>
      </div>
      {showErrors && !isCustomerInfoValid && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {!isStateValid && customer.state.trim()
            ? "UF inválida. Informe uma sigla de estado válida (ex: SC, SP, RJ)."
            : "Preencha os campos obrigatórios (nome, cidade e estado válido) para finalizar."}
        </p>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirmar Pedido
              </ModalHeader>
              <ModalBody>
                <p>
                  Você está prestes a finalizar um pedido com{" "}
                  <strong>{totalItems} itens</strong>.
                </p>
                <p>
                  Os dados do cliente são:
                  <br />
                  <strong>Nome:</strong> {customer.name}
                  <br />
                  <strong>Cidade/UF:</strong> {customer.city}/{customer.state}
                </p>
                <p>Deseja confirmar e enviar o pedido?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleFinalize();
                    // Não fechamos o modal aqui pois vamos redirecionar
                    // ou podemos fechar se quisermos, mas o loading state está no botão "Fechar pedido" original
                    // Vamos mover o loading state para este botão do modal?
                    // O handleFinalize usa setIsCreatingOrder, mas esse state é usado no botão principal.
                    // Idealmente o loading deveria estar no botão de confirmar do modal.
                  }}
                  isLoading={isCreatingOrder}
                >
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
