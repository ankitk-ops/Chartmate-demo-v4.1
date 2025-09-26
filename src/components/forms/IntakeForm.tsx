
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Mic, Bot, RefreshCw } from 'lucide-react';
import React, { useState, useCallback, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { NOTE_STYLE_OPTIONS, PROVIDER_ROLE_OPTIONS, SETTING_OPTIONS, SPECIALTY_OPTIONS, VISIT_TYPE_OPTIONS } from '@/lib/constants';
import type { IntakeFormValues } from '@/lib/types';
import { processNaturalLanguage } from '@/app/actions';
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  patientName: z.string().optional(),
  patientAge: z.coerce.number().min(0).optional(),
  patientSex: z.string().optional(),
  patientWeightBmi: z.string().optional(),
  patientCodeStatus: z.string().optional(),
  patientDecisionMaker: z.string().optional(),
  visitChiefComplaint: z.string().optional(),
  visitOnsetDate: z.string().optional(),
  visitDuration: z.string().optional(),
  visitInitialVsSubsequent: z.string().default('Subsequent'),
  visitSetting: z.string().default('SNF'),
  visitSpecialty: z.string().default('Internal Medicine'),
  noteStyle: z.string().default('Progress'),
  historyHpi: z.string().optional(),
  historyPmh: z.string().optional(),
  historyPsh: z.string().optional(),
  historyFh: z.string().optional(),
  historySh: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  immunizations: z.string().optional(),
  clinicalVitals: z.string().optional(),
  clinicalRosPeClues: z.string().optional(),
  clinicalLabsImaging: z.string().optional(),
  riskScores: z.string().optional(),
  mentalStatus: z.string().optional(),
  painScore: z.string().optional(),
  adminPayerHints: z.string().optional(),
  proceduresPerformed: z.string().optional(),
  providerRole: z.string().default('MD/DO'),
  timeMentioned: z.string().optional(),
});


interface IntakeFormProps {
  onSubmit: (data: IntakeFormValues) => void;
  isLoading: boolean;
}

