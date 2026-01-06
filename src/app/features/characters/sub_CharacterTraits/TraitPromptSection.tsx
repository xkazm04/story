'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Sparkles } from 'lucide-react';
import { PromptSection } from '@/app/constants/promptSections';
import { traitApi } from '@/app/api/traits';
import { Character } from '@/app/types/Character';
import { RichTextEditor } from '@/app/components/UI';
import { SmartGenerateButton } from '@/app/components/UI/SmartGenerateButton';
import { useLLM } from '@/app/hooks/useLLM';
import {
  smartCharacterCreationPrompt,
  gatherProjectContext,
  gatherStoryContext,
  gatherVisualStyleContext,
  gatherCharacterContext
} from '@/prompts';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useCharacters } from '@/app/hooks/useCharacters';
import { useAISuggestionStream } from '@/app/hooks/useAISuggestionStream';
import { AISuggestion } from '@/app/services/aiSuggestionService';
import AISuggestionSidebar from '../components/AISuggestionSidebar';
import { IconButton } from '@/app/components/UI/Button';

interface TraitPromptSectionProps {
  section: PromptSection;
  characterId: string;
  initialValue?: string;
  onSave?: () => void;
}

const TraitPromptSection: React.FC<TraitPromptSectionProps> = ({
  section,
  characterId,
  initialValue = '',
  onSave,
}) => {
  const [value, setValue] = useState(initialValue);
  const [originalValue, setOriginalValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { selectedProject } = useProjectStore();
  const { data: allCharacters = [] } = useCharacters(selectedProject?.id || '');
  const { generateFromTemplate, isLoading: isGenerating } = useLLM();

  // AI Suggestion Stream Hook
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    isStreaming,
    streamProgress,
    triggerSuggestions,
    clearSuggestions,
  } = useAISuggestionStream({
    projectId: selectedProject?.id || '',
    characterId,
    contextType: 'trait',
    fieldType: section.id,
    enabled: showSuggestions,
    debounceMs: 1500,
    minTextLength: 10,
  });

  const hasChanges = value !== originalValue;
  const maxLength = 2500;
  const isOverLimit = value.length > maxLength;

  useEffect(() => {
    if (initialValue !== originalValue) {
      setOriginalValue(initialValue);
      setValue(initialValue);
    }
  }, [initialValue, originalValue]);

  // Trigger suggestions on text change
  useEffect(() => {
    if (showSuggestions && value.trim().length >= 10) {
      triggerSuggestions(value);
    }
  }, [value, showSuggestions, triggerSuggestions]);

  const handleSave = async () => {
    if (!hasChanges || isOverLimit) return;

    setIsSaving(true);
    setError('');

    try {
      await traitApi.createTrait({
        character_id: characterId,
        type: section.id,
        description: value,
      });

      setOriginalValue(value);
      setSaved(true);
      if (onSave) onSave();

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save');
      console.error('Error saving trait:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSmartGenerate = async () => {
    if (!selectedProject) {
      setError('No active project');
      return;
    }

    setError('');

    try {
      // Gather rich context
      const [projectCtx, storyCtx, visualCtx, characterCtx] = await Promise.all([
        gatherProjectContext(selectedProject.id),
        gatherStoryContext(selectedProject.id),
        gatherVisualStyleContext(selectedProject.id),
        gatherCharacterContext(characterId),
      ]);

      // Get current character's name
      const currentCharacter = allCharacters.find((c: Character) => c.id === characterId);
      if (!currentCharacter) {
        setError('Character not found');
        return;
      }

      // Get other characters for context
      const otherCharacters = allCharacters.filter((c: Character) => c.id !== characterId);

      // Create focused prompt for this specific section
      const sectionPrompts: Record<string, string> = {
        background: `Create a detailed background for ${currentCharacter.name}. Focus on their history, origins, upbringing, and formative experiences that shaped who they are today.`,
        personality: `Describe ${currentCharacter.name}'s personality traits, behaviors, mannerisms, speech patterns, and how they typically interact with others.`,
        motivations: `What drives ${currentCharacter.name}? Describe their goals, desires, ambitions, fears, and what motivates them to act.`,
        strengths: `List and describe ${currentCharacter.name}'s strengths, abilities, skills, talents, and positive attributes in detail.`,
        weaknesses: `Describe ${currentCharacter.name}'s weaknesses, flaws, limitations, vulnerabilities, and struggles in detail.`,
        relationships: `Describe ${currentCharacter.name}'s important relationships and social connections. How do they relate to other characters in the story?`,
      };

      // Generate using smart character creation prompt
      const response = await generateFromTemplate(smartCharacterCreationPrompt, {
        characterName: currentCharacter.name,
        characterRole: currentCharacter.type,
        projectContext: projectCtx,
        storyContext: storyCtx,
        existingCharacters: otherCharacters,
        visualStyle: visualCtx,
        focusArea: section.id,
        specificRequest: sectionPrompts[section.id] || section.description,
      });

      if (response?.content) {
        // Extract the relevant section from the response
        // The LLM will return structured content, we need to parse it
        const content = response.content;

        // Try to find the specific section in the response
        const sectionKeywords: Record<string, string[]> = {
          background: ['background', 'history', 'origins', 'upbringing'],
          personality: ['personality', 'traits', 'behavior', 'mannerisms'],
          motivations: ['motivations', 'goals', 'desires', 'drives'],
          strengths: ['strengths', 'abilities', 'skills', 'talents'],
          weaknesses: ['weaknesses', 'flaws', 'limitations', 'vulnerabilities'],
          relationships: ['relationships', 'connections', 'social'],
        };

        // Simple extraction - in production you might want more sophisticated parsing
        let extractedContent = content;

        // If response has clear section markers, extract just that section
        const keywords = sectionKeywords[section.id] || [];
        for (const keyword of keywords) {
          const regex = new RegExp(`\\*\\*${keyword}[^\\*]*\\*\\*[:\\s]*([^\\n]+(?:\\n(?!\\*\\*)[^\\n]+)*)`, 'i');
          const match = content.match(regex);
          if (match && match[1]) {
            extractedContent = match[1].trim();
            break;
          }
        }

        // Clean up markdown formatting
        extractedContent = extractedContent
          .replace(/\*\*/g, '')
          .replace(/^#+\s/gm, '')
          .trim();

        setValue(extractedContent);
      }
    } catch (err) {
      setError('Failed to generate content');
      console.error('Error generating trait:', err);
    }
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    // Append or replace based on suggestion type
    if (value.trim().length === 0) {
      setValue(suggestion.suggestion);
    } else {
      // Smart insertion - add to end with proper spacing
      setValue(prev => {
        const trimmed = prev.trim();
        return `${trimmed}\n\n${suggestion.suggestion}`;
      });
    }
  };

  const handleToggleSuggestions = () => {
    if (showSuggestions) {
      clearSuggestions();
    }
    setShowSuggestions(prev => !prev);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Section Header */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                {section.icon}
                {section.title}
              </h3>
              <p className="text-sm text-gray-400">{section.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* AI Suggestions Toggle */}
              <IconButton
                icon={<Sparkles size={16} />}
                size="sm"
                variant={showSuggestions ? 'primary' : 'ghost'}
                onClick={handleToggleSuggestions}
                aria-label="Toggle AI suggestions"
                data-testid="toggle-ai-suggestions-btn"
                className={showSuggestions ? 'animate-pulse' : ''}
              />

              {/* Smart Generate Button */}
              <SmartGenerateButton
                onClick={handleSmartGenerate}
                isLoading={isGenerating}
                disabled={isGenerating}
                label="Auto-fill"
                size="sm"
                variant="ghost"
              />
            </div>
          </div>
        </div>

      {/* Rich Text Editor */}
      <RichTextEditor
        content={value}
        onChange={setValue}
        placeholder={section.placeholder}
        minHeight="250px"
        borderColor="blue"
      />

      {/* Save Button and Character Count */}
      <div className="flex items-center justify-between">
        <span
          className={`text-sm ${
            isOverLimit ? 'text-red-500 font-semibold' : 'text-gray-400'
          }`}
        >
          {value.length} / {maxLength} characters
          {isOverLimit && <span className="ml-2">Too long!</span>}
        </span>

        {error && <span className="text-sm text-red-500">{error}</span>}

        <AnimatePresence mode="wait">
          {hasChanges && !saved && (
            <motion.button
              key="save-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleSave}
              disabled={isSaving || isOverLimit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </motion.button>
          )}

          {saved && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              <Check size={16} />
              Saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>

    {/* AI Suggestion Sidebar */}
    <AnimatePresence>
      {showSuggestions && (
        <AISuggestionSidebar
          suggestions={suggestions}
          isLoading={isSuggestionsLoading}
          isStreaming={isStreaming}
          streamProgress={streamProgress}
          onApplySuggestion={handleApplySuggestion}
          onDismiss={handleToggleSuggestions}
          position="right"
        />
      )}
    </AnimatePresence>
  </>
  );
};

export default TraitPromptSection;

