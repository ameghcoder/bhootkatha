'use server';
/**
 * @fileOverview Generates visual scene prompts for a given Hindi horror script, ensuring face consistency across scenes.
 *
 * - generateVisualScenePrompts - A function that generates visual scene prompts.
 * - GenerateVisualScenePromptsInput - The input type for the generateVisualScenePrompts function.
 * - GenerateVisualScenePromptsOutput - The return type for the generateVisualScenePrompts function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateVisualScenePromptsInputSchema = z.object({
  script: z.string().describe('The Hindi horror script to generate visual scene prompts for.'),
});
export type GenerateVisualScenePromptsInput = z.infer<typeof GenerateVisualScenePromptsInputSchema>;

const GenerateVisualScenePromptsOutputSchema = z.object({
  prompts: z.array(
    z.string().describe('A detailed image prompt for a scene from the script.')
  ).describe('An array of image prompts, one for each scene segment.'),
});
export type GenerateVisualScenePromptsOutput = z.infer<typeof GenerateVisualScenePromptsOutputSchema>;

export async function generateVisualScenePrompts(input: GenerateVisualScenePromptsInput): Promise<GenerateVisualScenePromptsOutput> {
  return generateVisualScenePromptsFlow(input);
}

const segmentScriptTool = ai.defineTool({
  name: 'segmentScript',
  description: 'Segments a given script into a specified number of scenes.',
  inputSchema: z.object({
    script: z.string().describe('The script to segment.'),
    numberOfSegments: z.number().describe('The number of segments to divide the script into.  Must be at least 20.'),
  }),
  outputSchema: z.array(z.string().describe('A segment of the script.')),
},
async input => {
    const { script, numberOfSegments } = input;
    if (numberOfSegments < 20) {
      throw new Error('Number of segments must be at least 20.');
    }

    const segmentLength = Math.floor(script.length / numberOfSegments);
    const segments: string[] = [];

    for (let i = 0; i < numberOfSegments; i++) {
        const start = i * segmentLength;
        const end = (i === numberOfSegments - 1) ? script.length : (i + 1) * segmentLength;
        segments.push(script.substring(start, end).trim());
    }

    return segments;
});

const generateImagePromptTool = ai.defineTool({
    name: 'generateImagePrompt',
    description: 'Generates a detailed image prompt for a given scene segment, including scene setting, character descriptions, face consistency prompts, and mood/tone.',
    inputSchema: z.object({
        sceneSegment: z.string().describe('The scene segment to generate an image prompt for.'),
        previousFaceDescription: z.string().optional().describe('Description of the face from the previous segment, to ensure consistency.'),
    }),
    outputSchema: z.object({
        prompt: z.string().describe('A detailed image prompt for the scene segment.'),
        faceDescription: z.string().describe('A description of the face in this segment, for use in subsequent segments.'),
    }),
},
async input => {
    const { sceneSegment, previousFaceDescription } = input;

    const promptContext = `Scene Segment: ${sceneSegment}\n\nPrevious Face Description: ${previousFaceDescription || 'No previous face description available.'}`;

    const imagePromptPrompt = ai.definePrompt({
        name: 'imagePromptPrompt',
        prompt: `You are an AI that generates highly detailed image prompts for AI image generation tools like Midjourney or DALL-E, based on a given scene segment from a Hindi horror script.  Pay close attention to detail and cinematic style.

        The prompt must include:
        - Scene setting (location, lighting, time of day)
        - Character descriptions
        - Face consistency prompt: “same face as previous”, describe face features.  If there is no previous face description, create one.
        - Mood/tone (dark, foggy, tense)

        Output both the prompt and a description of the face in this scene.

        ${promptContext}

        Return a JSON object with 'prompt' and 'faceDescription' fields.`,        
        input: {
            schema: z.object({
                sceneSegment: z.string().describe('The scene segment to generate an image prompt for.'),
                previousFaceDescription: z.string().optional().describe('Description of the face from the previous segment.'),
            }),
        },
        output: {
            schema: z.object({
                prompt: z.string().describe('A detailed image prompt for the scene segment.'),
                faceDescription: z.string().describe('A description of the face in this segment.'),
            }),
        },
    });

    const { output } = await imagePromptPrompt({
        sceneSegment,
        previousFaceDescription,
    });

    return output!;
});

const generateVisualScenePromptsFlow = ai.defineFlow<
  typeof GenerateVisualScenePromptsInputSchema,
  typeof GenerateVisualScenePromptsOutputSchema
>(
  {
    name: 'generateVisualScenePromptsFlow',
    inputSchema: GenerateVisualScenePromptsInputSchema,
    outputSchema: GenerateVisualScenePromptsOutputSchema,
  },
  async input => {
    const { script } = input;

    const segments = await segmentScriptTool({
      script: script,
      numberOfSegments: 20,
    });

    let previousFaceDescription: string | undefined = undefined;
    const prompts: string[] = [];

    for (const segment of segments) {
      const imagePromptResult = await generateImagePromptTool({
        sceneSegment: segment,
        previousFaceDescription: previousFaceDescription,
      });

      prompts.push(imagePromptResult.prompt);
      previousFaceDescription = imagePromptResult.faceDescription;
    }

    return { prompts };
  }
);
