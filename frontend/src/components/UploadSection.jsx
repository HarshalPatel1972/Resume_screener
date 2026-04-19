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
                            {isSyncing ? 'Reading Files' : 'Start here'}
                        </h3>
                        <p className="text-[15px] text-[#86868B] mt-1 font-medium">
                            {isSyncing ? 'Almost ready...' : 'Add candidate resumes (PDF)'}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UploadSection;
