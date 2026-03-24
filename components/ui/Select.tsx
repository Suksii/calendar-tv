'use client';

import { useEffect, useRef, useState, useId } from 'react';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

export default function Select({
  options,
  value,
  onChange,
  label,
  placeholder = '— odaberite —',
  error,
  required,
  disabled,
}: SelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  // Zatvori na klik izvan
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !e.composedPath().includes(containerRef.current)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scrollaj fokusirani element u vidljivo područje
  useEffect(() => {
    if (open && focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusedIndex(options.findIndex((o) => o.value === value));
        } else if (focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setOpen(false);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) { setOpen(true); setFocusedIndex(0); break; }
        setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Escape':
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  function handleSelect(optValue: string) {
    onChange(optValue);
    setOpen(false);
    containerRef.current?.focus();
  }

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          id={`${id}-label`}
          className="block text-sm font-medium text-gray-700 mb-1"
          onClick={() => !disabled && setOpen((o) => !o)}
        >
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        role="combobox"
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          'relative flex items-center justify-between px-3 py-2 text-sm rounded-lg border cursor-pointer select-none transition-colors',
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white',
          open
            ? 'border-primary-500 ring-2 ring-primary-500'
            : error
            ? 'border-danger-400'
            : 'border-gray-300 hover:border-gray-400',
        ].join(' ')}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>

        {/* Dropdown */}
        {open && (
          <ul
            ref={listRef}
            role="listbox"
            aria-labelledby={label ? `${id}-label` : undefined}
            className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1"
          >
            {options.map((option, i) => {
              const isSelected = option.value === value;
              const isFocused = i === focusedIndex;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setFocusedIndex(i)}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(option.value); }}
                  className={[
                    'flex items-center justify-between px-3 py-2 cursor-pointer text-sm transition-colors',
                    isFocused ? 'bg-primary-50 text-primary-700' : 'text-gray-800',
                    isSelected && !isFocused ? 'bg-gray-50' : '',
                  ].join(' ')}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <p className="text-danger-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
