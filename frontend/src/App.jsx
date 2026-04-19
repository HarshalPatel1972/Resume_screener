import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import TopNav from './components/TopNav';
import UploadSection from './components/UploadSection';
import JDInput from './components/JDInput';
import ResultCard from './components/ResultCard';
import ComparisonView from './components/ComparisonView';

const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:8000`
  : `https://${window.location.hostname}`); // Production usually runs on standard ports (80/443)

function App() {
  const [jd, setJd] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Phase flags
  const isResultsMode = results.length > 0;

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await axios.get(`${API_BASE}/resumes`);
        if (res.data.resumes) {
          setUploadedFiles(res.data.resumes);
          setUploadStatus(`Ready (${res.data.resumes.length})`);
        }
      } catch (err) {
        console.error("Failed to fetch existing resumes", err);
      }
    };
    fetchExisting();
  }, []);

  const handleUpload = async (files) => {
    setUploadStatus('Syncing...');
    setError('');
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const res = await axios.post(`${API_BASE}/upload-resumes`, formData);
      setUploadStatus(`Ready (${res.data.count})`);
      const newFiles = files.map(f => f.name);
      setUploadedFiles(prev => [...new Set([...prev, ...newFiles])]);
    } catch (err) {
      setUploadStatus('Sync failed');
      const errorMsg = err.response?.data?.detail || 'Upload failed. Ensure resumes are valid text-based PDFs.';
      setError(errorMsg);
      // Ensure we don't enable the Analyze button if upload failed
      setUploadedFiles([]);
    }
  };

  const handleRemoveFile = async (filename) => {
    try {
      await axios.delete(`${API_BASE}/resumes/${filename}`);
      setUploadedFiles(prev => prev.filter(f => f !== filename));
      setUploadStatus(prev => {
        const count = uploadedFiles.length - 1;
        return count > 0 ? `Ready (${count})` : '';
      });
    } catch (err) {
      console.error("Failed to delete resume", err);
      setError("Failed to delete resume from cloud.");
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

  const resetToSetup = () => {
    setResults([]);
    setSelectedCandidates([]);
    setComparison(null);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-[Inter] overflow-x-hidden">

      <TopNav
        uploadedCount={uploadedFiles.length}
        onUploadClick={resetToSetup}
        onReset={resetToSetup}
      />

      <main className="max-w-[760px] mx-auto pt-24 px-6 pb-24">

        {/* Setup Phase */}
        <AnimatePresence mode="wait">
          {!isResultsMode && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center"
            >
              <h1 className="font-['Instrument_Serif'] text-[48px] md:text-[56px] font-normal leading-tight tracking-tight text-center mb-2 italic">
                Who's the right fit?
              </h1>
              <p className="text-[15px] text-[var(--text-secondary)] text-center mb-10">
                Describe the role and I'll rank your candidates by relevance.
              </p>

              <div className="w-full space-y-10">
                <UploadSection
                  onUpload={handleUpload}
                  status={uploadStatus}
                  uploadedFiles={uploadedFiles}
                  onRemoveFile={handleRemoveFile}
                />

                <JDInput
                  value={jd}
                  onChange={setJd}
                  onRank={handleRank}
                  loading={loading}
                  disabled={uploadedFiles.length === 0}
                />
              </div>
            </motion.div>
          )}

          {/* Results Phase */}
          {isResultsMode && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-8 group">
                <div className="flex items-center gap-4">
                  <button
                    onClick={resetToSetup}
                    className="p-2 -ml-2 hover:bg-[var(--bg-sunken)] rounded-full transition-colors text-[var(--text-secondary)]"
                    title="Back to Setup"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="font-['Instrument_Serif'] text-[32px] font-normal italic">
                    Analysis Results
                  </h2>
                </div>
                {selectedCandidates.length === 2 && (
                  <button
                    onClick={triggerComparison}
                    className="text-[14px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                  >
                    Compare top 2
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {results.map((candidate, idx) => (
                  <motion.div
                    key={candidate.filename}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ResultCard
                      candidate={candidate}
                      onCompareSelect={handleCompareSelect}
                      isSelected={selectedCandidates.includes(candidate.filename)}
                      rank={idx + 1}
                    />
                  </motion.div>
                ))}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-8 p-4 bg-[var(--red-subtle)] border border-[var(--red)]/20 rounded-xl text-[var(--red)] text-[13px] font-medium text-center shadow-sm">
            {error}
          </div>
        )}

      </main>

      {comparison && (
        <ComparisonView comparison={comparison} onClose={() => setComparison(null)} />
      )}
    </div>
  );
}

export default App;
