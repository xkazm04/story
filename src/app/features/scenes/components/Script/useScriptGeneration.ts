import { useState } from 'react';
import { useLLM } from '@/app/hooks/useLLM';
import {
  smartSceneGenerationPrompt,
  generateDialoguePrompt,
  generateOverviewPrompt,
  gatherProjectContext,
  gatherStoryContext,
  gatherSceneContext,
  gatherSceneCharacters,
} from '@/prompts';
import { Scene } from '@/app/types/Scene';
import type { DialogueLine } from './DialogueViewer';

interface UseScriptGenerationOptions {
  selectedScene: Scene | null;
  selectedProjectId: string | undefined;
  scenes: Scene[];
}

export function useScriptGeneration({
  selectedScene,
  selectedProjectId,
  scenes,
}: UseScriptGenerationOptions) {
  const [script, setScript] = useState(selectedScene?.script || '');
  const [overview, setOverview] = useState('');
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [error, setError] = useState('');
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const { generateFromTemplate, isLoading: isGenerating } = useLLM();

  const handleSmartGenerate = async () => {
    if (!selectedScene || !selectedProjectId) {
      setError('No scene or project selected');
      return;
    }

    setError('');

    try {
      const [projectCtx, storyCtx, sceneCtx, characters] = await Promise.all([
        gatherProjectContext(selectedProjectId),
        gatherStoryContext(selectedProjectId),
        gatherSceneContext(selectedScene.id),
        gatherSceneCharacters(selectedScene.id),
      ]);

      const currentSceneIndex = scenes.findIndex((s) => s.id === selectedScene.id);
      const previousScene = currentSceneIndex > 0 ? scenes[currentSceneIndex - 1] : undefined;
      const nextScene =
        currentSceneIndex < scenes.length - 1 ? scenes[currentSceneIndex + 1] : undefined;

      const response = await generateFromTemplate(smartSceneGenerationPrompt, {
        sceneTitle: selectedScene.name || 'Untitled Scene',
        sceneLocation: selectedScene.location,
        projectContext: projectCtx,
        storyContext: storyCtx,
        sceneContext: {
          ...sceneCtx,
          previousScene: previousScene
            ? { title: previousScene.name, description: previousScene.description }
            : undefined,
          nextScene: nextScene
            ? { title: nextScene.name, description: nextScene.description }
            : undefined,
        },
        characters,
      });

      if (response?.content) {
        const generatedScript = response.content
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
        script,
        characters,
      });

      if (response?.content) {
        try {
          const jsonMatch = response.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.lines && Array.isArray(parsed.lines)) {
              setDialogueLines(parsed.lines);
            }
          } else {
            setError('Failed to parse dialogue format.');
          }
        } catch {
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
        script,
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
    setScript((prev) => prev.replace(/\n{3,}/g, '\n\n').trim());
  };

  const handleExport = () => {
    const data = {
      scene: selectedScene?.name,
      description: selectedScene?.description,
      script,
      overview,
      dialogue: dialogueLines,
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

  return {
    script,
    setScript,
    overview,
    dialogueLines,
    error,
    isGenerating,
    isGeneratingDialogue,
    isGeneratingDescription,
    handleSmartGenerate,
    handleGenerateDialogue,
    handleAddDescription,
    handleFormat,
    handleExport,
  };
}
