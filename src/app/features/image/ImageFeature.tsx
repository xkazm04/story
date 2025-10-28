'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Pencil, Image as ImageIcon } from 'lucide-react';
import ImageGenerator from './generator/ImageGenerator';
import ImageEditor from './editor/ImageEditor';
import SketchToImage from './sketch/SketchToImage';

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
    <div className="h-full flex flex-col bg-gray-950">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-4 border-b border-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg
                transition-all duration-200
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 rounded-lg -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
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
