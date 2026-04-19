import React, { useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';

const UploadSection = ({ onUpload, status, uploadedFiles, onRemoveFile }) => {
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(Array.from(e.target.files));
        }
    };

    const isSyncing = status === 'Syncing...';

    return (
        <div className="w-full space-y-8">
            {/* Minimalist Upload Zone */}
            <div
                onClick={() => !isSyncing && fileInputRef.current?.click()}
                className={`
                    relative group w-full min-h-[160px] flex flex-col items-center justify-center 
                    bg-white border border-[var(--border)] rounded-[28px] p-10 
                    cursor-pointer transition-all duration-400
                    hover:border-black/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]
                    ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}
                `}
            >
                <input
                    type="file"
                    multiple
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleChange}
                    className="hidden"
                    disabled={isSyncing}
                />
                <div className="mb-4 p-4 bg-[var(--bg-base)] rounded-2xl group-hover:bg-black group-hover:scale-110 transition-all duration-300">
                    <Upload size={22} className="text-black group-hover:text-white transition-colors" strokeWidth={2} />
                </div>
                <div className="text-center">
                    <h3 className="text-[17px] font-bold text-black tracking-tight mb-1">
                        {isSyncing ? 'Processing Resumes...' : 'Upload candidate assets'}
                    </h3>
                    <p className="text-[13px] font-medium text-black/40">
                        Drag and drop or click to browse (PDF only)
                    </p>
                </div>
            </div>

            {/* Candidate Chips - Apple Style */}
            {uploadedFiles && uploadedFiles.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[11px] font-extrabold text-black/30 uppercase tracking-[0.2em]">Stored database</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm("Permanent cloud reset? This cannot be undone.")) {
                                    onRemoveFile('__ALL__');
                                }
                            }}
                            className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest cursor-pointer"
                        >
                            Reset Cloud
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {uploadedFiles.map(file => (
                            <div 
                                key={file} 
                                className="group/chip flex items-center justify-between bg-white border border-[var(--border)] rounded-2xl pl-4 pr-2 py-3 shadow-sm hover:shadow-md hover:border-black/10 transition-all"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-8 w-8 shrink-0 bg-[var(--bg-base)] rounded-xl flex items-center justify-center">
                                        <FileText size={16} className="text-black/60" />
                                    </div>
                                    <span className="text-[14px] font-semibold text-black/80 truncate">{file}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFile(file);
                                    }}
                                    className="p-2 text-black/20 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadSection;
