export type ActiveTab = 'cgpa' | 'percentage' | 'attendance' | 'guide';

export type VguGrade = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';

export interface GradeDefinition {
  grade: VguGrade;
  points: number;
  description: string;
  marksRange: string;
}

export interface SubjectCourse {
  id: string;
  name: string;
  code?: string;
  credits: number;
  grade: VguGrade;
}

export interface SemesterRecord {
  id: string;
  semesterNumber: number;
  name: string;
  credits: number;
  sgpa: number;
}

export interface MarksSubject {
  id: string;
  name: string;
  obtained: number;
  maxMarks: number;
}

export interface AttendanceSubject {
  id: string;
  name: string;
  code?: string;
  attended: number;
  total: number;
  targetPercent: number; // default 75% for VGU
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}

export type ConversionFormula = 'vgu-standard' | 'simple-10' | 'rajasthan-technical';
