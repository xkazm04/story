'use client';

import { useProjectStore } from "@/app/store/projectStore";
import TabMenu from "@/app/components/UI/TabMenu";
import ActOverview from "./components/ActOverview";
import BeatsOverview from "./components/Beats/BeatsOverview";
import SceneExporter from "./components/SceneExporter";

const StoryFeature = () => {
    const { selectedProject, selectedAct } = useProjectStore();

    const tabs = [
        {
            id: "beats",
            label: "Beats",
            content: <BeatsOverview />
        },
        {
            id: "act-evaluation",
            label: "Evaluator",
            content: <ActOverview />
        },
        {
            id: "act-exporter",
            label: "Exporter",
            content: <SceneExporter />
        }
    ];

    if (!selectedProject) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400">Select a project to view story features</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center h-full max-w-[2000px] w-full relative p-4">
            <TabMenu tabs={tabs} />
        </div>
    );
}

export default StoryFeature;

