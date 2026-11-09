"use client";

import { colorMap } from "@/lib/eventColors";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: Option<T>[];
  active: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  label,
  options,
  active,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      <span
        className="inline text-xs font-display tracking-widest uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <div
        className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-lg"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {options.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium font-display tracking-wide transition-all cursor-pointer"
            style={
              active === value
                ? {
                    background: "var(--accent)",
                    color: "#ffffff",
                    fontWeight: 700,
                  }
                : {
                    color: "var(--text-muted)",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <div className="flex items-center gap-4 flex-wrap py-3 px-1">
      {Object.entries(colorMap).map(([type, config]) => (
        <div key={type} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: config.dot }}
          />
          <span
            className="text-[11px] font-display tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            {config.label}
          </span>
        </div>
      ))}
    </div>
  );
}
