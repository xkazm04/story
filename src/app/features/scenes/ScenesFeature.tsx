'use client';

import { useProjectStore } from "@/app/store/slices/projectSlice";
import TabMenu from "@/app/components/UI/TabMenu";
import { BannerProvider } from "@/app/components/UI/BannerContext";
import SmartBanner from "@/app/components/UI/SmartBanner";
import ScriptEditor from "./components/Script/ScriptEditor";
import { ArrowLeft } from "lucide-react";

const ScenesFeature = () => {
    const { selectedSceneId, selectedScene } = useProjectStore();
    const tabs = [
        {
            id: "scene-editor",
            label: "Script Editor",
            content: <ScriptEditor />
        },
        {
            id: "character-relationships",
            label: "Relationships",
            content: (
                <div className="text-center py-10 text-gray-400">
                    Character Relationships - Coming soon
                </div>
            )
        },
        {
            id: "scene-impact",
            label: "Impact",
            content: (
                <div className="text-center py-10 text-gray-400">
                    Scene Impact Analysis - Coming soon
                </div>
            )
        }
    ];

    return (
        <BannerProvider>
            <div className="h-full w-full flex flex-col">
                <SmartBanner />

                {!selectedScene ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-400 flex items-center gap-2 justify-center">
                                <ArrowLeft className="w-5 h-5" />
                                Select a scene to display content
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-4">
                        {selectedScene && (
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-white">{selectedScene.name || 'Untitled Scene'}</h2>
                                <p className="text-sm text-gray-400">{selectedScene.description || 'No description'}</p>
                            </div>
                        )}
                        <TabMenu tabs={tabs} />
                    </div>
                )}
            </div>
        </BannerProvider>
    );
}

export default ScenesFeature;
