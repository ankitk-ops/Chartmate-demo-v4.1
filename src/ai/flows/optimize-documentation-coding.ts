// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing clinical documentation and coding.
 *
 * It provides suggestions for improving documentation specificity, ensuring medical necessity, and highlighting HCC/RAF opportunities.
 *
 * @exports {
 *   optimizeDocumentationCoding,
 *   OptimizeDocumentationCodingInput,
 *   OptimizeDocumentationCodingOutput
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeDocumentationCodingInputSchema = z.object({
  chiefComplaint: z.string().describe('The patient\'s chief complaint.'),
  hpi: z.string().describe('The history of present illness.'),
  ros: z.string().describe('The review of systems.'),
  pe: z.string().describe('The physical exam findings.'),
  vitals: z.string().describe('The patient\'s vital signs.'),
  medications: z.string().describe('The patient\'s medications.'),
  diagnoses: z.array(z.string()).describe('A list of the patient\'s diagnoses.'),
  orders: z.string().describe('Any orders given for the patient.'),
  assessment: z.string().describe('The clinician\'s assessment of the patient.'),
  plan: z.string().describe('The plan of care for the patient.'),
  noteType: z
    .enum(['SOAP', 'H&P', 'Progress Note', 'DAP'])
    .describe('The type of clinical note.'),
  setting: z
    .enum(['SNF', 'ALF', 'ED', 'IP', 'Clinic', 'Tele', 'UC', 'ASC', 'Rehab'])
    .describe('The setting where the patient is being seen.'),
});

export type OptimizeDocumentationCodingInput = z.infer<
  typeof OptimizeDocumentationCodingInputSchema
>;

const OptimizeDocumentationCodingOutputSchema = z.object({
  documentationSuggestions: z
    .array(z.string())
    .describe('Suggestions for improving documentation.'),
  codingSuggestions: z.array(z.string()).describe('Suggestions for coding.'),
  hccRafOpportunities: z
    .array(z.string())
    .describe('Potential HCC/RAF coding opportunities.'),
});

export type OptimizeDocumentationCodingOutput = z.infer<
  typeof OptimizeDocumentationCodingOutputSchema
>;

async function optimizeDocumentationCoding(
  input: OptimizeDocumentationCodingInput
): Promise<OptimizeDocumentationCodingOutput> {
  return optimizeDocumentationCodingFlow(input);
}

const optimizeDocumentationCodingPrompt = ai.definePrompt({
  name: 'optimizeDocumentationCodingPrompt',
  input: {
    schema: OptimizeDocumentationCodingInputSchema,
  },
  output: {
    schema: OptimizeDocumentationCodingOutputSchema,
  },
  prompt: `You are an expert clinical documentation and coding specialist.

  Based on the clinical note information provided, suggest improvements to documentation and coding practices.
  Focus on areas such as:
  - Specificity of diagnoses and chief complaint
  - Ensuring medical necessity for tests and procedures
  - Identifying potential HCC/RAF coding opportunities
  - Linking orders to diagnoses
  - Ensuring proper documentation of risk factors

  Consider the note type and setting when providing suggestions.

  Chief Complaint: {{{chiefComplaint}}}
HPI: {{{hpi}}}
ROS: {{{ros}}}
PE: {{{pe}}}
Vitals: {{{vitals}}}
Meds: {{{medications}}}
Diagnoses: {{{diagnoses}}}
Orders: {{{orders}}}
Assessment: {{{assessment}}}
Plan: {{{plan}}}
Note Type: {{{noteType}}}
Setting: {{{setting}}}

  Here are your suggestions for documentation improvements:
  {{documentationSuggestions}}
  Here are your suggestions for coding improvements:
  {{codingSuggestions}}
  Here are your suggestions for HCC/RAF coding opportunities:
  {{hccRafOpportunities}}`,
});

const optimizeDocumentationCodingFlow = ai.defineFlow(
  {
    name: 'optimizeDocumentationCodingFlow',
    inputSchema: OptimizeDocumentationCodingInputSchema,
    outputSchema: OptimizeDocumentationCodingOutputSchema,
  },
  async input => {
    const {output} = await optimizeDocumentationCodingPrompt(input);
    return output!;
  }
);
