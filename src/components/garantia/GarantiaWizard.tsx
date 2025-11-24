"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Divider,
  Input,
  Radio,
  RadioGroup,
  Textarea,
} from "@heroui/react";
import {
  buildWarrantyWhatsAppMessage,
  getWhatsAppUrl,
} from "@/src/lib/whatsapp";
import { Stepper } from "@/src/components/ui/Stepper";

const steps = [
  "Tipo de solicitação",
  "Item",
  "Detalhes",
  "Política",
  "WhatsApp",
];

type StepKey = 0 | 1 | 2 | 3 | 4;

const itemOptions = [
  { value: "Tela", label: "Tela" },
  { value: "Bateria", label: "Bateria" },
  { value: "Doc/Acessórios", label: "DOC / Acessórios" },
  { value: "Outro", label: "Outro" },
];

export function GarantiaWizard() {
  const [activeStep, setActiveStep] = useState<StepKey>(0);
  const [requestType, setRequestType] = useState("Troca (defeito)");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const handleNext = () =>
    setActiveStep((prev) => Math.min((prev + 1) as StepKey, 4) as StepKey);
  const handlePrev = () =>
    setActiveStep((prev) => Math.max((prev - 1) as StepKey, 0) as StepKey);

  const canContinue = () => {
    switch (activeStep) {
      case 0:
        return Boolean(requestType);
      case 1:
        return selectedItems.length > 0;
      case 2:
        return model.trim().length > 0 && description.trim().length > 0;
      case 3:
        return acceptedPolicy;
      default:
        return true;
    }
  };

  const selectedItemsLabel = useMemo(() => {
    return selectedItems.length > 0 ? selectedItems.join(", ") : "-";
  }, [selectedItems]);

  const handleSendWhatsApp = () => {
    setShowErrors(true);
    if (!selectedItems.length || !model.trim() || !description.trim()) {
      return;
    }

    const message = buildWarrantyWhatsAppMessage({
      requestType,
      itemType: selectedItemsLabel,
      model: model.trim(),
      description: description.trim(),
    });

    const url = getWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8">
      <Stepper steps={steps} currentStep={activeStep} />

      <Card className="w-full max-w-4xl mx-auto shadow-lg border border-slate-200 dark:border-slate-700">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-brand-600 animate-pulse"></div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {steps[activeStep]}
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-gradient-to-r from-transparent via-brand-600 to-transparent h-[2px]" />
        <CardBody className="space-y-6 p-8">
          {activeStep === 0 && (
            <RadioGroup
              label="Selecione o tipo de solicitação"
              value={requestType}
              onValueChange={setRequestType}
            >
              <Radio value="Troca (defeito)">Troca (defeito)</Radio>
              <Radio value="Devolução sem uso">Devolução sem uso</Radio>
            </RadioGroup>
          )}

          {activeStep === 1 && (
            <CheckboxGroup
              label="Qual o item?"
              value={selectedItems}
              onValueChange={(values) => setSelectedItems(values as string[])}
            >
              {itemOptions.map((item) => (
                <Checkbox key={item.value} value={item.value}>
                  {item.label}
                </Checkbox>
              ))}
            </CheckboxGroup>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <Input
                label="Modelo do aparelho"
                placeholder="Ex.: Galaxy A23"
                value={model}
                onValueChange={setModel}
                isInvalid={showErrors && !model.trim()}
                errorMessage={
                  showErrors && !model.trim()
                    ? "Informe o modelo do aparelho."
                    : undefined
                }
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.nativeEvent.stopPropagation();
                  }
                }}
              />
              <Textarea
                label="Descrição do defeito"
                minRows={4}
                placeholder="Descreva o problema identificado"
                value={description}
                onValueChange={setDescription}
                isInvalid={showErrors && !description.trim()}
                errorMessage={
                  showErrors && !description.trim()
                    ? "Descreva o defeito identificado."
                    : undefined
                }
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.nativeEvent.stopPropagation();
                  }
                }}
              />
              {/* <Input
                label="Anexar imagens"
                type="file"
                variant="bordered"
                description="Faça upload de fotos do defeito (opcional)"
              /> */}
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <p>
                Nossa política de trocas garante análise em até 5 dias úteis
                após recebimento da peça. O envio de fotos ajuda a acelerar o
                processo.
              </p>
              <p>
                Lembre-se: peças sem sinais de uso e com selo intacto garantem
                aprovação mais rápida para devolução ou troca.
              </p>
              <Checkbox
                isSelected={acceptedPolicy}
                onValueChange={setAcceptedPolicy}
              >
                Li e concordo com a política de trocas da IRON DISTRIBUIDORA SC.
              </Checkbox>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-6">
              <Card className="w-full border border-slate-200 dark:border-slate-700 shadow-md">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    📋 Revise os dados
                  </p>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-4 text-sm text-slate-600 dark:text-slate-400 p-6">
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Tipo de solicitação:
                    </span>{" "}
                    {requestType}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Item:
                    </span>{" "}
                    {selectedItemsLabel}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Modelo:
                    </span>{" "}
                    {model || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Descrição:
                    </span>{" "}
                    {description || "-"}
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      Ao enviar, abriremos o WhatsApp da IRON DISTRIBUIDORA SC
                      com todos os detalhes preenchidos.
                    </p>
                  </div>
                </CardBody>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  color="primary"
                  className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  onPress={handleSendWhatsApp}
                  size="lg"
                  startContent={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  }
                >
                  Gerar mensagem no WhatsApp
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between max-w-4xl mx-auto">
        <Button
          variant="bordered"
          onPress={handlePrev}
          isDisabled={activeStep === 0}
          className="sm:w-auto border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold"
          size="lg"
        >
          ← Voltar
        </Button>
        <Button
          color="primary"
          className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white sm:w-auto shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
          onPress={handleNext}
          isDisabled={activeStep === 4 || !canContinue()}
          size="lg"
        >
          Avançar →
        </Button>
      </div>
    </div>
  );
}
