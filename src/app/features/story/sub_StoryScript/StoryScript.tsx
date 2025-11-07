'use client';

import { useProjectStore } from "@/app/store/slices/projectSlice";
import { actApi } from "@/app/hooks/integration/useActs";
import { sceneApi } from "@/app/hooks/integration/useScenes";
import { SectionWrapper } from "@/app/components/UI";
import { FileText } from "lucide-react";
import ActItem from "./components/ActItem";

const StoryScript = () => {
    const { selectedProject } = useProjectStore();
    const { data: acts } = actApi.useProjectActs(selectedProject?.id || '', !!selectedProject);
    const { data: allScenes } = sceneApi.useProjectScenes(selectedProject?.id || '', !!selectedProject);

    if (!selectedProject) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Select a project to view story script</p>
            </div>
        );
    }

    const sortedActs = acts?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-3 p-4">
            {/* Project Overview */}
            <SectionWrapper borderColor="blue" padding="md">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-100">
                            {selectedProject.name}
                        </h2>
                        <p className="text-xs text-gray-400">Story Overview</p>
                    </div>
                </div>
                {selectedProject.description && (
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {selectedProject.description}
                    </p>
                )}
                {!selectedProject.description && (
                    <p className="text-sm text-gray-500 italic">No description available</p>
                )}
            </SectionWrapper>

            {/* Acts Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 px-1 mb-2">
                    <h2 className="text-sm font-semibold text-gray-300">
                        Story Structure
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {sortedActs.length} {sortedActs.length === 1 ? 'Act' : 'Acts'}
                    </span>
                </div>

                {sortedActs.length > 0 ? (
                    <div className="space-y-2">
                        {sortedActs.map((act, actIdx) => (
                            <ActItem
                                key={act.id}
                                act={act}
                                actIndex={actIdx}
                                scenes={allScenes || []}
                            />
                        ))}
                    </div>
                ) : (
                    <SectionWrapper borderColor="gray" padding="md">
                        <div className="text-center py-6">
                            <p className="text-sm text-gray-500">No acts available</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Create your first act to begin structuring your story
                            </p>
                        </div>
                    </SectionWrapper>
                )}
            </div>
        </div>
    );
};

export default StoryScript;
