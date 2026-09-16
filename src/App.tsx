import React, { useState, useEffect } from 'react';
import { ActiveTab, SubjectCourse, SemesterRecord, AttendanceSubject, ConversionFormula, ToastMessage } from './types';
import { 
  loadStoredSubjects, 
  saveStoredSubjects, 
  loadStoredSemesters, 
  saveStoredSemesters, 
  loadStoredAttendance, 
  saveStoredAttendance, 
  loadStoredFormula, 
  saveStoredFormula, 
  loadTheme, 
  saveTheme 
} from './utils/storage';
import { 
  VGU_SAMPLE_SUBJECTS, 
  VGU_SAMPLE_SEMESTERS, 
  VGU_SAMPLE_ATTENDANCE 
} from './utils/vguGrading';
import { Header } from './components/Header';
import { CgpaCalculator } from './components/CgpaCalculator';
import { PercentageCalculator } from './components/PercentageCalculator';
import { AttendanceCalculator } from './components/AttendanceCalculator';
import { VguGradingGuide } from './components/VguGradingGuide';
import { ToastContainer } from './components/Toast';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cgpa');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  
  const [subjects, setSubjects] = useState<SubjectCourse[]>(() => loadStoredSubjects());
  const [semesters, setSemesters] = useState<SemesterRecord[]>(() => loadStoredSemesters());
  const [attendanceList, setAttendanceList] = useState<AttendanceSubject[]>(() => loadStoredAttendance());
  const [formula, setFormula] = useState<ConversionFormula>(() => loadStoredFormula());
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Theme synchronization
  useEffect(() => {
    saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save changes to storage
  useEffect(() => {
    saveStoredSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveStoredSemesters(semesters);
  }, [semesters]);

  useEffect(() => {
    saveStoredAttendance(attendanceList);
  }, [attendanceList]);

  useEffect(() => {
    saveStoredFormula(formula);
  }, [formula]);

  const showToast = (title: string, description?: string, type?: 'success' | 'info' | 'warning') => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title,
      description,
      type: type || 'success'
    };
    setToasts(prev => [...prev.slice(-3), newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleResetData = () => {
    setSubjects(VGU_SAMPLE_SUBJECTS);
    setSemesters(VGU_SAMPLE_SEMESTERS);
    setAttendanceList(VGU_SAMPLE_ATTENDANCE);
    setFormula('vgu-standard');
    showToast('Reset Complete', 'Loaded Vivekananda Global University sample academic data', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-100 dark:selection:bg-blue-900/60 font-sans antialiased overflow-x-hidden">
      {/* Header & University Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
        onResetData={handleResetData}
      />

      {/* Main Workspace Area with Fluid Tab Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'cgpa' && (
            <motion.div
              key="tab-cgpa"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <CgpaCalculator
                subjects={subjects}
                onUpdateSubjects={setSubjects}
                semesters={semesters}
                onUpdateSemesters={setSemesters}
                formula={formula}
                onShowToast={showToast}
              />
            </motion.div>
          )}

          {activeTab === 'percentage' && (
            <motion.div
              key="tab-percentage"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <PercentageCalculator
                formula={formula}
                onChangeFormula={setFormula}
                onShowToast={showToast}
              />
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div
              key="tab-attendance"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <AttendanceCalculator
                attendanceList={attendanceList}
                onUpdateAttendance={setAttendanceList}
                onShowToast={showToast}
              />
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="tab-guide"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <VguGradingGuide />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer with University Credentials */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Vivekananda Global University (VGU)
            </span>
            <span>• Sector 36, NRI Road, Jagatpura, Jaipur, Rajasthan 303905</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>NAAC A+ Accredited</span>
            <span>•</span>
            <span>AICTE & UGC Recognized</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Formula: CGPA × 9.5</span>
          </div>
        </div>
      </footer>

      {/* Notification Toasts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
