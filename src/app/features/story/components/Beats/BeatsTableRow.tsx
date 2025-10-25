'use client';

import { useState } from "react";
import { BeatTableItem } from "./BeatsOverview";
import { Check, X, Pencil, Trash2 } from 'lucide-react';
import { beatsApi } from "@/app/api/beats";

type Props = {
    beat: BeatTableItem;
    index: number;
    setBeats: React.Dispatch<React.SetStateAction<BeatTableItem[]>>;
}

const BeatsTableRow = ({ beat, index, setBeats }: Props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Partial<BeatTableItem>>({});

    const startEditing = () => {
        setIsEditing(true);
        setEditValues({
            name: beat.name,
            description: beat.description,
            type: beat.type,
            order: beat.order
        });
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditValues({});
    };

    const saveEditing = async () => {
        if (!editValues.name) return;

        // Update each changed field
        const promises = [];
        if (editValues.name !== beat.name) {
            promises.push(beatsApi.editBeat(beat.id, 'name', editValues.name));
        }
        if (editValues.description !== beat.description) {
            promises.push(beatsApi.editBeat(beat.id, 'description', editValues.description || ''));
        }

        try {
            await Promise.all(promises);
            setBeats(prev => prev.map(b => 
                b.id === beat.id ? { ...b, ...editValues } : b
            ));
            setIsEditing(false);
            setEditValues({});
        } catch (error) {
            console.error('Failed to update beat:', error);
        }
    };

    const deleteBeat = async () => {
        if (!confirm('Delete this beat?')) return;
        try {
            await beatsApi.deleteBeat(beat.id);
            setBeats(prev => prev.filter(b => b.id !== beat.id));
        } catch (error) {
            console.error('Failed to delete beat:', error);
        }
    };

    const toggleCompletion = async () => {
        const newValue = !beat.completed;
        try {
            await beatsApi.editBeat(beat.id, 'completed', newValue);
            setBeats(prev => prev.map(b => 
                b.id === beat.id ? { ...b, completed: newValue } : b
            ));
        } catch (error) {
            console.error('Failed to toggle completion:', error);
        }
    };

    return (
        <div className="flex py-2 px-3 border-b border-gray-800 text-sm hover:bg-gray-900/50">
            {isEditing ? (
                <>
                    <div className="w-10 flex items-center justify-center text-gray-400">{index + 1}</div>
                    <div className="w-1/6">
                        <input
                            type="text"
                            value={editValues.name || ''}
                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-800 rounded-sm text-white"
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={editValues.description || ''}
                            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-800 rounded-sm text-white"
                        />
                    </div>
                    <div className="w-16 flex items-center capitalize text-gray-400">{beat.type}</div>
                    <div className="w-24" />
                    <div className="w-24 flex justify-end items-center space-x-1">
                        <button onClick={saveEditing} className="text-green-500 hover:text-green-400">
                            <Check className="h-4 w-4" />
                        </button>
                        <button onClick={cancelEditing} className="text-red-500 hover:text-red-400">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-10 flex items-center justify-center text-gray-400">{index + 1}</div>
                    <div className="w-1/6 flex items-center font-semibold">{beat.name}</div>
                    <div className="flex-1 flex items-center text-xs text-gray-400">{beat.description || '-'}</div>
                    <div className="w-16 flex items-center capitalize text-gray-400">{beat.type}</div>
                    <div className="w-24 flex justify-end items-center">
                        <input
                            type="checkbox"
                            checked={beat.completed || false}
                            onChange={toggleCompletion}
                            className="w-4 h-4 rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-24 flex justify-end items-center space-x-1">
                        <button onClick={startEditing} className="text-blue-500 hover:text-blue-400">
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={deleteBeat} className="text-red-500 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default BeatsTableRow;


