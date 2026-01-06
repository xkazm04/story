'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Pencil, Image as ImageIcon } from 'lucide-react';
import ImageGenerator from './generator/ImageGenerator';
import ImageEditor from './editor/ImageEditor';
import SketchToImage from './sub_Sketch/SketchToImage';
import { TabButton } from '@/app/components/UI/TabButton';

type TabType = 'generator' | 'sketch' | 'editor';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'generator', label: 'Generator', icon: Sparkles },
  { id: 'sketch', label: 'Sketch', icon: Pencil },
  { id: 'editor', label: 'Editor', icon: ImageIcon },
];

const ImageFeature: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('generator');

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Tab Navigation */}
      <div className="flex gap-2 px-4 pt-3 pb-2 border-b border-slate-900/70 bg-slate-950/95">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            layoutId="activeImageTab"
            activeColor="bg-cyan-600/20 border border-cyan-500/40 text-slate-50"
            data-testid={`image-tab-${tab.id}`}
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
            {activeTab === 'generator' && <ImageGenerator />}
            {activeTab === 'sketch' && <SketchToImage />}
            {activeTab === 'editor' && <ImageEditor />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImageFeature;
