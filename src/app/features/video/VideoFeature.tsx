'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Video, Clapperboard } from 'lucide-react';
import VideoGenerator from './generator/VideoGenerator';
import StoryboardEditor from './storyboard/StoryboardEditor';
import { TabButton } from '@/app/components/UI/TabButton';

type TabType = 'generator' | 'storyboard';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'generator', label: 'Generator', icon: Video },
  { id: 'storyboard', label: 'Storyboard', icon: Clapperboard },
];

const VideoFeature: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('generator');

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-4 border-b border-gray-800">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            layoutId="activeVideoTab"
            activeColor="bg-purple-600"
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'generator' && <VideoGenerator />}
            {activeTab === 'storyboard' && <StoryboardEditor />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoFeature;
