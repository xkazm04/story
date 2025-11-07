'use client';

import { SectionWrapper } from '@/app/components/UI';
import { Appearance } from '@/app/types/Character';

interface AppearanceCustomFeaturesProps {
  appearance: Appearance;
  onChange: (field: string, value: string) => void;
}

/**
 * Custom Features Section
 * Additional distinctive features
 */
export function AppearanceCustomFeatures({
  appearance,
  onChange,
}: AppearanceCustomFeaturesProps) {
  return (
    <SectionWrapper borderColor="yellow" padding="md">
      <h4 className="font-semibold text-white mb-4">Additional Details</h4>
      <div className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Custom Features
        </label>
        <textarea
          value={appearance.customFeatures}
          onChange={(e) => onChange('customFeatures', e.target.value)}
          placeholder="Any other distinctive features or characteristics..."
          className="w-full min-h-[120px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      </div>
    </SectionWrapper>
  );
}
