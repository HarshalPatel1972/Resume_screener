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
        <div className="w-full max-w-2xl mx-auto py-12 animate-in fade-in duration-1000">
            {/* Pure Apple Minimalist Upload */}
            <div
                onClick={() => !isSyncing && fileInputRef.current?.click()}
                className={`
                    relative w-full aspect-[16/6] flex flex-col items-center justify-center 
                    bg-[#FBFBFD] border border-[#D2D2D7]/50 rounded-[22px] 
                    cursor-pointer transition-all duration-400 ease-out
                    hover:bg-[#F5F5F7] hover:border-[#D2D2D7]
                    ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'}
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
                
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-[#D2D2D7] flex items-center justify-center">
                        <Upload size={20} className="text-[#1D1D1F]" strokeWidth={1} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-[19px] font-semibold text-[#1D1D1F] tracking-tight">
                            {isSyncing ? 'Uploading' : 'Add Resumes'}
                        </h3>
                        <p className="text-[14px] text-[#86868B] mt-1">
                            Select PDF files to begin
                        </p>
                    </div>
                </div>
            </div>

            {/* Clean File Registry */}
            {uploadedFiles && uploadedFiles.length > 0 && (
                <div className="mt-16 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[13px] font-semibold text-[#1D1D1F]">Ready for Screening</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm("Clear all resumes?")) {
                                    onRemoveFile('__ALL__');
                                }
                            }}
                            className="text-[13px] text-[#0066CC] hover:underline transition-all cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>
                    
                    <div className="divide-y divide-[#D2D2D7]/30 border-t border-b border-[#D2D2D7]/30">
                        {uploadedFiles.map((file) => (
                            <div 
                                key={file} 
                                className="group flex items-center justify-between py-4"
                            >
                                <div className="flex items-center gap-4">
                                    <FileText size={18} className="text-[#86868B]" strokeWidth={1.2} />
                                    <span className="text-[15px] text-[#1D1D1F] font-medium">{file}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFile(file);
                                    }}
                                    className="p-2 opacity-0 group-hover:opacity-100 text-[#86868B] hover:text-[#FF3B30] transition-all"
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
