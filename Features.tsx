"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface YearPickerProps {
  value?: number;
  onChange: (year: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function YearPicker({ value, onChange, min = 1990, max = new Date().getFullYear() + 1, className }: YearPickerProps) {
  const currentYear = new Date().getFullYear();
  const [page, setPage] = useState(() => {
    const selectedYear = value ?? currentYear;
    return Math.floor((selectedYear - min) / 12);
  });

  const totalPages = Math.ceil((max - min + 1) / 12);
  const startYear = min + page * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i).filter(y => y <= max);

  return (
    <div className={cn("border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-3 w-64", className)}>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="p-1 rounded hover:bg-[var(--color-muted)] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold text-[var(--color-foreground)]">
          {startYear} – {Math.min(startYear + 11, max)}
        </span>
        <button
          type="button"
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="p-1 rounded hover:bg-[var(--color-muted)] disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {years.map(year => (
          <button
            key={year}
            type="button"
            onClick={() => onChange(year)}
            className={cn(
              "py-2 rounded-[var(--radius)] text-sm font-medium transition-colors",
              value === year
                ? "bg-[var(--color-primary)] text-white"
                : year === currentYear
                ? "border border-[var(--color-primary)] text-[var(--color-primary)]"
                : "hover:bg-[var(--color-muted)] text-[var(--color-foreground)]"
            )}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}
