'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

const ImageEditor: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-gray-500">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">Image Editor</h3>
        <p className="text-sm max-w-md">
          Edit, upscale, and transform your generated images with advanced tools.
          <br />
          <span className="text-xs text-gray-600 mt-2 block">
            (Implementation coming in Phase 3B)
          </span>
        </p>
      </div>
    </div>
  );
};

export default ImageEditor;
