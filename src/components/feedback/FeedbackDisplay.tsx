"use client";

import type { OrderFeedback } from "@/types/feedback";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StarRating } from "./StarRating";

interface FeedbackDisplayProps {
  feedback: OrderFeedback;
  showDate?: boolean;
}

export function FeedbackDisplay({
  feedback,
  showDate = true,
}: FeedbackDisplayProps) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <StarRating value={feedback.rating} readOnly size="sm" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {feedback.rating}/5
          </span>
        </div>

        {showDate && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {format(new Date(feedback.createdAt), "dd/MM/yyyy", {
              locale: ptBR,
            })}
          </span>
        )}
      </div>

      {feedback.comment && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {feedback.comment}
        </p>
      )}
    </div>
  );
}
