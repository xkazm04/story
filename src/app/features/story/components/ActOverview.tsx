'use client';

import { motion } from "framer-motion";
import { useProjectStore } from "@/app/store/projectStore";
import { sceneApi } from "@/app/hooks/useScenes";

const ActOverview = () => {
    const { selectedProject, selectedAct } = useProjectStore();
    const { data: scenes, isLoading } = sceneApi.useScenesByProjectAndAct(
        selectedProject?.id, 
        selectedAct?.id
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="text-sm text-gray-400">Loading act overview...</div>
            </div>
        );
    }

    if (!scenes || scenes.length === 0) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="text-center">
                    <p className="text-gray-400">No scenes available for this act</p>
                    <p className="text-gray-500 text-sm mt-2">Create scenes in the Scenes tab</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mt-5 animate-fade-in transition-all duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full mb-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scenes.map((scene) => (
                        <div 
                            key={scene.id}
                            className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {scene.title || 'Untitled Scene'}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {scene.description || 'No description'}
                            </p>
                            <div className="mt-3 text-xs text-gray-500">
                                Order: {scene.order || 0}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default ActOverview;

