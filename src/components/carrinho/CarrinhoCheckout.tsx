"use client";

import { type CustomerDetails, useCart } from "@/src/contexts/CartContext";
import { logger } from "@/src/lib/logger";
import { maskCEP, maskCPFOrCNPJ, maskPhone } from "@/src/lib/masks";
import { buildOrderWhatsAppMessage, getWhatsAppUrl } from "@/src/lib/whatsapp";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Textarea,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
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
  const {
    items,
    totalItems,
    customer,
    updateQuantity,
    removeItem,
    updateCustomer,
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

  const isStateValid = VALID_STATES.has(customer.state.toUpperCase());
  const isCustomerInfoValid = Boolean(
    customer.name.trim() &&
      customer.city.trim() &&
      customer.state.trim() &&
      isStateValid
  );
  const canFinalize = items.length > 0 && isCustomerInfoValid;

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

  const handleFinalize = () => {
    setShowErrors(true);
    if (!canFinalize) return;

    const message = buildOrderWhatsAppMessage(items, customer);
    const url = getWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getStateErrorMessage = () => {
    if (!showErrors) return undefined;
    if (!customer.state.trim()) return "Informe o estado (UF).";
    if (!VALID_STATES.has(customer.state.toUpperCase())) return "UF inválida.";
    return undefined;
  };

  return (
    <div className="space-y-6">
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

      {/* Dados do cliente */}
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
            autoComplete={getAutoCompleteValue("addressLine2", "address-line2")}
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
          {session?.user && (
            <p className="text-xs text-slate-500 md:col-span-2">
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

      {/* Botão finalizar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          color="danger"
          size="lg"
          className="bg-brand-600 text-white sm:w-auto"
          onPress={handleFinalize}
          isDisabled={!canFinalize}
        >
          Finalizar pedido no WhatsApp
        </Button>
      </div>
      {showErrors && !isCustomerInfoValid && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {!isStateValid && customer.state.trim()
            ? "UF inválida. Informe uma sigla de estado válida (ex: SC, SP, RJ)."
            : "Preencha os campos obrigatórios (nome, cidade e estado válido) para finalizar."}
        </p>
      )}
    </div>
  );
}
