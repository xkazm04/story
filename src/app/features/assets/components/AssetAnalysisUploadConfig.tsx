'use client';

import { useCallback } from "react";
import { AssetTabConfig } from "../AssetsFeature";
import AssetConfigItem from "./AssetConfigItem";

type Props = {
    config: AssetTabConfig;
    setConfig: React.Dispatch<React.SetStateAction<AssetTabConfig>>;
}

const AssetAnalysisUploadConfig = ({ config, setConfig }: Props) => {
    const handleUpdateConfig = useCallback((
        model: keyof AssetTabConfig, 
        enabled: boolean, 
        apiKey: string
    ) => {
        setConfig((prev: AssetTabConfig) => ({
            ...prev,
            [model]: {
            ...prev[model],
            enabled,
            apiKey
            }
        }));
    }, [setConfig]);

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 min-w-[400px] mt-2">
            <h3 className="text-sm font-medium text-gray-200">Model provider configuration</h3>
            <div className="flex flex-col gap-4 mt-4">
                <AssetConfigItem 
                    tooltip="llama-4-scout-17b-16e-instruct"
                    model="groq" 
                    config={config} 
                    onUpdateConfig={handleUpdateConfig} 
                />
                <AssetConfigItem 
                    tooltip="gemini-flash-latest"
                    model="gemini" 
                    config={config} 
                    onUpdateConfig={handleUpdateConfig} 
                />
            </div>
        </div>
    );
};

export default AssetAnalysisUploadConfig;

