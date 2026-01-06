'use client';

import { useState, useRef, useEffect, useMemo } from "react";
import { useNavStore } from "@/app/store/navigationStore";
import BeatsTable from "./BeatsTable";
import { beatApi } from "@/app/hooks/integration/useBeats";
import { useProjectStore } from "@/app/store/projectStore";
import { Beat } from "@/app/types/Beat";
import BeatsTableAdd from "./BeatsTableAdd";
import { Button } from "@/app/components/UI/Button";
import ActRecommendations from "./ActRecommendations";
import { RecommendationResponse } from "@/app/types/Recommendation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, List, Map, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import NarrativeMap from './NarrativeMap';
import { BeatFilterPanel, BeatFilters, filterBeats } from './BeatFilterPanel';
import { cn } from '@/lib/utils';

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
    x_position?: number;
    y_position?: number;
    duration?: number;
    estimated_duration?: number;
    pacing_score?: number;
}

// Compact Beat Card for Cards View
function BeatCard({
    beat,
    index,
    onToggleCompletion,
}: {
    beat: BeatTableItem;
    index: number;
    onToggleCompletion: (id: string) => void;
}) {
    const typeColors = {
        story: 'border-purple-500/40 bg-purple-500/5',
        act: 'border-cyan-500/40 bg-cyan-500/5',
    };

    const statusBadge = beat.completed ? (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Done
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
            <Circle className="w-3 h-3" />
            Pending
        </span>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
                'group p-3 rounded-lg border transition-all cursor-pointer',
                'hover:shadow-lg hover:shadow-cyan-500/5',
                typeColors[beat.type] || typeColors.act,
                beat.completed && 'opacity-70'
            )}
            onClick={() => onToggleCompletion(beat.id)}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        'w-6 h-6 rounded flex items-center justify-center text-xs font-bold',
                        beat.type === 'story' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                    )}>
                        {index + 1}
                    </span>
                    <h3 className="text-sm font-medium text-slate-100 truncate">{beat.name}</h3>
                </div>
                {statusBadge}
            </div>

            {beat.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{beat.description}</p>
            )}

            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className={cn(
                    'uppercase font-medium px-1.5 py-0.5 rounded',
                    beat.type === 'story' ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'
                )}>
                    {beat.type}
                </span>
                {beat.estimated_duration && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(beat.estimated_duration / 60)}m
                    </span>
                )}
                {beat.pacing_score && (
                    <span>Pace: {beat.pacing_score}/10</span>
                )}
            </div>
        </motion.div>
    );
}

// Progress Bar Component
function BeatsProgressBar({ beats }: { beats: BeatTableItem[] }) {
    const completed = beats.filter(b => b.completed).length;
    const total = beats.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Progress</span>
                    <span className="text-slate-400">{completed}/{total} beats</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>
            <div className="text-lg font-bold text-cyan-400 tabular-nums">
                {percent}%
            </div>
        </div>
    );
}

