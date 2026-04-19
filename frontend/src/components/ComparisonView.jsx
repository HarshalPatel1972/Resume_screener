import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';

const ComparisonView = ({ comparison, onClose }) => {
    if (!comparison) return null;

    const [c1_key, c2_key] = Object.keys(comparison.comparison);
    const c1 = comparison.comparison[c1_key];
    const c2 = comparison.comparison[c2_key];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={onClose}
            >
                <motion.div
                    className="relative w-full max-w-[680px] bg-white rounded-[32px] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-black/5"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/5 transition-all text-black/20 hover:text-black active:scale-95"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>

                    <div className="mb-10">
                        <h2 className="text-[28px] font-black leading-none mb-4 text-black tracking-tighter uppercase italic">
                            The Verdict
                        </h2>
                        <div className="bg-[#FBFBFD] rounded-2xl p-6 text-[15px] font-medium leading-relaxed text-black/70 border border-[#D2D2D7]/30 shadow-inner">
                            {comparison.reason}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6">

                        {/* Candidate 1 */}
                        <div className={`flex-1 flex flex-col p-6 rounded-[24px] border transition-all ${comparison.better_candidate === c1.filename ? 'border-black ring-4 ring-black/5' : 'border-[#D2D2D7]/30'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    {comparison.better_candidate === c1.filename && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase tracking-[0.2em] mb-4">
                                            <div className="h-2 w-2 rounded-full bg-black animate-pulse" /> Selected Choice
                                        </div>
                                    )}
                                    <h3 className="font-semibold text-[17px] text-[var(--text-primary)] truncate max-w-[150px]">
                                        {c1.filename.replace('.pdf', '')}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[24px] font-extrabold ${comparison.better_candidate === c1.filename ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                                        {Math.round(c1.final_score * 100)}%
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Experience</h4>
                                    <p className="text-[14px] text-[var(--text-secondary)]">{c1.experience_years} years</p>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Key Strengths</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {c1.matched_skills?.slice(0, 4).map((m, i) => (
                                            <span key={i} className="text-[12px] bg-[var(--bg-sunken)] px-2 py-1 rounded-md text-[var(--text-secondary)]">{m}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider (only visible on md+) */}
                        <div className="hidden md:block w-px bg-[var(--border-strong)] my-4" />

                        {/* Candidate 2 */}
                        <div className={`flex-1 flex flex-col p-6 rounded-[24px] border transition-all ${comparison.better_candidate === c2.filename ? 'border-black ring-4 ring-black/5' : 'border-[#D2D2D7]/30'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    {comparison.better_candidate === c2.filename && (
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                                            <Trophy size={12} /> Top Pick
                                        </div>
                                    )}
                                    <h3 className="font-semibold text-[17px] text-[var(--text-primary)] truncate max-w-[150px]">
                                        {c2.filename.replace('.pdf', '')}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[24px] font-extrabold ${comparison.better_candidate === c2.filename ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                                        {Math.round(c2.final_score * 100)}%
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Experience</h4>
                                    <p className="text-[14px] text-[var(--text-secondary)]">{c2.experience_years} years</p>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Key Strengths</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {c2.matched_skills?.slice(0, 4).map((m, i) => (
                                            <span key={i} className="text-[12px] bg-[var(--bg-sunken)] px-2 py-1 rounded-md text-[var(--text-secondary)]">{m}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ComparisonView;
