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
        <div className="w-full space-y-12 animate-in fade-in duration-1000">
            {/* Ultra-Premium Upload Zone */}
            <div
                onClick={() => !isSyncing && fileInputRef.current?.click()}
                className={`
                    relative group w-full min-h-[200px] flex flex-col items-center justify-center 
                    bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-12 
                    cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                    hover:bg-white/60 hover:shadow-[0_40px_80px_rgba(0,0,0,0.05)] hover:border-white
                    ${isSyncing ? 'opacity-50 cursor-not-allowed scale-[0.98]' : 'hover:scale-[1.01] active:scale-[0.99]'}
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
                
                {/* Decorative background bloom */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10 blur-3xl rounded-[40px]" />

                <div className={`
                    mb-6 p-6 rounded-[24px] transition-all duration-500 shadow-sm
                    ${isSyncing ? 'bg-black animate-pulse' : 'bg-white group-hover:bg-black group-hover:shadow-2xl group-hover:shadow-black/20 group-hover:-translate-y-1'}
                `}>
                    <Upload 
                        size={28} 
                        className={`transition-colors duration-500 ${isSyncing ? 'text-white' : 'text-black group-hover:text-white'}`} 
                        strokeWidth={2.5} 
                    />
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-[22px] font-[Inter] font-extrabold text-black tracking-tight leading-tight">
                        {isSyncing ? 'Ingesting Intelligence...' : 'Feed the screening engine'}
                    </h3>
                    <p className="text-[14px] font-medium text-black/30 tracking-wide">
                        Drop high-quality PDF resumes or click to browse
                    </p>
                </div>
            </div>

            {/* Cloud Storage - Reimagined as a Premium Registry */}
            {uploadedFiles && uploadedFiles.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-8 bg-black/10 rounded-full" />
                            <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Resource Registry</span>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm("Permanent cloud wipe? This clears all screening history.")) {
                                    onRemoveFile('__ALL__');
                                }
                            }}
                            className="group flex items-center gap-2 text-[10px] font-black text-black/30 hover:text-red-600 transition-all uppercase tracking-widest cursor-pointer"
                        >
                            <span className="h-1 w-1 rounded-full bg-black/10 group-hover:bg-red-500 transition-colors" />
                            Cloud Reset
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {uploadedFiles.map((file, idx) => (
                            <div 
                                key={file} 
                                style={{ animationDelay: `${idx * 50}ms` }}
                                className="group/chip flex items-center justify-between bg-white/60 backdrop-blur-sm border border-black/[0.03] rounded-[22px] pl-5 pr-3 py-4 hover:bg-white hover:border-black/5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in"
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="h-10 w-10 shrink-0 bg-black/5 rounded-2xl flex items-center justify-center group-hover/chip:bg-black group-hover/chip:text-white transition-all duration-300">
                                        <FileText size={18} strokeWidth={2.2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold text-black/90 truncate leading-none mb-1">{file}</span>
                                        <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Authenticated PDF</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFile(file);
                                    }}
                                    className="p-2.5 text-black/10 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <X size={18} strokeWidth={2.5} />
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
