import { VguGrade, GradeDefinition, SubjectCourse, SemesterRecord, ConversionFormula, AttendanceSubject } from '../types';

export const VGU_GRADE_SCALE: GradeDefinition[] = [
  { grade: 'O', points: 10, description: 'Outstanding', marksRange: '90 - 100%' },
  { grade: 'A+', points: 9, description: 'Excellent', marksRange: '80 - 89%' },
  { grade: 'A', points: 8, description: 'Very Good', marksRange: '70 - 79%' },
  { grade: 'B+', points: 7, description: 'Good', marksRange: '60 - 69%' },
  { grade: 'B', points: 6, description: 'Above Average', marksRange: '50 - 59%' },
  { grade: 'C', points: 5, description: 'Average', marksRange: '45 - 49%' },
  { grade: 'P', points: 4, description: 'Pass', marksRange: '40 - 44%' },
  { grade: 'F', points: 0, description: 'Fail', marksRange: 'Below 40%' },
];

export const VGU_MINIMUM_ATTENDANCE_PERCENT = 75;

export function getGradePoint(grade: VguGrade): number {
  const match = VGU_GRADE_SCALE.find(g => g.grade === grade);
  return match ? match.points : 0;
}

export function calculateSGPA(subjects: SubjectCourse[]): {
  sgpa: number;
  totalCredits: number;
  earnedPoints: number;
  allPassed: boolean;
} {
  let totalCredits = 0;
  let earnedPoints = 0;
  let allPassed = true;

  for (const sub of subjects) {
    const pts = getGradePoint(sub.grade);
    const cr = Number(sub.credits) || 0;
    totalCredits += cr;
    earnedPoints += cr * pts;
    if (sub.grade === 'F') {
      allPassed = false;
    }
  }

  const sgpa = totalCredits > 0 ? earnedPoints / totalCredits : 0;
  return {
    sgpa: Number(sgpa.toFixed(2)),
    totalCredits,
    earnedPoints,
    allPassed
  };
}

export function calculateCGPA(semesters: SemesterRecord[]): {
  cgpa: number;
  totalCredits: number;
  earnedWeightedSgpa: number;
} {
  let totalCredits = 0;
  let earnedWeighted = 0;

  for (const sem of semesters) {
    const cr = Number(sem.credits) || 0;
    const sgpa = Number(sem.sgpa) || 0;
    totalCredits += cr;
    earnedWeighted += cr * sgpa;
  }

  const cgpa = totalCredits > 0 ? earnedWeighted / totalCredits : 0;
  return {
    cgpa: Number(cgpa.toFixed(2)),
    totalCredits,
    earnedWeightedSgpa: Number(earnedWeighted.toFixed(2))
  };
}

export function cgpaToPercentage(cgpa: number, formula: ConversionFormula): number {
  if (cgpa <= 0) return 0;
  const clampedCgpa = Math.min(10, Math.max(0, cgpa));

  switch (formula) {
    case 'vgu-standard':
      // VGU / AICTE official formula: Percentage (%) = CGPA * 9.5
      return Number((clampedCgpa * 9.5).toFixed(2));
    case 'simple-10':
      // Direct 10x multiplier
      return Number((clampedCgpa * 10).toFixed(2));
    case 'rajasthan-technical':
      // Common state formula: (CGPA - 0.75) * 10
      return Number((Math.max(0, clampedCgpa - 0.75) * 10).toFixed(2));
    default:
      return Number((clampedCgpa * 9.5).toFixed(2));
  }
}

export function percentageToCgpa(percentage: number, formula: ConversionFormula): number {
  if (percentage <= 0) return 0;
  const clamped = Math.min(100, Math.max(0, percentage));

  switch (formula) {
    case 'vgu-standard':
      return Number((clamped / 9.5).toFixed(2));
    case 'simple-10':
      return Number((clamped / 10).toFixed(2));
    case 'rajasthan-technical':
      return Number(((clamped / 10) + 0.75).toFixed(2));
    default:
      return Number((clamped / 9.5).toFixed(2));
  }
}

