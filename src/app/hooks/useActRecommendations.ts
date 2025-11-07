import { useState } from 'react';
import { RecommendationResponse, RecommendationContext } from '../types/Recommendation';
import { actDescriptionRecommendationPrompt } from '@/prompts';
import { useLLM } from './useLLM';

/**
 * Hook for generating Act description recommendations using LLM
 */
export const useActRecommendations = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateFromTemplate } = useLLM({
    temperature: 0.3, // Low temperature for consistent, conservative recommendations
  });

  const generateRecommendations = async (
    context: RecommendationContext
  ): Promise<RecommendationResponse | null> => {
    setIsGenerating(true);

    try {
      const response = await generateFromTemplate(actDescriptionRecommendationPrompt, context);

      if (!response) {
        return null;
      }

      // Parse the JSON response
      let recommendations: RecommendationResponse;

      if (typeof response.content === 'string') {
        // Clean up the response - remove markdown code blocks if present
        let cleanedContent = response.content.trim();
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/```\n?/g, '');
        }

        recommendations = JSON.parse(cleanedContent);
      } else {
        recommendations = response.content;
      }

      return recommendations;
    } catch (err) {
      console.error('Error generating recommendations:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateRecommendations,
    isGenerating,
  };
};
