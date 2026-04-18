from __future__ import annotations

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn
import asyncio
import numpy as np

from pdf_utils import extract_text_from_pdf
from services.embedding_service import get_embeddings
from services.groq_service import analyze_resume
from services.rag_service import chunk_text, get_rag_score

app = FastAPI(title="AI Resume Screener (RAG Enhanced)")

# In-memory storage for resume chunks
# Each item: {"filename": str, "chunk": str, "embedding": np.ndarray}
chunk_repository: list[dict] = []

# Grouped full text for LLM analysis
# { filename: full_text }
resume_full_texts: dict[str, str] = {}

class RankRequest(BaseModel):
    job_description: str

@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "API running"}

@app.get("/upload", response_class=HTMLResponse)
def upload_page() -> str:
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Resume Screener</title>
        <style>
            :root {
                --primary: #6366f1;
                --bg: #0f172a;
                --card: #1e293b;
                --text: #f8fafc;
            }
            body {
                font-family: 'Inter', -apple-system, sans-serif;
                background-color: var(--bg);
                color: var(--text);
                max-width: 1000px;
                margin: 40px auto;
                padding: 0 24px;
                line-height: 1.5;
            }
            .container {
                background: var(--card);
                padding: 32px;
                border-radius: 20px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                border: 1px solid #334155;
            }
            h1 { font-size: 2.5rem; color: var(--primary); margin-bottom: 8px; letter-spacing: -0.025em; }
            .section { margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #334155; }
            form { display: grid; gap: 16px; }
            textarea {
                background: #0f172a;
                color: white;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 16px;
                min-height: 120px;
                font-family: inherit;
                resize: vertical;
            }
            button {
                background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                color: white;
                border: none;
                padding: 14px 28px;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            button:hover { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }
            pre {
                background: #0f172a;
                padding: 16px;
                border-radius: 12px;
                overflow-x: auto;
                font-size: 14px;
                border: 1px solid #475569;
                color: #94a3b8;
            }
            .result-card {
                background: #1e293b;
                padding: 24px;
                border-radius: 16px;
                margin-top: 20px;
                border-left: 4px solid var(--primary);
                animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .badge {
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
                display: inline-block;
                margin-right: 8px;
                margin-bottom: 8px;
            }
            .badge-matched { background: #065f46; color: #34d399; }
            .badge-missing { background: #7f1d1d; color: #f87171; }
            .score-tag {
                font-size: 24px;
                font-weight: 800;
                color: #818cf8;
            }
            .decision {
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }
            .Decision-Shortlist { color: #34d399; }
            .Decision-Reject { color: #f87171; }
            .rag-pill { 
                font-size: 10px; 
                background: #334155; 
                padding: 2px 6px; 
                border-radius: 4px; 
                vertical-align: middle;
                margin-left: 8px;
                color: #94a3b8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>AI Resume Screener <span style="font-size: 1rem; opacity: 0.6;">(RAG mode)</span></h1>
            <p style="color: #94a3b8; margin-bottom: 40px; font-size: 1.1rem;">Upload, analyze, and rank talent with Chunk-based RAG and LLM Analysis.</p>

            <div class="section">
                <h3>1. Upload Resumes</h3>
                <form id="upload-form">
                    <input id="files" name="files" type="file" accept=".pdf" multiple required />
                    <button type="submit">Upload & Chunk</button>
                </form>
                <pre id="upload-result">Awaiting uploads...</pre>
            </div>

            <div class="section">
                <h3>2. Analysis & Ranking</h3>
                <form id="rank-form">
                    <textarea id="job-desc" placeholder="Paste the Job Description (JD) here to begin RAG analysis..." required></textarea>
                    <button type="submit">Run RAG + AI Screening</button>
                </form>
                <div id="rank-result"></div>
            </div>
        </div>

        <script>
            const uploadForm = document.getElementById("upload-form");
            const rankForm = document.getElementById("rank-form");
            const uploadResult = document.getElementById("upload-result");
            const rankResult = document.getElementById("rank-result");

            uploadForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const formData = new FormData();
                for (const file of document.getElementById("files").files) {
                    formData.append("files", file);
                }
                uploadResult.textContent = "⚙️ Extracting text and generating split chunks...";
                
                try {
                    const res = await fetch("/upload-resumes", { method: "POST", body: formData });
                    const data = await res.json();
                    uploadResult.textContent = `✅ Successfully processed ${data.count} resumes into ${data.total_chunks} search chunks.`;
                } catch (err) {
                    uploadResult.textContent = "❌ Upload failed.";
                }
            });

            rankForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const jd = document.getElementById("job-desc").value;
                rankResult.innerHTML = "<div style='text-align:center; padding: 40px;'>🔮 Performing RAG retrieval and LLM analysis...</div>";

                try {
                    const res = await fetch("/rank", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ job_description: jd })
                    });
                    const data = await res.json();
                    
                    rankResult.innerHTML = data.rankings.map(r => `
                        <div class="result-card">
                            <div style="display:flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <h4 style="margin:0">${r.filename} <span class="rag-pill">RAG Score: ${(r.score * 100).toFixed(1)}%</span></h4>
                                </div>
                                <span class="score-tag">${(r.llm_analysis.score * 100).toFixed(0)}%</span>
                            </div>
                            
                            <div style="margin: 16px 0;">
                                <span class="decision Decision-${r.llm_analysis.decision}">${r.llm_analysis.decision}</span>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <strong>Matched Skills:</strong><br/>
                                ${r.llm_analysis.matched_skills.map(s => `<span class="badge badge-matched">${s}</span>`).join("")}
                                ${r.llm_analysis.matched_skills.length === 0 ? "None detected" : ""}
                            </div>

                            <div style="margin-bottom: 16px;">
                                <strong>Missing Skills:</strong><br/>
                                ${r.llm_analysis.missing_skills.map(s => `<span class="badge badge-missing">${s}</span>`).join("")}
                                ${r.llm_analysis.missing_skills.length === 0 ? "None detected" : ""}
                            </div>

                            <div style="font-size: 14px; grid-template-columns: 1fr 1fr; display: grid; gap: 20px;">
                                <div><strong style="color:#34d399">Strengths:</strong><p>${r.llm_analysis.strengths}</p></div>
                                <div><strong style="color:#f87171">Weaknesses:</strong><p>${r.llm_analysis.weaknesses}</p></div>
                            </div>
                        </div>
                    `).join("");
                } catch (err) {
                    rankResult.innerHTML = "<div style='color:#f87171; padding: 20px;'>⚠️ Analysis failed. Check console.</div>";
                }
            });
        </script>
    </body>
    </html>
    """

@app.post("/upload-resumes")
async def upload_resumes(files: list[UploadFile] = File(...)):
    new_chunks_count = 0
    
    for uploaded_file in files:
        filename = uploaded_file.filename or "uploaded.pdf"
        pdf_bytes = await uploaded_file.read()
        extracted_text = extract_text_from_pdf(pdf_bytes)
        
        # Store full text for LLM
        resume_full_texts[filename] = extracted_text
        
        # Chunk text
        chunks = chunk_text(extracted_text)
        if chunks:
            # Generate embeddings for all chunks
            embeddings = get_embeddings(chunks)
            for i, chunk_text_content in enumerate(chunks):
                chunk_repository.append({
                    "filename": filename,
                    "chunk": chunk_text_content,
                    "embedding": embeddings[i]
                })
                new_chunks_count += 1
                
        await uploaded_file.close()

    return {
        "message": "Success", 
        "count": len(files), 
        "total_chunks": new_chunks_count
    }

@app.post("/rank")
async def rank_resumes(request: RankRequest):
    if not chunk_repository:
        return {"error": "No resumes have been uploaded yet."}
    
    # Get embedding for job description
    jd_embedding = get_embeddings([request.job_description])[0]
    
    # 1. RAG Ranking Logic
    # Group chunks by filename
    filenames = list(resume_full_texts.keys())
    rag_rankings = []
    
    for filename in filenames:
        resume_chunks = [c for c in chunk_repository if c["filename"] == filename]
        rag_score = get_rag_score(jd_embedding, resume_chunks)
        rag_rankings.append({
            "filename": filename,
            "score": rag_score
        })
    
    # 2. Parallel LLM Analysis (for top candidates or all if small)
    # We'll do it for all existing resumes since they are in-memory (small scale)
    analyses = await asyncio.gather(*[
        asyncio.to_thread(analyze_resume, request.job_description, resume_full_texts[f]) 
        for f in filenames
    ])
    
    # Combine results
    final_output = []
    for i, rag_info in enumerate(rag_rankings):
        final_output.append({
            "filename": rag_info["filename"],
            "score": rag_info["score"],
            "llm_analysis": analyses[i]
        })
    
    # Sort by RAG score descending
    final_output.sort(key=lambda x: x["score"], reverse=True)
    
    return {"rankings": final_output}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
