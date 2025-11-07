'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type CardVariant = 'default' | 'bordered' | 'gradient' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-gray-800/50 border border-gray-700/50',
  bordered: 'bg-gray-800/30 border-2 border-gray-700/50',
  gradient: 'bg-gradient-to-br from-gray-800 via-gray-800/80 to-gray-900 border border-gray-700/30',
  glass: 'bg-white/5 backdrop-blur-sm border border-white/10',
};

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg transition-all',
        variantClasses[variant],
        paddingClasses[padding],
        hoverable && 'hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card subcomponents for structured layouts
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  children,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={clsx('flex items-start justify-between gap-3 mb-3', className)}
      {...props}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-4 h-4 text-cyan-400">
            {icon}
          </div>
        )}
        {(title || subtitle) && (
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-white truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={clsx('text-sm text-gray-300', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-700/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Compact Card variant for lists
interface CompactCardProps extends Omit<CardProps, 'padding' | 'children'> {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function CompactCard({
  icon,
  title,
  subtitle,
  meta,
  actions,
  children,
  className,
  ...props
}: CompactCardProps) {
  return (
    <Card
      padding="sm"
      hoverable
      className={clsx('flex items-center gap-2.5', className)}
      {...props}
    >
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-cyan-500/10 rounded border border-cyan-500/30">
          <span className="w-4 h-4 text-cyan-400">{icon}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-white truncate">{title}</h4>
          {meta && (
            <span className="text-xs text-gray-500 flex-shrink-0">{meta}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 truncate">{subtitle}</p>
        )}
        {children}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </Card>
  );
}

// Grid Card variant for galleries
interface GridCardProps extends CardProps {
  image?: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  overlay?: ReactNode;
}

export function GridCard({
  image,
  title,
  subtitle,
  badge,
  overlay,
  className,
  children,
  ...props
}: GridCardProps) {
  return (
    <Card
      padding="none"
      hoverable
      className={clsx('overflow-hidden group', className)}
      {...props}
    >
      {/* Image Section */}
      {image && (
        <div className="relative aspect-square overflow-hidden bg-gray-900">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {badge && (
            <div className="absolute top-2 right-2">
              {badge}
            </div>
          )}
          {overlay && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {overlay}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-3">
        <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
        {subtitle && (
          <p className="text-xs text-gray-400 truncate mt-1">{subtitle}</p>
        )}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </Card>
  );
}
