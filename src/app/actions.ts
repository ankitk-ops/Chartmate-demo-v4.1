'use server';

import { generateClinicalNote } from '@/ai/flows/generate-clinical-note';
import { autofillIntakeForm } from '@/ai/flows/autofill-intake-form';
import { getSuggestions } from '@/ai/flows/get-suggestions';
import type { GenerateClinicalNoteInput, GenerateClinicalNoteOutput, AutofillIntakeFormInput, AutofillIntakeFormOutput, GetSuggestionsInput, GetSuggestionsOutput, IntakeFormValues } from '@/lib/types';

export async function processNaturalLanguage(
  text: string
): Promise<AutofillIntakeFormOutput> {
  const input: AutofillIntakeFormInput = {
    naturalLanguageText: text,
  };
  try {
    const output = await autofillIntakeForm(input);
    return output;
  } catch (error) {
    console.error('Error in autofillIntakeForm flow:', error);
    throw new Error('Failed to process the natural language input.');
  }
}

export async function generateChartMateProOutput(
  data: IntakeFormValues
): Promise<GenerateClinicalNoteOutput> {
  const input: GenerateClinicalNoteInput = {
    patientName: data.patientName || '',
    patientAge: data.patientAge || 0,
    patientSex: data.patientSex || '',
    patientWeightBmi: data.patientWeightBmi || '',
    patientCodeStatus: data.patientCodeStatus || '',
    patientDecisionMaker: data.patientDecisionMaker || '',
    visitChiefComplaint: data.visitChiefComplaint || '',
    visitOnsetDate: data.visitOnsetDate || '',
    visitDuration: data.visitDuration || '',
    visitInitialVsSubsequent: data.visitInitialVsSubsequent || '',
    visitSetting: data.visitSetting || '',
    visitSpecialty: data.visitSpecialty || '',
    noteStyle: data.noteStyle || '',
    historyHpi: data.historyHpi || '',
    historyPmh: data.historyPmh || '',
    historyPsh: data.historyPsh || '',
    historyFh: data.historyFh || '',
    historySh: data.historySh || '',
    allergies: data.allergies || '',
    medications: data.medications || '',
    immunizations: data.immunizations || '',
    clinicalVitals: data.clinicalVitals || '',
    clinicalRosPeClues: data.clinicalRosPeClues || '',
    clinicalLabsImaging: data.clinicalLabsImaging || '',
    riskScores: data.riskScores || '',
    mentalStatus: data.mentalStatus || '',
    painScore: data.painScore || '',
    adminPayerHints: data.adminPayerHints || '',
    proceduresPerformed: data.proceduresPerformed || '',
    providerRole: data.providerRole || '',
    timeMentioned: data.timeMentioned || '',
  };
  
  try {
    const output = await generateClinicalNote(input);
    return output;
  } catch (error) {
    console.error('Error in generateClinicalNote flow:', error);
    throw new Error('Failed to process the clinical note generation.');
  }
}

export async function fetchSuggestions(
  formContext: IntakeFormValues,
  placeholder: string
): Promise<GetSuggestionsOutput> {
  const input: GetSuggestionsInput = {
    formContext: {
      patientName: formContext.patientName || '',
      patientAge: formContext.patientAge || 0,
      patientSex: formContext.patientSex || '',
      patientWeightBmi: formContext.patientWeightBmi || '',
      patientCodeStatus: formContext.patientCodeStatus || '',
      patientDecisionMaker: formContext.patientDecisionMaker || '',
      visitChiefComplaint: formContext.visitChiefComplaint || '',
      visitOnsetDate: formContext.visitOnsetDate || '',
      visitDuration: formContext.visitDuration || '',
      visitInitialVsSubsequent: formContext.visitInitialVsSubsequent || '',
      visitSetting: formContext.visitSetting || '',
      visitSpecialty: formContext.visitSpecialty || '',
      noteStyle: formContext.noteStyle || '',
      historyHpi: formContext.historyHpi || '',
      historyPmh: formContext.historyPmh || '',
      historyPsh: formContext.historyPsh || '',
      historyFh: formContext.historyFh || '',
      historySh: formContext.historySh || '',
      allergies: formContext.allergies || '',
      medications: formContext.medications || '',
      immunizations: formContext.immunizations || '',
      clinicalVitals: formContext.clinicalVitals || '',
      clinicalRosPeClues: formContext.clinicalRosPeClues || '',
      clinicalLabsImaging: formContext.clinicalLabsImaging || '',
      riskScores: formContext.riskScores || '',
      mentalStatus: formContext.mentalStatus || '',
      painScore: formContext.painScore || '',
      adminPayerHints: formContext.adminPayerHints || '',
      proceduresPerformed: formContext.proceduresPerformed || '',
      providerRole: formContext.providerRole || '',
      timeMentioned: formContext.timeMentioned || '',
    },
    placeholder,
  };
  try {
    const output = await getSuggestions(input);
    return output;
  } catch (error) {
    console.error('Error in getSuggestions flow:', error);
    throw new Error('Failed to fetch suggestions.');
  }
}
