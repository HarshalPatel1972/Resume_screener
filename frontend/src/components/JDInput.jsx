import React, { useState, useEffect } from 'react';

const JDInput = ({ value, onChange, onRank, loading, disabled }) => {
    // Animated dots for the loading state
    const [dots, setDots] = useState('');

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '·');
            }, 400);
        } else {
            setDots('');
        }
        return () => clearInterval(interval);
    }, [loading]);

    return (
        <div className="w-full flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.08em]">
                TARGET CRITERIA
            </label>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g. 5+ years React, TypeScript, REST APIs, strong communication skills…"
                className="w-full min-h-[160px] bg-white border border-[#D2D2D7]/50 rounded-[22px] p-6 text-[15px] text-black placeholder-[#86868B]/60 focus:outline-none focus:border-[#D2D2D7] focus:ring-4 focus:ring-black/5 resize-none transition-all duration-300"
            />

            <button
                onClick={onRank}
                disabled={disabled || loading || !value.trim()}
                className="mt-6 w-full h-14 bg-black hover:bg-black/80 text-white font-bold text-[15px] rounded-full transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98] shadow-xl shadow-black/10"
            >
                {loading ? (
                    <span className="flex items-center">
                        Analyzing <span className="inline-block w-4 text-left ml-1">{dots}</span>
                    </span>
                ) : (
                    "Analyze Candidates"
                )}
            </button>
        </div>
    );
};

export default JDInput;
