import React from 'react';
import { Search } from 'lucide-react';

const JDInput = ({ value, onChange, onRank, loading }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
                <Search size={20} /> 2. Job Description
            </h3>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste the Job Description (JD) here to begin RAG analysis..."
                className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-4 min-height-[150px] focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                rows={6}
            />
            <button
                onClick={onRank}
                disabled={loading || !value}
                className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20"
            >
                {loading ? "🔮 Analyzing..." : "Run AI Screening Analysis"}
            </button>
        </div>
    );
};

export default JDInput;
