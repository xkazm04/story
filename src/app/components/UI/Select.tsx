'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  error?: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = 'md',
      error,
      label,
      helperText,
      fullWidth = true,
      options,
      placeholder,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={clsx('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-300"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'bg-gray-900/50 border rounded-lg text-white',
              'transition-all outline-none appearance-none',
              'focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'pr-8', // Space for chevron icon
              hasError
                ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
                : 'border-gray-600/50',
              sizeClasses[size],
              fullWidth && 'w-full',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        {(error || helperText) && (
          <span
            className={clsx(
              'text-xs',
              hasError ? 'text-red-400' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
