'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

type AccordionType = 'single' | 'multiple';

interface AccordionContextValue {
  type: AccordionType;
  openItems: Set<string>;
  toggleItem: (value: string) => void;
  isOpen: (value: string) => boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
}

interface AccordionProps {
  type?: AccordionType;
  defaultOpen?: string | string[];
  children: ReactNode;
  className?: string;
}

export function Accordion({
  type = 'single',
  defaultOpen = [],
  children,
  className,
}: AccordionProps) {
  const initialOpen = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(initialOpen));

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        if (type === 'single') {
          next.clear();
        }
        next.add(value);
      }
      return next;
    });
  };

  const isOpen = (value: string) => openItems.has(value);

  return (
    <AccordionContext.Provider value={{ type, openItems, toggleItem, isOpen }}>
      <div className={clsx('space-y-1', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div
      className={clsx(
        'border border-gray-700/50 rounded-lg bg-gray-800/30 overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  children: ReactNode;
  icon?: ReactNode;
  showIndicator?: boolean;
  badge?: ReactNode;
  className?: string;
}

export function AccordionTrigger({
  children,
  icon,
  showIndicator = true,
  badge,
  className,
}: AccordionTriggerProps) {
  const { toggleItem, isOpen } = useAccordionContext();
  const parentValue = useAccordionItemContext();
  const open = isOpen(parentValue);

  return (
    <button
      onClick={() => toggleItem(parentValue)}
      className={clsx(
        'w-full flex items-center gap-2.5 px-3 py-2.5',
        'text-left text-sm font-medium text-white',
        'hover:bg-gray-700/30 transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-inset',
        className
      )}
    >
      {icon && (
        <span className="flex-shrink-0 w-4 h-4 text-gray-400">{icon}</span>
      )}
      <span className="flex-1 min-w-0">{children}</span>
      {badge && <span className="flex-shrink-0">{badge}</span>}
      {showIndicator && (
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      )}
    </button>
  );
}

interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const { isOpen } = useAccordionContext();
  const parentValue = useAccordionItemContext();
  const open = isOpen(parentValue);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={clsx('px-3 py-2.5 text-sm text-gray-300', className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Context for AccordionItem value
const AccordionItemContext = createContext<string>('');

function useAccordionItemContext() {
  return useContext(AccordionItemContext);
}

// Wrapper to provide value context
interface AccordionItemWrapperProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionItemWrapper({
  value,
  children,
  className,
}: AccordionItemWrapperProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <AccordionItem value={value} className={className}>
        {children}
      </AccordionItem>
    </AccordionItemContext.Provider>
  );
}

// Compact variant for denser UIs
interface CompactAccordionProps extends AccordionProps {
  items: Array<{
    value: string;
    title: string;
    content: ReactNode;
    icon?: ReactNode;
    badge?: ReactNode;
  }>;
}

export function CompactAccordion({ items, ...accordionProps }: CompactAccordionProps) {
  return (
    <Accordion {...accordionProps}>
      {items.map((item) => (
        <AccordionItemWrapper key={item.value} value={item.value}>
          <AccordionTrigger icon={item.icon} badge={item.badge}>
            {item.title}
          </AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItemWrapper>
      ))}
    </Accordion>
  );
}
