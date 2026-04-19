import React from 'react';
import { UploadCloud } from 'lucide-react';

const TopNav = ({ uploadedCount, onUploadClick, onReset }) => {
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl h-14 bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] z-50 flex items-center justify-between px-6 rounded-2xl">
            <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={onReset}
            >
                <div className="h-2 w-2 rounded-full bg-[var(--accent)] group-hover:scale-125 transition-transform" />
                <span className="font-[Inter] font-bold text-[14px] text-[var(--text-primary)] tracking-tight">Resume Screener</span>
            </div>

            <div className="flex items-center gap-3">
                {uploadedCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-[var(--bg-sunken)]/50 px-2.5 py-1 rounded-full border border-[var(--border)]/50">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em]">
                            {uploadedCount} Resumes
                        </span>
                    </div>
                )}
                <button
                    onClick={onUploadClick}
                    className="flex items-center gap-2 text-[12px] font-semibold text-white bg-[var(--text-primary)] hover:bg-[#000] px-4 py-2 rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-black/5"
                >
                    <UploadCloud size={14} />
                    <span>New Scan</span>
                </button>
            </div>
        </div>
};

export default TopNav;
