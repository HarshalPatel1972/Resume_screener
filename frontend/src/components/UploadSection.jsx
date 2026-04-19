import React, { useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadSection = ({ onUpload, status, uploadedFiles, onRemoveFile }) => {
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(Array.from(e.target.files));
        }
    };

    const isSyncing = status === 'Syncing...';

    return (
        <div className="w-full max-w-2xl mx-auto py-0 space-y-4 animate-in fade-in duration-1000">
            {/* Interactive Apple Drop Zone */}
            <div
                onClick={() => !isSyncing && fileInputRef.current?.click()}
                className={`
                    relative group w-full aspect-[16/7] flex flex-col items-center justify-center 
                    bg-white border border-[#D2D2D7]/40 rounded-[32px] 
                    cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                    hover:border-[#0066CC]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.03)]
                    ${isSyncing ? 'opacity-70 cursor-wait' : 'active:scale-[0.98]'}
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
                
                {/* Dynamic Background Pulse */}
                <div className={`absolute inset-0 rounded-[32px] transition-opacity duration-1000 ${isSyncing ? 'bg-[#0066CC]/5 animate-pulse' : 'opacity-0 group-hover:opacity-100 bg-[#F5F5F7]'}`} />

                <div className="relative flex flex-col items-center gap-2 z-10">
                    <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700
                        ${isSyncing ? 'bg-[#0066CC] rotate-180 scale-110' : 'bg-[#1D1D1F] group-hover:bg-[#0066CC] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,102,204,0.3)]'}
                    `}>
                        <Upload 
                            size={24} 
                            className={`transition-all duration-500 ${isSyncing ? 'text-white animate-bounce' : 'text-white'}`} 
                            strokeWidth={1.5} 
                        />
                    </div>
                    <div className="text-center">
                        <h3 className="text-[21px] font-bold text-[#1D1D1F] tracking-tight">
                            {isSyncing ? 'Digitizing Records' : 'Start your scan'}
                        </h3>
                        <p className="text-[15px] text-[#86868B] mt-1 font-medium">
                            {isSyncing ? 'Hang tight, we\'re analyzing...' : 'Tap or drop candidate resumes'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Fluid File List */}
            <AnimatePresence mode="popLayout">
                {uploadedFiles && uploadedFiles.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-[#1D1D1F]">Ready to analyze</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0066CC] animate-pulse" />
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm("Cloud Reset?")) onRemoveFile('__ALL__');
                                }}
                                className="text-[13px] font-semibold text-[#0066CC] hover:text-[#004499] transition-colors cursor-pointer"
                            >
                                Reset Registry
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {uploadedFiles.map((file, idx) => (
                                <motion.div 
                                    layout
                                    key={file} 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group flex items-center justify-between bg-white border border-[#D2D2D7]/30 rounded-2xl px-5 py-4 hover:border-[#D2D2D7] hover:shadow-sm transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-[#F5F5F7] rounded-xl flex items-center justify-center text-[#1D1D1F]">
                                            <FileText size={18} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] text-[#1D1D1F] font-bold truncate leading-tight uppercase tracking-tight">{file}</span>
                                            <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-widest mt-1">Processed & Ready</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveFile(file);
                                        }}
                                        className="p-3 opacity-0 group-hover:opacity-100 text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/5 rounded-full transition-all duration-200 translate-x-2 group-hover:translate-x-0"
                                    >
                                        <X size={18} strokeWidth={2} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadSection;
