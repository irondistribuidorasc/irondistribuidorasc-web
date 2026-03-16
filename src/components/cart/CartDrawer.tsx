"use client";

import { useCart } from "@/src/contexts/CartContext";
import {
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
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
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type CartDrawerProps = Pick<DrawerProps, "isOpen" | "onClose">;

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const hasItems = items.length > 0;
  const isAuthenticated = !!session?.user;
  const isApproved = session?.user?.approved === true;

  const handleClose = () => {
    onClose?.();
  };

  const handleGoToCheckout = () => {
    if (!hasItems) return;

    // Verificar autenticação
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/carrinho");
      handleClose();
      return;
    }

    // Verificar aprovação da conta
    if (!isApproved) {
      router.push("/conta-pendente");
      handleClose();
      return;
    }

    router.push("/carrinho");
    handleClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} placement="right" size="lg">
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="flex flex-col items-start gap-1">
              <p className="text-lg font-semibold">Carrinho de pedidos</p>
              <p className="text-sm text-default-400">
                Revise os itens antes de finalizar via WhatsApp.
              </p>
            </DrawerHeader>
            <DrawerBody className="space-y-4">
              {!hasItems ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <ShoppingCartIcon className="h-16 w-16 text-default-300" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Seu carrinho está vazio
                    </p>
                    <p className="mt-1 text-xs text-default-400">
                      Adicione produtos para montar seu pedido.
                    </p>
                  </div>
                  <Button
                    variant="flat"
                    color="primary"
                    size="sm"
                    onPress={() => {
                      router.push("/produtos");
                      handleClose();
                    }}
                  >
                    Ver produtos
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map(({ product, quantity }) => (
                    <li
                      key={product.id}
                      className="flex gap-4 rounded-lg border border-divider p-4"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded bg-default-100">
                        <Image
                          src={product.imageUrl || "/logo-iron.png"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-default-400">
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
                  color="primary"
                  className="bg-brand-600 text-white"
                  onPress={handleGoToCheckout}
                  isDisabled={!hasItems}
                >
                  Ir para o carrinho
                </Button>
              </div>
              <Button variant="light" onPress={handleClose} fullWidth>
                Continuar comprando
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
