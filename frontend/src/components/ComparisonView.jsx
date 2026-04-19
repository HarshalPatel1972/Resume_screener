import React from 'react';
import { X, Trophy } from 'lucide-react';

const ComparisonView = ({ comparison, onClose }) => {
    if (!comparison) return null;

    const names = Object.keys(comparison.comparison);
    const winner = comparison.better_candidate;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="text-amber-400" /> AI Comparison Result
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 mb-8">
                        <h3 className="text-indigo-400 font-bold mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
                            🏆 AI Verdict: {winner} is the better choice
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{comparison.reason}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mt-8">
                        {names.map(name => {
                            const data = comparison.comparison[name];
                            const isWinner = name === winner;
                            return (
                                <div key={name} className={`p-6 rounded-2xl border ${isWinner ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700 bg-slate-900/50'}`}>
                                    <h4 className="font-bold text-lg mb-4 flex items-center justify-between">
                                        {name}
                                        {isWinner && <span className="bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded">WINNER</span>}
                                    </h4>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Final Score</div>
                                            <div className="text-2xl font-black text-indigo-400">{Math.round(data.final_score * 100)}%</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Experience</div>
                                            <div className="text-sm font-bold">{data.experience_years} Years</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Key Match</div>
                                            <div className="flex flex-wrap gap-1">
                                                {data.matched_skills.slice(0, 3).map(s => (
                                                    <span key={s} className="bg-slate-800 text-[9px] px-2 py-0.5 rounded border border-slate-700">{s}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-700">
                                            <div className={`text-sm font-bold ${data.decision === 'Shortlist' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {data.decision}
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
