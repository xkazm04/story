'use client';

import React from 'react';
import {
  Globe,
  Palette,
  User,
  Drama,
  Swords,
  Gamepad2,
  Hourglass,
  Camera,
  Settings,
  Bug,
  Clapperboard,
  Sparkles,
} from 'lucide-react';
import { DimensionType } from '../types';

const DIMENSION_ICON_MAP: Record<DimensionType, React.ComponentType<{ size?: number; className?: string }>> = {
  environment: Globe,
  artStyle: Palette,
  characters: User,
  mood: Drama,
  action: Swords,
  gameUI: Gamepad2,
  era: Hourglass,
  camera: Camera,
  technology: Settings,
  creatures: Bug,
  genre: Clapperboard,
  custom: Sparkles,
};

interface DimensionIconProps {
  type: DimensionType;
  size?: number;
  className?: string;
}

export function DimensionIcon({ type, size = 14, className }: DimensionIconProps) {
  const Icon = DIMENSION_ICON_MAP[type] || Sparkles;
  return <Icon size={size} className={className} />;
}

export function getDimensionIconComponent(type: DimensionType) {
  return DIMENSION_ICON_MAP[type] || Sparkles;
}

export default DimensionIcon;
