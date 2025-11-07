'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type TextareaSize = 'sm' | 'md' | 'lg';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextareaSize;
  error?: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  maxCharCount?: number;
}

const sizeClasses: Record<TextareaSize, string> = {
  sm: 'px-2 py-1.5 text-xs min-h-[60px]',
  md: 'px-3 py-2 text-sm min-h-[80px]',
  lg: 'px-4 py-2.5 text-base min-h-[120px]',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      error,
      label,
      helperText,
      fullWidth = true,
      showCharCount = false,
      maxCharCount,
      className,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const charCount = value ? String(value).length : 0;
    const showCount = showCharCount || maxCharCount;

    return (
      <div className={clsx('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className="text-sm font-medium text-gray-300"
            >
              {label}
              {props.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {showCount && (
              <span className="text-xs text-gray-500">
                {charCount}
                {maxCharCount && ` / ${maxCharCount}`}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          className={clsx(
            'bg-gray-900/50 border rounded-lg text-white placeholder-gray-500',
            'transition-all outline-none resize-y',
            'focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
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

Textarea.displayName = 'Textarea';
