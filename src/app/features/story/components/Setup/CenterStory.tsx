'use client';

import { motion } from 'framer-motion';
import { useProjectStore } from "@/app/store/slices/projectSlice";
import ColoredBorder from "@/app/components/UI/ColoredBorder";
import StoryConfigSelect from './StoryConfigSelect';
import StoryConceptInput from './StoryConceptInput';
import StorySettingArea from './StorySettingArea';

const CenterStory = () => {
    const { selectedProject } = useProjectStore();

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="relative group bg-gray-850/50 p-4 w-full backdrop-blur-sm transition-all duration-300 rounded-lg">
            <ColoredBorder />
            {children}
        </div>
    );

    if (!selectedProject) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">Select a project to configure story setup</p>
            </div>
        );
    }

    // TODO: These values should come from the project object once the database schema is updated
    // to include genre, audience, time_period, concept, and setting fields
    const componentsShortConfig = [
        { id: 1, component: <StoryConfigSelect column={undefined} type='genre' /> },
        { id: 2, component: <StoryConfigSelect column={undefined} type='audience' /> },
        { id: 3, component: <StoryConfigSelect column={undefined} type='time' /> }
    ];

    const componentsLongConfig = [
        { id: 4, component: <StoryConceptInput column={undefined} /> },
        { id: 5, component: <StorySettingArea column={undefined} /> }
    ];

    return (
        <motion.div
            className="inset-0 flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="h-full overflow-y-auto w-full max-w-5xl mx-auto text-gray-100 bg-gradient-to-b from-gray-900/40 to-gray-800/10 rounded-lg shadow-lg p-6">
                {/* Short Config Row */}
                <div className="flex flex-row gap-4 mb-4">
                    {componentsShortConfig.map((item) => (
                        <div key={item.id} className="flex-1">
                            <Wrapper>
                                {item.component}
                            </Wrapper>
                        </div>
                    ))}
                </div>

                {/* Long Config Column */}
                <div className="grid grid-cols-1 gap-4">
                    {componentsLongConfig.map((item) => (
                        <Wrapper key={item.id}>
                            {item.component}
                        </Wrapper>
                    ))}
                </div>

                {/* Info Footer */}
                <div className="mt-6 p-4 rounded-lg bg-gray-800/30 border-l-4 border-blue-500/30">
                    <p className="pl-4 font-light italic text-xs text-gray-400">
                        A well-crafted story overview serves as your creative compass, guiding your narrative toward a cohesive and compelling destination.
                    </p>
                </div>

                {/* Note about database schema */}
                <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                    <p className="text-xs text-yellow-400">
                        Note: Database schema needs to be updated to persist genre, audience, time_period, concept, and setting fields.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default CenterStory;
