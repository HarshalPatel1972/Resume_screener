import React from 'react';

const ResultCard = ({ candidate, onCompareSelect, isSelected }) => {
    return (
        <div className={`glass-card rounded-[32px] border transition-all duration-500 overflow-hidden group/card ${isSelected ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/5'}`}>
            <div className="p-8">
                <div className="flex justify-between items-start mb-10">
                    <div className="flex gap-6 items-center">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center font-black text-2xl text-slate-400 border border-white/5">
                            {candidate.rank}
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-white tracking-tight leading-tight">
                                {candidate.filename}
                            </h4>
                            <div className="flex items-center gap-4 mt-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-tighter ${candidate.decision === 'Shortlist' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                                    {candidate.decision}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                    {candidate.experience_years} Years Experience
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-4xl font-black text-white">{Math.round(candidate.final_score * 100)}%</div>
                        <div className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-1">Match Index</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    <div>
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Competencies Found</h5>
                        <div className="flex flex-wrap gap-2">
                            {candidate.matched_skills.map((skill, idx) => (
                                <span key={`${skill}-${idx}`} className="bg-emerald-500/5 text-emerald-400 text-xs px-3 py-1.5 rounded-full border border-emerald-500/10 transition-colors">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Development Areas</h5>
                        <div className="flex flex-wrap gap-2">
                            {candidate.missing_skills.map((skill, idx) => (
                                <span key={`${skill}-${idx}`} className="bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-full border border-white/5 italic">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Core Context</h5>
                    {candidate.evidence.map((chunk, i) => (
                        <div key={i} className="text-sm text-slate-400 mb-3 last:mb-0 leading-relaxed font-medium">
                            "{chunk}"
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                    <button
                        onClick={() => onCompareSelect(candidate.filename)}
                        className={`text-xs font-bold px-6 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                    >
                        {isSelected ? 'Comparison Queued' : 'Add to Comparison'}
                    </button>
                    <div className="flex gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        <span>Semantic: {Math.round(candidate.similarity_score * 100)}%</span>
                        <span>AI Logic: {candidate.ai_score}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