const BeatsOverview = () => {
    const tableRef = useRef(null);
    const { selectedProject } = useProjectStore();
    const { data: backendBeats, isLoading, refetch: refreshBeats } = beatApi.useGetBeats(selectedProject?.id);
    const [sortedBeats, setBeats] = useState<BeatTableItem[]>([]);
    const { setRightMode } = useNavStore();
    const [view, setView] = useState<'table' | 'map' | 'cards'>('table');
    const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
    const [isReordering, setIsReordering] = useState(false);
    const [filters, setFilters] = useState<BeatFilters>({
        searchQuery: '',
        type: 'all',
        completionStatus: 'all'
    });

    useEffect(() => {
        setRightMode('beats');
    }, [setRightMode]);

    useEffect(() => {
        if (backendBeats && backendBeats.length > 0) {
            const formattedBeats: BeatTableItem[] = backendBeats.map((beat: Beat) => ({
                id: beat.id,
                name: beat.name,
                type: beat.type as "act" | "story",
                description: beat.description,
                default_flag: beat.default_flag,
                paragraph_id: beat.paragraph_id,
                paragraph_title: beat.paragraph_title,
                order: beat.order || 0,
                completed: beat.completed,
                x_position: beat.x_position,
                y_position: beat.y_position,
                duration: beat.duration,
                estimated_duration: beat.estimated_duration,
                pacing_score: beat.pacing_score
            }));

            const sorted = formattedBeats.sort((a, b) => (a.order || 0) - (b.order || 0));
            setBeats(sorted);
        }
    }, [backendBeats]);

    const toggleBeatCompletion = (id: string) => {
        const beat = sortedBeats.find(beat => beat.id === id);
        if (!beat) return;

        const newCompletedState = !beat.completed;

        setBeats(prevBeats => prevBeats.map(b =>
            b.id === id ? { ...b, completed: newCompletedState } : b
        ));

        beatApi.editBeat(id, 'completed', newCompletedState)
            .then(() => refreshBeats())
            .catch(() => {
                setBeats(prevBeats => prevBeats.map(b =>
                    b.id === id ? { ...b, completed: !newCompletedState } : b
                ));
            });
    }

    const handleBeatUpdate = async (beatId: string, updates: Partial<Beat>) => {
        setBeats(prevBeats => prevBeats.map(b =>
            b.id === beatId ? { ...b, ...updates } as BeatTableItem : b
        ));

        try {
            for (const [field, value] of Object.entries(updates)) {
                if (value !== undefined && !(value instanceof Date)) {
                    await beatApi.editBeat(beatId, field, value);
                }
            }
            refreshBeats();
        } catch (error) {
            console.error('Failed to update beat:', error);
            refreshBeats();
        }
    };

    const handleReorder = async (beatId: string, newOrder: number) => {
        const beatIndex = sortedBeats.findIndex(b => b.id === beatId);
        if (beatIndex === -1) return;

        const reorderedBeats = Array.from(sortedBeats);
        const [movedBeat] = reorderedBeats.splice(beatIndex, 1);
        reorderedBeats.splice(newOrder, 0, movedBeat);

        const updatedBeats = reorderedBeats.map((beat, index) => ({
            ...beat,
            order: index
        }));

        setBeats(updatedBeats);
        setIsReordering(true);

        try {
            await Promise.all(
                updatedBeats.map(beat =>
                    beatApi.editBeat(beat.id, 'order', beat.order || 0)
                )
            );
            setIsReordering(false);
        } catch (error) {
            console.error('Failed to update beat order:', error);
            refreshBeats();
            setIsReordering(false);
        }
    };

    const handleRecommendationsReceived = (recs: RecommendationResponse) => {
        setRecommendations(recs);
    };

    const handleRecommendationsClose = () => {
        setRecommendations(null);
    };

    const handleRecommendationsApply = () => {
        setRecommendations(null);
        refreshBeats();
    };

    const filteredBeats = filterBeats(sortedBeats, filters);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10 text-sm text-slate-400">
                Loading beats...
            </div>
        );
    }

    return (
        <div className="space-y-4 text-sm text-slate-200">
            {/* Recommendations Section */}
            <AnimatePresence>
                {recommendations && (
                    <ActRecommendations
                        recommendations={recommendations.recommendations}
                        overallAssessment={recommendations.overall_assessment}
                        onClose={handleRecommendationsClose}
                        onApply={handleRecommendationsApply}
                    />
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            {sortedBeats.length > 0 && (
                <BeatsProgressBar beats={sortedBeats} />
            )}

            {/* Filter Panel */}
            {sortedBeats.length > 0 && (
                <BeatFilterPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    totalBeats={sortedBeats.length}
                    filteredBeatsCount={filteredBeats.length}
                />
            )}

            {/* View Toggle */}
            <div className="flex justify-between items-center">
                <div className="flex gap-1.5">
                    <Button
                        size="sm"
                        variant={view === 'table' ? 'primary' : 'secondary'}
                        onClick={() => setView('table')}
                        icon={<List />}
                        data-testid="beats-table-view-btn"
                    >
                        Overview
                    </Button>
                    <Button
                        size="sm"
                        variant={view === 'cards' ? 'primary' : 'secondary'}
                        onClick={() => setView('cards')}
                        icon={<LayoutGrid />}
                        data-testid="beats-cards-view-btn"
                    >
                        Cards
                    </Button>
                    <Button
                        size="sm"
                        variant={view === 'map' ? 'primary' : 'secondary'}
                        onClick={() => setView('map')}
                        icon={<Map />}
                        data-testid="beats-map-view-btn"
                    >
                        Narrative Map
                    </Button>
                </div>
            </div>

            {/* Views */}
            {view === 'table' ? (
                <div className="space-y-3">
                    <BeatsTable
                        beats={filteredBeats}
                        setBeats={setBeats}
                        isReordering={isReordering}
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                            {filteredBeats.length !== sortedBeats.length ? (
                                <>Showing {filteredBeats.length} of {sortedBeats.length}</>
                            ) : (
                                <>Total: {sortedBeats.length}</>
                            )}
                            {isReordering && <span className="ml-2 text-blue-400">(Updating order...)</span>}
                        </span>
                        <BeatsTableAdd
                            refetch={refreshBeats}
                            onRecommendationsReceived={handleRecommendationsReceived}
                        />
                    </div>
                </div>
            ) : view === 'cards' ? (
                <div className="space-y-4">
                    {/* Beat Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredBeats.length === 0 && sortedBeats.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400">
                                <LayoutGrid className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                <p className="text-sm">No beats available</p>
                                <p className="text-xs text-gray-500 mt-1">Create your first beat to get started</p>
                            </div>
                        ) : filteredBeats.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400">
                                <LayoutGrid className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                <p className="text-sm">No beats match your filters</p>
                                <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            filteredBeats.map((beat, index) => (
                                <BeatCard
                                    key={beat.id}
                                    beat={beat}
                                    index={index}
                                    onToggleCompletion={toggleBeatCompletion}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {sortedBeats.length > 0 && (
                        <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                            <span className="text-xs text-gray-400">
                                {filteredBeats.length !== sortedBeats.length ? (
                                    <>Showing {filteredBeats.length} of {sortedBeats.length} beats</>
                                ) : (
                                    <>Total: {sortedBeats.length} beats</>
                                )}
                            </span>
                            <BeatsTableAdd
                                refetch={refreshBeats}
                                onRecommendationsReceived={handleRecommendationsReceived}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <NarrativeMap
                    beats={filteredBeats}
                    onBeatUpdate={handleBeatUpdate}
                    onReorder={handleReorder}
                />
            )}
        </div>
    );
};

export default BeatsOverview;
