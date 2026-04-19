import React from 'react';
import { X, Trophy } from 'lucide-react';

const ComparisonView = ({ comparison, onClose }) => {
    if (!comparison) return null;

    const names = Object.keys(comparison.comparison);
    const winner = comparison.better_candidate;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-3xl z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] border-white/5">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                        Deep Comparison Analysis
                    </h2>
                    <button onClick={onClose} className="h-10 w-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-[32px] p-8 mb-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 h-40 w-40 bg-indigo-500/20 blur-[60px] rounded-full" />
                        <h3 className="text-indigo-400 font-black mb-4 uppercase text-[10px] tracking-[0.2em]">
                            Smart Recommendation
                        </h3>
                        <p className="text-white text-xl font-medium leading-relaxed max-w-3xl">
                            Our analysis suggests <span className="text-indigo-400 font-black underline underline-offset-4 decoration-2">{winner}</span> as the ideal candidate for this requirement.
                        </p>
                        <div className="mt-6 text-slate-400 text-sm italic border-l-2 border-indigo-500/40 pl-6 leading-relaxed">
                            {comparison.reason}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {names.map(name => {
                            const data = comparison.comparison[name];
                            const isWinner = name === winner;
                            return (
                                <div key={name} className={`p-8 rounded-[32px] border transition-all duration-500 ${isWinner ? 'border-indigo-500/40 bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'border-white/5 bg-white/[0.01]'}`}>
                                    <h4 className="font-bold text-xl mb-8 flex items-center justify-between text-white">
                                        {name}
                                        {isWinner && <span className="bg-indigo-500 text-[10px] text-white font-black px-2.5 py-1 rounded tracking-widest">TOP FIT</span>}
                                    </h4>

                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Fit Index</div>
                                                <div className="text-4xl font-black text-white">{Math.round(data.final_score * 100)}%</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Exp. Level</div>
                                                <div className="text-lg font-bold text-slate-300">{data.experience_years} Years</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Top Strengths</div>
                                            <div className="flex flex-wrap gap-2">
                                                {data.matched_skills.slice(0, 4).map(s => (
                                                    <span key={s} className="bg-white/5 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-lg border border-white/5">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5">
                                            <div className={`text-xs font-black uppercase tracking-[0.2em] ${data.decision === 'Shortlist' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {data.decision} Recommendation
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonView;
