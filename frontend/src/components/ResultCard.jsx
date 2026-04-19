import React from 'react';
import { Award, AlertCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

const ResultCard = ({ candidate, onCompareSelect, isSelected }) => {
    const getScoreColor = (score) => {
        if (score >= 0.7) return 'bg-emerald-500';
        if (score >= 0.4) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className={`bg-slate-800 rounded-2xl border ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-700'} shadow-lg mb-4 overflow-hidden group`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                        <span className="text-2xl font-black text-slate-600">#{candidate.rank}</span>
                        <div>
                            <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                {candidate.filename}
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${candidate.decision === 'Shortlist' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {candidate.decision}
                                </span>
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Clock size={12} /> {candidate.experience_years}y Exp</span>
                                <span className={`flex items-center gap-1 ${candidate.meets_experience ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <CheckCircle2 size={12} /> {candidate.meets_experience ? 'Meets req' : 'Low exp'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-black text-indigo-400">{Math.round(candidate.final_score * 100)}%</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Final Score</div>
                    </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-slate-900 h-2 rounded-full mb-6 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${getScoreColor(candidate.final_score)}`}
                        style={{ width: `${candidate.final_score * 100}%` }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Award size={12} className="text-emerald-400" /> Matched Skills
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {candidate.matched_skills.map((skill, idx) => (
                                <span key={`${skill}-${idx}`} className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">{skill}</span>
                            ))}
                            {candidate.matched_skills.length === 0 && <span className="text-xs text-slate-600">None detected</span>}
                        </div>
                    </div>
                    <div>
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <AlertCircle size={12} className="text-rose-400" /> Missing Skills
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {candidate.missing_skills.map((skill, idx) => (
                                <span key={`${skill}-${idx}`} className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-1 rounded border border-rose-500/20">{skill}</span>
                            ))}
                            {candidate.missing_skills.length === 0 && <span className="text-xs text-slate-600">None detected</span>}
                        </div>
                    </div>
                </div>

                {/* Evidence Section */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">RAG Evidence Chunks</h5>
                    {candidate.evidence.map((chunk, i) => (
                        <div key={i} className="text-xs text-slate-400 italic mb-2 leading-relaxed border-l-2 border-indigo-500/30 pl-3">
                            "{chunk}"
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                    <button
                        onClick={() => onCompareSelect(candidate.filename)}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        {isSelected ? 'Selected' : 'Select for Comparison'}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>Similarity: {Math.round(candidate.similarity_score * 100)}%</span>
                        <span>•</span>
                        <span>AI Alignment: {candidate.ai_score}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
