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
    <div
      className={clsx(
        "flex flex-col gap-4 md:flex-row md:gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm",
        className
      )}
    >
      {steps.map((step, index) => {
        const stepTitle = typeof step === "string" ? step : step.title;
        const stepDescription =
          typeof step === "string" ? undefined : step.description;
        const isCompleted = currentStep > index;
        const isCurrent = currentStep === index;

        return (
          <div key={index} className="flex items-start gap-3 flex-1">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  "flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold text-base transition-all duration-300",
                  isCompleted
                    ? "border-brand-600 bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md"
                    : isCurrent
                    ? "border-brand-600 bg-white text-brand-600 dark:bg-slate-900 shadow-lg ring-4 ring-brand-600/20"
                    : "border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-6 w-6 animate-in fade-in duration-300" />
                ) : (
                  <span className={isCurrent ? "animate-pulse" : ""}>
                    {index + 1}
                  </span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    "mt-2 transition-all duration-500",
                    "md:hidden h-12 w-0.5",
                    "hidden md:block md:h-0.5 md:w-full md:flex-1",
                    isCompleted
                      ? "bg-gradient-to-r from-brand-600 to-brand-700"
                      : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-8 md:pb-0">
              <p
                className={clsx(
                  "text-sm font-bold transition-colors duration-300",
                  isCurrent
                    ? "text-brand-600 dark:text-brand-400"
                    : isCompleted
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {stepTitle}
              </p>
              {stepDescription && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stepDescription}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
