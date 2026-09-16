import React, { useState } from 'react';
import { SubjectCourse, SemesterRecord, VguGrade, ConversionFormula } from '../types';
import { 
  VGU_GRADE_SCALE, 
  calculateSGPA, 
  calculateCGPA, 
  cgpaToPercentage, 
  getDivision,
  getGradePoint,
  VGU_SAMPLE_SUBJECTS
} from '../utils/vguGrading';
import { 
  Plus, 
  Trash2, 
  Target, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  PartyPopper
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedCircularGauge, AnimatedCounter } from './AnimatedMetric';
import { triggerCelebration } from '../utils/confetti';

interface CgpaCalculatorProps {
  subjects: SubjectCourse[];
  onUpdateSubjects: (subjects: SubjectCourse[]) => void;
  semesters: SemesterRecord[];
  onUpdateSemesters: (semesters: SemesterRecord[]) => void;
  formula: ConversionFormula;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const CgpaCalculator: React.FC<CgpaCalculatorProps> = ({
  subjects,
  onUpdateSubjects,
  semesters,
  onUpdateSemesters,
  formula,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sgpa' | 'cgpa' | 'target'>('sgpa');

  // SGPA Calculation
  const sgpaResult = calculateSGPA(subjects);
  const sgpaPercentage = cgpaToPercentage(sgpaResult.sgpa, formula);
  const sgpaDivision = getDivision(sgpaPercentage);

  // CGPA Calculation
  const cgpaResult = calculateCGPA(semesters);
  const cgpaPercentage = cgpaToPercentage(cgpaResult.cgpa, formula);
  const cgpaDivision = getDivision(cgpaPercentage);

  // Target CGPA Forecaster state
  const [targetCgpa, setTargetCgpa] = useState<number>(8.5);
  const [currentCgpaInput, setCurrentCgpaInput] = useState<number>(cgpaResult.cgpa || 8.0);
  const [completedCredits, setCompletedCredits] = useState<number>(cgpaResult.totalCredits || 60);
  const [upcomingCredits, setUpcomingCredits] = useState<number>(22);

  const handleCelebrate = () => {
    triggerCelebration();
    onShowToast('🎉 Academic Excellence!', `Celebrating your SGPA of ${sgpaResult.sgpa.toFixed(2)} at VGU Jaipur!`, 'success');
  };

  // Add subject
  const handleAddSubject = () => {
    const newSub: SubjectCourse = {
      id: 'sub-' + Date.now(),
      code: `SUB-${subjects.length + 1}`,
      name: `Course ${subjects.length + 1}`,
      credits: 4,
      grade: 'A'
    };
    onUpdateSubjects([...subjects, newSub]);
    onShowToast('Subject added', 'New course row created in current semester', 'info');
  };

  // Remove subject
  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) {
      onShowToast('Cannot remove', 'Semester must have at least one course row', 'warning');
      return;
    }
    onUpdateSubjects(subjects.filter(s => s.id !== id));
  };

  // Update subject
  const handleUpdateSubject = (id: string, field: keyof SubjectCourse, value: any) => {
    onUpdateSubjects(subjects.map(sub => {
      if (sub.id !== id) return sub;
      return { ...sub, [field]: value };
    }));
  };

  // Save current SGPA into semesters
  const handleSaveToSemesters = () => {
    if (sgpaResult.totalCredits === 0) {
      onShowToast('Invalid credits', 'Add at least one valid subject with credits', 'warning');
      return;
    }
    const newSemNum = semesters.length + 1;
    const newSem: SemesterRecord = {
      id: 'sem-' + Date.now(),
      semesterNumber: newSemNum,
      name: `Semester ${newSemNum}`,
      credits: sgpaResult.totalCredits,
      sgpa: sgpaResult.sgpa
    };
    onUpdateSemesters([...semesters, newSem]);
    onShowToast('Added to CGPA history', `Semester ${newSemNum} (SGPA: ${sgpaResult.sgpa}) recorded`, 'success');
  };

  // Add semester in CGPA tab
  const handleAddSemester = () => {
    const nextNum = semesters.length + 1;
    const newSem: SemesterRecord = {
      id: 'sem-' + Date.now(),
      semesterNumber: nextNum,
      name: `Semester ${nextNum}`,
      credits: 22,
      sgpa: 8.0
    };
    onUpdateSemesters([...semesters, newSem]);
  };

