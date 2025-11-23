
"use client";

import { useState } from "react";
import { Button, Card, CardBody, Progress } from "@heroui/react";
import { ArrowUpTrayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function ProductImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    message?: string;
    errors?: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ message: data.message, errors: data.errors });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById("csv-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setResult({ errors: [data.error || "Falha na importação"] });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setResult({ errors: ["Erro ao enviar arquivo"] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <CardBody>
          <h3 className="mb-4 text-lg font-semibold">Instruções de Importação</h3>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Para importar produtos em massa, utilize um arquivo CSV com as seguintes colunas (a primeira linha deve conter os cabeçalhos):
          </p>
          <div className="rounded-md bg-slate-100 p-4 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            code,name,brand,category,model,price,inStock,imageUrl,description,tags,popularity
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Exemplo:
            <br />
            <span className="font-mono text-xs">
              DISP-A01,Display A01,Samsung,display,A01,89.90,true,,Tela original,promo;novo,10
            </span>
          </p>
        </CardBody>
      </Card>

      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-12 dark:border-slate-700">
        <DocumentTextIcon className="mb-4 h-12 w-12 text-slate-400" />
        <label
          htmlFor="csv-upload"
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Selecionar Arquivo CSV
        </label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        {file && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Arquivo selecionado: {file.name}
          </p>
        )}
      </div>

      {loading && <Progress size="sm" isIndeterminate aria-label="Enviando..." />}

      {result && (
        <Card
          className={`border ${
            result.errors && result.errors.length > 0
              ? "border-danger-200 bg-danger-50 dark:bg-danger-900/20"
              : "border-success-200 bg-success-50 dark:bg-success-900/20"
          }`}
        >
          <CardBody>
            {result.message && (
              <p className="font-medium text-success-700 dark:text-success-400">
                {result.message}
              </p>
            )}
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-danger-700 dark:text-danger-400">
                  Erros encontrados:
                </p>
                <ul className="list-inside list-disc text-sm text-danger-600 dark:text-danger-400">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          color="primary"
          isDisabled={!file || loading}
          onPress={handleUpload}
          startContent={<ArrowUpTrayIcon className="h-5 w-5" />}
        >
          Importar Produtos
        </Button>
      </div>
    </div>
  );
}
