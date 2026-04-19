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
        <div className="w-full">
            {/* Upload Zone */}
            <div
                onClick={() => !isSyncing && fileInputRef.current?.click()}
                className="w-full bg-[var(--bg-sunken)] border-[1.5px] border-dashed border-[var(--border-strong)] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]"
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
                <Upload size={24} className="text-[var(--text-tertiary)] mb-2" strokeWidth={1.5} />
                <span className="text-[15px] font-medium text-[var(--text-primary)]">
                    {isSyncing ? 'Uploading...' : 'Drop PDF resumes here'}
                </span>
            </div>

            {/* Inline Loaded Chips */}
            {uploadedFiles && uploadedFiles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {uploadedFiles.map(file => (
                        <div key={file} className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 shadow-sm">
                            <FileText size={14} className="text-[var(--text-secondary)]" />
                            <span className="text-[13px] font-medium text-[var(--text-primary)] truncate max-w-[200px]">{file}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile(file);
                                }}
                                className="text-[var(--text-tertiary)] hover:text-[var(--red)] transition-colors ml-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UploadSection;
