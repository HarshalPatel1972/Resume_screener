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
                className="w-full min-h-[140px] bg-[var(--bg-sunken)] border border-[var(--border)] rounded-xl p-4 text-[15px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[1.5px] focus:border-[var(--accent)] resize-y transition-colors duration-150"
            />

            <button
                onClick={onRank}
                disabled={disabled || loading || !value.trim()}
                className="mt-4 w-full h-12 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-[15px] rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
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
