
'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { FileText, Stethoscope, ShieldCheck, Activity, BrainCircuit, CheckSquare, Sparkles, Trash2, Download, Pencil, AlertTriangle, Lightbulb, Loader2, PencilRuler, PlusCircle, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { EditableOutput, EditableSectionContent, EditableLine, EditingSections } from '@/app/page';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


interface GeneratedOutputProps {
  output: EditableOutput;
  editingSections: EditingSections;
  isLoading: boolean;
  isGeneratingSuggestions: boolean;
  onLineChange: (section: keyof EditableOutput, lineId: number, newText: string) => void;
  onLineRemove: (section: keyof EditableOutput, lineId: number) => void;
  onLineAdd: (section: keyof EditableOutput) => void;
  onCheckboxChange: (section: keyof EditableOutput, lineId: number, isChecked: boolean) => void;
  onSectionContentChange: (section: keyof EditableOutput, newContent: string) => void;
  onToggleEditSection: (section: keyof EditableOutput) => void;
  onDownloadPdf: () => void;
  onGetSuggestions: (placeholder: string) => Promise<string[]>;
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-24 w-full" />
  </div>
);

const EmptyState = () => (
    <Card className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CardHeader>
            <div className="mx-auto bg-secondary p-4 rounded-full mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Awaiting Your Input</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground max-w-md">
                Complete the clinical intake form to your left and click "Generate" to see the AI-powered analysis and documentation.
            </p>
        </CardContent>
    </Card>
);

