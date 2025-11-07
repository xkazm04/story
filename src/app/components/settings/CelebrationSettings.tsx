'use client';

import { useUserSettingsStore } from '@/app/store/slices/userSettingsSlice';
import { PartyPopper } from 'lucide-react';

export const CelebrationSettings = () => {
  const { celebrationsEnabled, setCelebrationsEnabled } = useUserSettingsStore();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
      <div className="flex items-center gap-3">
        <PartyPopper className="h-5 w-5 text-purple-400" />
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Beat Completion Celebrations</h3>
          <p className="text-xs text-gray-400">
            Show confetti and congratulations when completing a beat for the first time
          </p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={celebrationsEnabled}
          onChange={(e) => setCelebrationsEnabled(e.target.checked)}
          data-testid="celebration-toggle"
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
};
