'use client';

import { useState, useRef, useEffect } from "react";
import { useNavStore } from "@/app/store/navigationStore";
import BeatsTimeline from "./BeatsTimeline";
import BeatsTableRow from "./BeatsTableRow";
import { beatsApi } from "@/app/api/beats";
import { useProjectStore } from "@/app/store/projectStore";
import { Beat } from "@/app/types/Beat";
import BeatsTableAdd from "./BeatsTableAdd";

export type BeatTableItem = {
    id: string;
    name: string;
    type: "act" | "story";
    description?: string;
    default_flag?: boolean;
    paragraph_id?: string;
    paragraph_title?: string;
    order?: number;
    completed?: boolean;
}

const BeatsOverview = () => {
    const tableRef = useRef(null);
    const { selectedProject } = useProjectStore(); 
    const { data: backendBeats, isLoading, refetch: refreshBeats } = beatsApi.useGetBeats(selectedProject?.id);
    const [sortedBeats, setBeats] = useState<BeatTableItem[]>([]);
    const { setRightMode } = useNavStore();
    const [view, setView] = useState<'table' | 'timeline'>('table');

    useEffect(() => {
        // Update right panel mode
        setRightMode('beats');
    }, [setRightMode]);

    useEffect(() => {
        if (backendBeats && backendBeats.length > 0) {
            // Transform backend beats to BeatTableItem format
            const formattedBeats: BeatTableItem[] = backendBeats.map((beat: Beat) => ({
                id: beat.id,
                name: beat.name,
                type: beat.type as "act" | "story",
                description: beat.description,
                default_flag: beat.default_flag,
                paragraph_id: beat.paragraph_id,
                paragraph_title: beat.paragraph_title,
                order: beat.order || 0,
                completed: beat.completed
            }));
            
            // Sort by order
            const sorted = formattedBeats.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            setBeats(sorted);
        }
    }, [backendBeats]);

    const toggleBeatCompletion = (id: string) => {
        const beat = sortedBeats.find(beat => beat.id === id);
        if (!beat) return;
        
        const newCompletedState = !beat.completed;
        
        // Update UI optimistically
        setBeats(prevBeats => prevBeats.map(b => 
            b.id === id ? { ...b, completed: newCompletedState } : b
        ));
        
        // Call API to update the beat
        beatsApi.editBeat(id, 'completed', newCompletedState)
            .then(() => refreshBeats())
            .catch(() => {
                // Revert on error
                setBeats(prevBeats => prevBeats.map(b => 
                    b.id === id ? { ...b, completed: !newCompletedState } : b
                ));
            });
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="text-sm text-gray-400">Loading beats...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setView('table')} 
                        className={`px-3 py-1 rounded-sm transition-colors ${view === 'table' 
                            ? 'text-blue-400 bg-indigo-900/20' 
                            : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setView('timeline')} 
                        className={`px-3 py-1 rounded-sm transition-colors ${view === 'timeline' 
                            ? 'text-blue-400 bg-indigo-900/20' 
                            : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Timeline
                    </button>
                </div>
            </div>
            
            {view === 'table' ? (
                <div className="w-full overflow-hidden rounded-md border border-gray-800" ref={tableRef}>
                    <div className="flex py-2 px-3 border-b bg-gray-900/50 border-gray-800 text-gray-300 text-xs font-medium">
                        <div className="w-10 text-center">#</div>
                        <div className="w-1/6">Name</div>
                        <div className="flex-1">Description</div>
                        <div className="w-16">Type</div>
                        <div className="w-24 text-right">Completed</div>
                        <div className="w-24 text-right">Actions</div>
                    </div>
                    
                    <div className="bg-gray-950">
                        {sortedBeats.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                                No beats available
                            </div>
                        ) : (
                            <>
                                {sortedBeats.map((beat, index) => (
                                    <BeatsTableRow 
                                        beat={beat} 
                                        key={beat.id} 
                                        index={index} 
                                        setBeats={setBeats}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                    <div className="py-2 px-3 border-t border-gray-800 text-xs font-medium bg-gray-900/30">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total: {sortedBeats.length}</span>
                            <BeatsTableAdd refetch={refreshBeats}/>
                        </div>
                    </div>
                </div>
            ) : (
                <BeatsTimeline 
                    beats={sortedBeats} 
                    toggleBeatCompletion={toggleBeatCompletion} 
                />
            )}
        </div>
    );
};

export default BeatsOverview;


