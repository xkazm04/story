/**
 * AppShell Component
 * Main application layout with resizable three-panel structure
 * Design: Clean Manuscript style - sans-serif fonts with monospace accents
 */

'use client';

import React, { useRef, Suspense, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../UI/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useAppShellStore } from '@/app/store/appShellStore';
import Landing from '@/app/features/landing/Landing';
import { useCharacterProjectSync } from '@/app/hooks/useCharacterProjectSync';
import AppShellHeader from './header/AppShellHeader';
import { WriterStudioBackground } from './header/WriterStudioThemes';
import { safePanelStorageAPI, DEFAULT_PANEL_SIZES } from '@/app/utils/safePanelStorage';
import PanelPresetOverlay from './PanelPresetOverlay';
import { PanelPreset } from '@/app/types/PanelPreset';

// Dynamic imports for better performance
const LeftPanel = dynamic(() => import('./LeftPanel'), {
  ssr: false,
  loading: () => <LoadingPanel />,
});

const CenterPanel = dynamic(() => import('./CenterPanel'), {
  ssr: false,
  loading: () => <LoadingPanel />,
});

const RightPanel = dynamic(() => import('./RightPanel'), {
  ssr: false,
  loading: () => <LoadingPanel />,
});

const V2Layout = dynamic(() => import('@/app/features/v2/layout/V2Layout'), {
  ssr: false,
  loading: () => <LoadingPanel />,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * LoadingPanel - Clean Manuscript style loading indicator
 * Uses monospace font for status text with cyan accent spinner
 */
const LoadingPanel = () => (
  <div className="h-full w-full flex items-center justify-center ms-surface">
    <div className="flex flex-col items-center gap-3">
      {/* Spinner with cyan accent */}
      <div className="relative">
        <div className="w-8 h-8 border-2 border-slate-700/50 rounded-full" />
        <div className="absolute inset-0 w-8 h-8 border-2 border-cyan-500/60 border-t-transparent rounded-full animate-spin" />
      </div>
      {/* Monospace status text */}
      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        loading_panel...
      </span>
    </div>
  </div>
);

const AppShellContent: React.FC = () => {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const centerPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const { selectedProject, showLanding } = useProjectStore();
  const layoutMode = useAppShellStore((s) => s.layoutMode);
  const [isResizing, setIsResizing] = useState(false);
  const [showPresetOverlay, setShowPresetOverlay] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync character state with project changes
  useCharacterProjectSync();

  // Handle dragging state change
  const handleDragging = useCallback((isDragging: boolean) => {
    if (isDragging) {
      setIsResizing(true);

      // Show overlay after 200ms of dragging (prevents accidental triggers)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        setShowPresetOverlay(true);
      }, 200);
    } else {
      // Drag ended
      setIsResizing(false);
      setShowPresetOverlay(false);

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    }
  }, []);

  // Handle preset selection - snap panels to preset sizes
  const handlePresetSelect = useCallback((preset: PanelPreset) => {
    // Animate panels to preset sizes
    leftPanelRef.current?.resize(preset.sizes.left);
    centerPanelRef.current?.resize(preset.sizes.center);
    rightPanelRef.current?.resize(preset.sizes.right);

    // Hide overlay
    setShowPresetOverlay(false);
    setIsResizing(false);

    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = null;
    }
  }, []);

  // Show landing page if no project is selected or showLanding is true
  if (!selectedProject || showLanding) {
    return <Landing />;
  }

  return (
    <div className="h-screen w-screen flex flex-col text-slate-100 relative overflow-hidden ms-notebook-bg">
      {/* Writer Studio Theme Background - Notebook pattern layer */}
      <WriterStudioBackground />

      {/* Header with Navigation */}
      <AppShellHeader />

      {layoutMode === 'v2' ? (
        /* V2 Dynamic Workspace */
        <V2Layout />
      ) : (
        /* V1 Classic Three-Panel Layout */
        <>
          {/* Panel Preset Overlay */}
          <PanelPresetOverlay
            isVisible={showPresetOverlay}
            onPresetSelect={handlePresetSelect}
          />

          {/* Main Panel Layout - Three-column resizable structure */}
          <ResizablePanelGroup
            direction="horizontal"
            storage={safePanelStorageAPI}
            autoSaveId="app-shell-panels"
            className="flex-1"
          >
            {/* Left Panel - Sidebar navigation */}
            <ResizablePanel
              ref={leftPanelRef}
              defaultSize={DEFAULT_PANEL_SIZES.left}
              minSize={15}
              maxSize={40}
              collapsible={true}
              collapsedSize={2}
              className="ms-transition-slow ms-panel ms-scrollbar"
              data-testid="left-panel"
            >
              <Suspense fallback={<LoadingPanel />}>
                <LeftPanel />
              </Suspense>
            </ResizablePanel>

            {/* Left-Center Handle - Styled via globals.css */}
            <ResizableHandle
              withHandle
              className="ms-transition"
              data-testid="left-center-handle"
              onDragging={handleDragging}
            />

            {/* Center Panel - Main content area */}
            <ResizablePanel
              ref={centerPanelRef}
              defaultSize={DEFAULT_PANEL_SIZES.center}
              minSize={30}
              className="relative ms-transition-slow ms-surface ms-scrollbar"
              data-testid="center-panel"
            >
              <Suspense fallback={<LoadingPanel />}>
                <CenterPanel />
              </Suspense>
            </ResizablePanel>

            {/* Center-Right Handle - Styled via globals.css */}
            <ResizableHandle
              withHandle
              className="ms-transition"
              data-testid="center-right-handle"
              onDragging={handleDragging}
            />

            {/* Right Panel - Properties/details sidebar */}
            <ResizablePanel
              ref={rightPanelRef}
              defaultSize={DEFAULT_PANEL_SIZES.right}
              minSize={15}
              maxSize={40}
              collapsible={true}
              collapsedSize={2}
              className="ms-transition-slow ms-panel ms-scrollbar"
              data-testid="right-panel"
            >
              <Suspense fallback={<LoadingPanel />}>
                <RightPanel />
              </Suspense>
            </ResizablePanel>
          </ResizablePanelGroup>
        </>
      )}
    </div>
  );
};

const AppShell: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShellContent />
    </QueryClientProvider>
  );
};

export default AppShell;
