'use server';
/**
 * @fileOverview This file defines a Genkit flow to identify relevant MIPS quality measures
 * based on patient encounter information.
 *
 * - identifyMIPSQualityMeasures - A function that orchestrates the MIPS quality measure identification process.
 * - MIPSQualityMeasuresInput - The input type for the identifyMIPSQualityMeasures function.
 * - MIPSQualityMeasuresOutput - The return type for the identifyMIPSQualityMeasures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MIPSQualityMeasuresInputSchema = z.object({
  chiefComplaint: z.string().describe('The patient\'s chief complaint.'),
  history: z.string().describe('The patient\'s medical history, including PMH, PSH, FH, and SH.'),
  examFindings: z.string().describe('Physical exam findings.'),
  medications: z.string().describe('The patient\'s current medications.'),
  diagnoses: z.string().describe('The patient\'s diagnoses.'),
});
export type MIPSQualityMeasuresInput = z.infer<typeof MIPSQualityMeasuresInputSchema>;

const MIPSQualityMeasuresOutputSchema = z.object({
  eligibleMeasures: z.array(
    z.object({
      measureName: z.string().describe('The name of the MIPS quality measure.'),
      mipsId: z.string().describe('The MIPS ID number for the measure.'),
      rationale: z.string().describe('The rationale for the measure being applicable to the patient.'),
      macro: z.string().describe('A macro for documenting the measure.'),
      exceptionExclusion: z.string().describe('Any exceptions or exclusions that may apply.'),
    })
  ).describe('A list of MIPS quality measures that are relevant to the patient encounter.'),
});
export type MIPSQualityMeasuresOutput = z.infer<typeof MIPSQualityMeasuresOutputSchema>;

export async function identifyMIPSQualityMeasures(input: MIPSQualityMeasuresInput): Promise<MIPSQualityMeasuresOutput> {
  return identifyMIPSQualityMeasuresFlow(input);
}

const mipsPrompt = ai.definePrompt({
  name: 'mipsPrompt',
  input: {schema: MIPSQualityMeasuresInputSchema},
  output: {schema: MIPSQualityMeasuresOutputSchema},
  prompt: `You are an expert in MIPS quality measures. Based on the following patient information, identify the relevant MIPS quality measures and suggest documentation macros.

Patient Information:
Chief Complaint: {{{chiefComplaint}}}
History: {{{history}}}
Exam Findings: {{{examFindings}}}
Medications: {{{medications}}}
Diagnoses: {{{diagnoses}}}

Identify the MIPS quality measures that are most relevant to this patient encounter. For each measure, provide the MIPS ID, rationale, a documentation macro, and any applicable exceptions or exclusions.
`,
});

const identifyMIPSQualityMeasuresFlow = ai.defineFlow(
  {
    name: 'identifyMIPSQualityMeasuresFlow',
    inputSchema: MIPSQualityMeasuresInputSchema,
    outputSchema: MIPSQualityMeasuresOutputSchema,
  },
  async input => {
    const {output} = await mipsPrompt(input);
    return output!;
  }
);
