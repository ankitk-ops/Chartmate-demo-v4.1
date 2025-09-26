// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview This file defines a Genkit flow for auto-filling the intake form from a natural language string.
 *
 * - autofillIntakeForm - A function that processes natural language and returns structured form data.
 * - AutofillIntakeFormInput - The input type for the autofillIntakeForm function.
 * - AutofillIntakeFormOutput - The return type for the autofillIntakeForm function.
 */

import {ai} from '@/ai/genkit';
import {AutofillIntakeFormInputSchema, type AutofillIntakeFormInput, AutofillIntakeFormOutputSchema, type AutofillIntakeFormOutput } from '@/lib/types';


export async function autofillIntakeForm(
  input: AutofillIntakeFormInput
): Promise<AutofillIntakeFormOutput> {
  return autofillIntakeFormFlow(input);
}

const autofillIntakeFormPrompt = ai.definePrompt({
  name: 'autofillIntakeFormPrompt',
  input: {schema: AutofillIntakeFormInputSchema},
  output: {schema: AutofillIntakeFormOutputSchema},
  prompt: `You are an expert at parsing clinical notes and extracting structured data.
Given the following natural language text from a clinical encounter, extract the relevant information and populate the fields of the output JSON schema.

Only populate fields for which you have explicit information in the text.
Do not fabricate or infer any information.
If a piece of information is not present in the text, omit the corresponding field from the output.

Natural Language Input:
{{{naturalLanguageText}}}
`,
});

const autofillIntakeFormFlow = ai.defineFlow(
  {
    name: 'autofillIntakeFormFlow',
    inputSchema: AutofillIntakeFormInputSchema,
    outputSchema: AutofillIntakeFormOutputSchema,
  },
  async input => {
    const {output} = await autofillIntakeFormPrompt(input);
    return output!;
  }
);
