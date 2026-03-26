"use client";

import Select from "./Select";

type TimePickerProps = {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseTime(value: string): [number, number] {
  const [h, m] = (value ?? "").split(":").map(Number);
  return [isNaN(h) ? 0 : h, isNaN(m) ? 0 : m];
}

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: pad(i),
  label: pad(i),
}));

const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
  value: pad(i),
  label: pad(i),
}));

export default function TimePicker({
  value,
  onChange,
  error,
  label,
  required,
}: TimePickerProps) {
  const [h, m] = parseTime(value);

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select
            placeholder="Sat"
            options={hourOptions}
            value={pad(h)}
            onChange={(v) => onChange(`${v}:${pad(m)}`)}
          />
        </div>
        <span className="text-zinc-500 font-mono shrink-0">:</span>
        <div className="flex-1">
          <Select
            placeholder="Minuta"
            options={minuteOptions}
            value={pad(m)}
            onChange={(v) => onChange(`${pad(h)}:${v}`)}
          />
        </div>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
