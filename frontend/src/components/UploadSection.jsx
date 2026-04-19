import React from 'react';
import { Upload, FileCheck } from 'lucide-react';

const UploadSection = ({ onUpload, status }) => {
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        onUpload(files);
    };

    return (
        <div className="glass-card p-10 rounded-[32px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Upload size={80} className="text-indigo-500" />
            </div>

            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-100 relative z-10">
                Candidate Assets
            </h3>

            <div className="relative group/zone">
                <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-10 text-center group-hover/zone:border-indigo-500/50 group-hover/zone:bg-indigo-500/5 transition-all duration-300 relative z-10">
                    <div className="bg-slate-800 h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/zone:scale-110 transition-transform shadow-lg border border-slate-700">
                        <Upload size={24} className="text-indigo-400" />
                    </div>
                    <p className="text-slate-300 font-medium tracking-tight">Drop resumes or browse</p>
                    <p className="text-[11px] text-slate-500 mt-2 uppercase tracking-widest font-bold">PDF Format Only</p>
                </div>
            </div>

            {status && (
                <div className="mt-6 flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-400 truncate max-w-[200px]">{status}</span>
                    </div>
                    <FileCheck size={16} className="text-emerald-500" />
                </div>
            )}
        </div>
    );
};

export default UploadSection;
