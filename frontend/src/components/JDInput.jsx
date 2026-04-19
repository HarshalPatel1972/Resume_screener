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

    const criteria = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const minCriteria = 3;
    const remaining = minCriteria - criteria.length;
    const isQualityMet = remaining <= 0;

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">
                        Requirement Stack
                    </label>
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map((i) => (
                            <div 
                                key={i} 
                                className={`h-1.5 w-4 rounded-full transition-all duration-700 ${
                                    criteria.length >= i ? 'bg-black' : 'bg-black/5'
                                }`} 
                            />
                        ))}
                    </div>
                </div>
                {!isQualityMet && !disabled && (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">
                        {remaining} {remaining === 1 ? 'Skill' : 'Skills'} Remaining
                    </span>
                )}
                {isQualityMet && !disabled && (
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">
                        Stack Finalized
                    </span>
                )}
            </div>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g. React, TypeScript, 5+ Years Experience, AWS..."
                className={`
                    w-full min-h-[160px] bg-white border rounded-[24px] p-8 text-[15px] font-medium text-black 
                    placeholder-[#86868B]/40 focus:outline-none resize-none transition-all duration-500
                    ${!isQualityMet && !disabled && value.trim().length > 0 ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.03)]' : 'border-[#D2D2D7]/40 shadow-sm focus:border-black focus:ring-8 focus:ring-black/5'}
                `}
            />

            <button
                onClick={onRank}
                disabled={disabled || loading || !isQualityMet}
                className={`
                    mt-6 w-full h-16 rounded-full font-black text-[14px] uppercase tracking-[0.2em] transition-all duration-500 
                    flex items-center justify-center active:scale-[0.98] shadow-2xl
                    ${disabled || !isQualityMet ? 'bg-black/5 text-black/20 border border-black/5 shadow-none' : 'bg-black text-white hover:bg-black/80 shadow-black/20'}
                `}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        Synthesizing <span className="inline-block w-4 text-left ml-1">{dots}</span>
                    </span>
                ) : disabled ? (
                    "Upload Resumes First"
                ) : !isQualityMet ? (
                    `Need ${remaining} More ${remaining === 1 ? 'Criteria' : 'Criterias'}`
                ) : (
                    "Run Intelligence"
                )}
            </button>
        </div>
    );
};

export default JDInput;
