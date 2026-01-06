'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles } from 'lucide-react';
import type { AnalysisConfig } from '../../types';

interface ModelConfigPanelProps {
  config: AnalysisConfig;
  onConfigChange: (config: AnalysisConfig) => void;
}

interface ModelChipProps {
  name: string;
  label: string;
  enabled: boolean;
  tooltip?: string;
  referenceUrl?: string;
  onToggle: (enabled: boolean) => void;
}

const ModelChip = memo(function ModelChip({
  name,
  label,
  enabled,
  tooltip,
  referenceUrl,
  onToggle,
}: ModelChipProps) {
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onToggle(!enabled)}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
          border transition-all duration-200
          ${
            enabled
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
              : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:border-slate-600'
          }
        `}
        title={tooltip}
        data-testid={`model-toggle-${name}`}
      >
        {enabled && <Sparkles className="w-3 h-3" />}
        {label}
      </motion.button>

      {referenceUrl && (
        <a
          href={referenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          title="API documentation"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
});

const MODEL_CONFIG = [
  {
    name: 'groq',
    label: 'Groq',
    tooltip: 'llama-4-scout-17b-16e-instruct',
    referenceUrl: 'https://console.groq.com/docs/models',
  },
  {
    name: 'gemini',
    label: 'Gemini',
    tooltip: 'gemini-flash-latest',
    referenceUrl: 'https://ai.google.dev/gemini-api/docs/api-key',
  },
  {
    name: 'openai',
    label: 'OpenAI',
    tooltip: 'gpt-4-vision (coming soon)',
    referenceUrl: 'https://platform.openai.com/docs/guides/vision',
  },
] as const;

export default function ModelConfigPanel({
  config,
  onConfigChange,
}: ModelConfigPanelProps) {
  const handleToggle = (model: keyof AnalysisConfig) => (enabled: boolean) => {
    onConfigChange({
      ...config,
      [model]: { enabled },
    });
  };

  const enabledCount = Object.values(config).filter((m) => m.enabled).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">AI Models</span>
        <span className="text-[10px] text-slate-500">
          {enabledCount} enabled
        </span>
      </div>

      {/* Model chips */}
      <div className="flex flex-wrap items-center gap-2">
        {MODEL_CONFIG.map((model) => (
          <ModelChip
            key={model.name}
            name={model.name}
            label={model.label}
            enabled={config[model.name as keyof AnalysisConfig]?.enabled || false}
            tooltip={model.tooltip}
            referenceUrl={model.referenceUrl}
            onToggle={handleToggle(model.name as keyof AnalysisConfig)}
          />
        ))}
      </div>

      {/* Validation message */}
      {enabledCount === 0 && (
        <p className="text-[11px] text-amber-400/80">
          Enable at least one model to analyze
        </p>
      )}
    </div>
  );
}
