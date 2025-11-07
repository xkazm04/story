'use client';

import { SectionWrapper } from '@/app/components/UI';
import { Appearance } from '@/app/types/Character';

interface AppearanceBasicAttributesProps {
  appearance: Appearance;
  onChange: (field: string, value: string) => void;
}

/**
 * Basic Attributes Section
 * Gender, Age, Skin Color, Body Type, Height
 */
export function AppearanceBasicAttributes({
  appearance,
  onChange,
}: AppearanceBasicAttributesProps) {
  return (
    <SectionWrapper borderColor="blue" padding="md">
      <h4 className="font-semibold text-white mb-4">Basic Attributes</h4>
      <div className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
        <input
          type="text"
          value={appearance.gender}
          onChange={(e) => onChange('gender', e.target.value)}
          placeholder="e.g., Male, Female, Non-binary"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
        <input
          type="text"
          value={appearance.age}
          onChange={(e) => onChange('age', e.target.value)}
          placeholder="e.g., Young, Adult, Elderly"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Skin Color</label>
        <input
          type="text"
          value={appearance.skinColor}
          onChange={(e) => onChange('skinColor', e.target.value)}
          placeholder="e.g., Fair, Tan, Dark"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Body Type</label>
        <input
          type="text"
          value={appearance.bodyType}
          onChange={(e) => onChange('bodyType', e.target.value)}
          placeholder="e.g., Athletic, Slim, Muscular"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Height</label>
        <input
          type="text"
          value={appearance.height}
          onChange={(e) => onChange('height', e.target.value)}
          placeholder="e.g., Short, Average, Tall"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      </div>
    </SectionWrapper>
  );
}