export function getDivision(percentage: number): {
  division: string;
  badgeColor: string;
} {
  if (percentage >= 75) {
    return { division: 'First Division with Distinction', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' };
  } else if (percentage >= 60) {
    return { division: 'First Division', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300' };
  } else if (percentage >= 50) {
    return { division: 'Second Division', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' };
  } else if (percentage >= 40) {
    return { division: 'Pass Division', badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
  } else {
    return { division: 'Below Passing Threshold', badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300' };
  }
}

export function calculateAttendanceStatus(
  attended: number,
  total: number,
  targetPercent = VGU_MINIMUM_ATTENDANCE_PERCENT
): {
  currentPercent: number;
  isEligible: boolean;
  bunksAvailable: number;
  classesNeeded: number;
  status: 'safe' | 'warning' | 'danger';
} {
  if (total <= 0) {
    return {
      currentPercent: 100,
      isEligible: true,
      bunksAvailable: 0,
      classesNeeded: 0,
      status: 'safe'
    };
  }

  const validAttended = Math.min(attended, total);
  const targetFraction = targetPercent / 100;
  const currentPercent = Number(((validAttended / total) * 100).toFixed(1));
  const isEligible = currentPercent >= targetPercent;

  if (isEligible) {
    // How many classes can you miss (bunk)?
    // (Attended) / (Total + Bunks) >= targetFraction
    // Attended >= targetFraction * Total + targetFraction * Bunks
    // Bunks <= (Attended - targetFraction * Total) / targetFraction
    const maxBunks = Math.floor((validAttended - targetFraction * total) / targetFraction);
    return {
      currentPercent,
      isEligible: true,
      bunksAvailable: Math.max(0, maxBunks),
      classesNeeded: 0,
      status: currentPercent >= targetPercent + 5 ? 'safe' : 'warning'
    };
  } else {
    // How many classes do you need to attend continuously?
    // (Attended + Needed) / (Total + Needed) >= targetFraction
    // Attended + Needed >= targetFraction * Total + targetFraction * Needed
    // Needed * (1 - targetFraction) >= targetFraction * Total - Attended
    // Needed = ceil((targetFraction * Total - Attended) / (1 - targetFraction))
    const denominator = 1 - targetFraction;
    const numerator = targetFraction * total - validAttended;
    const classesNeeded = Math.ceil(numerator / denominator);

    return {
      currentPercent,
      isEligible: false,
      bunksAvailable: 0,
      classesNeeded: Math.max(1, classesNeeded),
      status: 'danger'
    };
  }
}

// Presets for Vivekananda Global University students
export const VGU_SAMPLE_SUBJECTS: SubjectCourse[] = [
  { id: 'sub-1', code: 'BCSE-401', name: 'Design and Analysis of Algorithms', credits: 4, grade: 'A+' },
  { id: 'sub-2', code: 'BCSE-402', name: 'Database Management Systems', credits: 4, grade: 'A' },
  { id: 'sub-3', code: 'BCSE-403', name: 'Operating Systems', credits: 3, grade: 'O' },
  { id: 'sub-4', code: 'BCSE-404', name: 'Theory of Computation', credits: 3, grade: 'B+' },
  { id: 'sub-5', code: 'BCSE-405', name: 'Computer Networks', credits: 3, grade: 'A' },
  { id: 'sub-6', code: 'BCSE-406', name: 'DBMS Laboratory', credits: 1.5, grade: 'O' },
  { id: 'sub-7', code: 'BCSE-407', name: 'Algorithms Laboratory', credits: 1.5, grade: 'A+' },
  { id: 'sub-8', code: 'VHSS-401', name: 'Universal Human Values & Professional Ethics', credits: 2, grade: 'A+' },
];

export const VGU_SAMPLE_SEMESTERS: SemesterRecord[] = [
  { id: 'sem-1', semesterNumber: 1, name: 'Semester 1', credits: 21, sgpa: 8.42 },
  { id: 'sem-2', semesterNumber: 2, name: 'Semester 2', credits: 22, sgpa: 8.75 },
  { id: 'sem-3', semesterNumber: 3, name: 'Semester 3', credits: 23, sgpa: 8.60 },
  { id: 'sem-4', semesterNumber: 4, name: 'Semester 4', credits: 22, sgpa: 8.91 },
];

export const VGU_SAMPLE_ATTENDANCE: AttendanceSubject[] = [
  { id: 'att-1', code: 'BCSE-401', name: 'Design and Analysis of Algorithms', attended: 38, total: 46, targetPercent: 75 },
  { id: 'att-2', code: 'BCSE-402', name: 'Database Management Systems', attended: 41, total: 48, targetPercent: 75 },
  { id: 'att-3', code: 'BCSE-403', name: 'Operating Systems', attended: 29, total: 44, targetPercent: 75 },
  { id: 'att-4', code: 'BCSE-404', name: 'Theory of Computation', attended: 36, total: 42, targetPercent: 75 },
  { id: 'att-5', code: 'BCSE-405', name: 'Computer Networks', attended: 33, total: 40, targetPercent: 75 },
  { id: 'att-6', code: 'BCSE-406', name: 'DBMS & OS Practical Labs', attended: 22, total: 24, targetPercent: 75 },
];
