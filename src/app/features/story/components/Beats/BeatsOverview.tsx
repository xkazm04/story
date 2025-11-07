'use client';

import { useState, useRef, useEffect } from "react";
import { useNavStore } from "@/app/store/navigationStore";
import BeatsTimeline from "./BeatsTimeline";
import BeatsTable from "./BeatsTable";
import { beatApi } from "@/app/hooks/integration/useBeats";
import { useProjectStore } from "@/app/store/projectStore";
import { Beat } from "@/app/types/Beat";
import BeatsTableAdd from "./BeatsTableAdd";
import { Button } from "@/app/components/UI/Button";
import ActRecommendations from "./ActRecommendations";
import { RecommendationResponse } from "@/app/types/Recommendation";
import { AnimatePresence } from "framer-motion";
import { LayoutGrid } from 'lucide-react';
import NarrativeMap from './NarrativeMap';
import { BeatSummaryCard, BeatSummaryCardSkeleton } from './BeatSummaryCard';
import { useBeatSummaries } from '@/app/hooks/useBeatSummaries';
import { BeatFilterPanel, BeatFilters, filterBeats } from './BeatFilterPanel';

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

const BeatsOverview = () => {
    const tableRef = useRef(null);
    const { selectedProject } = useProjectStore();
    const { data: backendBeats, isLoading, refetch: refreshBeats } = beatApi.useGetBeats(selectedProject?.id);
    const [sortedBeats, setBeats] = useState<BeatTableItem[]>([]);
    const { setRightMode } = useNavStore();
    const [view, setView] = useState<'table' | 'timeline' | 'map' | 'cards'>('table');
    const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
    const [isReordering, setIsReordering] = useState(false);
    const [filters, setFilters] = useState<BeatFilters>({
        searchQuery: '',
        type: 'all',
        completionStatus: 'all'
    });
    const {
        generateSummary,
        generateBatchSummaries,
        getSummary,
    } = useBeatSummaries();

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
                completed: beat.completed,
                x_position: beat.x_position,
                y_position: beat.y_position,
                duration: beat.duration,
                estimated_duration: beat.estimated_duration,
                pacing_score: beat.pacing_score
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
        beatApi.editBeat(id, 'completed', newCompletedState)
            .then(() => refreshBeats())
            .catch(() => {
                // Revert on error
                setBeats(prevBeats => prevBeats.map(b =>
                    b.id === id ? { ...b, completed: !newCompletedState } : b
                ));
            });
    }

    const handleBeatUpdate = async (beatId: string, updates: Partial<Beat>) => {
        // Update UI optimistically
        setBeats(prevBeats => prevBeats.map(b =>
            b.id === beatId ? { ...b, ...updates } as BeatTableItem : b
        ));

        // Call API to update each field
        try {
            for (const [field, value] of Object.entries(updates)) {
                if (value !== undefined && !(value instanceof Date)) {
                    await beatApi.editBeat(beatId, field, value);
                }
            }
            refreshBeats();
        } catch (error) {
            console.error('Failed to update beat:', error);
            // Revert on error
            refreshBeats();
        }
    };

    const handleReorder = async (beatId: string, newOrder: number) => {
        const beatIndex = sortedBeats.findIndex(b => b.id === beatId);
        if (beatIndex === -1) return;

        const reorderedBeats = Array.from(sortedBeats);
        const [movedBeat] = reorderedBeats.splice(beatIndex, 1);
        reorderedBeats.splice(newOrder, 0, movedBeat);

        // Update order field for all affected beats
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="text-sm text-gray-400">Loading beats...</div>
            </div>
        );
    }

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

    // Apply filters to get filtered beats
    const filteredBeats = filterBeats(sortedBeats, filters);

    const handleGenerateSummary = async (beatId: string) => {
        const beat = sortedBeats.find(b => b.id === beatId);
        if (!beat) return;

        const beatIndex = sortedBeats.findIndex(b => b.id === beatId);
        const precedingBeat = beatIndex > 0 ? sortedBeats[beatIndex - 1] : null;
        const precedingSummary = precedingBeat ? getSummary(precedingBeat.id).summary : undefined;

        try {
            await generateSummary({
                beatId: beat.id,
                beatName: beat.name,
                beatDescription: beat.description,
                beatType: beat.type,
                order: beatIndex,
                precedingBeatSummary: precedingSummary,
            });
        } catch (error) {
            console.error('Failed to generate summary:', error);
        }
    };

    const handleGenerateAllSummaries = async () => {
        const beatsData = sortedBeats.map((beat, index) => ({
            beatId: beat.id,
            beatName: beat.name,
            beatDescription: beat.description,
            beatType: beat.type,
            order: index,
        }));

        try {
            await generateBatchSummaries(beatsData);
        } catch (error) {
            console.error('Failed to generate batch summaries:', error);
        }
    };

    return (
        <div className="space-y-4">
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

            {/* Filter Panel */}
            {sortedBeats.length > 0 && (
                <BeatFilterPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    totalBeats={sortedBeats.length}
                    filteredBeatsCount={filteredBeats.length}
                />
            )}

            <div className="flex justify-between items-center">
                <div className="flex gap-1.5">
                    <Button
                        size="sm"
                        variant={view === 'table' ? 'primary' : 'secondary'}
                        onClick={() => setView('table')}
                        data-testid="beats-table-view-btn"
                    >
                        Overview
                    </Button>
                    <Button
                        size="sm"
                        variant={view === 'cards' ? 'primary' : 'secondary'}
                        onClick={() => setView('cards')}
                        data-testid="beats-cards-view-btn"
                        className="flex items-center gap-1.5"
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Cards
                    </Button>
                    <Button
                        size="sm"
                        variant={view === 'timeline' ? 'primary' : 'secondary'}
                        onClick={() => setView('timeline')}
                        data-testid="beats-timeline-view-btn"
                    >
                        Timeline
                    </Button>
                    <Button
                        size="sm"
                        variant={view === 'map' ? 'primary' : 'secondary'}
                        onClick={() => setView('map')}
                        data-testid="beats-map-view-btn"
                    >
                        Narrative Map
                    </Button>
                </div>

                <div className="flex gap-2">
                    {view === 'cards' && sortedBeats.length > 0 && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleGenerateAllSummaries}
                            data-testid="beats-generate-all-summaries-btn"
                            className="flex items-center gap-1.5"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Generate All
                        </Button>
                    )}
                </div>
            </div>

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
                    {/* Beat Summary Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {isLoading ? (
                            // Loading skeletons
                            Array.from({ length: 8 }).map((_, index) => (
                                <BeatSummaryCardSkeleton key={index} index={index} />
                            ))
                        ) : filteredBeats.length === 0 && sortedBeats.length === 0 ? (
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
                            filteredBeats.map((beat, index) => {
                                const summaryState = getSummary(beat.id);
                                return (
                                    <BeatSummaryCard
                                        key={beat.id}
                                        beat={beat}
                                        index={index}
                                        summary={summaryState.summary}
                                        isGenerating={summaryState.isGenerating}
                                        onGenerateSummary={handleGenerateSummary}
                                        onToggleCompletion={toggleBeatCompletion}
                                    />
                                );
                            })
                        )}
                    </div>

                    {/* Add new beat section for cards view */}
                    {!isLoading && sortedBeats.length > 0 && (
                        <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                            <span className="text-xs text-gray-400">
                                {filteredBeats.length !== sortedBeats.length ? (
                                    <>Showing {filteredBeats.length} of {sortedBeats.length} {sortedBeats.length === 1 ? 'beat' : 'beats'}</>
                                ) : (
                                    <>Total: {sortedBeats.length} {sortedBeats.length === 1 ? 'beat' : 'beats'}</>
                                )}
                            </span>
                            <BeatsTableAdd
                                refetch={refreshBeats}
                                onRecommendationsReceived={handleRecommendationsReceived}
                            />
                        </div>
                    )}
                </div>
            ) : view === 'timeline' ? (
                <BeatsTimeline
                    beats={filteredBeats}
                    toggleBeatCompletion={toggleBeatCompletion}
                />
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
