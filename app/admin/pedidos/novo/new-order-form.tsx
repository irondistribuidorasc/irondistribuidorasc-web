"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User as UserAvatar,
} from "@heroui/react";
import { toast } from "sonner";
import { searchUsers, searchProducts, createAdminOrder } from "@/app/actions/admin-order-creation";
import { formatCurrency } from "@/src/lib/utils";
import { TrashIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

type User = {
  id: string;
  name: string;
  email: string;
  storeName: string | null;
};

type Product = {
  id: string;
  name: string;
  code: string;
  price: number;
  imageUrl: string;
  brand: string;
};

type CartItem = Product & {
  quantity: number;
};

export function NewOrderForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // User Search State
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Product Search State
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  
  // Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [status, setStatus] = useState("CONFIRMED");
  const [notes, setNotes] = useState("");
  const [createdAt, setCreatedAt] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });

  // Debounced User Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (userSearch.length >= 2) {
        const results = await searchUsers(userSearch);
        setUsers(results);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Debounced Product Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (productSearch.length >= 2) {
        const results = await searchProducts(productSearch);
        setProducts(results);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Clear search to allow adding more
    setProductSearch("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeProduct = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast.error("Selecione um cliente");
      return;
    }
    if (cart.length === 0) {
      toast.error("Adicione produtos ao pedido");
      return;
    }

    setLoading(true);
    try {
      const result = await createAdminOrder({
        userId: selectedUser.id,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
        paymentMethod: paymentMethod as "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "OTHER",
        notes,
        createdAt: new Date(createdAt),
      });

      if (result.success) {
        toast.success("Pedido criado com sucesso!");
        router.push("/admin/pedidos");
      } else {
        toast.error(result.error || "Erro ao criar pedido");
      }
    } catch {
      toast.error("Erro inesperado ao criar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Column: Customer & Products */}
      <div className="lg:col-span-2 space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h2 className="text-lg font-semibold">1. Selecionar Cliente</h2>
          </CardHeader>
          <CardBody className="p-6">
            <Autocomplete
              label="Buscar Cliente"
              placeholder="Digite nome, email ou loja..."
              inputValue={userSearch}
              onInputChange={setUserSearch}
              onSelectionChange={(key) => {
                const user = users.find((u) => u.id === key);
                setSelectedUser(user || null);
              }}
              items={users}
            >
              {(user) => (
                <AutocompleteItem key={user.id} textValue={user.name}>
                  <div className="flex flex-col">
                    <span className="text-small">{user.name}</span>
                    <span className="text-tiny text-default-400">{user.email}</span>
                    {user.storeName && (
                      <span className="text-tiny text-default-400">Loja: {user.storeName}</span>
                    )}
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            {selectedUser && (
              <div className="mt-4 p-4 bg-default-50 rounded-lg border border-default-200">
                <UserAvatar
                  name={selectedUser.name}
                  description={selectedUser.email}
                  avatarProps={{
                    src: undefined, // Add avatar if available
                  }}
                />
                {selectedUser.storeName && (
                  <p className="mt-2 text-sm text-default-500">
                    <strong>Loja:</strong> {selectedUser.storeName}
                  </p>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Product Selection */}
        <Card isDisabled={!selectedUser}>
          <CardHeader className="px-6 py-4 border-b border-divider">
            <h2 className="text-lg font-semibold">2. Adicionar Produtos</h2>
          </CardHeader>
          <CardBody className="p-6">
            <Autocomplete
              label="Buscar Produto"
              placeholder="Digite nome ou código..."
              inputValue={productSearch}
              onInputChange={setProductSearch}
              onSelectionChange={(key) => handleAddProduct(key as string)}
              items={products}
            >
              {(product) => (
                <AutocompleteItem key={product.id} textValue={product.name}>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-small">{product.name}</span>
                      <span className="text-tiny text-default-400">Cód: {product.code}</span>
                    </div>
                    <span className="text-small font-semibold text-success">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            {/* Cart Table */}
            {cart.length > 0 && (
              <div className="mt-6">
                <Table aria-label="Itens do pedido">
                  <TableHeader>
                    <TableColumn>PRODUTO</TableColumn>
                    <TableColumn>PREÇO</TableColumn>
                    <TableColumn>QTD</TableColumn>
                    <TableColumn>TOTAL</TableColumn>
                    <TableColumn>AÇÕES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-small font-medium">{item.name}</span>
                            <span className="text-tiny text-default-400">{item.code}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => updateQuantity(item.id, -1)}
                            >
                              <MinusIcon className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => updateQuantity(item.id, 1)}
                            >
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                        <TableCell>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() => removeProduct(item.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Right Column: Order Summary */}
      <div className="space-y-6">
        <Card className="sticky top-6">
          <CardHeader className="px-6 py-4 border-b border-divider bg-default-50">
            <h2 className="text-lg font-semibold">Resumo do Pedido</h2>
          </CardHeader>
          <CardBody className="p-6 space-y-6">
            <div className="space-y-4">
              <Input
                type="date"
                label="Data do Pedido"
                value={createdAt}
                onValueChange={setCreatedAt}
              />

              <Select
                label="Status do Pedido"
                selectedKeys={[status]}
                onChange={(e) => setStatus(e.target.value)}
              >
                <SelectItem key="PENDING" value="PENDING">Pendente</SelectItem>
                <SelectItem key="CONFIRMED" value="CONFIRMED">Confirmado</SelectItem>
                <SelectItem key="PROCESSING" value="PROCESSING">Processando</SelectItem>
                <SelectItem key="SHIPPED" value="SHIPPED">Enviado</SelectItem>
                <SelectItem key="DELIVERED" value="DELIVERED">Entregue</SelectItem>
              </Select>

              <Select
                label="Método de Pagamento"
                selectedKeys={[paymentMethod]}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <SelectItem key="PIX" value="PIX">PIX</SelectItem>
                <SelectItem key="CREDIT_CARD" value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem key="DEBIT_CARD" value="DEBIT_CARD">Cartão de Débito</SelectItem>
                <SelectItem key="CASH" value="CASH">Dinheiro</SelectItem>
                <SelectItem key="OTHER" value="OTHER">Outro</SelectItem>
              </Select>

              <Input
                label="Observações"
                placeholder="Ex: Pedido via WhatsApp"
                value={notes}
                onValueChange={setNotes}
                onKeyDown={(e) => {
									if (e.key === " ") {
										e.nativeEvent.stopPropagation();
									}
								}}
              />
            </div>

            <Divider />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>

            <Button
              color="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={loading}
              onPress={handleSubmit}
              isDisabled={!selectedUser || cart.length === 0}
            >
              Criar Pedido
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
