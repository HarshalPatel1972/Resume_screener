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
        <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">
                    Target Profile
                </label>
                {!value.trim() && !disabled && (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
                        Missing Criteria
                    </span>
                )}
            </div>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Detail the technical requirements and culture fit..."
                className={`
                    w-full min-h-[160px] bg-white border rounded-[24px] p-8 text-[15px] font-medium text-black 
                    placeholder-[#86868B]/40 focus:outline-none resize-none transition-all duration-500
                    ${!value.trim() && !disabled ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.03)]' : 'border-[#D2D2D7]/40 shadow-sm focus:border-black focus:ring-8 focus:ring-black/5'}
                `}
            />

            <button
                onClick={onRank}
                disabled={disabled || loading || !value.trim()}
                className={`
                    mt-6 w-full h-16 rounded-full font-black text-[14px] uppercase tracking-[0.2em] transition-all duration-500 
                    flex items-center justify-center active:scale-[0.98] shadow-2xl
                    ${disabled || !value.trim() ? 'bg-black/5 text-black/20 border border-black/5 shadow-none' : 'bg-black text-white hover:bg-black/80 shadow-black/20'}
                `}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        Synthesizing <span className="inline-block w-4 text-left ml-1">{dots}</span>
                    </span>
                ) : disabled ? (
                    "Upload Resumes First"
                ) : !value.trim() ? (
                    "Enter Criteria"
                ) : (
                    "Initialize Analysis"
                )}
            </button>
        </div>
    );
};

export default JDInput;
