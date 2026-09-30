export type AudioSource = 'microphone' | 'system' | 'both'
export type AppMode = 'interview' | 'class' | 'meeting' | 'general'
export type AnswerLength = 'short' | 'normal' | 'detailed'
export type ResponseStyle = 'natural' | 'professional' | 'simple' | 'technical'
export type OutputLanguage = 'auto' | 'en' | 'es'
export type RecordingStatus = 'idle' | 'listening' | 'processing' | 'generating'
export type QuestionType = 'behavioral' | 'technical' | 'general' | 'clarification' | 'opinion' | 'unknown'
export interface AssistantResponse { transcript: string; detectedLanguage: string; translation: string | null; suggestedAnswer: string; quickAnswer: string; tip: string; questionType: QuestionType; needsAnswer: boolean; reason?: string | null }
export interface ApiError { message: string; code?: string }
