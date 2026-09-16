import React, { useState } from 'react';
import { ConversionFormula, MarksSubject } from '../types';
import { 
  cgpaToPercentage, 
  percentageToCgpa, 
  getDivision 
} from '../utils/vguGrading';
import { 
  Calculator, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Info,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedCircularGauge, AnimatedCounter } from './AnimatedMetric';

interface PercentageCalculatorProps {
  formula: ConversionFormula;
  onChangeFormula: (formula: ConversionFormula) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PercentageCalculator: React.FC<PercentageCalculatorProps> = ({
  formula,
  onChangeFormula,
  onShowToast
}) => {
  // Mode tabs: 'cgpa-conv' | 'marks-conv' | 'exam-target'
  const [activeTab, setActiveTab] = useState<'cgpa-conv' | 'marks-conv' | 'exam-target'>('cgpa-conv');

  // CGPA <-> Percentage state
  const [cgpaInput, setCgpaInput] = useState<string>('8.50');
  const [percentInput, setPercentInput] = useState<string>('80.75');
  const [copied, setCopied] = useState(false);

  // Subject Marks Table state
  const [marksSubjects, setMarksSubjects] = useState<MarksSubject[]>([
    { id: 'm-1', name: 'Subject 1 (Theory)', obtained: 82, maxMarks: 100 },
    { id: 'm-2', name: 'Subject 2 (Theory)', obtained: 76, maxMarks: 100 },
    { id: 'm-3', name: 'Subject 3 (Theory)', obtained: 91, maxMarks: 100 },
    { id: 'm-4', name: 'Subject 4 (Theory)', obtained: 68, maxMarks: 100 },
    { id: 'm-5', name: 'Subject 5 (Practical / Lab)', obtained: 46, maxMarks: 50 },
    { id: 'm-6', name: 'Subject 6 (Practical / Lab)', obtained: 48, maxMarks: 50 },
  ]);

  // Exam Target Planner state
  const [internalScored, setInternalScored] = useState<number>(34);
  const [internalMax, setInternalMax] = useState<number>(40);
  const [externalMax, setExternalMax] = useState<number>(60);
  const [targetDesiredGrade, setTargetDesiredGrade] = useState<number>(80); // 80% for A+

  // Handlers for CGPA conversion
  const handleCgpaChange = (val: string) => {
    setCgpaInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      const calcPercent = cgpaToPercentage(num, formula);
      setPercentInput(calcPercent.toString());
    }
  };

