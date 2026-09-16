import React, { useState } from 'react';
import { AttendanceSubject } from '../types';
import { 
  calculateAttendanceStatus, 
  VGU_SAMPLE_ATTENDANCE 
} from '../utils/vguGrading';
import { 
  CalendarCheck, 
  Plus, 
  Minus, 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  XCircle,
  PartyPopper
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedCircularGauge, AnimatedCounter } from './AnimatedMetric';
import { triggerCelebration } from '../utils/confetti';

interface AttendanceCalculatorProps {
  attendanceList: AttendanceSubject[];
  onUpdateAttendance: (list: AttendanceSubject[]) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AttendanceCalculator: React.FC<AttendanceCalculatorProps> = ({
  attendanceList,
  onUpdateAttendance,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'subject-manager'>('quick');

  // Quick Forecaster state
  const [quickAttended, setQuickAttended] = useState<number>(38);
  const [quickTotal, setQuickTotal] = useState<number>(48);
  const [quickTarget, setQuickTarget] = useState<number>(75);

  const quickStatus = calculateAttendanceStatus(quickAttended, quickTotal, quickTarget);

  // Overall attendance across all subjects
  const totalAttendedAll = attendanceList.reduce((acc, i) => acc + (Number(i.attended) || 0), 0);
  const totalConductedAll = attendanceList.reduce((acc, i) => acc + (Number(i.total) || 0), 0);
  const overallStatus = calculateAttendanceStatus(totalAttendedAll, totalConductedAll, 75);

  const handleCelebrateSafe = () => {
    triggerCelebration();
    onShowToast('🎉 Safe from Debarment!', `Your attendance is ${quickStatus.currentPercent}% (Above VGU 75% rule)`, 'success');
  };

  // Quick present/absent buttons
  const handleQuickPresent = () => {
    setQuickAttended(prev => prev + 1);
    setQuickTotal(prev => prev + 1);
    onShowToast('Attended +1', `Now ${quickAttended + 1}/${quickTotal + 1} classes`, 'info');
  };

  const handleQuickAbsent = () => {
    setQuickTotal(prev => prev + 1);
    onShowToast('Missed / Bunked +1', `Total delivered increased to ${quickTotal + 1}`, 'warning');
  };

  const handleQuickReset = () => {
    setQuickAttended(38);
    setQuickTotal(48);
    setQuickTarget(75);
    onShowToast('Reset', 'Quick attendance values restored', 'info');
  };

  // Subject table handlers
  const handleAddSubject = () => {
    const newSub: AttendanceSubject = {
      id: 'att-' + Date.now(),
      code: `CS${attendanceList.length + 101}`,
      name: `Course ${attendanceList.length + 1}`,
      attended: 28,
      total: 35,
      targetPercent: 75
    };
    onUpdateAttendance([...attendanceList, newSub]);
    onShowToast('Course added', 'New attendance tracker row created', 'info');
  };

  const handleRemoveSubject = (id: string) => {
    if (attendanceList.length <= 1) {
      onShowToast('Cannot remove', 'At least one subject required in timetable', 'warning');
      return;
    }
    onUpdateAttendance(attendanceList.filter(item => item.id !== id));
  };

  const handleUpdateField = (id: string, field: keyof AttendanceSubject, value: any) => {
    onUpdateAttendance(attendanceList.map(item => {
      if (item.id !== id) return item;
      return { ...item, [field]: value };
    }));
  };

  const handleIncrementAttended = (id: string) => {
    onUpdateAttendance(attendanceList.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        attended: item.attended + 1,
        total: item.total + 1
      };
    }));
  };

  const handleIncrementAbsent = (id: string) => {
    onUpdateAttendance(attendanceList.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        total: item.total + 1
      };
    }));
  };

  const handleUndoClass = (id: string) => {
    onUpdateAttendance(attendanceList.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        attended: Math.max(0, item.attended - 1),
        total: Math.max(0, item.total - 1)
      };
    }));
  };

  const tabs = [
    { id: 'quick' as const, label: '1. Quick 75% Bunk & Criteria Forecaster' },
    { id: 'subject-manager' as const, label: `2. Semester Subject Ledger (${attendanceList.length} Courses)` },
  ];

  return (
    <div className="space-y-6">
      {/* Sub Tabs with sliding animated pill */}
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
                    layoutId="attendanceSubTabIndicator"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>VGU Minimum Criteria: <strong>75%</strong></span>
          {quickStatus.isEligible && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCelebrateSafe}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
            >
              <PartyPopper className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Safe!</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* TAB 1: QUICK FORECASTER */}
      {activeTab === 'quick' && (
        <motion.div
          key="view-quick"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  VGU 75% Attendance Forecaster
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculate whether you can safely bunk upcoming classes or how many you must attend.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleQuickReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </motion.button>
            </div>

            {/* Target Percentage Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mandatory Attendance Target:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { target: 75, label: '75% Standard', sub: 'VGU Official Rule', color: 'blue' },
                  { target: 80, label: '80% Safe Buffer', sub: 'Recommended Safety', color: 'blue' },
                  { target: 65, label: '65% Medical', sub: 'Concession / Dean', color: 'amber' },
                ].map((item) => (
                  <motion.button
                    key={item.target}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setQuickTarget(item.target)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      quickTarget === item.target
                        ? item.color === 'blue'
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold ring-1 ring-blue-500'
                          : 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 ${item.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.sub}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Inputs & live adjustments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Classes Attended
                </label>
                <input
                  type="number"
                  min="0"
                  max={quickTotal}
                  value={quickAttended}
                  onChange={(e) => setQuickAttended(Math.min(quickTotal, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-2xl font-black rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Number of lectures present
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Delivered Classes
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={quickTotal}
                  onChange={(e) => setQuickTotal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-2xl font-black rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total periods taken by faculty
                </p>
              </div>
            </div>

            {/* Quick action buttons: +1 Today's class */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quick Log:</span>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleQuickPresent}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Attended Today (+1)</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleQuickAbsent}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bunked / Missed (+1)</span>
              </motion.button>
            </div>

            {/* The Output Status Card with Animated Circular Gauge */}
            <motion.div 
              layout
              className={`p-6 rounded-2xl border text-center space-y-4 ${
                quickStatus.isEligible
                  ? 'bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-gradient-to-br from-rose-50/80 to-amber-50/50 dark:from-rose-950/30 dark:to-amber-950/20 border-rose-200 dark:border-rose-900/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <motion.span 
                  layout
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    quickStatus.isEligible
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  }`}
                >
                  {quickStatus.isEligible ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Eligible for VGU Examinations</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Short of Attendance (Below {quickTarget}%)</span>
                    </>
                  )}
                </motion.span>
              </div>

              {/* Circular Attendance Radial Gauge */}
              <div className="flex flex-col items-center justify-center">
                <AnimatedCircularGauge
                  value={quickStatus.currentPercent}
                  max={100}
                  size={160}
                  strokeWidth={12}
                  gradientId="attendanceGaugeGradient"
                  startColor={quickStatus.isEligible ? '#059669' : '#dc2626'}
                  endColor={quickStatus.isEligible ? '#10b981' : '#f87171'}
                >
                  <div className={`text-4xl font-black tracking-tight ${
                    quickStatus.isEligible ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                  }`}>
                    <AnimatedCounter value={quickStatus.currentPercent} decimals={1} suffix="%" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {quickAttended} / {quickTotal}
                  </div>
                </AnimatedCircularGauge>
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      quickStatus.isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, quickStatus.currentPercent)}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0%</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">{quickTarget}% VGU Rule</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Actionable Advice Statement */}
              <motion.div 
                layout
                className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 max-w-lg mx-auto"
              >
                {quickStatus.isEligible ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      🎉 Safe to Bunk!
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      You can safely miss up to <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">{quickStatus.bunksAvailable}</span> upcoming classes without falling below your {quickTarget}% threshold.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                      ⚠️ Action Required: Debarment Risk
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      You must attend the next <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">{quickStatus.classesNeeded}</span> consecutive classes without taking any leave to pull your attendance back up to {quickTarget}%.
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* VGU Official Rule Note */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">Vivekananda Global University Attendance Bylaw:</span>
                <p className="text-[11px] leading-relaxed">
                  As per VGU Academic Ordinance, every student is expected to attend 100% of the lectures, tutorials, and practicals. Under no circumstances will a student with less than 75% attendance be allowed to appear in the End-Term Semester Examinations, except on certified medical grounds or authorized institutional representation up to a minimum of 65%.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: SEMESTER SUBJECT TIMETABLE LEDGER */}
      {activeTab === 'subject-manager' && (
        <motion.div
          key="view-subject-manager"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Top overview card */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Semester Aggregate Attendance
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-black ${
                    overallStatus.isEligible ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    <AnimatedCounter value={overallStatus.currentPercent} decimals={1} suffix="%" />
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    ({totalAttendedAll} / {totalConductedAll} Classes across {attendanceList.length} Courses)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onUpdateAttendance(VGU_SAMPLE_ATTENDANCE)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800/60 transition-colors"
                >
                  Load Sample Timetable
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddSubject}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#0f2b5c] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Table of Subjects with AnimatePresence */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="py-3 px-3 sm:px-4">Course / Subject</th>
                    <th className="py-3 px-3 sm:px-4 w-36 text-center">Attended / Total</th>
                    <th className="py-3 px-3 sm:px-4 w-28 text-center">Current %</th>
                    <th className="py-3 px-3 sm:px-4 w-44">Status / Target</th>
                    <th className="py-3 px-3 sm:px-4 w-40 text-center">Quick Log</th>
                    <th className="py-3 px-3 sm:px-4 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <AnimatePresence>
                    {attendanceList.map((item) => {
                      const status = calculateAttendanceStatus(item.attended, item.total, item.targetPercent || 75);
                      const isShort = !status.isEligible;

                      return (
                        <motion.tr
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isShort ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                          }`}
                        >
                          {/* Course Name */}
                          <td className="py-3 px-3 sm:px-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <input
                                type="text"
                                value={item.code || ''}
                                onChange={(e) => handleUpdateField(item.id, 'code', e.target.value)}
                                placeholder="Code"
                                className="w-20 sm:w-24 px-2 py-1 text-xs font-mono font-medium rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 focus:outline-none"
                              />
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateField(item.id, 'name', e.target.value)}
                                className="flex-1 font-medium text-slate-900 dark:text-white px-2 py-1 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </td>

                          {/* Attended / Total */}
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <div className="inline-flex items-center gap-1 font-mono font-bold">
                              <input
                                type="number"
                                min="0"
                                max={item.total}
                                value={item.attended}
                                onChange={(e) => handleUpdateField(item.id, 'attended', parseInt(e.target.value) || 0)}
                                className="w-12 text-center py-1 rounded border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold bg-white dark:bg-slate-800"
                              />
                              <span className="text-slate-400">/</span>
                              <input
                                type="number"
                                min="1"
                                max="300"
                                value={item.total}
                                onChange={(e) => handleUpdateField(item.id, 'total', parseInt(e.target.value) || 1)}
                                className="w-12 text-center py-1 rounded border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800"
                              />
                            </div>
                          </td>

                          {/* Current % */}
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <motion.span 
                              layout
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                                status.isEligible
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                              }`}
                            >
                              {status.currentPercent}%
                            </motion.span>
                          </td>

                          {/* Actionable status */}
                          <td className="py-3 px-3 sm:px-4">
                            {status.isEligible ? (
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                Can bunk {status.bunksAvailable} {status.bunksAvailable === 1 ? 'class' : 'classes'}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                Must attend next {status.classesNeeded} consecutive
                              </span>
                            )}
                          </td>

                          {/* Quick logging buttons */}
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => handleIncrementAttended(item.id)}
                                title="Mark Present (+1)"
                                className="px-2 py-1 text-xs font-bold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                              >
                                +1 Present
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => handleIncrementAbsent(item.id)}
                                title="Mark Absent / Bunk (+1 total)"
                                className="px-2 py-1 text-xs font-bold rounded bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 transition-colors"
                              >
                                +1 Bunk
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUndoClass(item.id)}
                                title="Undo last class"
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <motion.button
                              whileHover={{ scale: 1.2, color: '#e11d48' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveSubject(item.id)}
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
        </motion.div>
      )}
    </div>
  );
};
