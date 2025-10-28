# Prompt System Documentation

## Overview

This directory contains all LLM prompts used throughout the Storyteller application. Each prompt follows a consistent structure and is designed to produce high-quality, context-aware responses.

## Structure

```
prompts/
├── index.ts                    # Central export point
├── character/                  # Character-related prompts
│   ├── characterTrait.ts
│   ├── characterBackstory.ts
│   └── characterDialogue.ts
├── story/                      # Story-related prompts
│   ├── storyDescription.ts
│   ├── beatDescription.ts
│   └── actSummary.ts
├── scene/                      # Scene-related prompts
│   ├── sceneDescription.ts
│   └── dialogueImprovement.ts
├── voice/                      # Voice-related prompts
│   ├── voiceDescription.ts
│   └── voiceCharacterization.ts
└── dataset/                    # Dataset-related prompts
    ├── datasetTagging.ts
    └── imageAnalysis.ts
```

## Prompt Template Interface

All prompts follow this structure:

```typescript
interface PromptTemplate {
  system: string;                              // System-level instructions
  user: (context: Record<string, any>) => string;  // User prompt generator
}
```

## Usage Examples

### Basic Usage with useLLM Hook

```typescript
import { useLLM } from '@/app/hooks/useLLM';
import { characterTraitPrompt } from '@/prompts';

const MyComponent = () => {
  const { generateFromTemplate, isLoading, response, error } = useLLM({
    temperature: 0.7,  // Optional: default is 0.7
    maxTokens: 2000,   // Optional: default is 2000
  });

  const handleGenerate = async () => {
    const result = await generateFromTemplate(characterTraitPrompt, {
      characterName: 'Alice',
      characterType: 'protagonist',
      existingTraits: ['brave', 'curious'],
      role: 'Explorer',
      background: 'Grew up in a small village',
    });

    if (result) {
      console.log(result.content); // Generated traits
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Traits'}
      </button>

      {error && <p className="text-red-500">{error.message}</p>}
      {response && <p>{response.content}</p>}
    </div>
  );
};
```

### Advanced Usage with Callbacks

```typescript
const { generate } = useLLM({
  onSuccess: (response) => {
    console.log('Generation completed:', response);
    // Auto-save, show toast, etc.
  },
  onError: (error) => {
    console.error('Generation failed:', error);
    // Show error notification
  },
});
```

### Using Raw Prompts (Without Template)

```typescript
const { generate } = useLLM();

const result = await generate(
  'Write a short character description for a warrior named Bob',
  'You are a creative writing assistant'
);
```

## Creating New Prompts

### 1. Create a New Prompt File

```typescript
// src/prompts/character/characterGoals.ts
import { PromptTemplate } from '../index';

export const characterGoalsPrompt: PromptTemplate = {
  system: `You are a character development specialist who creates compelling character goals.
Goals should be specific, achievable, and connect to the character's background and motivations.`,

  user: (context) => {
    const { characterName, background, traits, role } = context;

    let prompt = `Create 3-5 character goals for "${characterName}"`;

    if (background) {
      prompt += `\n\nBackground: ${background}`;
    }

    if (traits && traits.length > 0) {
      prompt += `\nPersonality: ${traits.join(', ')}`;
    }

    if (role) {
      prompt += `\nRole: ${role}`;
    }

    prompt += `\n\nProvide goals in these categories:`;
    prompt += `\n1. Short-term (immediate objectives)`;
    prompt += `\n2. Long-term (ultimate aspirations)`;
    prompt += `\n3. Internal (personal growth)`;
    prompt += `\n4. External (tangible achievements)`;

    return prompt;
  }
};
```

### 2. Export from Index

```typescript
// src/prompts/index.ts
export { characterGoalsPrompt } from './character/characterGoals';
```

### 3. Use in Your Component

```typescript
import { characterGoalsPrompt } from '@/prompts';

