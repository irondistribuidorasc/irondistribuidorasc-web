
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Tab,
  Tabs,
} from "@heroui/react";
import ProductList from "@/src/components/admin/ProductList";
import ProductForm from "@/src/components/admin/ProductForm";
import ProductImport from "@/src/components/admin/ProductImport";

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
          <Button
            color="danger"
            variant="flat"
            onPress={() => router.push("/admin")}
          >
            Voltar ao Painel
          </Button>
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
