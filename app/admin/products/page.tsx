"use client";

import DeleteAllProductsButton from "@/src/components/admin/DeleteAllProductsButton";
import ProductForm from "@/src/components/admin/ProductForm";
import ProductImport from "@/src/components/admin/ProductImport";
import ProductList from "@/src/components/admin/ProductList";
import StockManager from "@/src/components/admin/StockManager";
import { Button, Spinner, Tab, Tabs } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white px-4 py-12 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Gerenciar Produtos
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Adicione, edite ou importe produtos em massa
            </p>
          </div>
          <div className="flex gap-2">
            <DeleteAllProductsButton />
            <Button
              color="danger"
              variant="flat"
              onPress={() => router.push("/admin")}
            >
              Voltar ao Painel
            </Button>
          </div>
        </div>

        <div className="mb-6">
          {/* We could add a global alert here if we fetched products and checked stock, 
              but ProductList/StockManager handle their own data. 
              For a global alert, we might need to fetch data here or use a context.
              For now, let's rely on the visual indicators in the lists. 
          */}
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          color="danger"
          variant="bordered"
          className="mb-6"
          classNames={{
            tabList: "overflow-x-auto w-full justify-start",
          }}
        >
          <Tab key="list" title="Lista de Produtos">
            <ProductList />
          </Tab>
          <Tab key="stock" title="Gerenciar Estoque">
            <StockManager />
          </Tab>
          <Tab key="add" title="Adicionar Produto">
            <ProductForm onSuccess={() => setActiveTab("list")} />
          </Tab>
          <Tab key="import" title="Importar CSV">
            <ProductImport />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
