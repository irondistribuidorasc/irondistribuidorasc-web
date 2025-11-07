"use client";

import { useCart } from "@/src/contexts/CartContext";
import { buildOrderWhatsAppMessage, getWhatsAppUrl } from "@/src/lib/whatsapp";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerProps,
} from "@heroui/react";
import Image from "next/image";
import { useState } from "react";

type CartDrawerProps = Pick<DrawerProps, "isOpen" | "onClose">;

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, customer, removeItem, updateQuantity, clearCart } = useCart();
  const [showHelper, setShowHelper] = useState(false);

  const hasItems = items.length > 0;
  const isCustomerInfoValid = Boolean(
    customer.name.trim() && customer.city.trim() && customer.state.trim()
  );

  const handleClose = () => {
    setShowHelper(false);
    onClose?.();
  };

  const handleFinalize = () => {
    if (!hasItems) return;
    if (!isCustomerInfoValid) {
      setShowHelper(true);
      return;
    }

    const message = buildOrderWhatsAppMessage(items, customer);
    const url = getWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} placement="right" size="lg">
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="flex flex-col items-start gap-1">
              <p className="text-lg font-semibold">Carrinho de pedidos</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Revise os itens antes de finalizar via WhatsApp.
              </p>
            </DrawerHeader>
            <DrawerBody className="space-y-4">
              {!hasItems ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Seu carrinho está vazio. Adicione produtos para criar o
                  pedido.
                </p>
              ) : (
                <ul className="space-y-4">
                  {items.map(({ product, quantity }) => (
                    <li
                      key={product.id}
                      className="flex gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                        <Image
                          src={product.imageUrl || "/logo-iron.png"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
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
            </DrawerBody>
            <Divider />
            <DrawerFooter className="flex-col gap-3">
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button
                  fullWidth
                  variant="flat"
                  color="danger"
                  onPress={clearCart}
                  isDisabled={!hasItems}
                >
                  Limpar carrinho
                </Button>
                <Button
                  fullWidth
                  color="danger"
                  className="bg-brand-600 text-white"
                  onPress={handleFinalize}
                  isDisabled={!hasItems}
                >
                  Finalizar pedido no WhatsApp
                </Button>
              </div>
              {showHelper && !isCustomerInfoValid && (
                <p className="w-full text-center text-xs text-slate-500">
                  Complete os dados do cliente na etapa &quot;Resumo&quot; do
                  pedido para liberar o envio.
                </p>
              )}
              <Button variant="light" onPress={handleClose} fullWidth>
                Fechar
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
