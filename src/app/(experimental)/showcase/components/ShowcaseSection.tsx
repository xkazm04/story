'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/app/lib/utils';
import { ChevronDown, Code } from 'lucide-react';

interface ShowcaseItemProps {
  label: string;
  source: string;
  children: ReactNode;
  className?: string;
}

export function ShowcaseItem({ label, source, children, className }: ShowcaseItemProps) {
  return (
    <div className={cn('rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden', className)}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 bg-slate-900/80">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="text-[10px] font-mono text-slate-500">{source}</span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

interface ShowcaseSectionProps {
  id: string;
  title: string;
  description?: string;
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function ShowcaseSection({
  id,
  title,
  description,
  count,
  children,
  defaultOpen = true,
}: ShowcaseSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section id={id} className="scroll-mt-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 py-4 px-1 text-left group"
      >
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-500 transition-transform',
            !isOpen && '-rotate-90'
          )}
        />
        <h2 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
          {title}
        </h2>
        {count !== undefined && (
          <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            {count} variants
          </span>
        )}
        {description && (
          <span className="text-xs text-slate-500 ml-auto hidden sm:block">{description}</span>
        )}
      </button>
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
          {children}
        </div>
      )}
    </section>
  );
}
