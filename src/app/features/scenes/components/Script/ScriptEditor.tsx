'use client';

import { useState } from 'react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { SmartGenerateButton } from '@/app/components/UI/SmartGenerateButton';
import { useLLM } from '@/app/hooks/useLLM';
import {
    smartSceneGenerationPrompt,
    generateDialoguePrompt,
    generateOverviewPrompt,
    gatherProjectContext,
    gatherStoryContext,
    gatherSceneContext,
    gatherSceneCharacters
} from '@/prompts';
import { ScriptQuickActions } from './ScriptQuickActions';
import { DialogueViewer } from './DialogueViewer';

const ScriptEditor = () => {
    const { selectedScene, selectedProject, selectedAct } = useProjectStore();
    const { data: scenes = [] } = sceneApi.useScenesByProjectAndAct(
        selectedProject?.id || '',
        selectedAct?.id || '',
        !!selectedProject && !!selectedAct
    );
    const [script, setScript] = useState(selectedScene?.script || '');
    const [overview, setOverview] = useState('');
    const [dialogueLines, setDialogueLines] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

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

    const handleGenerateDialogue = async () => {
        if (!script) {
            setError('Please write or generate a script first.');
            return;
        }

        setIsGeneratingDialogue(true);
        setError('');

        try {
            const characters = await gatherSceneCharacters(selectedScene?.id || '');

            const response = await generateFromTemplate(generateDialoguePrompt, {
                sceneTitle: selectedScene?.name || 'Untitled',
                sceneDescription: selectedScene?.description || '',
                script: script,
                characters: characters
            });

            if (response?.content) {
                try {
                    // Attempt to parse JSON from the response
                    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        if (parsed.lines && Array.isArray(parsed.lines)) {
                            setDialogueLines(parsed.lines);
                        }
                    } else {
                        setError('Failed to parse dialogue format.');
                    }
                } catch (e) {
                    setError('Failed to parse dialogue JSON.');
                }
            }
        } catch (err) {
            setError('Failed to generate dialogue.');
            console.error(err);
        } finally {
            setIsGeneratingDialogue(false);
        }
    };

    const handleAddDescription = async () => {
        if (!script) {
            setError('Please write or generate a script first.');
            return;
        }

        setIsGeneratingDescription(true);
        setError('');

        try {
            const response = await generateFromTemplate(generateOverviewPrompt, {
                sceneTitle: selectedScene?.name || 'Untitled',
                script: script
            });

            if (response?.content) {
                setOverview(response.content);
            }
        } catch (err) {
            setError('Failed to generate description.');
            console.error(err);
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleFormat = () => {
        // Simple formatting for now - could be enhanced
        setScript(prev => prev.replace(/\n{3,}/g, '\n\n').trim());
    };

    const handleExport = () => {
        const data = {
            scene: selectedScene?.name,
            description: selectedScene?.description,
            script: script,
            overview: overview,
            dialogue: dialogueLines
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scene-${selectedScene?.id || 'export'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!selectedScene) {
        return (
            <div className="text-center py-10 text-gray-400">
                No scene selected
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
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

                {overview && (
                    <div className="mb-4 p-4 bg-gray-950/50 border border-gray-800 rounded-lg">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Overview</h4>
                        <p className="text-gray-300 text-sm italic">{overview}</p>
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

            <ScriptQuickActions
                onGenerateDialogue={handleGenerateDialogue}
                onAddDescription={handleAddDescription}
                onFormat={handleFormat}
                onExport={handleExport}
                isGeneratingDialogue={isGeneratingDialogue}
                isGeneratingDescription={isGeneratingDescription}
            />

            <DialogueViewer lines={dialogueLines} />
        </div>
    );
};

export default ScriptEditor;


