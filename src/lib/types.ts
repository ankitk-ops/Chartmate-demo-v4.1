import {z} from 'zod';

export const GenerateClinicalNoteInputSchema = z.object({
  patientName: z.string().describe('Patient name/ID.'),
  patientAge: z.number().describe('Patient age.'),
  patientSex: z.string().describe('Patient sex.'),
  patientWeightBmi: z.string().describe('Patient weight/BMI.'),
  patientCodeStatus: z.string().describe('Patient code status.'),
  patientDecisionMaker: z.string().describe('Patient POA/decision-maker.'),
  visitChiefComplaint: z.string().describe('Visit chief complaint.'),
  visitOnsetDate: z.string().describe('Visit onset date (YYYY-MM-DD).'),
  visitDuration: z.string().describe('Visit duration.'),
  visitInitialVsSubsequent: z.string().describe('Initial vs subsequent visit.'),
  visitSetting: z.string().describe('Visit setting (SNF, ED, Clinic, etc.).'),
  visitSpecialty: z.string().describe('Visit specialty (IM, Cards, etc.).'),
  noteStyle: z.string().describe('Note style (Progress, SOAP, H&P, DAP).'),
  historyHpi: z.string().describe('History of Present Illness.'),
  historyPmh: z.string().describe('Past Medical History.'),
  historyPsh: z.string().describe('Past Surgical History.'),
  historyFh: z.string().describe('Family History.'),
  historySh: z.string().describe('Social History (tobacco/alcohol/drugs/living).'),
  allergies: z.string().describe('Allergies.'),
  medications: z.string().describe('Medications (dose/route/freq).'),
  immunizations: z.string().describe('Immunizations.'),
  clinicalVitals: z.string().describe('Clinical vitals (T, HR, BP, RR, SpO2, Weight).'),
  clinicalRosPeClues: z.string().describe('ROS/PE clues.'),
  clinicalLabsImaging: z.string().describe('Labs/imaging.'),
  riskScores: z.string().describe('Risk scores (Braden, Morse).'),
  mentalStatus: z.string().describe('Mental status.'),
  painScore: z.string().describe('Pain score.'),
  adminPayerHints: z.string().describe('Payer hints.'),
  proceduresPerformed: z.string().describe('Procedures/services performed.'),
  providerRole: z.string().describe('Provider role (MD/DO vs NP/PA).'),
  timeMentioned: z.string().describe('Time mentioned (only if mentioned).'),
});

export type GenerateClinicalNoteInput = z.infer<typeof GenerateClinicalNoteInputSchema>;

export const GenerateClinicalNoteOutputSchema = z.object({
  clinicalNote: z.string().describe('The generated clinical note, formatted with markdown headers for Subjective, Objective, Assessment, and Plan. Each point should be on a new line.'),
  icd10Codes: z.string().describe('Recommended ICD-10 codes, with each code on a new line.'),
  cptCodes: z.string().describe('Recommended CPT/E/M codes, with each code on a new line.'),
  uspstfRecommendations: z.string().describe('USPSTF preventive services recommendations, each on a new line.'),
  mipsQualityMeasures: z.string().describe('MIPS quality measures, each on a new line.'),
  cdiSuggestions: z.string().describe('Clinical Documentation Improvement (CDI) suggestions, each on a new line.'),
  auditChecklist: z.string().describe('Audit-readiness checklist. Items with checkboxes should start with `[ ]` or `[x]`. Each item on a new line.'),
  precautions: z.string().describe("Precautions and preventive measures as a checklist starting with `[ ]`, each on a new line."),
  recommendations: z.string().describe('Further recommendations for the patient as a checklist starting with `[ ]`, each on a new line.'),
});

export type GenerateClinicalNoteOutput = z.infer<typeof GenerateClinicalNoteOutputSchema>;


export const AutofillIntakeFormInputSchema = z.object({
  naturalLanguageText: z.string().describe('The natural language text of the clinical encounter.'),
});

export type AutofillIntakeFormInput = z.infer<
  typeof AutofillIntakeFormInputSchema
>;

export const AutofillIntakeFormOutputSchema = z.object({
    patientName: z.string().describe("Patient's name or ID."),
    patientAge: z.number().optional().describe("Patient's age."),
    patientSex: z.string().describe("Patient's sex."),
    patientWeightBmi: z.string().describe("Patient's weight/BMI."),
    patientCodeStatus: z.string().describe("Patient's code status."),
    patientDecisionMaker: z.string().describe("Patient's POA/decision-maker."),
    visitChiefComplaint: z.string().describe("Visit's chief complaint."),
    visitOnsetDate: z.string().describe("Visit's onset date (YYYY-MM-DD)."),
    visitDuration: z.string().describe("Visit's duration."),
    visitInitialVsSubsequent: z.string().describe("Initial vs subsequent visit."),
    visitSetting: z.string().describe("Visit setting (SNF, ED, Clinic, etc.)."),
    visitSpecialty: z.string().describe("Visit specialty (IM, Cards, etc.)."),
    noteStyle: z.string().describe("Note style (Progress, SOAP, H&P, DAP)."),
    historyHpi: z.string().describe("History of Present Illness."),
    historyPmh: z.string().describe("Past Medical History."),
    historyPsh: z.string().describe("Past Surgical History."),
    historyFh: z.string().describe("Family History."),
    historySh: z.string().describe("Social History (tobacco/alcohol/drugs/living)."),
    allergies: z.string().describe("Allergies."),
    medications: z.string().describe("Medications (dose/route/freq)."),
    immunizations: z.string().describe("Immunizations."),
    clinicalVitals: z.string().describe("Clinical vitals (T, HR, BP, RR, SpO2, Weight)."),
    clinicalRosPeClues: z.string().describe("ROS/PE clues."),
    clinicalLabsImaging: z.string().describe("Labs/imaging."),
    riskScores: z.string().describe("Risk scores (Braden, Morse)."),
    mentalStatus: z.string().describe("Mental status."),
    painScore: z.string().describe("Pain score."),
adminPayerHints: z.string().describe("Payer hints."),
    proceduresPerformed: z.string().describe("Procedures/services performed."),
    providerRole: z.string().describe("Provider role (MD/DO vs NP/PA)."),
    timeMentioned: z.string().describe("Time mentioned (only if mentioned)."),
  }).partial();

export type AutofillIntakeFormOutput = z.infer<
  typeof AutofillIntakeFormOutputSchema
>;

export const GetSuggestionsInputSchema = z.object({
  formContext: GenerateClinicalNoteInputSchema.describe("The current state of the entire intake form, providing context for the suggestions."),
  placeholder: z.string().describe("The full placeholder text to generate suggestions for, e.g., '[PLACEHOLDER: Vitals — T(°F), HR, BP, RR, SpO2(%), Weight(lb)]'"),
});

export type GetSuggestionsInput = z.infer<typeof GetSuggestionsInputSchema>;

export const GetSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of 3-5 concise, relevant suggestions for the placeholder.'),
});

export type GetSuggestionsOutput = z.infer<typeof GetSuggestionsOutputSchema>;

// The form values are almost identical to the AI flow input, but age is a number.
// We can reuse the AI type and make necessary adjustments if needed, or define a separate one.
// For now, let's keep it simple and aligned.
export type IntakeFormValues = Omit<GenerateClinicalNoteInput, 'patientAge'> & {
  patientAge?: number | '';
};
