import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResultCard = ({ candidate, onCompareSelect, isSelected, rank }) => {
    const [expanded, setExpanded] = useState(false);

    // Score semantic colors
    let colorTheme = { scoreText: 'text-[var(--text-primary)]', progress: 'bg-[var(--accent)]', badgeBg: 'bg-[var(--bg-sunken)]', badgeText: 'text-[var(--text-tertiary)]' };

    if (candidate.final_score >= 0.75) {
        colorTheme = { scoreText: 'text-[var(--green)]', progress: 'bg-[var(--green)]', badgeBg: 'bg-[var(--green-subtle)]', badgeText: 'text-[var(--green)]' };
    } else if (candidate.final_score >= 0.50) {
        colorTheme = { scoreText: 'text-[var(--amber)]', progress: 'bg-[var(--amber)]', badgeBg: 'bg-[var(--amber-subtle)]', badgeText: 'text-[var(--amber)]' };
    } else {
        colorTheme = { scoreText: 'text-[var(--red)]', progress: 'bg-[var(--red)]', badgeBg: 'bg-[var(--red-subtle)]', badgeText: 'text-[var(--red)]' };
    }

    // Parse decision to normalize semantic badges
    const dLow = (candidate.decision || "").toLowerCase();
    let badgeTheme = { bg: 'bg-[var(--bg-sunken)]', text: 'text-[var(--text-tertiary)]' };

    if (dLow.includes('shortlist') || dLow.includes('hire')) {
        badgeTheme = { bg: 'bg-[var(--green-subtle)]', text: 'text-[#15803d]' }; // Darker green for text legibility
    } else if (dLow.includes('review') || dLow.includes('maybe')) {
        badgeTheme = { bg: 'bg-[var(--amber-subtle)]', text: 'text-[#b45309]' };
    } else {
        // Pass/Reject
        badgeTheme = { bg: '#F5F5F5', text: 'text-[var(--text-tertiary)]' };
    }

    return (
        <div
            className={`relative w-full bg-white rounded-[24px] p-8 border transition-all duration-400 shadow-sm ${isSelected ? 'border-black ring-4 ring-black/5' : 'border-[#D2D2D7]/40 hover:border-[#D2D2D7] hover:shadow-md'
                }`}
        >
            <div
                className="absolute top-6 left-[-16px] hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-black/5 text-[12px] font-black text-black shadow-lg shadow-black/5"
            >
                #{rank}
            </div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-[18px] text-[var(--text-primary)] tracking-tight">
                            {candidate.filename.replace('.pdf', '')}
                        </h3>

                        <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${badgeTheme.bg.startsWith('#') ? '' : badgeTheme.bg} ${badgeTheme.text}`}
                            style={badgeTheme.bg.startsWith('#') ? { backgroundColor: badgeTheme.bg } : {}}
                        >
                            {candidate.decision || 'Review'}
                        </span>
                    </div>

                    <div className="text-[14px] font-medium text-black/30 tracking-tight">
                        {candidate.experience_years} years professional experience
                    </div>
                </div>

                <div className="text-right">
                    <div className={`font-['Inter'] font-extrabold text-[52px] leading-none tracking-tight text-[var(--text-primary)]`}>
                        {Math.round(candidate.final_score * 100)}<span className="text-[24px] text-[var(--text-tertiary)] ml-1">%</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-[var(--bg-sunken)] rounded-full mb-8 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${candidate.final_score * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full ${colorTheme.progress} rounded-full`}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                    <h4 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Strengths</h4>
                    <div className="flex flex-wrap gap-2">
                        {candidate.matched_skills?.map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Gaps</h4>
                    <div className="flex flex-wrap gap-2">
                        {candidate.missing_skills?.map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[var(--border)] text-[13px] text-[var(--text-secondary)]">
                                {skill}
                            </span>
                        ))}
                        {(!candidate.missing_skills || candidate.missing_skills.length === 0) && (
                            <span className="text-[13px] text-[var(--text-tertiary)] italic">None identified</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4 mt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-[12px] font-bold text-black hover:bg-black hover:text-white transition-all duration-300 active:scale-95"
                >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Rationale
                </button>

                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-black border-black' : 'border-[#D2D2D7] bg-white group-hover:border-black'
                        }`}>
                        {isSelected && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                    </div>
                    <span className="text-[13px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                        Select for Comparison
                    </span>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={() => onCompareSelect(candidate.filename)}
                    />
                </label>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[var(--bg-sunken)] rounded-xl p-5 mt-4 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                            <strong className="text-[var(--text-primary)] font-semibold block mb-2">Contextual Evidence:</strong>
                            <blockquote className="border-l-2 border-[var(--border-strong)] pl-4 italic">
                                "{candidate.evidence}"
                            </blockquote>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ResultCard;
