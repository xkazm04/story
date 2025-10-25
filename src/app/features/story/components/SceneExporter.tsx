'use client';

import { useState } from "react";

const SceneExporter = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Subtitle configuration
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontColor, setFontColor] = useState("FFFFFF");
  const [fontSize, setFontSize] = useState(24);
  const [bgColor, setBgColor] = useState("000000");

  // Quality configuration
  const [quality, setQuality] = useState("medium");
  const [resolution, setResolution] = useState("1280x720");
  const [bitrate, setBitrate] = useState("1500k");

  // Animation configuration
  const [transitionType, setTransitionType] = useState("fade");
  const [transitionDuration, setTransitionDuration] = useState(3.0);

  const handleExport = () => {
    setIsExporting(true);
    setError(null);
    
    // Placeholder for export logic
    setTimeout(() => {
      setIsExporting(false);
      setError("Export functionality coming soon");
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="p-6 bg-gray-950/40 text-white flex flex-col gap-4 rounded-lg border border-gray-800 mb-4">
        <h2 className="text-xl font-semibold text-blue-400">Scene Exporter</h2>
        <p className="text-gray-400 text-sm">
          Configure and export your scenes as video files
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Subtitle Configuration */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Subtitles</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Font Family</label>
                <select 
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                >
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Font Size: {fontSize}px</label>
                <input 
                  type="range" 
                  min="16" 
                  max="48" 
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Quality Configuration */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Quality</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Resolution</label>
                <select 
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                >
                  <option>1280x720</option>
                  <option>1920x1080</option>
                  <option>3840x2160</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Quality</label>
                <select 
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exporting...' : 'Export Video'}
        </button>

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        {videoUrl && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Generated Video:</h2>
            <video src={videoUrl} controls width="640" className="mb-4 rounded-lg" />
            <a href={videoUrl} download="final_video.mp4" className="text-blue-400 hover:underline text-sm">
              Download Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default SceneExporter;