export default function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        patientName: '',
        patientAge: '' as unknown as number, // Default to empty string to avoid uncontrolled to controlled error
        patientSex: '',
        patientWeightBmi: '',
        patientCodeStatus: '',
        patientDecisionMaker: '',
        visitChiefComplaint: '',
        visitOnsetDate: '',
        visitDuration: '',
        visitInitialVsSubsequent: 'Subsequent',
        visitSetting: 'SNF',
        visitSpecialty: 'Internal Medicine',
        noteStyle: 'Progress',
        historyHpi: '',
        historyPmh: '',
        historyPsh: '',
        historyFh: '',
        historySh: '',
        allergies: '',
        medications: '',
        immunizations: '',
        clinicalVitals: '',
        clinicalRosPeClues: '',
        clinicalLabsImaging: '',
        riskScores: '',
        mentalStatus: '',
        painScore: '',
        adminPayerHints: '',
        proceduresPerformed: '',
        providerRole: 'MD/DO',
        timeMentioned: '',
    },
  });

  const { toast } = useToast();
  const [naturalLanguageText, setNaturalLanguageText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micTime, setMicTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setMicTime(prevTime => prevTime + 1);
        }, 1000);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Voice recognition requires an internet connection. Please check your network and try again.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Voice Recognition Error",
                description: `An error occurred: ${event.error}`,
            });
        }
        setIsListening(false);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setNaturalLanguageText(finalTranscriptRef.current + interimTranscript);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [toast]);

  const handleAutofill = async () => {
    if (!naturalLanguageText) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter or dictate some text to autofill the form.",
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
    }

    setIsProcessing(true);
    try {
      const result = await processNaturalLanguage(naturalLanguageText);
      
      // Reset form with new values, keeping existing ones if not in result
      const currentValues = form.getValues();
      const newValues: Partial<IntakeFormValues> = {};
      for (const [key, value] of Object.entries(result)) {
        if (value !== undefined && value !== null) {
          newValues[key as keyof IntakeFormValues] = value as any;
        }
      }
      form.reset({ ...currentValues, ...newValues });

      toast({
        title: "Form Autofilled",
        description: "The form has been populated based on your input.",
      });
    } catch (error) {
      console.error("Error autofilling form:", error);
      toast({
        variant: "destructive",
        title: "Autofill Failed",
        description: "Could not process the provided text. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Your browser does not support voice recognition.",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // If continuing dictation, start from current text. If starting fresh, reset final transcript.
      if (naturalLanguageText === finalTranscriptRef.current) {
        finalTranscriptRef.current = naturalLanguageText;
      } else if (!naturalLanguageText) {
        finalTranscriptRef.current = '';
      }
      recognitionRef.current.start();
    }
  };

  const handleStartOver = () => {
    setNaturalLanguageText('');
    finalTranscriptRef.current = '';
    setMicTime(0);
    if (isListening) {
      recognitionRef.current.stop();
    }
     if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSubmit = (data: IntakeFormValues) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinical Intake</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Card className="bg-muted/30">
              <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bot className="w-6 h-6 text-primary"/>
                    Dictate Full Note
                  </CardTitle>
                  <CardDescription>
                      Use natural language or voice to describe the encounter, then click "Autofill" to populate the form.
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="relative">
                      <Textarea
                          placeholder="e.g., '87-year-old male presents with cough and fever for 3 days...'"
                          value={naturalLanguageText}
                          onChange={(e) => {
                            setNaturalLanguageText(e.target.value);
                            // If user types, make sure the final transcript reflects this change
                            if (!isListening) {
                                finalTranscriptRef.current = e.target.value;
                            }
                          }}
                          rows={6}
                          className="pr-24"
                      />
                      <div className="absolute top-2 right-2 flex flex-col items-center gap-1">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={handleVoiceInput}
                            className={`h-8 w-8 ${isListening ? 'text-accent' : ''}`}
                            aria-label={isListening ? "Stop recording" : "Start recording"}
                        >
                            <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
                        </Button>
                        {isListening && (
                            <span className="text-xs text-muted-foreground font-mono bg-background/50 px-1.5 py-0.5 rounded">
                                {formatTime(micTime)}
                            </span>
                        )}
                      </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAutofill} disabled={isProcessing || !naturalLanguageText} className="flex-1">
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isProcessing ? 'Processing...' : 'Autofill Form Fields'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleStartOver} disabled={isProcessing || (!naturalLanguageText && !isListening)} aria-label="Start Over">
                        <RefreshCw />
                    </Button>
                  </div>
              </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className='text-lg font-semibold'>Visit & Patient Details</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="visitChiefComplaint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chief Complaint</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Follow-up on hypertension and diabetes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="noteStyle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note Style</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select note style" /></SelectTrigger></FormControl>
                          <SelectContent>{NOTE_STYLE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="visitSetting" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setting</FormLabel>
                        <Select onValuechange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select setting" /></SelectTrigger></FormControl>
                          <SelectContent>{SETTING_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="visitSpecialty" render={({ field }) => (
                       <FormItem>
                        <FormLabel>Specialty</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                           <FormControl><SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger></FormControl>
                           <SelectContent>{SPECIALTY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                       </FormItem>
                    )} />
                     <FormField control={form.control} name="visitInitialVsSubsequent" render={({ field }) => (
                       <FormItem>
                        <FormLabel>Visit Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                           <FormControl><SelectTrigger><SelectValue placeholder="Select visit type" /></SelectTrigger></FormControl>
                           <SelectContent>{VISIT_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                       </FormItem>
                    )} />
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="patientName" render={({ field }) => (
                       <FormItem><FormLabel>Patient Name/ID</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl></FormItem>
                    )} />
                     <FormField control={form.control} name="patientAge" render={({ field }) => (
                       <FormItem><FormLabel>Patient Age</FormLabel><FormControl><Input type="number" placeholder="e.g., 78" {...field} value={field.value || ''} /></FormControl></FormItem>
                    )} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className='text-lg font-semibold'>History of Present Illness</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <FormField
                    control={form.control}
                    name="historyHpi"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Describe the history of present illness..." {...field} rows={4} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className='text-lg font-semibold'>Additional Context (Optional)</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField control={form.control} name="clinicalRosPeClues" render={({ field }) => (
                    <FormItem><FormLabel>ROS / PE Clues</FormLabel><FormControl><Textarea placeholder="e.g., Patient reports mild cough, denies fever. Lungs clear on exam." {...field} /></FormControl></FormItem>
                  )} />
                   <FormField control={form.control} name="clinicalVitals" render={({ field }) => (
                    <FormItem><FormLabel>Vitals</FormLabel><FormControl><Input placeholder="e.g., BP 130/80, HR 72, SpO2 98%" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="historyPmh" render={({ field }) => (
                    <FormItem><FormLabel>Past Medical History (PMH)</FormLabel><FormControl><Textarea placeholder="e.g., HTN, DM2, HLD" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="medications" render={({ field }) => (
                    <FormItem><FormLabel>Medications</FormLabel><FormControl><Textarea placeholder="e.g., Lisinopril 10mg daily, Metformin 500mg BID" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="clinicalLabsImaging" render={({ field }) => (
                    <FormItem><FormLabel>Labs / Imaging</FormLabel><FormControl><Textarea placeholder="e.g., CBC 2023-10-15: WNL. CXR 2023-10-14: no acute process." {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="providerRole" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                         <FormControl><SelectTrigger><SelectValue placeholder="Select provider role" /></SelectTrigger></FormControl>
                         <SelectContent>{PROVIDER_ROLE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Generating...' : 'Generate Note & Recommendations'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  interface SpeechRecognitionEvent extends Event {
      resultIndex: number;
      results: SpeechRecognitionResultList;
  }
}

    