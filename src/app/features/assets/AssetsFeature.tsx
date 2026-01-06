'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FolderOpen } from 'lucide-react';
import { UploaderPanel } from './components/uploader';
import { ManagerPanel } from './components/manager';

type AssetTab = 'uploader' | 'manager';

const TABS = [
  {
    id: 'uploader' as const,
    label: 'Image Uploader',
    icon: Upload,
    description: 'Upload and analyze images with AI',
  },
  {
    id: 'manager' as const,
    label: 'Asset Manager',
    icon: FolderOpen,
    description: 'Browse and manage your asset library',
  },
];

const AssetsFeature = () => {
  const [activeTab, setActiveTab] = useState<AssetTab>('uploader');

  return (
    <div className="h-full w-full flex flex-col bg-slate-950">
      {/* Tab navigation */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-3 pb-2 border-b border-slate-900/70 bg-slate-950/95">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                transition-all duration-150 min-w-[110px] text-[11px]
                ${
                  isActive
                    ? 'bg-cyan-600/20 text-slate-50 border border-cyan-500/40 shadow-[0_0_0_1px_rgba(8,145,178,0.28)]'
                    : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100'
                }
              `}
              data-testid={`assets-tab-${tab.id}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeTab === 'uploader' && (
            <div className="h-full overflow-auto p-4">
              <div className="max-w-2xl mx-auto">
                <UploaderPanel />
              </div>
            </div>
          )}

          {activeTab === 'manager' && (
            <ManagerPanel className="h-full" />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AssetsFeature;
