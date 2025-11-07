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
import { buildWarrantyWhatsAppMessage, getWhatsAppUrl } from "@/src/lib/whatsapp";
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

      <Card className="border border-slate-200 dark:border-slate-800">
        <CardHeader>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{steps[activeStep]}</p>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-6">
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
                errorMessage={showErrors && !model.trim() ? "Informe o modelo do aparelho." : undefined}
              />
              <Textarea
                label="Descrição do defeito"
                minRows={4}
                placeholder="Descreva o problema identificado"
                value={description}
                onValueChange={setDescription}
                isInvalid={showErrors && !description.trim()}
                errorMessage={
                  showErrors && !description.trim() ? "Descreva o defeito identificado." : undefined
                }
              />
              <Input
                label="Anexar imagens"
                type="file"
                variant="bordered"
                description="Faça upload de fotos do defeito (opcional)"
              />
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <p>
                Nossa política de trocas garante análise em até 5 dias úteis após recebimento da peça. O envio de fotos ajuda a acelerar o processo.
              </p>
              <p>
                Lembre-se: peças sem sinais de uso e com selo intacto garantem aprovação mais rápida para devolução ou troca.
              </p>
              <Checkbox isSelected={acceptedPolicy} onValueChange={setAcceptedPolicy}>
                Li e concordo com a política de trocas da IRON DISTRIBUIDORA SC.
              </Checkbox>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-6">
              <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Revise os dados</p>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Tipo de solicitação:</span> {requestType}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Item:</span> {selectedItemsLabel}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Modelo:</span> {model || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Descrição:</span> {description || "-"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ao enviar, abriremos o WhatsApp da IRON DISTRIBUIDORA SC com todos os detalhes preenchidos.
                  </p>
                </CardBody>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  color="danger"
                  className="bg-brand-600 text-white"
                  onPress={handleSendWhatsApp}
                >
                  Gerar mensagem no WhatsApp
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="light" onPress={handlePrev} isDisabled={activeStep === 0} className="sm:w-auto">
          Voltar
        </Button>
        <Button
          color="danger"
          className="bg-brand-600 text-white sm:w-auto"
          onPress={handleNext}
          isDisabled={activeStep === 4 || !canContinue()}
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}

