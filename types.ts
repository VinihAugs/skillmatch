
export enum Screen {
  LOGIN = 'LOGIN',
  SETTINGS = 'SETTINGS',
  PROJECT = 'PROJECT'
}

export type ThemeColor = 'emerald' | 'indigo' | 'rose' | 'amber';

export interface UserSettings {
  name: string;
  apiKey: string;
  themeColor: ThemeColor;
}

export interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
  interviewTips: string[];
}
