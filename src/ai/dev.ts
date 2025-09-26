import { config } from 'dotenv';
config();

import '@/ai/flows/optimize-documentation-coding.ts';
import '@/ai/flows/identify-mips-quality-measures.ts';
import '@/ai/flows/suggest-icd-codes.ts';
import '@/ai/flows/recommend-preventive-care.ts';
import '@/ai/flows/generate-clinical-note.ts';
import '@/ai/flows/autofill-intake-form.ts';
import '@/ai/flows/get-suggestions.ts';
