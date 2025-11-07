'use client';

import React, { useRef, Suspense, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../UI/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import Landing from '@/app/features/landing/Landing';
import CharacterSelectionBadge from '../UI/CharacterSelectionBadge';
import { useCharacterProjectSync } from '@/app/hooks/useCharacterProjectSync';
import ActSelector from './header/ActSelector';
import SceneSelector from './header/SceneSelector';
import ProjectEditModal from '@/app/features/projects/sub_projectModal/ProjectEditModal';
import { Edit } from 'lucide-react';
import { IconButton } from '../UI/Button';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LoadingPanel = () => (
  <div className="h-full w-full flex items-center justify-center bg-gray-900">
    <div className="animate-pulse text-gray-400">Loading...</div>
  </div>
);

const AppShellContent: React.FC = () => {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const centerPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const { selectedProject, showLanding } = useProjectStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    <div className="h-screen w-screen flex flex-col bg-gray-950">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Project Name with Edit Button */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-white">
              {selectedProject?.name || 'Project'}
            </h1>
            <IconButton
              icon={<Edit size={14} />}
              size="sm"
              variant="ghost"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Edit project"
              title="Edit project details"
            />
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-700" />

          {/* Act Selector */}
          <ActSelector />

          {/* Scene Selector */}
          <SceneSelector />
        </div>

        {/* Right side - Character Selection */}
        <div className="flex items-center gap-4">
          <CharacterSelectionBadge />
        </div>
      </div>

      {/* Project Edit Modal */}
      <ProjectEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={selectedProject}
      />

      {/* Panel Preset Overlay */}
      <PanelPresetOverlay
        isVisible={showPresetOverlay}
        onPresetSelect={handlePresetSelect}
      />

      <ResizablePanelGroup
        direction="horizontal"
        storage={safePanelStorageAPI}
        autoSaveId="app-shell-panels"
      >
          {/* Left Panel */}
          <ResizablePanel
            ref={leftPanelRef}
            defaultSize={DEFAULT_PANEL_SIZES.left}
            minSize={15}
            maxSize={40}
            collapsible={true}
            collapsedSize={2}
            className="transition-all duration-300 ease-in-out"
            data-testid="left-panel"
          >
            <Suspense fallback={<LoadingPanel />}>
              <LeftPanel />
            </Suspense>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="transition-opacity duration-200"
            data-testid="left-center-handle"
            onDragging={handleDragging}
          />

          {/* Center Panel */}
          <ResizablePanel
            ref={centerPanelRef}
            defaultSize={DEFAULT_PANEL_SIZES.center}
            minSize={30}
            className="relative transition-all duration-300 ease-in-out"
            data-testid="center-panel"
          >
            <Suspense fallback={<LoadingPanel />}>
              <CenterPanel />
            </Suspense>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="transition-opacity duration-200"
            data-testid="center-right-handle"
            onDragging={handleDragging}
          />

          {/* Right Panel */}
          <ResizablePanel
            ref={rightPanelRef}
            defaultSize={DEFAULT_PANEL_SIZES.right}
            minSize={15}
            maxSize={40}
            collapsible={true}
            collapsedSize={2}
            className="transition-all duration-300 ease-in-out"
            data-testid="right-panel"
          >
            <Suspense fallback={<LoadingPanel />}>
              <RightPanel />
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
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