  const handleRemoveSemester = (id: string) => {
    if (semesters.length <= 1) {
      onShowToast('Cannot remove', 'At least one semester required in history', 'warning');
      return;
    }
    onUpdateSemesters(semesters.filter(s => s.id !== id));
  };

  const handleUpdateSemester = (id: string, field: keyof SemesterRecord, value: any) => {
    onUpdateSemesters(semesters.map(s => {
      if (s.id !== id) return s;
      return { ...s, [field]: value };
    }));
  };

  // Calculate required SGPA for Target
  const calculateRequiredSgpa = () => {
    const totalCreditsFuture = completedCredits + upcomingCredits;
    if (upcomingCredits <= 0 || totalCreditsFuture <= 0) return null;

    const totalPointsNeeded = targetCgpa * totalCreditsFuture;
    const currentPoints = currentCgpaInput * completedCredits;
    const requiredPoints = totalPointsNeeded - currentPoints;
    const reqSgpa = requiredPoints / upcomingCredits;

    return Number(reqSgpa.toFixed(2));
  };

  const requiredSgpa = calculateRequiredSgpa();

  const subTabs = [
    { id: 'sgpa' as const, label: '1. Semester SGPA Calculator' },
    { id: 'cgpa' as const, label: '2. Cumulative CGPA (All Semesters)' },
    { id: 'target' as const, label: '3. Target CGPA Predictor' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub tabs with sliding animated pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="relative flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto no-scrollbar">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative z-10 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="cgpaSubTabIndicator"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">UGC/AICTE 10-Point Grading Scale</span>
          {sgpaResult.sgpa >= 8.5 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCelebrate}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Celebrate Distinction!</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* VIEW 1: SGPA CALCULATOR */}
      {activeSubTab === 'sgpa' && (
        <motion.div
          key="view-sgpa"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Main Subjects Table (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Current Semester Subjects
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select grade and credit value for each subject per VGU syllabus
                </p>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onUpdateSubjects(VGU_SAMPLE_SUBJECTS)}
                  className="px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800/60 transition-colors"
                >
                  Load Sample B.Tech Sem
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddSubject}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#0f2b5c] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </motion.button>
              </div>
            </div>

            {/* Subjects Table Card with animated rows */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-3 sm:px-4">Code / Subject</th>
                      <th className="py-3 px-3 sm:px-4 w-28">Credits</th>
                      <th className="py-3 px-3 sm:px-4 w-36">Grade</th>
                      <th className="py-3 px-3 sm:px-4 w-24 text-center">Pts</th>
                      <th className="py-3 px-3 sm:px-4 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <AnimatePresence>
                      {subjects.map((sub) => {
                        const gradePt = getGradePoint(sub.grade);
                        const isFail = sub.grade === 'F';

                        return (
                          <motion.tr
                            key={sub.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                              isFail ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 sm:px-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <input
                                  type="text"
                                  value={sub.code || ''}
                                  onChange={(e) => handleUpdateSubject(sub.id, 'code', e.target.value)}
                                  placeholder="Code"
                                  className="w-20 sm:w-24 px-2 py-1 text-xs font-mono font-medium rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={sub.name}
                                  onChange={(e) => handleUpdateSubject(sub.id, 'name', e.target.value)}
                                  placeholder="Course Name"
                                  className="flex-1 px-2 py-1 text-xs sm:text-sm font-medium rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                                />
                              </div>
                            </td>

                            <td className="py-2.5 px-3 sm:px-4">
                              <select
                                value={sub.credits}
                                onChange={(e) => handleUpdateSubject(sub.id, 'credits', parseFloat(e.target.value) || 0)}
                                className="w-full px-2.5 py-1 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="5">5 Credits</option>
                                <option value="4">4 Credits</option>
                                <option value="3">3 Credits</option>
                                <option value="2">2 Credits</option>
                                <option value="1.5">1.5 Credits (Lab)</option>
                                <option value="1">1 Credit</option>
                              </select>
                            </td>

                            <td className="py-2.5 px-3 sm:px-4">
                              <select
                                value={sub.grade}
                                onChange={(e) => handleUpdateSubject(sub.id, 'grade', e.target.value as VguGrade)}
                                className={`w-full px-2.5 py-1 text-xs sm:text-sm font-bold rounded-lg border focus:outline-none focus:ring-1 ${
                                  isFail
                                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                {VGU_GRADE_SCALE.map((g) => (
                                  <option key={g.grade} value={g.grade}>
                                    {g.grade} ({g.points} pts) - {g.description}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-2.5 px-3 sm:px-4 text-center font-mono font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                              {(Number(sub.credits) * gradePt).toFixed(1)}
                            </td>

                            <td className="py-2.5 px-3 sm:px-4 text-center">
                              <motion.button
                                whileHover={{ scale: 1.2, color: '#e11d48' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveSubject(sub.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Delete course"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SGPA Summary Scorecard (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div 
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Semester SGPA Result
                </span>
                <motion.span 
                  layout
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sgpaDivision.badgeColor}`}
                >
                  {sgpaResult.allPassed ? 'Passed' : 'Backlog (F)'}
                </motion.span>
              </div>

              {/* Animated SGPA Gauge & Score Display */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40">
                <AnimatedCircularGauge
                  value={sgpaResult.sgpa}
                  max={10}
                  size={150}
                  strokeWidth={11}
                  gradientId="sgpaGradient"
                  startColor="#0f2b5c"
                  endColor="#3b82f6"
                >
                  <div className="text-3xl font-black tracking-tight text-[#0f2b5c] dark:text-blue-300">
                    <AnimatedCounter value={sgpaResult.sgpa} decimals={2} />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    / 10.00 SGPA
                  </div>
                </AnimatedCircularGauge>

                <motion.div 
                  layout
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-blue-800 dark:text-blue-200 shadow-xs border border-blue-200 dark:border-blue-800/60"
                >
                  <span>≈ <AnimatedCounter value={sgpaPercentage} decimals={2} suffix="%" /></span>
                  <span className="text-[10px] font-normal text-slate-400">({formula === 'vgu-standard' ? '× 9.5' : '× 10'})</span>
                </motion.div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">Total Credits</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {sgpaResult.totalCredits}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">Grade Points (ΣCi×Gi)</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    <AnimatedCounter value={sgpaResult.earnedPoints} decimals={1} />
                  </div>
                </div>
              </div>

              {/* Division Badge */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Division:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {sgpaDivision.division}
                </span>
              </div>

              {/* Warning for F grade */}
              {!sgpaResult.allPassed && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <div>
                    <span className="font-bold">Backlog Warning:</span> One or more courses have an 'F' (Fail) grade (0 points). In VGU, backlog subjects must be cleared in subsequent examinations.
                  </div>
                </motion.div>
              )}

              {/* Save to History Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveToSemesters}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#0f2b5c] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xs transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>Save this SGPA to Multi-Sem CGPA History</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* VIEW 2: MULTI-SEMESTER CGPA CALCULATOR */}
      {activeSubTab === 'cgpa' && (
        <motion.div
          key="view-cgpa"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Semesters list */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Semester-wise Academic Records
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Weighted Cumulative Grade Point Average (CGPA) = Σ(Credits × SGPA) ÷ Σ(Credits)
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddSemester}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#0f2b5c] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Semester</span>
              </motion.button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-3 sm:px-4">Semester</th>
                      <th className="py-3 px-3 sm:px-4 w-32">Total Credits</th>
                      <th className="py-3 px-3 sm:px-4 w-36">SGPA (0 - 10)</th>
                      <th className="py-3 px-3 sm:px-4 w-28 text-center">Credit × SGPA</th>
                      <th className="py-3 px-3 sm:px-4 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <AnimatePresence>
                      {semesters.map((sem) => {
                        const weighted = (Number(sem.credits) * Number(sem.sgpa)).toFixed(2);

                        return (
                          <motion.tr
                            key={sem.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3 px-3 sm:px-4">
                              <input
                                type="text"
                                value={sem.name}
                                onChange={(e) => handleUpdateSemester(sem.id, 'name', e.target.value)}
                                className="font-medium text-slate-900 dark:text-white px-2 py-1 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none"
                              />
                            </td>

                            <td className="py-3 px-3 sm:px-4">
                              <input
                                type="number"
                                min="1"
                                max="40"
                                step="0.5"
                                value={sem.credits}
                                onChange={(e) => handleUpdateSemester(sem.id, 'credits', parseFloat(e.target.value) || 0)}
                                className="w-full px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>

                            <td className="py-3 px-3 sm:px-4">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.01"
                                value={sem.sgpa}
                                onChange={(e) => handleUpdateSemester(sem.id, 'sgpa', parseFloat(e.target.value) || 0)}
                                className="w-full px-2.5 py-1 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>

                            <td className="py-3 px-3 sm:px-4 text-center font-mono font-semibold text-slate-600 dark:text-slate-300">
                              {weighted}
                            </td>

                            <td className="py-3 px-3 sm:px-4 text-center">
                              <motion.button
                                whileHover={{ scale: 1.2, color: '#e11d48' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveSemester(sem.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Delete semester"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CGPA Summary Card with Circular Gauge */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div 
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Overall Cumulative CGPA
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cgpaDivision.badgeColor}`}>
                  {cgpaDivision.division}
                </span>
              </div>

              {/* CGPA Score Display */}
              <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <AnimatedCircularGauge
                  value={cgpaResult.cgpa}
                  max={10}
                  size={150}
                  strokeWidth={11}
                  gradientId="cgpaGradient"
                  startColor="#059669"
                  endColor="#10b981"
                >
                  <div className="text-3xl font-black tracking-tight text-emerald-800 dark:text-emerald-300">
                    <AnimatedCounter value={cgpaResult.cgpa} decimals={2} />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Overall CGPA
                  </div>
                </AnimatedCircularGauge>

                <motion.div 
                  layout
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-200 shadow-xs border border-emerald-200 dark:border-emerald-800/60"
                >
                  <span>≈ <AnimatedCounter value={cgpaPercentage} decimals={2} suffix="%" /></span>
                  <span className="text-[10px] font-normal text-slate-400">(Official VGU Formula)</span>
                </motion.div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">Semesters Recorded</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {semesters.length} Semesters
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">Completed Credits</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {cgpaResult.totalCredits} Cr
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Final Division:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {cgpaDivision.division}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  VGU Degree Honors Norm
                </div>
                <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
                  Students graduating with a CGPA ≥ 8.0 and no backlog histories are eligible for First Division with Distinction at Vivekananda Global University.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* VIEW 3: TARGET CGPA FORECASTER */}
      {activeSubTab === 'target' && (
        <motion.div
          key="view-target"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Target CGPA Predictor & Planner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Calculate the exact SGPA you need in your upcoming semester to achieve your target degree CGPA.
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target CGPA Desired (e.g. 8.50)
                </label>
                <input
                  type="number"
                  min="4.0"
                  max="10.0"
                  step="0.05"
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Cumulative CGPA
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={currentCgpaInput}
                  onChange={(e) => setCurrentCgpaInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Completed Credits So Far
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={completedCredits}
                  onChange={(e) => setCompletedCredits(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upcoming Semester Credits
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={upcomingCredits}
                  onChange={(e) => setUpcomingCredits(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Target Calculation Result Card */}
            {requiredSgpa !== null && (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-blue-950/30 border border-slate-200 dark:border-slate-700 text-center space-y-3"
              >
                <div className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Required Upcoming Semester SGPA
                </div>

                <div className={`text-5xl font-black tracking-tight ${
                  requiredSgpa > 10
                    ? 'text-rose-600 dark:text-rose-400'
                    : requiredSgpa <= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-[#0f2b5c] dark:text-blue-300'
                }`}>
                  <AnimatedCounter value={requiredSgpa} decimals={2} />
                </div>

                {requiredSgpa > 10 ? (
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold max-w-md mx-auto">
                    ⚠️ Mathematically unattainable in 1 semester (exceeds maximum 10.00 SGPA ceiling). Consider aiming for a slightly adjusted target or distributing across 2+ semesters.
                  </div>
                ) : requiredSgpa <= 0 ? (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold max-w-md mx-auto">
                    🎉 Excellent! Your current CGPA already comfortably satisfies or exceeds this target.
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    You need to score at least <span className="font-bold text-blue-700 dark:text-blue-300">{requiredSgpa.toFixed(2)} SGPA</span> across your next {upcomingCredits} credits to bring your overall CGPA up to <span className="font-bold text-slate-900 dark:text-white">{targetCgpa.toFixed(2)}</span>.
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
