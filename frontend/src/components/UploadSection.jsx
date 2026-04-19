import React from 'react';
import { Upload, FileCheck } from 'lucide-react';

const UploadSection = ({ onUpload, status }) => {
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        onUpload(files);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
                <Upload size={20} /> 1. Upload Resumes
            </h3>
            <div className="relative group">
                <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center group-hover:border-indigo-500 transition-colors">
                    <p className="text-slate-400">Click or drag PDF resumes here to upload</p>
                    <p className="text-xs text-slate-500 mt-2">Maximum 10 files recommended</p>
                </div>
            </div>
            {status && (
                <div className="mt-4 p-3 bg-slate-900 rounded-lg flex items-center gap-2 text-sm text-slate-300">
                    <FileCheck size={16} className="text-emerald-400" /> {status}
                </div>
            )}
        </div>
    );
};

export default UploadSection;
