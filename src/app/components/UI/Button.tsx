'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-cyan-500 to-blue-500
    hover:from-cyan-400 hover:to-blue-400
    text-white
    shadow-lg shadow-cyan-500/20
    border-0
    disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none
  `,
  secondary: `
    bg-white/5
    hover:bg-white/10
    text-white
    border border-white/10
    hover:border-white/20
    disabled:bg-white/5 disabled:border-white/5
  `,
  ghost: `
    bg-transparent
    hover:bg-gray-700/50
    text-gray-300
    hover:text-white
    border-0
    disabled:bg-transparent disabled:text-gray-600
  `,
  danger: `
    bg-red-500/10
    hover:bg-red-500/20
    text-red-400
    border border-red-500/30
    hover:border-red-500/50
    disabled:bg-red-500/5 disabled:border-red-500/20
  `,
  link: `
    bg-transparent
    hover:bg-transparent
    text-cyan-400
    hover:text-cyan-300
    underline-offset-4
    hover:underline
    border-0
    p-0
    disabled:text-cyan-600 disabled:no-underline
  `,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = 'md',
      variant = 'primary',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const showIcon = icon || loading;
    const iconElement = loading ? (
      <Loader2 className={clsx(iconSizeClasses[size], 'animate-spin')} />
    ) : (
      icon && <span className={iconSizeClasses[size]}>{icon}</span>
    );

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: variant === 'link' ? 1 : 1.02 } : {}}
        whileTap={!isDisabled ? { scale: variant === 'link' ? 1 : 0.98 } : {}}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all outline-none',
          'focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {showIcon && iconPosition === 'left' && iconElement}
        {children && <span>{children}</span>}
        {showIcon && iconPosition === 'right' && iconElement}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon-only variant for compact UIs
interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition' | 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'ghost', className, ...props }, ref) => {
    const iconOnlyClasses: Record<ButtonSize, string> = {
      xs: 'p-1',
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-2.5',
    };

    return (
      <Button
        ref={ref}
        size={size}
        variant={variant}
        className={clsx(iconOnlyClasses[size], 'aspect-square', className)}
        {...props}
      >
        <span className={iconSizeClasses[size]}>{icon}</span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
