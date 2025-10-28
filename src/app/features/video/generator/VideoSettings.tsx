'use client';

import React from 'react';
import { VIDEO_RESOLUTIONS, VIDEO_FPS_OPTIONS, VIDEO_DURATIONS, VIDEO_STYLES, MOTION_PRESETS } from '@/app/types/Video';

interface VideoParams {
  width: number;
  height: number;
  duration: number;
  fps: number;
  motion_strength: number;
  style: string;
  provider: 'runway' | 'pika' | 'stable-video' | 'deforum' | 'local';
}

interface VideoSettingsProps {
  params: VideoParams;
  onChange: (params: VideoParams) => void;
}

const providers = [
  { value: 'runway' as const, label: 'Runway ML' },
  { value: 'pika' as const, label: 'Pika Labs' },
  { value: 'stable-video' as const, label: 'Stable Video' },
  { value: 'local' as const, label: 'Local (Deforum)' },
];

const VideoSettings: React.FC<VideoSettingsProps> = ({ params, onChange }) => {
  const handleChange = (field: keyof VideoParams, value: number | string) => {
    onChange({
      ...params,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Resolution */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Resolution
        </label>
        <div className="grid grid-cols-3 gap-2">
          {VIDEO_RESOLUTIONS.map((res) => {
            const isSelected = params.width === res.width && params.height === res.height;
            return (
              <button
                key={res.name}
                onClick={() => {
                  handleChange('width', res.width);
                  handleChange('height', res.height);
                }}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                {res.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Duration
        </label>
        <div className="grid grid-cols-5 gap-2">
          {VIDEO_DURATIONS.map((dur) => {
            const isSelected = params.duration === dur.value;
            return (
              <button
                key={dur.value}
                onClick={() => handleChange('duration', dur.value)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                {dur.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* FPS */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Frame Rate
        </label>
        <div className="grid grid-cols-3 gap-2">
          {VIDEO_FPS_OPTIONS.map((fps) => {
            const isSelected = params.fps === fps.value;
            return (
              <button
                key={fps.value}
                onClick={() => handleChange('fps', fps.value)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                {fps.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Visual Style
        </label>
        <select
          value={params.style}
          onChange={(e) => handleChange('style', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {VIDEO_STYLES.map((style) => (
            <option key={style.name} value={style.name.toLowerCase()}>
              {style.name}
            </option>
          ))}
        </select>
      </div>

      {/* Motion Strength */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Motion Strength: {params.motion_strength.toFixed(1)}
        </label>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {MOTION_PRESETS.map((preset) => {
            const isSelected = Math.abs(params.motion_strength - preset.strength) < 0.1;
            return (
              <button
                key={preset.name}
                onClick={() => handleChange('motion_strength', preset.strength)}
                className={`
                  px-2 py-1 rounded text-xs font-medium
                  transition-colors duration-200
                  ${isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
                title={preset.description}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={params.motion_strength}
          onChange={(e) => handleChange('motion_strength', parseFloat(e.target.value))}
          className="w-full accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Static</span>
          <span>Intense</span>
        </div>
      </div>

      {/* Provider */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Provider
        </label>
        <select
          value={params.provider}
          onChange={(e) => handleChange('provider', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {providers.map((provider) => (
            <option key={provider.value} value={provider.value}>
              {provider.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VideoSettings;
