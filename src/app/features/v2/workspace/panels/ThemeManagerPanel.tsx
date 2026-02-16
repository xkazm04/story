'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import PanelFrame from './PanelFrame';
import ThemeManager from '@/app/features/story/components/ThemeManager';
import type { Theme } from '@/lib/themes/ThemeTracker';

interface ThemeManagerPanelProps {
  onClose?: () => void;
}

export default function ThemeManagerPanel({ onClose }: ThemeManagerPanelProps) {
  const [themes, setThemes] = useState<Theme[]>([]);

  const handleAdd = useCallback((theme: Omit<Theme, 'id'>) => {
    setThemes((prev) => [...prev, { ...theme, id: `theme-${Date.now()}` }]);
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Theme>) => {
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setThemes((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <PanelFrame title="Themes" icon={Sparkles} onClose={onClose} headerAccent="violet">
      <ThemeManager
        themes={themes}
        onAddTheme={handleAdd}
        onUpdateTheme={handleUpdate}
        onRemoveTheme={handleRemove}
      />
    </PanelFrame>
  );
}
