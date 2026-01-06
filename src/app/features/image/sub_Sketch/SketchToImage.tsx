"use client";

import React, { useState } from "react";
import { Pencil, Sparkles, Zap } from "lucide-react";
import { Button } from "@/app/components/UI/Button";
import { Card } from "@/app/components/UI/Card";
import PromptMapGpt from "./components/PromptMapGpt";
import PromptMapClaude from "./components/PromptMapClaude";
import PromptLaboratory from "./components/PromptLaboratory";

type PromptMapMode = 'gpt' | 'claude' | 'lab' | null;

const SketchToImage: React.FC = () => {
  const [promptMapMode, setPromptMapMode] = useState<PromptMapMode>(null);
  const [composedPrompt, setComposedPrompt] = useState("");

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold tracking-tight text-slate-50">
              Sketch to Image
            </h3>
            <p className="text-[11px] text-slate-500">
              Combine hand-drawn sketches with AI-assisted prompts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant={promptMapMode === 'gpt' ? "primary" : "secondary"}
            className="h-7 px-2 text-[11px]"
            onClick={() => setPromptMapMode(prev => prev === 'gpt' ? null : 'gpt')}
            data-testid="sketch-prompt-mode-gpt-btn"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {promptMapMode === 'gpt' ? "Hide" : "Gpt"}
          </Button>

          <Button
            size="xs"
            variant={promptMapMode === 'claude' ? "primary" : "secondary"}
            className="h-7 px-2 text-[11px]"
            onClick={() => setPromptMapMode(prev => prev === 'claude' ? null : 'claude')}
            data-testid="sketch-prompt-mode-claude-btn"
          >
            <Zap className="w-3 h-3 mr-1" />
            {promptMapMode === 'claude' ? "Hide" : "Claude"}
          </Button>

          <Button
            size="xs"
            variant={promptMapMode === 'lab' ? "primary" : "secondary"}
            className="h-7 px-2 text-[11px] bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30"
            onClick={() => setPromptMapMode(prev => prev === 'lab' ? null : 'lab')}
            data-testid="sketch-prompt-mode-lab-btn"
          >
            <span className="mr-1">🧪</span>
            {promptMapMode === 'lab' ? "Hide" : "Lab"}
          </Button>
        </div>
      </div>

      {/* Prompt map full-width on top */}
      <Card className="flex flex-col bg-slate-950/80 border-slate-900/80 overflow-hidden">
        {promptMapMode === 'gpt' ? (
          <PromptMapGpt onPromptChange={setComposedPrompt} />
        ) : promptMapMode === 'claude' ? (
          <PromptMapClaude onPromptChange={setComposedPrompt} />
        ) : promptMapMode === 'lab' ? (
          <PromptLaboratory onPromptChange={setComposedPrompt} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-[11px] text-slate-500 px-4 py-6">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-cyan-400/70" />
              <Zap className="w-8 h-8 text-purple-400/70" />
              <span className="text-3xl">🧪</span>
            </div>
            <p className="max-w-md text-center">
              Try <span className="font-semibold text-slate-300">Gpt</span>,{" "}
              <span className="font-semibold text-purple-300">Claude</span>, or the{" "}
              <span className="font-semibold text-cyan-300">Lab</span> to compose prompts
              with different visual builders and smart features.
            </p>
          </div>
        )}

        {composedPrompt && (
          <div className="border-t border-slate-900/80 bg-slate-950/90 px-3 py-2 text-[11px] text-slate-300">
            <span className="text-slate-500 mr-1">Current prompt:</span>
            <span className="text-slate-100 line-clamp-2">{composedPrompt}</span>
          </div>
        )}
      </Card>

      {/* Sketch workspace below, full width */}
      <Card className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 border-slate-900/80 text-slate-500 min-h-[160px]">
        <Pencil className="w-10 h-10 mb-3 opacity-60" />
        <p className="text-xs max-w-xs text-center">
          Sketch canvas coming soon. You&apos;ll be able to draw silhouettes and
          structural guides to pair with your AI-crafted prompts.
        </p>
      </Card>
    </div>
  );
};

export default SketchToImage;
