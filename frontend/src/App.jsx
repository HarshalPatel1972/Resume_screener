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

  const handleUpload = async (files) => {
    setUploadStatus('Uploading...');
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const res = await axios.post(`${API_BASE}/upload-resumes`, formData);
      setUploadStatus(`Successfully processed ${res.data.count} resumes.`);
    } catch (err) {
      setUploadStatus('Upload failed.');
      setError('Check server connection.');
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
    <div className="relative min-h-screen text-slate-200 overflow-x-hidden selection:bg-indigo-500/30">
      <div className="mesh-gradient" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl font-black mb-4 tracking-tight drop-shadow-2xl">
              <span className="text-gradient">Selection</span>
              <span className="text-indigo-500"> Intelligence</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
              Objective resume screening powered by semantic intelligence.
              Find the perfect match without the guesswork.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <UploadSection onUpload={handleUpload} status={uploadStatus} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <JDInput value={jd} onChange={setJd} onRank={handleRank} loading={loading} />
            </motion.div>

            <AnimatePresence>
              {selectedCandidates.length === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="glass-card p-8 rounded-[32px] border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)]"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <RefreshCw size={20} className="text-indigo-400 animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">Direct Comparison</h3>
                      <p className="text-xs text-slate-500">2 candidates selected for AI review</p>
                    </div>
                  </div>
                  <button
                    onClick={triggerComparison}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    Compare Candidates
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card border-rose-500/30 p-4 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-medium"
                >
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  {error}
                </motion.div>
              )}

              {results.length > 0 ? (
                results.map((candidate, idx) => (
                  <motion.div
                    key={candidate.filename}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  >
                    <ResultCard
                      candidate={candidate}
                      onCompareSelect={handleCompareSelect}
                      isSelected={selectedCandidates.includes(candidate.filename)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center glass-card rounded-[40px] text-slate-600 border-dashed border-slate-800/50">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                    <Layout size={64} className="relative text-slate-800" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-500 mb-2">Ready for analysis</h3>
                  <p className="text-slate-600 max-w-[280px] text-center text-sm leading-relaxed">
                    Upload candidate resumes and provide a job description to see smart rankings.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ComparisonView comparison={comparison} onClose={() => setComparison(null)} />
    </div>
  );
}

export default App;
