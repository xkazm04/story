'use client';

import { useProjectStore } from "@/app/store/slices/projectSlice";
import TabMenu from "@/app/components/UI/TabMenu";
import { BannerProvider } from "@/app/components/UI/BannerContext";
import SmartBanner from "@/app/components/UI/SmartBanner";
import ScriptEditor from "./components/Script/ScriptEditor";
import { ArrowLeft } from "lucide-react";
import { useEventListenerGuard } from "@/app/hooks/useEventListenerGuard";
import EventListenerDebugPanel from "@/app/components/dev/EventListenerDebugPanel";

const ScenesFeature = () => {
    /**
     * Parent-Level Event Listener Guard
     *
     * This is a strategic placement of the guard at the parent component level to
     * catch any listeners added by child components like ActManager and ScenesList.
     *
     * Parent-level monitoring benefits:
     * - Provides holistic view of listener management across feature
     * - Catches leaks from deeply nested children
     * - Helps identify which child components need their own guards
     * - Reduces need to instrument every single child component
     *
     * Best practice:
     * 1. Add parent-level guard to major feature components
     * 2. Add component-level guards to complex children with many listeners
     * 3. Use debug panel in development to monitor real-time listener activity
     * 4. Check console summary reports when components unmount
     */
    const listenerGuard = useEventListenerGuard('ScenesFeature', {
        enabled: process.env.NODE_ENV !== 'production',
        warnOnUnmount: true,
        trackGlobalListeners: true,
    });

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
                
                {!selectedSceneId ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-400 flex items-center gap-2 justify-center">
                                <ArrowLeft className="w-5 h-5" />
                                Select a scene from the left panel
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-4">
                        {selectedScene && (
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-white">{selectedScene.title || 'Untitled Scene'}</h2>
                                <p className="text-sm text-gray-400">{selectedScene.description || 'No description'}</p>
                            </div>
                        )}
                        <TabMenu tabs={tabs} />
                    </div>
                )}

                {/* Debug Panel - Development Only */}
                {process.env.NODE_ENV !== 'production' && (
                    <EventListenerDebugPanel
                        guardResult={listenerGuard}
                        componentName="ScenesFeature"
                    />
                )}
            </div>
        </BannerProvider>
    );
}

export default ScenesFeature;
