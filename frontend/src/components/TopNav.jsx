import React from 'react';
import { UploadCloud } from 'lucide-react';

const TopNav = ({ uploadedCount, onUploadClick, onReset }) => {
    return (
        <div className="fixed top-0 left-0 right-0 h-14 bg-[var(--bg-surface)] border-b border-[var(--border)] z-50 flex items-center justify-between px-6">
            <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={onReset}
            >
                <span className="font-[Inter] font-bold text-[15px] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">SleekScan</span>
                <span className="text-[var(--text-tertiary)] font-medium text-[13px] hidden sm:inline-block">Resume Intelligence</span>
            </div>

            <div className="flex items-center gap-4">
                {uploadedCount > 0 && (
                    <span className="bg-[var(--bg-sunken)] px-2.5 py-1 rounded-full text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        {uploadedCount} Loaded
                    </span>
                )}
                <button
                    onClick={onUploadClick}
                    className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent hover:bg-[var(--bg-sunken)] px-3 py-1.5 rounded-lg transition-all duration-200"
                >
                    <UploadCloud size={16} />
                    <span>New Scan</span>
                </button>
            </div>
        </div>
    );
};

export default TopNav;
