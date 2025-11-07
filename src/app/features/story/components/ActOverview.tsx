'use client';

import { motion } from "framer-motion";
import { useProjectStore } from "@/app/store/projectStore";
import { sceneApi } from "@/app/hooks/integration/useScenes";
import { SectionWrapper } from "@/app/components/UI";
import { Film, MapPin } from "lucide-react";

const ActOverview = () => {
    const { selectedProject, selectedAct } = useProjectStore();
    const { data: scenes, isLoading } = sceneApi.useScenesByProjectAndAct(
        selectedProject?.id || '',
        selectedAct?.id || '',
        !!selectedProject?.id && !!selectedAct?.id
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
                <SectionWrapper borderColor="gray" padding="lg">
                    <div className="text-center">
                        <p className="text-gray-400">No scenes available for this act</p>
                        <p className="text-gray-500 text-sm mt-2">Create scenes in the Scenes tab</p>
                    </div>
                </SectionWrapper>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {scenes.map((scene) => (
                        <SectionWrapper
                            key={scene.id}
                            borderColor="blue"
                            padding="sm"
                            className="hover:bg-gray-800/50 transition-all cursor-pointer"
                        >
                            <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/30 flex-shrink-0">
                                    <Film className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-white mb-1 truncate">
                                        {scene.name || 'Untitled Scene'}
                                    </h3>
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                        {scene.description || 'No description'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        {scene.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-gray-500" />
                                                <span className="text-xs text-gray-500">{scene.location}</span>
                                            </div>
                                        )}
                                        <span className="text-xs text-gray-600 font-mono">
                                            #{scene.order || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </SectionWrapper>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default ActOverview;
