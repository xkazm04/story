'use client';

import { SectionWrapper } from '@/app/components/UI';
import { Appearance } from '@/app/types/Character';

interface AppearanceFacialFeaturesProps {
  appearance: Appearance;
  onChange: (field: string, value: string) => void;
}

/**
 * Facial Features Section
 * Face shape, eyes, hair, facial hair, special features
 */
export function AppearanceFacialFeatures({
  appearance,
  onChange,
}: AppearanceFacialFeaturesProps) {
  return (
    <SectionWrapper borderColor="purple" padding="md">
      <h4 className="font-semibold text-white mb-4">Facial Features</h4>
      <div className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Face Shape</label>
        <input
          type="text"
          value={appearance.face.shape}
          onChange={(e) => onChange('face.shape', e.target.value)}
          placeholder="e.g., Oval, Round, Square"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Eye Color</label>
        <input
          type="text"
          value={appearance.face.eyeColor}
          onChange={(e) => onChange('face.eyeColor', e.target.value)}
          placeholder="e.g., Blue, Brown, Green"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Hair Color</label>
        <input
          type="text"
          value={appearance.face.hairColor}
          onChange={(e) => onChange('face.hairColor', e.target.value)}
          placeholder="e.g., Black, Blonde, Red"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Hair Style</label>
        <input
          type="text"
          value={appearance.face.hairStyle}
          onChange={(e) => onChange('face.hairStyle', e.target.value)}
          placeholder="e.g., Short, Long, Curly"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Facial Hair</label>
        <input
          type="text"
          value={appearance.face.facialHair}
          onChange={(e) => onChange('face.facialHair', e.target.value)}
          placeholder="e.g., Beard, Mustache, Clean-shaven"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Special Features
        </label>
        <input
          type="text"
          value={appearance.face.features}
          onChange={(e) => onChange('face.features', e.target.value)}
          placeholder="e.g., Scar, Tattoo, Freckles"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      </div>
    </SectionWrapper>
  );
}
