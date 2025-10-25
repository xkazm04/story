'use client';

import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { beatsApi } from "@/app/api/beats";
import { useProjectStore } from "@/app/store/projectStore";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
    refetch: () => void;
}

const BeatsTableAdd = ({ refetch }: Props) => {
    const [isAddingNew, setIsAddingNew] = useState(false);
    const { selectedProject, selectedAct } = useProjectStore();
    const [beatName, setBeatName] = useState<string>('');
    const [beatDescription, setBeatDescription] = useState<string>('');
    const [beatType, setBeatType] = useState<"act" | "story">('story');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveNewBeat = async () => {
        if (!beatName || !selectedProject) return;
        
        setLoading(true);
        setError(null);

        try {
            if (beatType === "act" && selectedAct) {
                await beatsApi.createActBeat({
                    name: beatName,
                    project_id: selectedProject.id,
                    act_id: selectedAct.id,
                    description: beatDescription
                });
            } else {
                await beatsApi.createStoryBeat({
                    name: beatName,
                    project_id: selectedProject.id,
                    description: beatDescription
                });
            }
            
            refetch();
            setBeatName('');
            setBeatDescription('');
            setIsAddingNew(false);
        } catch (err) {
            setError("Failed to create beat");
            console.error('Error creating beat:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
                <Plus className="w-4 h-4" />
                Add Beat
            </button>
            
            <AnimatePresence>
                {isAddingNew && (
                    <motion.div 
                        className="flex flex-col bg-gray-900 rounded-lg p-3 mt-2 gap-2 border border-gray-800"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={beatName}
                                    onChange={(e) => setBeatName(e.target.value)}
                                    placeholder="Beat name"
                                    className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                                />
                            </div>
                            <select 
                                value={beatType} 
                                onChange={(e) => setBeatType(e.target.value as "act" | "story")}
                                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                            >
                                <option value="story">Story</option>
                                <option value="act">Act</option>
                            </select>
                            <button 
                                onClick={saveNewBeat} 
                                disabled={!beatName || loading}
                                className={`px-3 py-1 rounded transition ${
                                    !beatName || loading
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <textarea
                            value={beatDescription}
                            onChange={(e) => setBeatDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm resize-none"
                            rows={2}
                        />
                        {error && <p className="text-red-400 text-xs">{error}</p>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default BeatsTableAdd;