const result = await generateFromTemplate(characterGoalsPrompt, {
  characterName: 'Bob',
  background: 'Former soldier',
  traits: ['disciplined', 'haunted'],
  role: 'Mercenary'
});
```

## Best Practices

### 1. System Prompts
- Be specific about the AI's role
- Define the output format expected
- Set the tone and style
- Include constraints and guidelines

```typescript
system: `You are a professional dialogue writer.
Write natural, character-specific dialogue that reveals personality.
Avoid exposition dumps and "on-the-nose" dialogue.
Maximum 3 lines per response.`
```

### 2. User Prompts
- Start with clear instructions
- Provide relevant context
- Use conditional sections for optional data
- End with specific formatting requirements

```typescript
user: (context) => {
  let prompt = 'Generate dialogue for this scene';

  if (context.situation) {
    prompt += `\n\nSituation: ${context.situation}`;
  }

  // Optional context
  if (context.characters) {
    prompt += `\n\nCharacters:`;
    context.characters.forEach(char => {
      prompt += `\n- ${char.name}: ${char.traits.join(', ')}`;
    });
  }

  prompt += `\n\nFormat: Return dialogue lines as JSON array`;
  return prompt;
}
```

### 3. Context Handling
Always provide sensible defaults for optional context:

```typescript
const {
  characterName,
  traits = [],
  background = 'Unknown background',
  role
} = context;
```

### 4. Error Handling
Handle LLM errors gracefully:

```typescript
const result = await generateFromTemplate(myPrompt, context);

if (!result) {
  // Handle error - show fallback UI, retry, etc.
  return;
}

try {
  const parsed = JSON.parse(result.content);
  // Use parsed data
} catch (e) {
  // Handle parsing error
}
```

## Prompt Design Guidelines

### ✅ Do:
- Be specific about desired output
- Provide examples when helpful
- Use clear, unambiguous language
- Test with various contexts
- Include formatting instructions
- Consider edge cases

### ❌ Don't:
- Make assumptions about context availability
- Use vague terms like "good" or "interesting"
- Ignore error cases
- Hardcode values that should be context-driven
- Write overly long system prompts
- Mix multiple concerns in one prompt

## Testing Prompts

### Manual Testing
Use the `/api/llm` endpoint directly:

```bash
curl -X POST http://localhost:3000/api/llm \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a character trait for a brave warrior",
    "systemPrompt": "You are a character development specialist",
    "temperature": 0.7
  }'
```

### Component Testing
Create a test component:

```typescript
const PromptTester = () => {
  const { generateFromTemplate, isLoading, response } = useLLM();

  const testPrompt = async () => {
    await generateFromTemplate(myPrompt, {
      // Test context
    });
  };

  return (
    <div>
      <button onClick={testPrompt}>Test Prompt</button>
      {isLoading && <p>Loading...</p>}
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
};
```

## Performance Tips

1. **Caching**: Consider caching responses for identical inputs
2. **Streaming**: Use streaming for long responses
3. **Batching**: Batch related requests when possible
4. **Token Limits**: Keep prompts concise to reduce token usage
5. **Temperature**: Lower temperature (0.3-0.5) for consistent outputs, higher (0.7-0.9) for creative outputs

## LLM Configuration

### Environment Variables

```env
# .env.local
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:20b
```

### Per-Request Configuration

```typescript
const { generate } = useLLM({
  model: 'llama2',           // Override default model
  temperature: 0.5,          // Lower for consistency
  maxTokens: 1000,           // Shorter responses
});
```

## Integration Checklist

When adding LLM to a new feature:

- [ ] Identify where AI assistance makes sense
- [ ] Create appropriate prompts in `/prompts`
- [ ] Export prompts from `index.ts`
- [ ] Import `useLLM` hook in component
- [ ] Add loading states
- [ ] Handle errors gracefully
- [ ] Add success feedback
- [ ] Test with various inputs
- [ ] Add user documentation
- [ ] Consider token costs

## Examples in Production

See these components for real-world examples:

1. **Voice Description** (`features/voice/components/VoiceDescription.tsx`)
   - AI-enhanced voice descriptions
   - Edit and save workflow
   - Error handling

2. **Character Traits** (Coming in Phase 2+)
   - Generate trait suggestions
   - Context-aware generation

3. **Story Beats** (Coming in Phase 2+)
   - Beat description enhancement
   - Act summaries

## Troubleshooting

### LLM Not Responding
1. Check Ollama is running: `ollama serve`
2. Verify model is installed: `ollama list`
3. Test endpoint: `curl http://localhost:11434/api/tags`

### Poor Quality Responses
1. Adjust temperature (lower = more focused)
2. Provide more context
3. Refine system prompt
4. Add examples to prompt

### Slow Responses
1. Reduce `maxTokens`
2. Use smaller model
3. Simplify prompt
4. Consider streaming

## Future Enhancements

- [ ] Prompt versioning system
- [ ] A/B testing for prompts
- [ ] Prompt analytics/metrics
- [ ] User prompt customization
- [ ] Multi-language support
- [ ] Prompt validation tools

---

For more information, see the main documentation at `PHASE_1_VOICE_MIGRATION_COMPLETE.md`
