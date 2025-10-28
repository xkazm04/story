'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { useLLM } from '@/app/hooks/useLLM';
import { characterBackstoryPrompt } from '@/prompts';

interface CharacterBackstoryGeneratorProps {
  characterName: string;
  currentBackstory?: string;
  traits?: string[];
  role?: string;
  age?: number;
  onBackstoryGenerated: (backstory: string) => void;
}

const CharacterBackstoryGenerator: React.FC<CharacterBackstoryGeneratorProps> = ({
  characterName,
  currentBackstory,
  traits = [],
  role,
  age,
  onBackstoryGenerated,
}) => {
  const { generateFromTemplate, isLoading } = useLLM();
  const [backstoryLength, setBackstoryLength] = useState<'brief' | 'detailed' | 'extensive'>(
    'detailed'
  );
  const [focusAreas, setFocusAreas] = useState({
    childhood: true,
    formativeEvent: true,
    relationships: true,
    motivations: true,
  });

  const handleGenerate = async () => {
    if (!characterName.trim()) {
      alert('Character name is required');
      return;
    }

    const selectedFocusAreas = Object.entries(focusAreas)
      .filter(([_, selected]) => selected)
      .map(([area]) => area);

    try {
      const result = await generateFromTemplate(characterBackstoryPrompt, {
        characterName,
        currentBackstory,
        traits,
        role,
        age,
        length: backstoryLength,
        focusAreas: selectedFocusAreas,
      });

      if (result && result.content) {
        onBackstoryGenerated(result.content);
      }
    } catch (error) {
      console.error('Backstory generation error:', error);
      alert('Failed to generate backstory. Make sure LLM service is running.');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-amber-500" />
        <h4 className="text-sm font-semibold text-white">AI Backstory Generator</h4>
      </div>

      {/* Length Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">Backstory Length</label>
        <div className="grid grid-cols-3 gap-2">
          {(['brief', 'detailed', 'extensive'] as const).map((length) => (
            <button
              key={length}
              onClick={() => setBackstoryLength(length)}
              className={`
                px-2 py-1 rounded text-xs font-medium capitalize
                transition-colors duration-200
                ${backstoryLength === length
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }
              `}
            >
              {length}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Areas */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">Focus Areas</label>
        <div className="space-y-1">
          {Object.entries(focusAreas).map(([area, selected]) => (
            <label key={area} className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) =>
                  setFocusAreas((prev) => ({ ...prev, [area]: e.target.checked }))
                }
                className="rounded bg-gray-800 border-gray-700 text-amber-600 focus:ring-amber-500"
              />
              <span className="capitalize">{area.replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Character Context */}
      {(traits.length > 0 || role) && (
        <div className="text-xs text-gray-500 space-y-1">
          {role && (
            <div>
              <span className="text-gray-600">Role:</span> {role}
            </div>
          )}
          {traits.length > 0 && (
            <div>
              <span className="text-gray-600">Traits:</span> {traits.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <motion.button
        onClick={handleGenerate}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-200
          ${isLoading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-amber-600 hover:bg-amber-700 text-white'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Backstory...
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4" />
            {currentBackstory ? 'Expand Backstory' : 'Generate Backstory'}
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500">
        AI will create a compelling backstory with formative experiences and motivations
      </p>
    </div>
  );
};

export default CharacterBackstoryGenerator;
