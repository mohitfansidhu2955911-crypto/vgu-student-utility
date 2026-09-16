import React from 'react';
import { VGU_GRADE_SCALE } from '../utils/vguGrading';
import { 
  Award, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

export const VguGradingGuide: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* University Intro Banner with gentle hover scale */}
      <motion.div 
        whileHover={{ scale: 1.008 }}
        transition={{ duration: 0.2 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-[#0f2b5c] to-[#1e4b8f] text-white shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-blue-950 uppercase tracking-wider">
              NAAC Grade A+ Accredited
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Vivekananda Global University, Jaipur
            </h2>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-xl">
              Academic evaluation guidelines, Choice Based Credit System (CBCS), 10-point scale grade mapping, and statutory examination bylaws.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs text-blue-200">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>NRI Road, Jagatpura, Jaipur</span>
          </div>
        </div>
      </motion.div>

      {/* 10-Point Grade Table */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.25 }}
        className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4"
      >
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            VGU 10-Point Letter Grading System (CBCS)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Adopted under UGC & AICTE model guidelines for undergraduate & postgraduate engineering and management programs.
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Letter Grade</th>
                <th className="py-3 px-4">Grade Point</th>
                <th className="py-3 px-4">Marks Range (%)</th>
                <th className="py-3 px-4">Qualitative Description</th>
                <th className="py-3 px-4 text-center">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {VGU_GRADE_SCALE.map((item) => (
                <tr key={item.grade} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                      {item.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-300">
                    {item.points}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {item.marksRange}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.grade === 'F' ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Fail / Backlog
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Credit Earned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Formulae & Calculations Explained */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SGPA & CGPA Formulas */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Calculation of SGPA & CGPA
          </h3>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-center">
              <span className="font-bold text-blue-800 dark:text-blue-300">SGPA = Σ (Ci × Gi) ÷ Σ Ci</span>
            </div>
            <p className="leading-relaxed">
              Where <code className="text-blue-600 dark:text-blue-400 font-semibold">Ci</code> is the number of credits allocated to the i-th course, and <code className="text-blue-600 dark:text-blue-400 font-semibold">Gi</code> is the grade point obtained in that course.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-center">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">CGPA = Σ (Cj × SGPAj) ÷ Σ Cj</span>
            </div>
            <p className="leading-relaxed">
              Where <code className="text-emerald-600 dark:text-emerald-400 font-semibold">Cj</code> is total credits of j-th semester and <code className="text-emerald-600 dark:text-emerald-400 font-semibold">SGPAj</code> is the semester grade point average.
            </p>
          </div>
        </motion.div>

        {/* Percentage Conversion */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.15 }}
          className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Official VGU Percentage Conversion
          </h3>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-center">
              <span className="font-bold text-purple-800 dark:text-purple-300">Equivalent % = CGPA × 9.5</span>
            </div>
            <p className="leading-relaxed">
              Per AICTE and Vivekananda Global University guidelines, the standard multiplying factor is <strong>9.5</strong>. For example, a CGPA of 8.00 corresponds to <code className="font-semibold text-slate-900 dark:text-white">8.00 × 9.5 = 76.00%</code>.
            </p>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
              <span className="font-bold">Honours & Distinction:</span> Awarded to candidates securing a CGPA of 8.00 or higher without failing in any paper throughout the program.
            </div>
          </div>
        </motion.div>
      </div>

      {/* 75% Attendance Ordinance */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4"
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          VGU Statutory Attendance Regulations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Minimum 75% Rule
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Mandatory minimum 75% attendance in theoretical lectures, tutorials, and laboratories in every individual course.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              65% Medical Relaxation
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Up to 10% relaxation (lowering threshold to 65%) can be condoned by the Dean on valid medical certificates or national/sports representation.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              Debarment Clause
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Students falling short of 75% without authorized condonation are designated as "Debarred" and cannot sit for that paper's End-Term Exam.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
