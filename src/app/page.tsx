
'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateChartMateProOutput, fetchSuggestions } from '@/app/actions';
import Header from '@/components/layout/Header';
import IntakeForm from '@/components/forms/IntakeForm';
import GeneratedOutput from '@/components/output/GeneratedOutput';
import type { GenerateClinicalNoteOutput, IntakeFormValues } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export type EditableLine = { id: number; text: string; isChecked: boolean | null; isPlaceholder: boolean; placeholderContent: string };
export type EditableSectionContent = EditableLine[];
export type EditableOutput = { [key in keyof GenerateClinicalNoteOutput]?: EditableSectionContent };
export type EditingSections = { [key in keyof GenerateClinicalNoteOutput]?: boolean };

export default function Home() {
  const [formValues, setFormValues] = useState<IntakeFormValues>({});
  const [aiOutput, setAiOutput] = useState<GenerateClinicalNoteOutput | null>(null);
  const [editableOutput, setEditableOutput] = useState<EditableOutput>({});
  const [editingSections, setEditingSections] = useState<EditingSections>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const { toast } = useToast();

  const parseRawTextToEditable = (text: string | undefined): EditableSectionContent => {
    if (!text) return [];
    return text.split('\n').map((line, index) => {
      const checkboxMatch = line.match(/^\[(x| )\]\s*/);
      const isChecked = checkboxMatch ? checkboxMatch[1] === 'x' : null;
      const cleanLine = line.replace(/^\[(x| )\]\s*/, '');
      
      const placeholderMatch = cleanLine.match(/\[PLACEHOLDER:\s*(.*?)\]/);
      const isPlaceholder = !!placeholderMatch;
      const placeholderContent = placeholderMatch ? placeholderMatch[1] : '';

      return {
        id: Date.now() + index, // Use a more unique ID
        text: cleanLine,
        isChecked,
        isPlaceholder,
        placeholderContent,
      };
    });
  };

  useEffect(() => {
    if (aiOutput) {
      const newEditableOutput: EditableOutput = {};
      for (const key in aiOutput) {
        const typedKey = key as keyof GenerateClinicalNoteOutput;
        newEditableOutput[typedKey] = parseRawTextToEditable(aiOutput[typedKey]);
      }
      setEditableOutput(newEditableOutput);
    } else {
      setEditableOutput({});
    }
  }, [aiOutput]);

  const handleGenerateNote = async (data: IntakeFormValues) => {
    setIsLoading(true);
    setAiOutput(null);
    setEditingSections({});
    setFormValues(data); // Save form state for context
    try {
      const result = await generateChartMateProOutput(data);
      setAiOutput(result);
    } catch (error) {
      console.error("Error generating note:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to generate the clinical note. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineChange = useCallback((section: keyof EditableOutput, lineId: number, newText: string) => {
    setEditableOutput(prev => {
      const newSection = [...(prev[section] || [])];
      const lineIndex = newSection.findIndex(l => l.id === lineId);
      if (lineIndex > -1) {
        const oldLine = newSection[lineIndex]!;
        // Reconstruct the original text if it was a placeholder
        const updatedText = oldLine.isPlaceholder 
          ? oldLine.text.replace(/\[PLACEHOLDER:.*?\]/, `[PLACEHOLDER: ${newText}]`)
          : newText;
        newSection[lineIndex] = { ...oldLine, text: updatedText, placeholderContent: newText };
      }
      return { ...prev, [section]: newSection };
    });
  }, []);
  
  const handleSectionContentChange = useCallback((section: keyof EditableOutput, newContent: string) => {
    setEditableOutput(prev => {
      return {
        ...prev,
        [section]: parseRawTextToEditable(newContent)
      };
    });
  }, []);

  const handleLineRemove = useCallback((section: keyof EditableOutput, lineId: number) => {
    setEditableOutput(prev => {
      const newSection = (prev[section] || []).filter(l => l.id !== lineId);
      return { ...prev, [section]: newSection };
    });
  }, []);

  const handleLineAdd = useCallback((section: keyof EditableOutput) => {
    setEditableOutput(prev => {
      const newSection = [...(prev[section] || [])];
      newSection.push({
        id: Date.now(),
        text: "[PLACEHOLDER: New item]",
        isChecked: null,
        isPlaceholder: true,
        placeholderContent: "New item"
      });
      return { ...prev, [section]: newSection };
    });
  }, []);
  
  const handleCheckboxChange = useCallback((section: keyof EditableOutput, lineId: number, isChecked: boolean) => {
    setEditableOutput(prev => {
      const newSection = [...(prev[section] || [])];
      const lineIndex = newSection.findIndex(l => l.id === lineId);
      if (lineIndex > -1) {
        newSection[lineIndex] = { ...newSection[lineIndex]!, isChecked };
      }
      return { ...prev, [section]: newSection };
    });
  }, []);

  const toggleEditSection = useCallback((section: keyof EditableOutput) => {
    setEditingSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const getSuggestions = useCallback(async (placeholder: string): Promise<string[]> => {
    setIsGeneratingSuggestions(true);
    try {
        const result = await fetchSuggestions(formValues, placeholder);
        return result.suggestions || [];
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        toast({
            variant: "destructive",
            title: "Suggestion Error",
            description: "Could not fetch AI suggestions.",
        });
        return [];
    } finally {
        setIsGeneratingSuggestions(false);
    }
  }, [formValues, toast]);


  const handleDownloadPdf = () => {
    if (!editableOutput) return;

    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;
    const lineHeight = 5;
    const maxLineWidth = pageWidth - margin * 2;

    const checkAndAddPage = (requiredHeight: number) => {
        if (y + requiredHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }
    }

    const addSection = (title: string, content?: EditableSectionContent) => {
        if (!content || content.length === 0) return;
        
        checkAndAddPage(20);
  
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(title, margin, y);
        y += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        content.forEach(line => {
            let lineText = line.text;
            if (line.isChecked !== null) {
                lineText = `${line.isChecked ? '[x]' : '[ ]'} ${line.text}`;
            }

            const lines = doc.splitTextToSize(lineText, maxLineWidth);

            lines.forEach((textLine: string) => {
                checkAndAddPage(lineHeight);
                let currentX = margin;
                
                const parts = textLine.split(/(\[ \]|\[x\]|\*\*.*?\*\*|\[PLACEHOLDER:.*?\])/g).filter(part => part);

                parts.forEach(part => {
                    if (part === '[ ]' || part === '[x]') {
                        try {
                            doc.setFont('ZapfDingbats', 'normal');
                            const symbol = part === '[x]' ? '4' : 'o'; // Using ZapfDingbats checkmark and square
                            doc.text(symbol, currentX, y);
                            currentX += doc.getTextWidth(symbol + ' ');
                            doc.setFont('helvetica', 'normal');
                        } catch(e) {
                             doc.setFont('helvetica', 'normal');
                             doc.text(part, currentX, y);
                             currentX += doc.getTextWidth(part);
                        }
                    } else if (part.startsWith('**') && part.endsWith('**')) {
                        const boldText = part.substring(2, part.length - 2);
                        doc.setFont('helvetica', 'bold');
                        doc.text(boldText, currentX, y, { maxWidth: maxLineWidth - (currentX - margin) });
                        currentX += doc.getTextWidth(boldText);
                        doc.setFont('helvetica', 'normal');
                    } else if (part.startsWith('[PLACEHOLDER:')) {
                         doc.setFont('helvetica', 'italic');
                         const placeholderText = part.substring(13, part.length - 1);
                         doc.text(placeholderText, currentX, y, { maxWidth: maxLineWidth - (currentX - margin) });
                         currentX += doc.getTextWidth(placeholderText);
                         doc.setFont('helvetica', 'normal');
                    }
                    else {
                        doc.text(part, currentX, y, { maxWidth: maxLineWidth - (currentX - margin) });
                        currentX += doc.getTextWidth(part);
                    }
                });
                y += lineHeight;
            });
        });
  
        y += 5; 
    };

    if (editableOutput.clinicalNote) addSection("Clinical Note", editableOutput.clinicalNote);
    if (editableOutput.icd10Codes) addSection("ICD-10 Codes", editableOutput.icd10Codes);
    if (editableOutput.cptCodes) addSection("CPT/E/M Codes", editableOutput.cptCodes);
    if (editableOutput.uspstfRecommendations) addSection("USPSTF Preventive Services", editableOutput.uspstfRecommendations);
    if (editableOutput.mipsQualityMeasures) addSection("Quality Measures (MIPS)", editableOutput.mipsQualityMeasures);
    if (editableOutput.cdiSuggestions) addSection("Documentation & Coding Suggestions (CDI)", editableOutput.cdiSuggestions);
    if (editableOutput.auditChecklist) addSection("Audit-Readiness Checklist", editableOutput.auditChecklist);
    if (editableOutput.precautions) addSection("Precautions & Preventive Measures", editableOutput.precautions);
    if (editableOutput.recommendations) addSection("Recommendations", editableOutput.recommendations);

    doc.save("clinical-report.pdf");
  };

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-8">
            <IntakeForm onSubmit={handleGenerateNote} isLoading={isLoading} />
          </div>
          <GeneratedOutput
            output={editableOutput}
            editingSections={editingSections}
            isLoading={isLoading}
            isGeneratingSuggestions={isGeneratingSuggestions}
            onLineChange={handleLineChange}
            onLineRemove={handleLineRemove}
            onLineAdd={handleLineAdd}
            onCheckboxChange={handleCheckboxChange}
            onSectionContentChange={handleSectionContentChange}
            onToggleEditSection={toggleEditSection}
            onDownloadPdf={handleDownloadPdf}
            onGetSuggestions={getSuggestions}
          />
        </div>
      </main>
    </>
  );
}

    