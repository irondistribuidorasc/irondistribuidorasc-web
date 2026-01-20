"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Kbd,
  Tooltip,
} from "@heroui/react";
import { toast } from "sonner";
import { searchUsers, searchProducts, createAdminOrder, createQuickUser } from "@/app/actions/admin-order-creation";
import { formatCurrency } from "@/src/lib/utils";
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon, 
  UserPlusIcon, 
  BoltIcon,
  UserCircleIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

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
  
  // Detecta se é Mac para mostrar atalho correto
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);
  
  // User Search State
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Product Search State
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  
  // Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [status, setStatus] = useState("CONFIRMED");
  const [notes, setNotes] = useState("");
  const [createdAt, setCreatedAt] = useState(() => {
    // Usa data local ao invés de UTC para evitar problemas de timezone
    // toISOString() converte para UTC, causando data errada à noite no Brasil (UTC-3)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  // Função de submit memoizada para usar no atalho
  const canSubmit = selectedUser && cart.length > 0 && !loading;

  // Debounced User Search (300ms para resposta mais rápida)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (userSearch.length >= 2) {
        const results = await searchUsers(userSearch);
        setUsers(results);
        setHasSearched(true);
      } else {
        setUsers([]);
        setHasSearched(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Handler para criar cliente avulso
  const handleCreateQuickUser = async () => {
    if (userSearch.length < 2) {
      toast.error("Digite pelo menos 2 caracteres para o nome");
      return;
    }

    setCreatingUser(true);
    try {
      const result = await createQuickUser(userSearch);
      if (result.success && result.user) {
        setSelectedUser(result.user);
        setUserSearch("");
        setUsers([]);
        setHasSearched(false);
        toast.success(`Cliente "${result.user.name}" cadastrado com sucesso!`);
      } else {
        toast.error(result.error || "Erro ao criar cliente");
      }
    } catch {
      toast.error("Erro inesperado ao criar cliente");
    } finally {
      setCreatingUser(false);
    }
  };

  // Debounced Product Search (300ms para resposta mais rápida)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (productSearch.length >= 2) {
        const results = await searchProducts(productSearch);
        setProducts(results);
      } else {
        setProducts([]);
      }
    }, 300);
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

  const setQuantity = (productId: string, quantity: number) => {
    const newQty = Math.max(1, quantity);
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeProduct = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleSubmit = useCallback(async () => {
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
        // Adiciona horário atual para evitar problema de timezone
        // new Date("YYYY-MM-DD") interpreta como meia-noite UTC, causando dia errado no Brasil
        createdAt: new Date(`${createdAt}T12:00:00`),
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
  }, [selectedUser, cart, status, paymentMethod, notes, createdAt, router]);

  // Atalho de teclado: Ctrl+Enter para criar pedido
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canSubmit) {
        e.preventDefault();
        handleSubmit();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canSubmit, handleSubmit]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Column: Customer & Products */}
      <div className="lg:col-span-2 space-y-6">
        {/* Customer Selection */}
        <Card className="border-none bg-gradient-to-br from-slate-50 to-slate-100/50 shadow-lg dark:from-slate-800/80 dark:to-slate-900/80">
          <CardHeader className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
                <UserCircleIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Selecionar Cliente</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Busque ou crie um novo cliente</p>
              </div>
              {selectedUser && (
                <Chip
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<CheckCircleIcon className="h-3.5 w-3.5" />}
                  className="ml-auto"
                >
                  Selecionado
                </Chip>
              )}
            </div>
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
              classNames={{
                listboxWrapper: "max-h-[300px]",
              }}
              listboxProps={{
                emptyContent: hasSearched && userSearch.length >= 2 ? (
                  <div className="p-3 text-center">
                    <div className="mb-3 flex justify-center">
                      <div className="rounded-full bg-warning-100 p-3 dark:bg-warning-900/30">
                        <UserCircleIcon className="h-6 w-6 text-warning-600" />
                      </div>
                    </div>
                    <p className="text-sm text-default-600 mb-3">
                      Cliente não encontrado
                    </p>
                    <Button
                      color="success"
                      variant="flat"
                      size="sm"
                      className="w-full font-medium"
                      startContent={<UserPlusIcon className="w-4 h-4" />}
                      onPress={handleCreateQuickUser}
                      isLoading={creatingUser}
                    >
                      Criar &quot;{userSearch}&quot;
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 text-center text-default-400">
                    <p className="text-sm">Digite para buscar...</p>
                  </div>
                )
              }}
            >
              {(user) => (
                <AutocompleteItem key={user.id} textValue={user.name}>
                  <div className="flex items-center gap-3 py-1">
                    <Avatar
                      name={user.name.charAt(0)}
                      size="sm"
                      className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-default-400">{user.email}</span>
                      {user.storeName && (
                        <span className="text-xs text-default-400">🏪 {user.storeName}</span>
                      )}
                    </div>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            {/* Botão de criar cliente rápido sempre visível */}
            {!selectedUser && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 dark:border-slate-600 dark:bg-slate-800/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <UserPlusIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Criar cliente rápido</p>
                  <p className="text-xs text-slate-500">{userSearch.length < 2 ? "Digite o nome acima" : `Criar "${userSearch}"`}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 font-medium text-white shadow-md shadow-emerald-500/20"
                  onPress={handleCreateQuickUser}
                  isLoading={creatingUser}
                  isDisabled={userSearch.length < 2}
                >
                  Criar
                </Button>
              </div>
            )}

            {selectedUser && (
              <div className="mt-4 overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-800/50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <div className="flex items-center gap-4 p-4">
                  <Avatar
                    name={selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    size="lg"
                    className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg font-semibold"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{selectedUser.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{selectedUser.email}</p>
                    {selectedUser.storeName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="inline-flex items-center gap-1">
                          🏪 {selectedUser.storeName}
                        </span>
                      </p>
                    )}
                  </div>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => setSelectedUser(null)}
                    className="text-slate-400 hover:text-brand-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Product Selection */}
        <Card className={`border-none shadow-lg transition-all duration-300 ${!selectedUser ? 'opacity-50 pointer-events-none' : ''} bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-900/80`}>
          <CardHeader className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25">
                <ShoppingCartIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Adicionar Produtos</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Busque e adicione itens ao pedido</p>
              </div>
              {cart.length > 0 && (
                <Chip
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="ml-auto"
                >
                  {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                </Chip>
              )}
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <Autocomplete
              label="Buscar Produto"
              placeholder="Digite nome ou código..."
              inputValue={productSearch}
              onInputChange={setProductSearch}
              onSelectionChange={(key) => handleAddProduct(key as string)}
              items={products}
              classNames={{
                listboxWrapper: "max-h-[300px]",
              }}
            >
              {(product) => (
                <AutocompleteItem key={product.id} textValue={product.name}>
                  <div className="flex justify-between items-center py-1">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{product.name}</span>
                      <span className="text-xs text-default-400">Cód: {product.code}</span>
                    </div>
                    <Chip color="success" variant="flat" size="sm" className="font-semibold">
                      {formatCurrency(product.price)}
                    </Chip>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            {/* Cart Table */}
            {cart.length > 0 && (
              <div className="mt-6 space-y-3">
                {cart.map((item, index) => (
                  <div 
                    key={item.id}
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 dark:text-slate-100 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.code}</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-700/50">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => updateQuantity(item.id, -1)}
                        className="h-8 w-8 min-w-8"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity.toString()}
                        onValueChange={(val) => setQuantity(item.id, parseInt(val) || 1)}
                        classNames={{
                          base: "w-12",
                          input: "text-center font-semibold",
                          inputWrapper: "h-8 min-h-8 bg-white dark:bg-slate-800 shadow-sm",
                        }}
                        size="sm"
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => updateQuantity(item.id, 1)}
                        className="h-8 w-8 min-w-8"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Total */}
                    <div className="text-right min-w-[100px]">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Tooltip content="Remover item" placement="top">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => removeProduct(item.id)}
                        className="text-slate-400 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </Button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {cart.length === 0 && selectedUser && (
              <div className="mt-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/30">
                <ShoppingCartIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhum produto adicionado</p>
                <p className="text-xs text-slate-400">Busque produtos acima para adicionar ao pedido</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Right Column: Order Summary */}
      <div className="space-y-6">
        <Card className="sticky top-6 border-none bg-gradient-to-br from-slate-50 to-slate-100/50 shadow-xl dark:from-slate-800/80 dark:to-slate-900/80">
          <CardHeader className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
                <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Resumo do Pedido</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure os detalhes</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-5">
            <div className="space-y-4">
              <Input
                type="date"
                label="Data do Pedido"
                value={createdAt}
                onValueChange={setCreatedAt}
                classNames={{
                  inputWrapper: "bg-white dark:bg-slate-800 shadow-sm",
                }}
              />

              <Select
                label="Status do Pedido"
                selectedKeys={[status]}
                onChange={(e) => setStatus(e.target.value)}
                classNames={{
                  trigger: "bg-white dark:bg-slate-800 shadow-sm",
                }}
              >
                <SelectItem key="PENDING" value="PENDING">⏳ Pendente</SelectItem>
                <SelectItem key="CONFIRMED" value="CONFIRMED">✅ Confirmado</SelectItem>
                <SelectItem key="PROCESSING" value="PROCESSING">🔄 Processando</SelectItem>
                <SelectItem key="SHIPPED" value="SHIPPED">📦 Enviado</SelectItem>
                <SelectItem key="DELIVERED" value="DELIVERED">🎉 Entregue</SelectItem>
              </Select>

              <Select
                label="Método de Pagamento"
                selectedKeys={[paymentMethod]}
                onChange={(e) => setPaymentMethod(e.target.value)}
                classNames={{
                  trigger: "bg-white dark:bg-slate-800 shadow-sm",
                }}
              >
                <SelectItem key="PIX" value="PIX">📱 PIX</SelectItem>
                <SelectItem key="CREDIT_CARD" value="CREDIT_CARD">💳 Cartão de Crédito</SelectItem>
                <SelectItem key="DEBIT_CARD" value="DEBIT_CARD">💳 Cartão de Débito</SelectItem>
                <SelectItem key="CASH" value="CASH">💵 Dinheiro</SelectItem>
                <SelectItem key="OTHER" value="OTHER">📋 Outro</SelectItem>
              </Select>

              <Input
                label="Observações"
                placeholder="Ex: Pedido via WhatsApp"
                value={notes}
                onValueChange={setNotes}
                classNames={{
                  inputWrapper: "bg-white dark:bg-slate-800 shadow-sm",
                }}
              />
            </div>

            <Divider className="my-4" />

            {/* Order Summary Stats */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Itens no pedido</span>
                <span className="font-medium">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Produtos diferentes</span>
                <span className="font-medium">{cart.length}</span>
              </div>
            </div>

            <Divider className="my-4" />

            {/* Total */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-500/25">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-emerald-100">Total do Pedido</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
                </div>
                <CheckBadgeIcon className="h-10 w-10 text-emerald-200" />
              </div>
            </div>

            {/* Submit Button */}
            <Tooltip
              content={
                <div className="flex items-center gap-2 px-1 py-0.5">
                  <span className="text-xs">Atalho rápido:</span>
                  <Kbd keys={isMac ? ["command"] : ["ctrl"]} className="text-xs">Enter</Kbd>
                </div>
              }
              placement="top"
            >
              <Button
                size="lg"
                className={`w-full font-semibold text-white shadow-lg transition-all ${
                  canSubmit 
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02]' 
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
                isLoading={loading}
                onPress={handleSubmit}
                isDisabled={!selectedUser || cart.length === 0}
                startContent={!loading && <BoltIcon className="w-5 h-5" />}
              >
                Criar Pedido
              </Button>
            </Tooltip>

            {/* Keyboard Hint */}
            <p className="text-center text-xs text-slate-400">
              Pressione <Kbd keys={isMac ? ["command"] : ["ctrl"]} className="text-[10px] mx-1">Enter</Kbd> para criar rapidamente
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
