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
                    className="relative w-full max-w-[680px] bg-[var(--bg-surface)] rounded-3xl p-10 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--bg-sunken)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-8">
                        <h2 className="font-['Instrument_Serif'] text-[32px] font-normal leading-none mb-2 text-[var(--text-primary)]">
                            AI Verdict
                        </h2>
                        <div className="bg-[var(--bg-sunken)] rounded-xl p-4 text-[14px] text-[var(--text-primary)] border border-[var(--border)]">
                            {comparison.reason}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6">

                        {/* Candidate 1 */}
                        <div className={`flex-1 flex flex-col p-5 rounded-2xl border ${comparison.better_candidate === c1.filename ? 'border-[var(--accent)] border-2' : 'border-[var(--border)]'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    {comparison.better_candidate === c1.filename && (
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
                                            <Trophy size={12} /> Top Pick
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
                        <div className={`flex-1 flex flex-col p-5 rounded-2xl border ${comparison.better_candidate === c2.filename ? 'border-[var(--accent)] border-2' : 'border-[var(--border)]'}`}>
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
