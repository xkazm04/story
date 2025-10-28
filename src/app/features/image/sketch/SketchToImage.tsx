'use client';

import React from 'react';
import { Pencil } from 'lucide-react';

const SketchToImage: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-gray-500">
        <Pencil className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">Sketch to Image</h3>
        <p className="text-sm max-w-md">
          Draw or upload a sketch and convert it to a detailed image.
          <br />
          <span className="text-xs text-gray-600 mt-2 block">
            (Implementation coming in Phase 3B)
          </span>
        </p>
      </div>
    </div>
  );
};

export default SketchToImage;
