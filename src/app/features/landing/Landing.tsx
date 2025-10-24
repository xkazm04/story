'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Inter } from 'next/font/google';
import BackgroundPattern from '@/app/components/animation/BackgroundPattern';
import LandingMenu from './components/LandingMenu';
import ColoredBorder from '@/app/components/UI/ColoredBorder';
import { PlusIcon } from 'lucide-react';
import { LogoSvg } from '@/app/components/icons/Logo';
import StepperLayout from './components/FirstProject/StepperLayout';
import LandingProjectCreate from './components/LandingProjectCreate';
import { MOCK_USER_ID } from '@/app/config/mockUser';
import { projectApi } from '@/app/api/projects';
import LandingCard from './components/LandingCard';

const inter = Inter({ subsets: ['latin'] });

interface Props {
  userId?: string;
}

const Landing: React.FC<Props> = ({
  userId = MOCK_USER_ID
}) => {
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { data: projects, refetch } = projectApi.useUserProjects(userId);
  const [showGuide, setShowGuide] = useState(false);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettingsPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);


  return (
    <div className={`bg-dark-base text-gray-200 min-h-screen overflow-x-hidden z-10 ${inter.className}`}>
      <BackgroundPattern numLines={15} colorScheme="mixed" />
      <div className='absolute top-0 opacity-10 z-0'>
        <LogoSvg size={244} color={'white'} />
      </div>
      <header className="flex justify-between items-center px-8 py-6 fixed right-0 gap-5 z-50">
        <div className="text-2xl font-bold text-white flex flex-row justify-center w-full">
          <div>Studio<span className="bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent font-mono leading-relaxed">Story</span>
          </div>
        </div>
        <div className="flex gap-4">
          {/* Settings button with popover toggle */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettingsPopover(!showSettingsPopover)}
              className="w-10 h-10 bg-white/5 border border-white/10 text-white rounded-lg flex items-center justify-center transition hover:bg-white/10 hover:border-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82"></path>
              </svg>
            </button>
            {showSettingsPopover && (
              <div className="absolute top-12 right-0 w-72 bg-dark-base/90 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-2xl z-30 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold m-0">Writer Resources</h2>
                  <button onClick={() => setShowSettingsPopover(false)} className="text-white/50 text-xl">&times;</button>
                </div>
                <ColoredBorder />
                <LandingMenu />
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="px-8 py-1 max-w-7xl mx-auto z-10">
        {projects && projects.length < 8 && (
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-12">
          {!showGuide && <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-800 text-white px-5 py-3 rounded-lg font-medium transition 
            hover:brightness-110 hover:shadow-lg active:scale-95 cursor-pointer"
            onClick={() => setShowGuide(true)}
          >
            <PlusIcon />
            New Project
          </button>}
        </div>
      )}
      {showGuide && <StepperLayout setShowGuide={setShowGuide} userId={userId} />}
        {/* Projects grid */}
        {!showGuide && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Suspense fallback={
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2 text-white/70">Loading projects...</p>
            </div>
          }>
            {projects && projects.length > 0 ? (
              projects.map((project, index) => (
                <LandingCard key={`project-${index}`} project={project} index={index} onUpdate={refetch} />
              ))
            ) : (
              <LandingProjectCreate userId={userId} onProjectCreated={refetch} />
            )}
          </Suspense>
        </div>}
      </div>
    </div>
  );
};

export default Landing;

