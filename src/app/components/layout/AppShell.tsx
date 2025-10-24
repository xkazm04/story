'use client';

import React, { useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../UI/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { useProjectStore } from '@/app/store/projectStore';
import Landing from '@/app/features/landing/Landing';

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

  // Show landing page if no project is selected or showLanding is true
  if (!selectedProject || showLanding) {
    return <Landing />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950">
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
