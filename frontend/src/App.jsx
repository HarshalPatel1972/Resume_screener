import React, { useState } from 'react';
import axios from 'axios';
import { Layout, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import UploadSection from './components/UploadSection';
import JDInput from './components/JDInput';
import ResultCard from './components/ResultCard';
import ComparisonView from './components/ComparisonView';

const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:8000`
  : `https://${window.location.hostname}:8000`); // Fallback for other hosts

function App() {
  const [jd, setJd] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUpload = async (files) => {
    setUploadStatus('Syncing...');
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const res = await axios.post(`${API_BASE}/upload-resumes`, formData);
      setUploadStatus(`Ready (${res.data.count})`);
      // Update local file list
      const newFiles = files.map(f => f.name);
      setUploadedFiles(prev => [...new Set([...prev, ...newFiles])]);
    } catch (err) {
      setUploadStatus('Sync failed');
      setError('Check backend connection');
    }
  };

  const handleRank = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/rank`, { job_description: jd });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompareSelect = (filename) => {
    setSelectedCandidates(prev => {
      if (prev.includes(filename)) return prev.filter(f => f !== filename);
      if (prev.length >= 2) return [prev[1], filename];
      return [...prev, filename];
    });
  };

  const triggerComparison = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/compare`, {
        job_description: jd,
        candidates: selectedCandidates
      });
      setComparison(res.data);
    } catch (err) {
      setError('Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen flex text-slate-200 overflow-hidden font-sans">
      <div className="mesh-gradient" />

      {/* Sidebar - Uploaded Assets */}
      <aside className="w-80 border-r border-white/5 bg-black/20 backdrop-blur-3xl flex flex-col z-20">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20" />
            <span className="font-black text-xl tracking-tighter text-white">SleekScan</span>
          </div>
          <UploadSection onUpload={handleUpload} status={uploadStatus} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-2">Knowledge Base</h3>
          <div className="space-y-1">
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map(file => (
                <div key={file} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-default transition-colors group">
                  <div className="h-2 w-2 rounded-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors" />
                  <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 truncate">{file}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-30">
                <Layout size={24} className="mx-auto mb-2" />
                <p className="text-[10px] uppercase font-bold tracking-widest">No resumes</p>
              </div>
            )}
          </div>
        </div>

        {selectedCandidates.length === 2 && (
          <div className="p-6 border-t border-white/5 bg-emerald-500/5">
            <button
              onClick={triggerComparison}
              className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-emerald-500/10"
            >
              Compare Selection
            </button>
          </div>
        )}
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto w-full px-8 py-16 flex-1 flex flex-col">

          {/* Header */}
          <header className={`transition-all duration-1000 ${results.length > 0 ? 'mb-10 text-left' : 'flex-1 flex flex-col justify-center text-center'}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className={`${results.length > 0 ? 'text-2xl' : 'text-5xl'} font-black mb-4 tracking-tight`}>
                How can I <span className="text-emerald-500 underline underline-offset-8 decoration-white/10">analyze</span> your candidates today?
              </h1>
              {results.length === 0 && (
                <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
                  Paste the requirements below and I'll rank your uploaded candidates based on semantic relevance and expertise.
                </p>
              )}
            </motion.div>
          </header>

          {/* Input Area */}
          <div className={`${results.length > 0 ? 'mb-16' : 'mb-24'}`}>
            <JDInput value={jd} onChange={setJd} onRank={handleRank} loading={loading} />
          </div>

          {/* Results Flow */}
          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold text-center">
                {error}
              </motion.div>
            )}

            {results.length > 0 && (
              <div className="space-y-12 pb-24 border-t border-white/5 pt-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-0.5 flex-1 bg-white/5" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Analysis Completed</span>
                  <div className="h-0.5 flex-1 bg-white/5" />
                </div>
                {results.map((candidate, idx) => (
                  <motion.div
                    key={candidate.filename}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ResultCard
                      candidate={candidate}
                      onCompareSelect={handleCompareSelect}
                      isSelected={selectedCandidates.includes(candidate.filename)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ComparisonView comparison={comparison} onClose={() => setComparison(null)} />
    </div>
  );
}

export default App;
