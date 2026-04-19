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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AI Resume Screener Pro
            </h1>
            <p className="text-slate-500 font-medium">Production-grade RAG Analysis & Skill Comparison</p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <UploadSection onUpload={handleUpload} status={uploadStatus} />
            <JDInput value={jd} onChange={setJd} onRank={handleRank} loading={loading} />

            {selectedCandidates.length === 2 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-indigo-600/10 border border-indigo-500/50 p-6 rounded-2xl"
              >
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 italic">Comparison Ready</div>
                <button
                  onClick={triggerComparison}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                >
                  Compare Selection
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-400 text-sm flex items-center gap-2 mb-6"
                >
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}

              {results.length > 0 ? (
                results.map(candidate => (
                  <motion.div
                    key={candidate.filename}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ResultCard
                      candidate={candidate}
                      onCompareSelect={handleCompareSelect}
                      isSelected={selectedCandidates.includes(candidate.filename)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-700">
                  <Layout size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium opacity-50">Upload resumes and paste JD to see rankings</p>
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
