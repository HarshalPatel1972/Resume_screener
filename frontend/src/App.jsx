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
        <header className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl font-black mb-6 tracking-tight">
              <span className="text-gradient">Selection</span>
              <span className="text-emerald-500"> Intelligence</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
              Precision-engineered resume screening. Objective insights
              delivered through Claude-level semantic analysis.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-10">
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
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 10 }}
                  className="glass-card p-8 rounded-[32px] border-emerald-500/20 bg-emerald-500/5 shadow-2xl"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <RefreshCw size={20} className="text-emerald-400 animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 italic">Comparison Logic Active</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Ready for AI Verdict</p>
                    </div>
                  </div>
                  <button
                    onClick={triggerComparison}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    Generate Comparison
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}

              {results.length > 0 ? (
                results.map((candidate, idx) => (
                  <motion.div
                    key={candidate.filename}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ResultCard
                      candidate={candidate}
                      onCompareSelect={handleCompareSelect}
                      isSelected={selectedCandidates.includes(candidate.filename)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center glass-card rounded-[40px] border-dashed border-white/5">
                  <div className="relative mb-8 p-6 bg-slate-900/50 rounded-full">
                    <Layout size={48} className="text-slate-700" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-500 mb-2">Awaiting Data</h3>
                  <p className="text-slate-600 max-w-[240px] text-center text-xs leading-relaxed font-medium">
                    Upload resumes to initialize the screening pipeline.
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
