'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Voice } from '@/app/types/Voice';
import { useUpdateVoice } from '@/app/hooks/useVoices';
import { useLLM } from '@/app/hooks/useLLM';
import { voiceDescriptionPrompt } from '@/prompts';
import { Sparkles, Save, Loader2, Edit3, X } from 'lucide-react';

interface VoiceDescriptionProps {
  voice: Voice;
}

const VoiceDescription = ({ voice }: VoiceDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(voice.description || '');
  const { mutate: updateVoice, isPending: isSaving } = useUpdateVoice();
  const { generate, isLoading: isGenerating } = useLLM();

  const handleEnhance = async () => {
    const context = {
      voiceName: voice.name,
      characterName: voice.character_id || undefined,
      currentDescription: description || undefined,
      provider: voice.provider,
      language: voice.language,
      gender: voice.gender,
    };

    const response = await generate(
      voiceDescriptionPrompt.user(context),
      voiceDescriptionPrompt.system
    );

    if (response) {
      setDescription(response.content);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateVoice(
      {
        id: voice.id,
        updates: { description },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setDescription(voice.description || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-950/50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Voice Description
        </h4>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <button
                onClick={handleEnhance}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-900 text-purple-200 hover:bg-purple-800 transition-colors text-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    AI Enhance
                  </>
                )}
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            </>
          )}

          {isEditing && (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    Save
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the voice characteristics, tone, and ideal use cases..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={6}
          />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {description ? (
            <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No description yet. Use AI Enhance to generate one or add your own.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default VoiceDescription;
