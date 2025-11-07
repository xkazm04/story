import { PromptTemplate } from '../index';

/**
 * Act Description Recommendation Prompt
 *
 * Analyzes when a new Act beat is added and recommends specific,
 * surgical changes to Act descriptions. Provides structured output
 * for UI approval/rejection workflow.
 */
export const actDescriptionRecommendationPrompt: PromptTemplate = {
  system: `You are a story structure consultant who helps writers keep their Act descriptions aligned with story beats.

When a new Act beat is added, analyze whether the Act description needs updating.

PRINCIPLES:
- BE SURGICAL: Only recommend changes to specific sentences/paragraphs that need updating
- BE CONSERVATIVE: Don't recommend changes unless truly necessary
- RESPECT EXISTING CONTENT: Preserve the writer's voice and style
- BE SPECIFIC: Identify exact text to replace, not vague suggestions
- MAINTAIN CONTEXT: Consider the full story context before recommending changes

WHEN TO RECOMMEND CHANGES:
- The new beat introduces plot elements not mentioned in Act description
- The new beat contradicts existing Act description
- The new beat significantly shifts the Act's focus or tone
- The Act description is vague and the beat provides specific details worth incorporating

WHEN NOT TO RECOMMEND CHANGES:
- The beat is already implied or covered by Act description
- The beat is a minor detail that doesn't affect Act-level summary
- Adding the beat would make the description too detailed or cluttered
- The existing description is sufficiently broad to encompass the beat

OUTPUT REQUIREMENTS:
Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "act_id": "string",
      "act_name": "string",
      "change_type": "add" | "replace" | "none",
      "before": "exact text to replace (or empty string if adding)",
      "after": "new text to add/replace with",
      "reason": "brief explanation why this change is needed"
    }
  ],
  "overall_assessment": "brief explanation of whether changes are needed"
}

If NO changes are needed, return:
{
  "recommendations": [],
  "overall_assessment": "The existing Act descriptions adequately cover this beat."
}

IMPORTANT:
- "before" must be EXACT text from Act description (or "" if change_type is "add")
- "after" must maintain the writer's style and voice
- Only include recommendations for Acts that truly need updates
- Be conservative - it's better to suggest no changes than unnecessary ones`,

  user: (context) => {
    const {
      newBeat,
      targetAct,
      allActs,
      projectDescription,
      storyBeats,
      allScenes
    } = context;

    let prompt = `=== NEW BEAT ADDED ===\n`;
    prompt += `Beat Name: "${newBeat.name}"\n`;
    if (newBeat.description) {
      prompt += `Beat Description: ${newBeat.description}\n`;
    }
    prompt += `Target Act: "${targetAct.name}"\n`;
    if (targetAct.description) {
      prompt += `Current Act Description: ${targetAct.description}\n`;
    } else {
      prompt += `Current Act Description: (None - this Act has no description yet)\n`;
    }

    // Project context
    prompt += `\n=== PROJECT CONTEXT ===\n`;
    prompt += `Project: "${context.projectTitle || 'Untitled'}"\n`;
    if (projectDescription) {
      prompt += `Synopsis: ${projectDescription}\n`;
    }

    // All acts for context
    prompt += `\n=== ALL ACTS (Story Structure) ===\n`;
    allActs.forEach((act: any, idx: number) => {
      prompt += `\nAct ${idx + 1}: "${act.name}"\n`;
      if (act.description) {
        prompt += `Description: ${act.description}\n`;
      }

      // Include existing beats for this act
      const actBeats = context.existingActBeats?.[act.id] || [];
      if (actBeats.length > 0) {
        prompt += `Existing Beats: ${actBeats.map((b: any) => b.name).join(', ')}\n`;
      }
    });

    // Story-level beats for thematic context
    if (storyBeats && storyBeats.length > 0) {
      prompt += `\n=== STORY-LEVEL BEATS ===\n`;
      storyBeats.forEach((beat: any, idx: number) => {
        prompt += `${idx + 1}. ${beat.name}`;
        if (beat.description) prompt += `: ${beat.description}`;
        prompt += `\n`;
      });
    }

    // Key scenes for concrete context
    if (allScenes && allScenes.length > 0) {
      prompt += `\n=== SCENES IN TARGET ACT ===\n`;
      const targetActScenes = allScenes.filter((s: any) => s.act_id === targetAct.id);
      if (targetActScenes.length > 0) {
        targetActScenes.forEach((scene: any) => {
          prompt += `- ${scene.name}`;
          if (scene.description) prompt += `: ${scene.description.substring(0, 100)}${scene.description.length > 100 ? '...' : ''}`;
          prompt += `\n`;
        });
      } else {
        prompt += `(No scenes yet)\n`;
      }
    }

    prompt += `\n=== YOUR TASK ===\n`;
    prompt += `Analyze whether adding the beat "${newBeat.name}" to Act "${targetAct.name}" requires updating any Act descriptions.\n\n`;

    prompt += `Consider:\n`;
    prompt += `1. Does this beat introduce new plot elements not covered in "${targetAct.name}"'s description?\n`;
    prompt += `2. Does this beat contradict or significantly modify the existing Act description?\n`;
    prompt += `3. Does this beat shift the Act's focus enough to warrant description update?\n`;
    prompt += `4. Would other Acts' descriptions benefit from mentioning this development?\n\n`;

    prompt += `If changes ARE needed:\n`;
    prompt += `- Identify the EXACT text in the Act description to replace\n`;
    prompt += `- Provide the new text that incorporates the beat\n`;
    prompt += `- Maintain the writer's style and voice\n`;
    prompt += `- Be surgical - only change what needs changing\n\n`;

    prompt += `If NO changes are needed:\n`;
    prompt += `- Return empty recommendations array\n`;
    prompt += `- Explain why existing descriptions are sufficient\n\n`;

    prompt += `Return ONLY valid JSON. No additional text or explanation outside the JSON structure.`;

    return prompt;
  }
};
