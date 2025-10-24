'use client';

import { useState } from 'react';
import { useProjectStore } from '@/app/store/projectStore';

const ScriptEditor = () => {
    const { selectedScene } = useProjectStore();
    const [script, setScript] = useState(selectedScene?.script || '');

    const handleSave = () => {
        // TODO: Implement save functionality
        console.log('Saving script:', script);
    };

    if (!selectedScene) {
        return (
            <div className="text-center py-10 text-gray-400">
                No scene selected
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Script Editor</h3>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                        Save Script
                    </button>
                </div>

                <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Write your scene script here..."
                    className="w-full h-96 bg-gray-950 border border-gray-800 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition"
                />

                <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
                    <div>
                        Words: {script.split(/\s+/).filter(w => w).length}
                    </div>
                    <div>
                        Characters: {script.length}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition text-sm">
                        Generate Dialogue
                    </button>
                    <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition text-sm">
                        Add Description
                    </button>
                    <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition text-sm">
                        Format Script
                    </button>
                    <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition text-sm">
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScriptEditor;