const PlaceholderEditor = ({
    line,
    section,
    onLineChange,
    onGetSuggestions,
    isGeneratingSuggestions,
}: {
    line: EditableLine;
    section: keyof EditableOutput;
    onLineChange: (section: keyof EditableOutput, lineId: number, newText: string) => void;
    onGetSuggestions: (placeholder: string) => Promise<string[]>;
    isGeneratingSuggestions: boolean;
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFocus = async () => {
        setIsPopoverOpen(true);
        if (suggestions.length === 0) {
            const fetchedSuggestions = await onGetSuggestions(line.placeholderContent);
            setSuggestions(fetchedSuggestions);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        onLineChange(section, line.id, suggestion);
        setIsPopoverOpen(false);
    };
    
    return (
        <span onFocus={handleFocus} className="inline-flex items-center gap-1 group/placeholder min-w-0">
            <Pencil className="w-3 h-3 text-primary/70"/>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <input
                        ref={inputRef}
                        type="text"
                        value={line.placeholderContent}
                        onChange={(e) => onLineChange(section, line.id, e.target.value)}
                        placeholder={line.placeholderContent}
                        className="placeholder-input min-w-0"
                        style={{ width: `${Math.max((line.placeholderContent || '').length, 10)}ch` }}
                    />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                    {isGeneratingSuggestions ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                            <Loader2 className="w-4 h-4 animate-spin"/>
                            <span>Generating suggestions...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {suggestions.map((s, i) => (
                                <Button
                                    key={i}
                                    variant="ghost"
                                    className="justify-start text-left h-auto"
                                    onClick={() => handleSuggestionClick(s)}
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground p-2">No suggestions available.</div>
                    )}
                </PopoverContent>
            </Popover>
        </span>
    );
};


const LineRenderer = ({
    line,
    section,
    onLineChange,
    onLineRemove,
    onCheckboxChange,
    onGetSuggestions,
    isGeneratingSuggestions,
}: {
    line: EditableLine;
    section: keyof EditableOutput;
    onLineChange: (section: keyof EditableOutput, lineId: number, newText: string) => void;
    onLineRemove: (section: keyof EditableOutput, lineId: number) => void;
    onCheckboxChange: (section: keyof EditableOutput, lineId: number, isChecked: boolean) => void;
    onGetSuggestions: (placeholder: string) => Promise<string[]>;
    isGeneratingSuggestions: boolean;
}) => {
    
    const textParts = useMemo(() => {
        // Regex to split by placeholder, preserving bold tags within
        return line.text.split(/(\[PLACEHOLDER:.*?\]|\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => {
            const placeholderMatch = part.match(/\[PLACEHOLDER:\s*(.*?)\]/);
            if (placeholderMatch) {
                return (
                    <PlaceholderEditor
                        key={index}
                        line={{...line, placeholderContent: placeholderMatch[1] || ''}}
                        section={section}
                        onLineChange={onLineChange}
                        onGetSuggestions={onGetSuggestions}
                        isGeneratingSuggestions={isGeneratingSuggestions}
                    />
                );
            }
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    }, [line, section, onLineChange, onGetSuggestions, isGeneratingSuggestions]);
    
    return (
        <div className="group flex items-start gap-2 py-1 min-w-0">
            {line.isChecked !== null && (
                <Checkbox
                    id={`line-${section}-${line.id}`}
                    checked={line.isChecked}
                    onCheckedChange={(checked) => onCheckboxChange(section, line.id, !!checked)}
                    className="mt-1"
                />
            )}
            <Label htmlFor={`line-${section}-${line.id}`} className={cn("flex-1 font-normal leading-relaxed cursor-text min-w-0 break-words", line.isChecked === null && "ml-6")}>
                 {textParts}
            </Label>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={() => onLineRemove(section, line.id)}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    );
};


const EditableSection = ({
  title,
  content,
  sectionKey,
  icon,
  isEditing,
  onLineChange,
  onLineRemove,
  onLineAdd,
  onCheckboxChange,
  onSectionContentChange,
  onToggleEditSection,
  onGetSuggestions,
  isGeneratingSuggestions,
}: {
  title: string;
  content: EditableSectionContent;
  sectionKey: keyof EditableOutput;
  icon: React.ElementType;
  isEditing: boolean;
  onLineChange: (section: keyof EditableOutput, lineId: number, newText: string) => void;
  onLineRemove: (section: keyof EditableOutput, lineId: number) => void;
  onLineAdd: (section: keyof EditableOutput) => void;
  onCheckboxChange: (section: keyof EditableOutput, lineId: number, isChecked: boolean) => void;
  onSectionContentChange: (section: keyof EditableOutput, newContent: string) => void;
  onToggleEditSection: (section: keyof EditableOutput) => void;
  onGetSuggestions: (placeholder: string) => Promise<string[]>;
  isGeneratingSuggestions: boolean;
}) => {
    const Icon = icon;

    const convertEditableToRaw = (lines: EditableSectionContent): string => {
        return lines.map(line => {
            let text = line.text;
            if(line.isChecked !== null) {
                text = `${line.isChecked ? '[x]' : '[ ]'} ${text}`;
            }
            return text;
        }).join('\n');
    };

    const [editText, setEditText] = useState(() => convertEditableToRaw(content));

    useEffect(() => {
        setEditText(convertEditableToRaw(content));
    }, [content]);

    const handleSave = () => {
        onSectionContentChange(sectionKey, editText);
        onToggleEditSection(sectionKey);
    };

    const handleCancel = () => {
        setEditText(convertEditableToRaw(content));
        onToggleEditSection(sectionKey);
    };

    // Special rendering for Clinical Note with subsections
    if (sectionKey === 'clinicalNote') {
        const subsections = content.reduce((acc, line) => {
            const match = line.text.match(/^\*\*(Subjective|Objective|Assessment|Plan):\*\*(.*)/);
            if (match && match[1]) {
                const title = match[1];
                const restOfLine = match[2] ? match[2].trim() : '';
                
                const newSection = { title, lines: [] as EditableSectionContent };
                acc.push(newSection);

                if (restOfLine) {
                    const newLine: EditableLine = {
                        ...line,
                        id: line.id + 0.1, 
                        text: restOfLine, 
                    };
                    newSection.lines.push(newLine);
                }
            } else if (acc.length > 0) {
                 acc[acc.length - 1]!.lines.push(line);
            }
            return acc;
        }, [] as { title: string, lines: EditableSectionContent }[]);

        return (
             <div className="min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      {title}
                  </h3>
                   {/* We can add a global edit button for the whole clinical note later if needed */}
                </div>
                {subsections.length > 0 ? (
                    <Accordion type="multiple" defaultValue={['Subjective', 'Objective', 'Assessment', 'Plan']} className="w-full">
                        {subsections.map((sub, index) => (
                            <AccordionItem value={sub.title} key={index}>
                                <AccordionTrigger className="text-base font-semibold">{sub.title}</AccordionTrigger>
                                <AccordionContent className="font-body text-sm leading-relaxed bg-background p-1 rounded-md border min-w-0">
                                    {sub.lines.length > 0 ? sub.lines.map(line => (
                                        <LineRenderer 
                                            key={line.id}
                                            line={line}
                                            section={sectionKey}
                                            onLineChange={onLineChange}
                                            onLineRemove={onLineRemove}
                                            onCheckboxChange={onCheckboxChange}
                                            onGetSuggestions={onGetSuggestions}
                                            isGeneratingSuggestions={isGeneratingSuggestions}
                                        />
                                    )) : <p className="p-2 text-muted-foreground text-sm italic">No content generated for this section.</p>}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    // Fallback to render all content if no subsections are found
                    <div className="font-body text-sm leading-relaxed bg-background p-1 rounded-md border min-w-0">
                        {content.map(line => (
                            <LineRenderer 
                                key={line.id}
                                line={line}
                                section={sectionKey}
                                onLineChange={onLineChange}
                                onLineRemove={onLineRemove}
                                onCheckboxChange={onCheckboxChange}
                                onGetSuggestions={onGetSuggestions}
                                isGeneratingSuggestions={isGeneratingSuggestions}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="min-w-0">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    {title}
                </h3>
                <div className="flex items-center gap-1">
                    {!isEditing && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onLineAdd(sectionKey)}>
                              <PlusCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleEditSection(sectionKey)}>
                              <PencilRuler className="h-4 w-4" />
                          </Button>
                        </>
                    )}
                    {isEditing && (
                        <>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={handleSave}>
                              <Save className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={handleCancel}>
                              <X className="h-4 w-4" />
                          </Button>
                        </>
                    )}
                </div>
            </div>
            {isEditing ? (
                 <Textarea 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[150px] font-mono text-xs"
                    autoFocus
                 />
            ) : (
                <div className="font-body text-sm leading-relaxed bg-background p-1 rounded-md border min-h-[40px] min-w-0">
                    {content.map(line => (
                        <LineRenderer 
                            key={line.id}
                            line={line}
                            section={sectionKey}
                            onLineChange={onLineChange}
                            onLineRemove={onLineRemove}
                            onCheckboxChange={onCheckboxChange}
                            onGetSuggestions={onGetSuggestions}
                            isGeneratingSuggestions={isGeneratingSuggestions}
                        />
                    ))}
                </div>
            )}
        </div>
    )
};

export default function GeneratedOutput({ 
    output, 
    editingSections,
    isLoading, 
    isGeneratingSuggestions,
    onLineChange, 
    onLineRemove, 
    onLineAdd,
    onCheckboxChange,
    onSectionContentChange,
    onToggleEditSection,
    onDownloadPdf,
    onGetSuggestions,
}: GeneratedOutputProps) {
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Generating Report...</CardTitle>
            </CardHeader>
            <CardContent>
                <LoadingSkeleton />
            </CardContent>
        </Card>
    );
  }

  if (Object.keys(output).length === 0) {
    return <EmptyState />;
  }
  
  const SECTIONS_CONFIG: { field: keyof EditableOutput; title: string; icon: React.ElementType; }[] = [
    { field: "clinicalNote", title: "Clinical Note", icon: FileText },
    { field: "icd10Codes", title: "ICD-10 Codes", icon: Stethoscope },
    { field: "cptCodes", title: "CPT/E/M Codes", icon: Stethoscope },
    { field: "uspstfRecommendations", title: "USPSTF Preventive Services", icon: ShieldCheck },
    { field: "mipsQualityMeasures", title: "Quality Measures (MIPS)", icon: Activity },
    { field: "cdiSuggestions", title: "Documentation & Coding Suggestions (CDI)", icon: BrainCircuit },
    { field: "auditChecklist", title: "Audit-Readiness Checklist", icon: CheckSquare },
    { field: "precautions", title: "Precautions & Preventive Measures", icon: AlertTriangle },
    { field: "recommendations", title: "Recommendations", icon: Lightbulb },
  ];

  const availableSections = SECTIONS_CONFIG.filter(section => output[section.field] && output[section.field]!.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {availableSections.map((section, index) => {
            const content = output[section.field];
            if (!content) return null;

            return (
                <div key={section.field}>
                    <EditableSection
                        title={section.title}
                        content={content}
                        sectionKey={section.field}
                        icon={section.icon}
                        isEditing={!!editingSections[section.field]}
                        onLineChange={onLineChange}
                        onLineRemove={onLineRemove}
                        onLineAdd={onLineAdd}
                        onCheckboxChange={onCheckboxChange}
                        onSectionContentChange={onSectionContentChange}
                        onToggleEditSection={onToggleEditSection}
                        onGetSuggestions={onGetSuggestions}
                        isGeneratingSuggestions={isGeneratingSuggestions}
                    />
                    {index < availableSections.length - 1 && <Separator className="my-8" />}
                </div>
            )
        })}
      </CardContent>
      <CardFooter>
        <Button onClick={onDownloadPdf} className="w-full">
            <Download className="mr-2" />
            Finalize & Download PDF
        </Button>
      </CardFooter>
    </Card>
  );
}

    