'use server';

import {ai} from '@/ai/genkit';
import { GetSuggestionsInputSchema, type GetSuggestionsInput, GetSuggestionsOutputSchema, type GetSuggestionsOutput } from '@/lib/types';


export async function getSuggestions(input: GetSuggestionsInput): Promise<GetSuggestionsOutput> {
  return getSuggestionsFlow(input);
}

const getSuggestionsPrompt = ai.definePrompt({
  name: 'getSuggestionsPrompt',
  input: {schema: GetSuggestionsInputSchema},
  output: {schema: GetSuggestionsOutputSchema},
  prompt: `
    You are an expert clinical assistant. Your task is to provide concise, relevant, and actionable suggestions to a healthcare provider who is filling out a form.
    Generate 3-5 suggestions for the specific placeholder they are trying to fill, based on the entire context of the clinical form provided.

    **Instructions:**
    1.  Analyze the **Full Form Context** to understand the patient's situation.
    2.  Focus on the **Placeholder to fill**.
    3.  Generate a list of short, clinically appropriate, and directly usable suggestions.

    **Full Form Context:**
    {{json formContext}}

    **Placeholder to fill:**
    "{{{placeholder}}}"

    **Example:**
    - If placeholder is for 'Diagnosis' and HPI mentions 'cough and fever', suggestions could be 'Pneumonia', 'Acute Bronchitis', 'Influenza'.
    - If placeholder is for 'Vitals', suggestions could be example formats like 'T 98.6F, HR 75, BP 120/80, RR 16, SpO2 98%', or context-specific values like 'T 101.5F (Fever)' if fever is mentioned elsewhere.

    Provide only the list of suggestions in the output.
  `,
});

const getSuggestionsFlow = ai.defineFlow(
  {
    name: 'getSuggestionsFlow',
    inputSchema: GetSuggestionsInputSchema,
    outputSchema: GetSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await getSuggestionsPrompt(input);
    return output!;
  }
);