  const handlePercentChange = (val: string) => {
    setPercentInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      const calcCgpa = percentageToCgpa(num, formula);
      setCgpaInput(calcCgpa.toString());
    }
  };

  const currentCgpaNum = parseFloat(cgpaInput) || 0;
  const currentPercentNum = parseFloat(percentInput) || 0;
  const divisionInfo = getDivision(currentPercentNum);

  const handleCopyResult = () => {
    const text = `VGU Jaipur Academic Score: ${currentCgpaNum.toFixed(2)} CGPA = ${currentPercentNum.toFixed(2)}% (${formula === 'vgu-standard' ? 'VGU / AICTE 9.5x Formula' : 'Formula: ' + formula}) - ${divisionInfo.division}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Copied to clipboard', text, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  // Handlers for Marks List
  const handleAddMarksSubject = () => {
    setMarksSubjects([
      ...marksSubjects,
      {
        id: 'm-' + Date.now(),
        name: `Subject ${marksSubjects.length + 1}`,
        obtained: 75,
        maxMarks: 100,
      }
    ]);
  };

  const handleRemoveMarksSubject = (id: string) => {
    if (marksSubjects.length <= 1) {
      onShowToast('Cannot remove', 'At least one subject required', 'warning');
      return;
    }
    setMarksSubjects(marksSubjects.filter(m => m.id !== id));
  };

  const handleUpdateMarksSubject = (id: string, field: keyof MarksSubject, val: any) => {
    setMarksSubjects(marksSubjects.map(m => {
      if (m.id !== id) return m;
      return { ...m, [field]: val };
    }));
  };

  // Calculate total marks and percentage
  const totalObtained = marksSubjects.reduce((acc, s) => acc + (Number(s.obtained) || 0), 0);
  const totalMaxMarks = marksSubjects.reduce((acc, s) => acc + (Number(s.maxMarks) || 0), 0);
  const calculatedMarksPercent = totalMaxMarks > 0 ? Number(((totalObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
  const marksDivision = getDivision(calculatedMarksPercent);
  const estimatedEquivalentCgpa = percentageToCgpa(calculatedMarksPercent, formula);

  // Exam Target Planner calculation
  const totalOverallSubjectMax = internalMax + externalMax;
  const totalMarksNeededForTarget = (targetDesiredGrade / 100) * totalOverallSubjectMax;
  const marksNeededInExternal = Math.ceil(totalMarksNeededForTarget - internalScored);
  const requiredExternalPercent = externalMax > 0 ? Number(((marksNeededInExternal / externalMax) * 100).toFixed(1)) : 0;

  const tabs = [
    { id: 'cgpa-conv' as const, label: '1. CGPA ↔ Percentage Conversion' },
    { id: 'marks-conv' as const, label: '2. Marks to Percentage Ledger' },
    { id: 'exam-target' as const, label: '3. Internal & External Exam Forecaster' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub Tabs with animated sliding pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="relative flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="percentSubTabIndicator"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Formula selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Conversion Standard:</span>
          <select
            value={formula}
            onChange={(e) => onChangeFormula(e.target.value as ConversionFormula)}
            className="px-2.5 py-1 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="vgu-standard">VGU / AICTE Official (CGPA × 9.5)</option>
            <option value="simple-10">Direct Scale (CGPA × 10)</option>
            <option value="rajasthan-technical">Rajasthan Tech ((CGPA - 0.75) × 10)</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: CGPA <-> PERCENTAGE CONVERTER */}
      {activeTab === 'cgpa-conv' && (
        <motion.div
          key="view-cgpa-conv"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Two-Way CGPA & Percentage Converter
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Accredited by Vivekananda Global University Jaipur following official AICTE / UGC standard
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCopyResult}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                    >
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy for Resume/Job Form</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Live Interactive Conversion Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800">
              {/* CGPA Input side */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  CGPA (Scale of 10)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={cgpaInput}
                    onChange={(e) => handleCgpaChange(e.target.value)}
                    className="w-full px-4 py-3 text-2xl sm:text-3xl font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    / 10.00
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter your Cumulative Grade Point Average
                </p>
              </div>

              {/* Percentage Input side */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Equivalent Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={percentInput}
                    onChange={(e) => handlePercentChange(e.target.value)}
                    className="w-full px-4 py-3 text-2xl sm:text-3xl font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Calculated using {formula === 'vgu-standard' ? 'Percentage = CGPA × 9.5' : formula}
                </p>
              </div>
            </div>

            {/* Evaluation Result Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Applied Formula</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {formula === 'vgu-standard'
                    ? 'Percentage = CGPA × 9.5'
                    : formula === 'simple-10'
                    ? 'Percentage = CGPA × 10'
                    : 'Percentage = (CGPA - 0.75) × 10'}
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Awarded Division</div>
                <div className="mt-1">
                  <motion.span 
                    layout
                    className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${divisionInfo.badgeColor}`}
                  >
                    {divisionInfo.division}
                  </motion.span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Placement / Job Eligibility</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {currentPercentNum >= 60 ? 'Eligible for IT/MNCs (≥60%)' : 'Check company criteria'}
                </div>
              </motion.div>
            </div>

            {/* Info Note on VGU Formula */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Official VGU Conversion Reference:</span>
                <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
                  Vivekananda Global University follows the AICTE guideline for conversion of CGPA into equivalent percentage: <strong className="font-semibold text-slate-900 dark:text-white">Percentage = CGPA × 9.5</strong>. This formula is recognized for central/state examinations (GATE, UPSC, SSC, Banking) and corporate placements.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEW 2: MARKS TO PERCENTAGE LEDGER */}
      {activeTab === 'marks-conv' && (
        <motion.div
          key="view-marks-conv"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Subject Marks & Aggregate Calculator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add theoretical and lab examination marks to compute total percentage & division
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddMarksSubject}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#0f2b5c] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Paper</span>
              </motion.button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-3 sm:px-4">Paper / Subject Name</th>
                      <th className="py-3 px-3 sm:px-4 w-32">Obtained Marks</th>
                      <th className="py-3 px-3 sm:px-4 w-32">Maximum Marks</th>
                      <th className="py-3 px-3 sm:px-4 w-28 text-center">Percentage</th>
                      <th className="py-3 px-3 sm:px-4 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <AnimatePresence>
                      {marksSubjects.map((sub) => {
                        const subPercent = sub.maxMarks > 0 ? Number(((sub.obtained / sub.maxMarks) * 100).toFixed(1)) : 0;
                        const isPassed = subPercent >= 40;

                        return (
                          <motion.tr
                            key={sub.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-2.5 px-3 sm:px-4">
                              <input
                                type="text"
                                value={sub.name}
                                onChange={(e) => handleUpdateMarksSubject(sub.id, 'name', e.target.value)}
                                className="w-full font-medium text-slate-900 dark:text-white px-2 py-1 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none text-xs sm:text-sm"
                              />
                            </td>

                            <td className="py-2.5 px-3 sm:px-4">
                              <input
                                type="number"
                                min="0"
                                max={sub.maxMarks}
                                value={sub.obtained}
                                onChange={(e) => handleUpdateMarksSubject(sub.id, 'obtained', parseFloat(e.target.value) || 0)}
                                className="w-full px-2.5 py-1 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>

                            <td className="py-2.5 px-3 sm:px-4">
                              <input
                                type="number"
                                min="1"
                                max="200"
                                value={sub.maxMarks}
                                onChange={(e) => handleUpdateMarksSubject(sub.id, 'maxMarks', parseFloat(e.target.value) || 0)}
                                className="w-full px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>

                            <td className="py-2.5 px-3 sm:px-4 text-center font-semibold">
                              <span className={isPassed ? 'text-slate-700 dark:text-slate-300' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                                {subPercent}%
                              </span>
                            </td>

                            <td className="py-2.5 px-3 sm:px-4 text-center">
                              <motion.button
                                whileHover={{ scale: 1.2, color: '#e11d48' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveMarksSubject(sub.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Delete subject"
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

          {/* Result Card with Circular Progress Gauge */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div 
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs space-y-5"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aggregate Marks Result
              </span>

              <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <AnimatedCircularGauge
                  value={calculatedMarksPercent}
                  max={100}
                  size={150}
                  strokeWidth={11}
                  gradientId="marksGaugeGradient"
                  startColor="#4338ca"
                  endColor="#6366f1"
                >
                  <div className="text-3xl font-black tracking-tight text-[#0f2b5c] dark:text-blue-300">
                    <AnimatedCounter value={calculatedMarksPercent} decimals={2} suffix="%" />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Aggregate
                  </div>
                </AnimatedCircularGauge>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-indigo-800 dark:text-indigo-200 shadow-xs border border-indigo-200 dark:border-indigo-800/60">
                  <span>≈ <AnimatedCounter value={estimatedEquivalentCgpa} decimals={2} /> CGPA Equivalent</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">Marks Scored</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {totalObtained} / {totalMaxMarks}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400">Total Subjects</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {marksSubjects.length} Papers
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Division:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {marksDivision.division}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* VIEW 3: INTERNAL VS EXTERNAL TARGET SCORE ESTIMATOR */}
      {activeTab === 'exam-target' && (
        <motion.div
          key="view-exam-target"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                VGU Internal & End-Term Exam Forecaster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                At Vivekananda Global University, courses are split between Continuous Internal Assessment (e.g. 40 marks) and End-Term Exam (e.g. 60 marks). Enter your internal marks to see what you need in the End-Term paper.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Marks Scored
                </label>
                <input
                  type="number"
                  min="0"
                  max={internalMax}
                  value={internalScored}
                  onChange={(e) => setInternalScored(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="text-[10px] text-slate-400">Mid-terms, attendance, assignments</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max Internal Marks
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={internalMax}
                  onChange={(e) => setInternalMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="text-[10px] text-slate-400">Usually 40 or 50 marks</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Max End-Term Exam Marks
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={externalMax}
                  onChange={(e) => setExternalMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="text-[10px] text-slate-400">Usually 60 or 50 marks</span>
              </div>
            </div>

            {/* Target Grade Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Target Final Course Grade / Percentage:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Grade O (≥90%)', pct: 90 },
                  { label: 'Grade A+ (≥80%)', pct: 80 },
                  { label: 'Grade A (≥70%)', pct: 70 },
                  { label: 'Pass (≥40%)', pct: 40 },
                ].map(item => (
                  <motion.button
                    key={item.pct}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTargetDesiredGrade(item.pct)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      targetDesiredGrade === item.pct
                        ? 'bg-[#0f2b5c] text-white border-blue-900 dark:bg-blue-600 dark:border-blue-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Forecaster Outcome Card with Spring animation */}
            <motion.div 
              layout
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 dark:from-slate-800/80 dark:to-amber-950/20 border border-slate-200 dark:border-slate-700 text-center space-y-3"
            >
              <div className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                Minimum Marks Needed in End-Term University Exam
              </div>

              <div className={`text-5xl font-black tracking-tight ${
                marksNeededInExternal > externalMax
                  ? 'text-rose-600 dark:text-rose-400'
                  : marksNeededInExternal <= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[#0f2b5c] dark:text-blue-300'
              }`}>
                {marksNeededInExternal <= 0 ? 0 : <AnimatedCounter value={marksNeededInExternal} decimals={0} />}{' '}
                <span className="text-xl font-bold text-slate-400">/ {externalMax}</span>
              </div>

              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {marksNeededInExternal > externalMax ? (
                  <span className="text-rose-600 dark:text-rose-400">
                    ⚠️ Need more than maximum marks available ({marksNeededInExternal} &gt; {externalMax}). Aim for the next lower grade.
                  </span>
                ) : marksNeededInExternal <= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    🎉 You have already secured enough internal marks to achieve this grade threshold! Just attend and write the paper.
                  </span>
                ) : (
                  <span>
                    You need to score at least <strong className="text-blue-700 dark:text-blue-300">{marksNeededInExternal} marks ({requiredExternalPercent}%)</strong> in the End-Term written exam to secure your target grade.
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
