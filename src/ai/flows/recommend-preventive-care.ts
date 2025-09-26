'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending USPSTF preventive care services.
 *
 * The flow takes patient information as input and returns a list of relevant preventive care recommendations.
 * @fileOverview This file defines a Genkit flow for generating clinical notes in various formats.
 *
 * @fileOverview This file defines a Genkit flow for generating clinical notes in various formats.
 *
 * - recommendPreventiveCare - A function that initiates the preventive care recommendation process.
 * - RecommendPreventiveCareInput - The input type for the recommendPreventiveCare function.
 * - RecommendPreventiveCareOutput - The return type for the recommendPreventiveCare function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendPreventiveCareInputSchema = z.object({
  age: z.number().describe('The age of the patient.'),
  sex: z.enum(['male', 'female']).describe('The sex of the patient.'),
  history: z
    .string()
    .describe(
      'The relevant medical history of the patient, including conditions and risk factors.'
    ),
});
export type RecommendPreventiveCareInput = z.infer<
  typeof RecommendPreventiveCareInputSchema
>;

const RecommendPreventiveCareOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of preventive care recommendations.'),
  rationale: z
    .array(z.string())
    .describe('A list of rationales for each recommendation.'),
});
export type RecommendPreventiveCareOutput = z.infer<
  typeof RecommendPreventiveCareOutputSchema
>;

export async function recommendPreventiveCare(
  input: RecommendPreventiveCareInput
): Promise<RecommendPreventiveCareOutput> {
  return recommendPreventiveCareFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendPreventiveCarePrompt',
  input: {schema: RecommendPreventiveCareInputSchema},
  output: {schema: RecommendPreventiveCareOutputSchema},
  prompt: `You are an expert in USPSTF preventive care recommendations. Based on the
  patient's age, sex, and medical history, provide a list of relevant preventive
  care recommendations and a brief rationale for each recommendation.

  Patient Age: {{{age}}}
  Patient Sex: {{{sex}}}
  Patient History: {{{history}}}

  Format the output as a JSON object with two keys:
  - recommendations: An array of strings, where each string is a preventive care recommendation.
  - rationale: An array of strings, where each string is the reason for the corresponding recommendation. Ensure that the rationale corresponds to the recommendation. Omit any recommendations that are grade D.
  Make sure to follow USPSTF guidelines.
  `,
});

const recommendPreventiveCareFlow = ai.defineFlow(
  {
    name: 'recommendPreventiveCareFlow',
    inputSchema: RecommendPreventiveCareInputSchema,
    outputSchema: RecommendPreventiveCareOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
