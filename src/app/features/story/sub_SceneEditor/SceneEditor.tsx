/**
 * SceneEditor Component
 * Main editor for story scene content with split view mode
 * Design: Clean Manuscript style with monospace accents
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneEditor } from '@/contexts/SceneEditorContext';
import { cn } from '@/lib/utils';
import {
  FileText,
  Sparkles,
  SplitSquareHorizontal,
  Columns,
  ImageIcon,
  GripVertical,
  Keyboard,
} from 'lucide-react';
import { ContentSection } from './components/ContentSection';
import { SceneSketchPanel } from './components/SceneSketchPanel';

type LayoutMode = 'stacked' | 'split';

// Split pane resize handle
function ResizeHandle({
  onResize,
}: {
  onResize: (delta: number) => void;
}) {
  const handleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      onResize(delta);
      startX.current = e.clientX;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize]);

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className={cn(
        'w-2 shrink-0 cursor-col-resize flex items-center justify-center',
        'bg-slate-800 hover:bg-cyan-500/30 transition-colors group'
      )}
    >
      <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-cyan-400" />
    </div>
  );
}

// Keyboard shortcuts hint
function KeyboardHint() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-500 font-mono">
      <Keyboard className="w-3 h-3" />
      <span>
        <kbd className="px-1.5 py-0.5 bg-slate-700/80 rounded-md text-cyan-400 font-mono text-[10px] border border-slate-600/50">Ctrl+\\</kbd>
        <span className="ml-1.5">Toggle split view</span>
      </span>
    </div>
  );
}

export default function SceneEditor() {
  const { currentScene, projectId, scenes, updateScene } = useSceneEditor();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('stacked');
  const [splitRatio, setSplitRatio] = useState(50); // percentage

  // Handler for audio URL changes
  const handleAudioUrlChange = useCallback(
    (url: string | null) => {
      if (currentScene) {
        updateScene(currentScene.id, { audio_url: url || undefined });
      }
    },
    [currentScene, updateScene]
  );

  // Handler for image selection from sketch panel
  const handleImageSelect = useCallback(
    (url: string, prompt?: string) => {
      if (currentScene) {
        updateScene(currentScene.id, {
          image_url: url,
          image_prompt: prompt,
        });
      }
    },
    [currentScene, updateScene]
  );

  // Handler for removing image
  const handleRemoveImage = useCallback(() => {
    if (currentScene) {
      updateScene(currentScene.id, {
        image_url: undefined,
        image_prompt: undefined,
      });
    }
  }, [currentScene, updateScene]);

  // Resize handler
  const handleResize = useCallback((delta: number) => {
    setSplitRatio(prev => {
      const containerWidth = window.innerWidth * 0.9; // approximate
      const percentDelta = (delta / containerWidth) * 100;
      return Math.min(80, Math.max(20, prev + percentDelta));
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '\\') {
        e.preventDefault();
        setLayoutMode(prev => prev === 'stacked' ? 'split' : 'stacked');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!projectId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex items-center justify-center bg-slate-950 text-slate-400"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 mb-4">
            <FileText className="w-8 h-8 text-slate-700" />
          </div>
          <p className="text-sm">No project selected</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header with Layout Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 border-b border-slate-800/70 bg-slate-900/80 backdrop-blur-sm px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="font-mono font-medium uppercase tracking-wide">// scene_editor</span>
              {currentScene && (
                <span className="text-slate-500 font-normal normal-case">/ {currentScene.name || 'Untitled'}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <KeyboardHint />

            {/* Layout Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
              <button
                onClick={() => setLayoutMode('stacked')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all uppercase tracking-wide',
                  layoutMode === 'stacked'
                    ? 'bg-slate-700 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                )}
                title="Stacked layout"
              >
                <Columns className="w-3.5 h-3.5" />
                Stack
              </button>
              <button
                onClick={() => setLayoutMode('split')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all uppercase tracking-wide',
                  layoutMode === 'split'
                    ? 'bg-slate-700 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                )}
                title="Split view"
              >
                <SplitSquareHorizontal className="w-3.5 h-3.5" />
                Split
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-950 pointer-events-none" />

        <AnimatePresence mode="wait">
          {currentScene ? (
            layoutMode === 'split' ? (
              // Split View
              <motion.div
                key="split"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex relative"
              >
                {/* Left: Text Content */}
                <div
                  className="h-full overflow-y-auto"
                  style={{ width: `${splitRatio}%` }}
                >
                  <div className="p-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-900/80 rounded-xl border border-slate-800/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm"
                    >
                      <ContentSection
                        sceneId={currentScene.id}
                        projectId={projectId}
                        initialName={currentScene.name || ''}
                        initialContent={currentScene.content || ''}
                        initialDescription={currentScene.description || ''}
                        audioUrl={currentScene.audio_url}
                        onAudioUrlChange={handleAudioUrlChange}
                        showImagePanel={false}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Resize Handle */}
                <ResizeHandle onResize={handleResize} />

                {/* Right: Image Content */}
                <div
                  className="h-full overflow-y-auto"
                  style={{ width: `${100 - splitRatio}%` }}
                >
                  <div className="p-6">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-900/80 rounded-xl border border-slate-800/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-medium text-slate-300">Scene Image</h3>
                      </div>

                      {/* Current Image Preview */}
                      {currentScene.image_url && (
                        <div className="relative rounded-lg overflow-hidden mb-4 border border-slate-700">
                          <img
                            src={currentScene.image_url}
                            alt={currentScene.name || 'Scene image'}
                            className="w-full h-auto"
                          />
                        </div>
                      )}

                      <SceneSketchPanel
                        storyContent={currentScene.content || ''}
                        imageUrl={currentScene.image_url ?? null}
                        imagePrompt={currentScene.image_prompt ?? null}
                        onImageSelect={handleImageSelect}
                        onRemoveImage={handleRemoveImage}
                        isSaving={false}
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Stacked View
              <motion.div
                key={`scene-${currentScene.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto relative"
              >
                <div className="max-w-4xl mx-auto p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/80 rounded-xl border border-slate-800/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm"
                  >
                    <ContentSection
                      sceneId={currentScene.id}
                      projectId={projectId}
                      initialName={currentScene.name || ''}
                      initialContent={currentScene.content || ''}
                      initialDescription={currentScene.description || ''}
                      audioUrl={currentScene.audio_url}
                      onAudioUrlChange={handleAudioUrlChange}
                      imageUrl={currentScene.image_url}
                      imagePrompt={currentScene.image_prompt}
                      onImageSelect={handleImageSelect}
                      onRemoveImage={handleRemoveImage}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center text-slate-400 relative"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4"
                >
                  <Sparkles className="w-8 h-8 text-slate-600" />
                </motion.div>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-lg mb-2 text-slate-300">No scene selected</p>
                  <p className="text-sm text-slate-500">
                    Select a scene from the Graph tab or create a new one
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
