'use client';

import React, { useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../UI/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import Landing from '@/app/features/landing/Landing';
import CharacterSelectionBadge from '../UI/CharacterSelectionBadge';
import { useCharacterProjectSync } from '@/app/hooks/useCharacterProjectSync';

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
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const { selectedProject, showLanding } = useProjectStore();

  // Sync character state with project changes
  useCharacterProjectSync();

  // Show landing page if no project is selected or showLanding is true
  if (!selectedProject || showLanding) {
    return <Landing />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950">
      {/* Header with Character Selection Badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">
            {selectedProject?.title || 'Project'}
          </h1>
          <CharacterSelectionBadge />
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal">
          {/* Left Panel */}
          <ResizablePanel
            ref={leftPanelRef}
            defaultSize={20}
            minSize={15}
            maxSize={40}
            collapsible={true}
            collapsedSize={2}
            className="transition-all duration-300 ease-in-out"
          >
            <Suspense fallback={<LoadingPanel />}>
              <LeftPanel />
            </Suspense>
          </ResizablePanel>

          <ResizableHandle withHandle className="transition-opacity duration-200" />

          {/* Center Panel */}
          <ResizablePanel
            defaultSize={60}
            minSize={30}
            className="relative transition-all duration-300 ease-in-out"
          >
            <Suspense fallback={<LoadingPanel />}>
              <CenterPanel />
            </Suspense>
          </ResizablePanel>

          <ResizableHandle withHandle className="transition-opacity duration-200" />

          {/* Right Panel */}
          <ResizablePanel
            ref={rightPanelRef}
            defaultSize={20}
            minSize={15}
            maxSize={40}
            collapsible={true}
            collapsedSize={2}
            className="transition-all duration-300 ease-in-out"
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
