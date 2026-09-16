import React from 'react';
import { ActiveTab } from '../types';
import { 
  GraduationCap, 
  Percent, 
  CalendarCheck, 
  BookOpen, 
  Sun, 
  Moon, 
  RotateCcw, 
  Printer, 
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { triggerGentleBurst } from '../utils/confetti';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  onResetData,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleCelebrate = () => {
    triggerGentleBurst();
  };

  const navItems = [
    { id: 'cgpa' as ActiveTab, label: 'CGPA & SGPA Calculator', icon: GraduationCap },
    { id: 'percentage' as ActiveTab, label: 'Percentage Calculator', icon: Percent },
    { id: 'attendance' as ActiveTab, label: 'Attendance & 75% Rule', icon: CalendarCheck },
    { id: 'guide' as ActiveTab, label: 'VGU Grading Guide', icon: BookOpen },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 transition-colors shadow-xs">
      {/* University Official Sub-bar */}
      <div className="bg-gradient-to-r from-[#0f2b5c] via-[#163a78] to-[#0b2249] text-white py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <motion.span 
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 5, duration: 1.5 }}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] border border-amber-400/40"
            >
              V
            </motion.span>
            <span className="font-medium tracking-wide">
              Vivekananda Global University, Jaipur
            </span>
            <span className="hidden md:inline-block text-amber-300/80 font-normal">
              • Sector 36, NRI Road, Jagatpura
            </span>
          </div>

          <div className="flex items-center gap-3">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
              <span>NAAC Grade A+ University</span>
            </motion.span>
            <span className="text-slate-300 text-[11px] hidden sm:inline">
              UGC & AICTE Approved
            </span>
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          
          {/* Logo & Hub Identity */}
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCelebrate}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f2b5c] to-[#1e4b8f] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-blue-900/40 shrink-0 cursor-pointer"
              title="Click for celebratory spark!"
            >
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  VGU Student Utility Hub
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  Jaipur
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official grading scale, SGPA/CGPA formulas & 75% attendance criteria
              </p>
            </div>
          </div>

          {/* Controls: Theme, Reset, Print */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onResetData}
              title="Reset with VGU sample data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Load VGU Sample</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handlePrint}
              title="Print academic summary / transcript sheet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Tab Navigation with Animated Sliding Indicator */}
        <nav className="relative flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative z-10 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeHeaderTab"
                    className="absolute inset-0 bg-[#0f2b5c] dark:bg-blue-600 rounded-lg shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
