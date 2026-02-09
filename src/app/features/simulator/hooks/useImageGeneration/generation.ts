/**
 * Image generation logic as pure functions.
 * These are NOT hooks — they accept state setters and refs as parameters
 * so the main hook can orchestrate them.
 */

import { GeneratedImage, GenerationStartResponse, GenerationCheckResponse } from './types';
import { POLL_INTERVAL, MAX_POLL_ATTEMPTS } from './constants';
import { v4 as uuidv4 } from 'uuid';

/** Parameters needed by pollGeneration */
export interface PollGenerationParams {
  pollingRef: React.MutableRefObject<Map<string, NodeJS.Timeout>>;
  pollAttemptsRef: React.MutableRefObject<Map<string, number>>;
  setGeneratedImages: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
}

/**
 * Poll for a single generation's completion.
 * Recursively schedules itself via setTimeout until complete, failed, or timed out.
 */
export async function pollGeneration(
  generationId: string,
  promptId: string,
  params: PollGenerationParams
): Promise<void> {
  const { pollingRef, pollAttemptsRef, setGeneratedImages } = params;
  const attempts = pollAttemptsRef.current.get(generationId) || 0;

  if (attempts >= MAX_POLL_ATTEMPTS) {
    // Timeout - mark as failed
    setGeneratedImages((prev) =>
      prev.map((img) =>
        img.promptId === promptId
          ? { ...img, status: 'failed' as const, error: 'Generation timed out' }
          : img
      )
    );
    pollingRef.current.delete(generationId);
    pollAttemptsRef.current.delete(generationId);
    return;
  }

  try {
    const response = await fetch(`/api/ai/generate-images?generationId=${generationId}`);
    const data: GenerationCheckResponse = await response.json();

    if (data.status === 'complete' && data.images && data.images.length > 0) {
      // Success - update with image URL
      setGeneratedImages((prev) =>
        prev.map((img) =>
          img.promptId === promptId
            ? { ...img, status: 'complete' as const, url: data.images![0].url }
            : img
        )
      );
      pollingRef.current.delete(generationId);
      pollAttemptsRef.current.delete(generationId);
    } else if (data.status === 'failed') {
      // Failed - update status
      setGeneratedImages((prev) =>
        prev.map((img) =>
          img.promptId === promptId
            ? { ...img, status: 'failed' as const, error: data.error || 'Generation failed' }
            : img
        )
      );
      pollingRef.current.delete(generationId);
      pollAttemptsRef.current.delete(generationId);
    } else {
      // Still pending - continue polling
      pollAttemptsRef.current.set(generationId, attempts + 1);
      const timeout = setTimeout(
        () => pollGeneration(generationId, promptId, params),
        POLL_INTERVAL
      );
      pollingRef.current.set(generationId, timeout);
    }
  } catch (error) {
    console.error('Polling error:', error);
    // Continue polling on network errors
    pollAttemptsRef.current.set(generationId, attempts + 1);
    const timeout = setTimeout(
      () => pollGeneration(generationId, promptId, params),
      POLL_INTERVAL
    );
    pollingRef.current.set(generationId, timeout);
  }
}

/**
 * Delete previous generations from Leonardo to free up storage.
 */
export async function deletePreviousGenerations(
  generatedImages: GeneratedImage[]
): Promise<void> {
  const generationIds = generatedImages
    .filter((img) => img.generationId)
    .map((img) => img.generationId!);

  if (generationIds.length === 0) return;

  try {
    await fetch('/api/ai/generate-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generationIds }),
    });
  } catch (error) {
    console.error('Failed to delete previous generations:', error);
    // Continue even if deletion fails
  }
}

/** Parameters needed by generateImagesFromPrompts */
export interface GenerateImagesParams extends PollGenerationParams {
  currentGeneratedImages: GeneratedImage[];
  setIsGeneratingImages: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Generate images from an array of prompts.
 * Starts parallel generations and sets up polling for each.
 */
export async function generateImagesFromPrompts(
  prompts: Array<{ id: string; prompt: string }>,
  params: GenerateImagesParams
): Promise<void> {
  const {
    currentGeneratedImages,
    setGeneratedImages,
    setIsGeneratingImages,
    pollingRef,
    pollAttemptsRef,
  } = params;

  if (prompts.length === 0) return;

  // Step 1: Delete previous generations from Leonardo
  await deletePreviousGenerations(currentGeneratedImages);

  setIsGeneratingImages(true);

  // Initialize all images as pending
  const initialImages: GeneratedImage[] = prompts.map((p) => ({
    id: uuidv4(),
    promptId: p.id,
    url: null,
    status: 'pending' as const,
  }));
  setGeneratedImages(initialImages);

  const pollParams: PollGenerationParams = {
    pollingRef,
    pollAttemptsRef,
    setGeneratedImages,
  };

  try {
    // Start all generations with 16:9 aspect ratio for cinematic look
    const response = await fetch('/api/ai/generate-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompts: prompts.map((p) => ({
          id: p.id,
          text: p.prompt,
        })),
        width: 1344,  // 16:9 aspect ratio (1344/768 = 1.75)
        height: 768,
      }),
    });

    const data: GenerationStartResponse = await response.json();

    if (!data.success || !data.generations) {
      // All failed to start
      setGeneratedImages((prev) =>
        prev.map((img) => ({
          ...img,
          status: 'failed' as const,
          error: data.error || 'Failed to start generation',
        }))
      );
      setIsGeneratingImages(false);
      return;
    }

    // Update status and start polling for each generation
    setGeneratedImages((prev) =>
      prev.map((img) => {
        const gen = data.generations!.find((g) => g.promptId === img.promptId);
        if (gen) {
          if (gen.status === 'failed') {
            return { ...img, status: 'failed' as const, error: gen.error };
          }
          return { ...img, status: 'generating' as const, generationId: gen.generationId };
        }
        return img;
      })
    );

    // Start polling for each successful generation
    data.generations.forEach((gen) => {
      if (gen.status === 'started' && gen.generationId) {
        pollAttemptsRef.current.set(gen.generationId, 0);
        const timeout = setTimeout(
          () => pollGeneration(gen.generationId, gen.promptId, pollParams),
          POLL_INTERVAL
        );
        pollingRef.current.set(gen.generationId, timeout);
      }
    });
  } catch (error) {
    console.error('Generation error:', error);
    setGeneratedImages((prev) =>
      prev.map((img) => ({
        ...img,
        status: 'failed' as const,
        error: 'Network error',
      }))
    );
  }

  // Check if all are done (either complete or failed)
  // This will be updated by polling, but we can do an initial check
  setTimeout(() => {
    setGeneratedImages((prev) => {
      const allDone = prev.every((img) => img.status === 'complete' || img.status === 'failed');
      if (allDone) {
        setIsGeneratingImages(false);
      }
      return prev;
    });
  }, 100);
}
