'use client';

import { BeatTableItem } from "./BeatsOverview";
import { Check, Circle } from 'lucide-react';

type Props = {
    beats: BeatTableItem[];
    toggleBeatCompletion: (id: string) => void;
}

const BeatsTimeline = ({ beats, toggleBeatCompletion }: Props) => {
    if (beats.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400">
                No beats to display
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800" />
            
            {/* Beat items */}
            <div className="space-y-6">
                {beats.map((beat, index) => (
                    <div key={beat.id} className="relative flex items-start gap-6">
                        {/* Timeline node */}
                        <button
                            onClick={() => toggleBeatCompletion(beat.id)}
                            className="relative z-10 flex-shrink-0"
                        >
                            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                                beat.completed 
                                    ? 'bg-green-600 border-green-500' 
                                    : 'bg-gray-900 border-gray-700 hover:border-blue-500'
                            }`}>
                                {beat.completed ? (
                                    <Check className="w-6 h-6 text-white" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-600" />
                                )}
                            </div>
                        </button>

                        {/* Beat content */}
                        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {beat.name}
                                    </h3>
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${
                                        beat.type === 'story' 
                                            ? 'bg-blue-500/20 text-blue-400' 
                                            : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                        {beat.type}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500">#{index + 1}</span>
                            </div>
                            {beat.description && (
                                <p className="text-sm text-gray-400 mt-2">
                                    {beat.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress indicator */}
            <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-semibold text-blue-400">
                        {beats.filter(b => b.completed).length} / {beats.length}
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(beats.filter(b => b.completed).length / beats.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default BeatsTimeline;

