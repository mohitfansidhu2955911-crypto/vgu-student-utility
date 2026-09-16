import { SubjectCourse, SemesterRecord, AttendanceSubject, ConversionFormula } from '../types';
import { VGU_SAMPLE_SUBJECTS, VGU_SAMPLE_SEMESTERS, VGU_SAMPLE_ATTENDANCE } from './vguGrading';

const VGU_SUBJECTS_KEY = 'vgu_student_subjects_v1';
const VGU_SEMESTERS_KEY = 'vgu_student_semesters_v1';
const VGU_ATTENDANCE_KEY = 'vgu_student_attendance_v1';
const VGU_FORMULA_KEY = 'vgu_student_formula_v1';
const VGU_THEME_KEY = 'vgu_student_theme_v1';

export function loadStoredSubjects(): SubjectCourse[] {
  try {
    const raw = localStorage.getItem(VGU_SUBJECTS_KEY);
    if (!raw) return VGU_SAMPLE_SUBJECTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : VGU_SAMPLE_SUBJECTS;
  } catch {
    return VGU_SAMPLE_SUBJECTS;
  }
}

export function saveStoredSubjects(subjects: SubjectCourse[]): void {
  try {
    localStorage.setItem(VGU_SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function loadStoredSemesters(): SemesterRecord[] {
  try {
    const raw = localStorage.getItem(VGU_SEMESTERS_KEY);
    if (!raw) return VGU_SAMPLE_SEMESTERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : VGU_SAMPLE_SEMESTERS;
  } catch {
    return VGU_SAMPLE_SEMESTERS;
  }
}

export function saveStoredSemesters(semesters: SemesterRecord[]): void {
  try {
    localStorage.setItem(VGU_SEMESTERS_KEY, JSON.stringify(semesters));
  } catch (e) {
    console.error('Failed to save semesters', e);
  }
}

export function loadStoredAttendance(): AttendanceSubject[] {
  try {
    const raw = localStorage.getItem(VGU_ATTENDANCE_KEY);
    if (!raw) return VGU_SAMPLE_ATTENDANCE;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : VGU_SAMPLE_ATTENDANCE;
  } catch {
    return VGU_SAMPLE_ATTENDANCE;
  }
}

export function saveStoredAttendance(attendance: AttendanceSubject[]): void {
  try {
    localStorage.setItem(VGU_ATTENDANCE_KEY, JSON.stringify(attendance));
  } catch (e) {
    console.error('Failed to save attendance', e);
  }
}

export function loadStoredFormula(): ConversionFormula {
  try {
    const raw = localStorage.getItem(VGU_FORMULA_KEY);
    if (raw === 'vgu-standard' || raw === 'simple-10' || raw === 'rajasthan-technical') {
      return raw;
    }
    return 'vgu-standard';
  } catch {
    return 'vgu-standard';
  }
}

export function saveStoredFormula(formula: ConversionFormula): void {
  try {
    localStorage.setItem(VGU_FORMULA_KEY, formula);
  } catch (e) {
    console.error('Failed to save formula', e);
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(VGU_THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(VGU_THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}
