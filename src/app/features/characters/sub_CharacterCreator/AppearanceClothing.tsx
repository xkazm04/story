'use client';

import { SectionWrapper } from '@/app/components/UI';
import { Appearance } from '@/app/types/Character';

interface AppearanceClothingProps {
  appearance: Appearance;
  onChange: (field: string, value: string) => void;
}

/**
 * Clothing & Style Section
 * Clothing style, colors, accessories
 */
export function AppearanceClothing({
  appearance,
  onChange,
}: AppearanceClothingProps) {
  return (
    <SectionWrapper borderColor="green" padding="md">
      <h4 className="font-semibold text-white mb-4">Clothing & Style</h4>
      <div className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Clothing Style</label>
        <input
          type="text"
          value={appearance.clothing.style}
          onChange={(e) => onChange('clothing.style', e.target.value)}
          placeholder="e.g., Casual, Formal, Armor"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Primary Colors</label>
        <input
          type="text"
          value={appearance.clothing.color}
          onChange={(e) => onChange('clothing.color', e.target.value)}
          placeholder="e.g., Black, Blue, Red"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Accessories</label>
        <input
          type="text"
          value={appearance.clothing.accessories}
          onChange={(e) => onChange('clothing.accessories', e.target.value)}
          placeholder="e.g., Hat, Jewelry, Glasses"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      </div>
    </SectionWrapper>
  );
}
