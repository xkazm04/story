'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'mono';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  variant?: InputVariant;
  error?: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      error,
      label,
      helperText,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={clsx('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-300"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'bg-gray-900/50 border rounded-lg text-white placeholder-gray-500',
            'transition-all outline-none',
            'focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variant === 'mono' && 'font-mono',
            hasError
              ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
              : 'border-gray-600/50',
            sizeClasses[size],
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
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

Input.displayName = 'Input';
