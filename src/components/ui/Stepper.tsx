"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { clsx } from "clsx";

type Step = {
  title: string;
  description?: string;
};

type StepperProps = {
  steps: string[] | Step[];
  currentStep: number;
  className?: string;
};

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={clsx("flex flex-col gap-4 md:flex-row md:gap-6", className)}>
      {steps.map((step, index) => {
        const stepTitle = typeof step === "string" ? step : step.title;
        const stepDescription = typeof step === "string" ? undefined : step.description;
        const isCompleted = currentStep > index;
        const isCurrent = currentStep === index;

        return (
          <div key={index} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors",
                  isCompleted
                    ? "border-brand-600 bg-brand-600 text-white"
                    : isCurrent
                      ? "border-brand-600 bg-white text-brand-600 dark:bg-slate-900"
                      : "border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    "mt-2 h-8 w-0.5 md:h-0.5 md:w-8",
                    isCompleted ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-8 md:pb-0">
              <p
                className={clsx(
                  "text-sm font-semibold",
                  isCurrent
                    ? "text-brand-600"
                    : isCompleted
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400 dark:text-slate-500"
                )}
              >
                {stepTitle}
              </p>
              {stepDescription && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stepDescription}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

