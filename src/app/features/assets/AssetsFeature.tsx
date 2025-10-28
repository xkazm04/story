'use client';

import { useState } from "react";
import AssetAnalysisUpload from "./components/AssetAnalysisUpload";
import { Asset } from "@/app/types/Asset";

export interface AssetTabConfig {
  gemini: {
    apiKey: string;
    enabled: boolean;
    reference_url: string;
  };
  groq: {
    apiKey: string;
    enabled: boolean;
    reference_url: string;
  };
}

const AssetsFeature = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [geminiAssets, setGeminiAssets] = useState<Asset[]>([]);
  const [groqAssets, setGroqAssets] = useState<Asset[]>([]);
  const [config, setConfig] = useState({
    gemini: {
      apiKey: "",
      enabled: false,
      reference_url: "https://ai.google.dev/gemini-api/docs/api-key" 
    },
    groq: {
      apiKey: "",
      enabled: true,
      reference_url: "https://console.groq.com/docs/models"
    },
  });

  return (
    <div className="flex flex-row w-full h-full p-4 gap-10 justify-start flex-wrap lg:flex-nowrap">
      <AssetAnalysisUpload
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setGroqAssets={setGroqAssets}
        setGeminiAssets={setGeminiAssets}
        config={config}
        setConfig={setConfig}
      />
      {/* AssetAnalysisResult component descoped - will be redesigned in the future */}
      {(geminiAssets.length > 0 || groqAssets.length > 0) && (
        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Analysis Results</h3>
          <div className="text-gray-400 text-sm">
            <p>Results component will be implemented here.</p>
            {groqAssets.length > 0 && (
              <p className="mt-2">Groq: {groqAssets.length} assets detected</p>
            )}
            {geminiAssets.length > 0 && (
              <p>Gemini: {geminiAssets.length} assets detected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsFeature;

