'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wand2, ImageIcon } from 'lucide-react';
import DropzoneCard from './DropzoneCard';
import ModelConfigPanel from './ModelConfigPanel';
import AnalysisResultsPanel from './AnalysisResultsPanel';
import { CollapsibleSection } from '@/app/components/UI/CollapsibleSection';
import { Button } from '@/app/components/UI/Button';
import type { AnalysisConfig, AnalysisResult, DEFAULT_ANALYSIS_CONFIG } from '../../types';

interface UploaderPanelProps {
  className?: string;
}

export default function UploaderPanel({ className = '' }: UploaderPanelProps) {
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Config state
  const [config, setConfig] = useState<AnalysisConfig>({
    gemini: { enabled: false },
    groq: { enabled: true },
    openai: { enabled: false },
  });

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setResults([]);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setResults([]);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    const enabledModels = Object.entries(config).filter(([, v]) => v.enabled);
    if (enabledModels.length === 0) {
      setError('Please enable at least one AI model');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('config', JSON.stringify(config));

      const response = await fetch('/api/asset-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform response to AnalysisResult array
      const analysisResults: AnalysisResult[] = [];

      if (data.gemini) {
        analysisResults.push({
          model: 'gemini',
          assets: data.gemini.assets || [],
          processingTime: data.gemini.processingTime || 0,
          error: data.gemini.error,
        });
      }

      if (data.groq) {
        analysisResults.push({
          model: 'groq',
          assets: data.groq.assets || [],
          processingTime: data.groq.processingTime || 0,
          error: data.groq.error,
        });
      }

      setResults(analysisResults);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile, config]);

  const canAnalyze =
    selectedFile && Object.values(config).some((m) => m.enabled) && !isAnalyzing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col gap-4 ${className}`}
    >
      {/* Main card with gradient background */}
      <div
        className="relative p-5 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
          border border-slate-800/70 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-medium text-slate-100">Image Analysis</h2>
        </div>

        {/* Dropzone */}
        <DropzoneCard
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onClear={handleClear}
          isDisabled={isAnalyzing}
        />

        {/* Model configuration - collapsible */}
        <div className="mt-4">
          <CollapsibleSection
            title="Model Configuration"
            defaultOpen={true}
            compact
          >
            <div className="pt-3">
              <ModelConfigPanel config={config} onConfigChange={setConfig} />
            </div>
          </CollapsibleSection>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Analyze button */}
        <div className="mt-5">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            data-testid="analyze-button"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Analyze Image
              </>
            )}
          </Button>
        </div>

        {/* Results panel */}
        <AnalysisResultsPanel results={results} isLoading={isAnalyzing} />
      </div>
    </motion.div>
  );
}
