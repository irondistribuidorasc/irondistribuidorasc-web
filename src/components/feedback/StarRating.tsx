"use client";

import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const ratingLabels: Record<number, string> = {
  1: "Péssimo",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Excelente",
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  showLabel = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;
  const sizeClass = sizeClasses[size];

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readOnly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const isFilled = rating <= displayValue;
          const isInteractive = !readOnly && onChange;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              disabled={readOnly}
              className={`
                transition
                ${isInteractive ? "cursor-pointer hover:scale-110" : "cursor-default"}
                ${!readOnly ? "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 rounded" : ""}
              `}
              aria-label={`Avaliar ${rating} estrela${rating > 1 ? "s" : ""}`}
            >
              {isFilled ? (
                <StarIconSolid
                  className={`${sizeClass} text-brand-500 transition-colors`}
                />
              ) : (
                <StarIcon
                  className={`${sizeClass} text-default-300 transition-colors`}
                />
              )}
            </button>
          );
        })}
      </div>

      {showLabel && displayValue > 0 && (
        <span className="text-sm font-medium text-default-500">
          {ratingLabels[displayValue]}
        </span>
      )}
    </div>
  );
}
