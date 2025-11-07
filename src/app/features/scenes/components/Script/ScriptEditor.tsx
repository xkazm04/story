'use client';

import { useState } from 'react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { SmartGenerateButton } from '@/app/components/UI/SmartGenerateButton';
import { useLLM } from '@/app/hooks/useLLM';
import {
  smartSceneGenerationPrompt,
  gatherProjectContext,
  gatherStoryContext,
  gatherSceneContext,
  gatherSceneCharacters
} from '@/prompts';

const ScriptEditor = () => {
    const { selectedScene, selectedProject, selectedAct } = useProjectStore();
    const { data: scenes = [] } = sceneApi.useScenesByProjectAndAct(
        selectedProject?.id || '',
        selectedAct?.id || '',
        !!selectedProject && !!selectedAct
    );
    const [script, setScript] = useState(selectedScene?.script || '');
    const [error, setError] = useState('');

    const { generateFromTemplate, isLoading: isGenerating } = useLLM();

    const handleSave = () => {
        // TODO: Implement save functionality
        console.log('Saving script:', script);
    };

    const handleSmartGenerate = async () => {
        if (!selectedScene || !selectedProject) {
            setError('No scene or project selected');
            return;
        }

        setError('');

        try {
            // Gather rich context
            const [projectCtx, storyCtx, sceneCtx, characters] = await Promise.all([
                gatherProjectContext(selectedProject.id),
                gatherStoryContext(selectedProject.id),
                gatherSceneContext(selectedScene.id),
                gatherSceneCharacters(selectedScene.id)
            ]);

            // Find previous scene for continuity
            const currentSceneIndex = scenes.findIndex(s => s.id === selectedScene.id);
            const previousScene = currentSceneIndex > 0 ? scenes[currentSceneIndex - 1] : undefined;
            const nextScene = currentSceneIndex < scenes.length - 1 ? scenes[currentSceneIndex + 1] : undefined;

            // Generate scene script
            const response = await generateFromTemplate(smartSceneGenerationPrompt, {
                sceneTitle: selectedScene.name || 'Untitled Scene',
                sceneLocation: selectedScene.location,
                projectContext: projectCtx,
                storyContext: storyCtx,
                sceneContext: {
                    ...sceneCtx,
                    previousScene: previousScene ? {
                        title: previousScene.name,
                        description: previousScene.description
                    } : undefined,
                    nextScene: nextScene ? {
                        title: nextScene.name,
                        description: nextScene.description
                    } : undefined
                },
                characters: characters
            });

            if (response?.content) {
                // Clean up the response
                let generatedScript = response.content
                    .replace(/\*\*/g, '')
                    .replace(/^#+\s/gm, '')
                    .trim();

                setScript(generatedScript);
            }
        } catch (err) {
            setError('Failed to generate scene script');
            console.error('Error generating scene:', err);
        }
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
                    <div className="flex gap-2">
                        <SmartGenerateButton
                            onClick={handleSmartGenerate}
                            isLoading={isGenerating}
                            disabled={isGenerating}
                            label="Generate Scene"
                            size="sm"
                            variant="secondary"
                        />
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                            Save Script
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Write your scene script here..."
                    className="w-full h-96 bg-gray-950 border border-gray-800 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition"
                />

                <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
                    <div>
                        Words: {script.split(/\s+/).filter((w: string) => w).length}
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


