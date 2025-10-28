'use client';

import React from 'react';
import { Clapperboard } from 'lucide-react';

const StoryboardEditor: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-gray-500">
        <Clapperboard className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">Storyboard Editor</h3>
        <p className="text-sm max-w-md">
          Create shot-by-shot storyboards from scenes and generate videos for each frame.
          <br />
          <span className="text-xs text-gray-600 mt-2 block">
            (Advanced storyboard features coming in future updates)
          </span>
        </p>
      </div>
    </div>
  );
};

export default StoryboardEditor;
