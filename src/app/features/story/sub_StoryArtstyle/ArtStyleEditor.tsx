/**
 * ArtStyleEditor Component
 * Main editor for story art style with preset and custom modes
 */

'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/UI/Button';
import { ArtStylePresetSelector } from './components/ArtStylePresetSelector';
import { ArtStyleExtractor } from './components/ArtStyleExtractor';
import { ArtStyleSource } from './types';

interface ArtStyleEditorProps {
  projectId: string;
  initialStyleId?: string | null;
  initialCustomPrompt?: string | null;
  initialSource?: ArtStyleSource | null;
  initialExtractedImageUrl?: string | null;
  onSave?: (data: {
    artStyleId: string | null;
    customArtStylePrompt: string | null;
    artStyleSource: ArtStyleSource;
    extractedStyleImageUrl: string | null;
  }) => void;
}

export default function ArtStyleEditor({
  projectId,
  initialStyleId = 'adventure_journal',
  initialCustomPrompt = '',
  initialSource = 'preset',
  initialExtractedImageUrl = null,
  onSave,
}: ArtStyleEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>(
    initialSource === 'preset' ? 'preset' : 'custom'
  );

  // Local state for editing
  const [selectedStyleId, setSelectedStyleId] = useState(
    initialStyleId || 'adventure_journal'
  );
  const [customPrompt, setCustomPrompt] = useState(initialCustomPrompt || '');
  const [extractedImageUrl, setExtractedImageUrl] = useState<string | null>(
    initialExtractedImageUrl
  );
  const [artStyleSource, setArtStyleSource] = useState<ArtStyleSource>(
    initialSource || 'preset'
  );

  const handlePresetSelect = useCallback((styleId: string) => {
    setSelectedStyleId(styleId);
    setArtStyleSource('preset');
    setActiveTab('preset');
  }, []);

  const handleCustomPromptChange = useCallback((prompt: string) => {
    setCustomPrompt(prompt);
    setArtStyleSource('custom');
  }, []);

  const handleExtract = useCallback((imageUrl: string, prompt: string) => {
    setExtractedImageUrl(imageUrl);
    setCustomPrompt(prompt);
    setArtStyleSource('extracted');
  }, []);

  const handleClearCustom = useCallback(() => {
    setCustomPrompt('');
    setExtractedImageUrl(null);
    setArtStyleSource('preset');
    setActiveTab('preset');
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = {
        artStyleId: activeTab === 'preset' ? selectedStyleId : null,
        customArtStylePrompt: activeTab === 'custom' ? customPrompt : null,
        artStyleSource: activeTab === 'preset' ? 'preset' as const : artStyleSource,
        extractedStyleImageUrl:
          activeTab === 'custom' && artStyleSource === 'extracted'
            ? extractedImageUrl
            : null,
      };

      // Call API to save (mock for now - would need actual endpoint)
      // await fetch(`/api/projects/${projectId}/art-style`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      onSave?.(data);
      setSavedRecently(true);
      setTimeout(() => setSavedRecently(false), 2000);
    } catch (err) {
      console.error('Failed to save art style:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    (activeTab === 'preset' &&
      (selectedStyleId !== initialStyleId || initialSource !== 'preset')) ||
    (activeTab === 'custom' &&
      (customPrompt !== initialCustomPrompt || artStyleSource !== initialSource));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <Palette className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Story Art Style</h2>
          <p className="text-xs text-slate-500">
            This style applies to all scene images in your story
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
        <button
          onClick={() => setActiveTab('preset')}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
            activeTab === 'preset'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          )}
        >
          Preset Styles
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
            activeTab === 'custom'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          )}
        >
          Custom Style
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'preset' ? (
          <ArtStylePresetSelector
            selectedStyleId={selectedStyleId}
            onSelect={handlePresetSelect}
            disabled={isSaving}
          />
        ) : (
          <ArtStyleExtractor
            customPrompt={customPrompt}
            extractedImageUrl={extractedImageUrl}
            onExtract={handleExtract}
            onCustomPromptChange={handleCustomPromptChange}
            onClear={handleClearCustom}
            disabled={isSaving}
          />
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-500">
          {hasChanges ? 'Unsaved changes' : 'No changes'}
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          variant="primary"
          size="sm"
          loading={isSaving}
          icon={savedRecently ? <Check /> : <Save />}
        >
          {isSaving ? 'Saving...' : savedRecently ? 'Saved' : 'Save Style'}
        </Button>
      </div>
    </motion.div>
  );
}
