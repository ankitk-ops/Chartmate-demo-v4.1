'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant ICD-10 codes based on a clinical note.
 *
 * - suggestIcdCodes - A function that suggests ICD-10 codes for a given clinical note.
 * - SuggestIcdCodesInput - The input type for the suggestIcdCodes function.
 * - SuggestIcdCodesOutput - The return type for the suggestIcdCodes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIcdCodesInputSchema = z.object({
  clinicalNote: z.string().describe('The clinical note to suggest ICD-10 codes for.'),
});
export type SuggestIcdCodesInput = z.infer<typeof SuggestIcdCodesInputSchema>;

const SuggestIcdCodesOutputSchema = z.object({
  icdCodes: z.array(z.string()).describe('An array of suggested ICD-10 codes.'),
});
export type SuggestIcdCodesOutput = z.infer<typeof SuggestIcdCodesOutputSchema>;

export async function suggestIcdCodes(input: SuggestIcdCodesInput): Promise<SuggestIcdCodesOutput> {
  return suggestIcdCodesFlow(input);
}

const suggestIcdCodesPrompt = ai.definePrompt({
  name: 'suggestIcdCodesPrompt',
  input: {schema: SuggestIcdCodesInputSchema},
  output: {schema: SuggestIcdCodesOutputSchema},
  prompt: `You are a medical coding expert. Given the following clinical note, suggest relevant ICD-10 codes.

Clinical Note: {{{clinicalNote}}}

Suggest ICD-10 codes:
`,
});

const suggestIcdCodesFlow = ai.defineFlow(
  {
    name: 'suggestIcdCodesFlow',
    inputSchema: SuggestIcdCodesInputSchema,
    outputSchema: SuggestIcdCodesOutputSchema,
  },
  async input => {
    const {output} = await suggestIcdCodesPrompt(input);
    return output!;
  }
);
