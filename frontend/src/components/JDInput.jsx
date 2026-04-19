import React from 'react';
import { Search } from 'lucide-react';

const JDInput = ({ value, onChange, onRank, loading }) => {
    return (
        <div className="glass-card p-10 rounded-[32px] shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-slate-100">
                Target Criteria
            </h3>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste the Job Specification here..."
                className="w-full bg-slate-800/50 text-slate-100 border border-slate-700/50 rounded-2xl p-6 min-height-[180px] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600 focus:bg-slate-800"
                rows={8}
            />
            <button
                onClick={onRank}
                disabled={loading || !value}
                className="mt-6 w-full bg-slate-100 hover:bg-white disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold py-4 px-6 rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        Calculating Fit...
                    </>
                ) : (
                    "Evaluate Candidates"
                )}
            </button>
        </div>
    );
};

export default JDInput;
