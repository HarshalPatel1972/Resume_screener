from __future__ import annotations

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn
import asyncio

from pdf_utils import extract_text_from_pdf
from services.embedding_service import get_embeddings, compute_similarity
from services.groq_service import analyze_resume

app = FastAPI(title="AI Resume Screener")

# In-memory storage for resumes and their embeddings
# Each item: {"filename": str, "text": str, "embedding": np.ndarray}
stored_resumes: list[dict] = []

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
        </style>
    </head>
    <body>
        <div class="container">
            <h1>AI Resume Screener</h1>
            <p style="color: #94a3b8; margin-bottom: 40px; font-size: 1.1rem;">Upload, analyze, and rank talent with LLM-powered precision.</p>

            <div class="section">
                <h3>1. Upload Resumes</h3>
                <form id="upload-form">
                    <input id="files" name="files" type="file" accept=".pdf" multiple required />
                    <button type="submit">Upload & Vectorize</button>
                </form>
                <pre id="upload-result">Awaiting uploads...</pre>
            </div>

            <div class="section">
                <h3>2. Analysis & Ranking</h3>
                <form id="rank-form">
                    <textarea id="job-desc" placeholder="Paste the Job Description (JD) here to begin analysis..." required></textarea>
                    <button type="submit">Run AI Screening Analysis</button>
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
                uploadResult.textContent = "⚙️ Extracting text and generating embeddings...";
                
                try {
                    const res = await fetch("/upload-resumes", { method: "POST", body: formData });
                    const data = await res.json();
                    uploadResult.textContent = `✅ Successfully processed ${data.count} resumes. Ready for ranking.`;
                } catch (err) {
                    uploadResult.textContent = "❌ Upload failed.";
                }
            });

            rankForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const jd = document.getElementById("job-desc").value;
                rankResult.innerHTML = "<div style='text-align:center; padding: 40px;'>🔮 AI is analyzing candidate alignment... this may take a few seconds.</div>";

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
                                <h4 style="margin:0">${r.filename}</h4>
                                <span class="score-tag">${(r.score * 100).toFixed(0)}%</span>
                            </div>
                            
                            <div style="margin: 16px 0;">
                                <span class="decision Decision-${r.decision}">${r.decision}</span>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <strong>Matched Skills:</strong><br/>
                                ${r.matched_skills.map(s => `<span class="badge badge-matched">${s}</span>`).join("")}
                                ${r.matched_skills.length === 0 ? "None detected" : ""}
                            </div>

                            <div style="margin-bottom: 16px;">
                                <strong>Missing Skills:</strong><br/>
                                ${r.missing_skills.map(s => `<span class="badge badge-missing">${s}</span>`).join("")}
                                ${r.missing_skills.length === 0 ? "None detected" : ""}
                            </div>

                            <div style="font-size: 14px; grid-template-columns: 1fr 1fr; display: grid; gap: 20px;">
                                <div><strong style="color:#34d399">Strengths:</strong><p>${r.strengths}</p></div>
                                <div><strong style="color:#f87171">Weaknesses:</strong><p>${r.weaknesses}</p></div>
                            </div>
                        </div>
                    `).join("");
                } catch (err) {
                    rankResult.innerHTML = "<div style='color:#f87171; padding: 20px;'>⚠️ Analysis failed. Please check your Groq API key and connection.</div>";
                }
            });
        </script>
    </body>
    </html>
    """

@app.post("/upload-resumes")
async def upload_resumes(files: list[UploadFile] = File(...)):
    new_resumes = []
    
    for uploaded_file in files:
        pdf_bytes = await uploaded_file.read()
        extracted_text = extract_text_from_pdf(pdf_bytes)
        
        # Store metadata
        resume_data = {
            "filename": uploaded_file.filename or "uploaded.pdf",
            "text": extracted_text,
        }
        new_resumes.append(resume_data)
        await uploaded_file.close()

    # Bulk compute embeddings for efficiency
    texts = [r["text"] for r in new_resumes]
    if texts:
        embeddings = get_embeddings(texts)
        # Store in global memory
        for i, resume in enumerate(new_resumes):
            resume["embedding"] = embeddings[i]
            stored_resumes.append(resume)

    return {"message": "Success", "count": len(new_resumes)}

@app.post("/rank")
async def rank_resumes(request: RankRequest):
    if not stored_resumes:
        return {"error": "No resumes have been uploaded yet."}
    
    # Process each resume with Groq for detailed analysis
    # We do this in parallel to keep it fast
    tasks = [analyze_resume(request.job_description, r["text"]) for r in stored_resumes]
    analyses = await asyncio.gather(*[asyncio.to_thread(lambda a, b: analyze_resume(a, b), request.job_description, r["text"]) for r in stored_resumes])
    
    # Prepare results
    rankings = []
    for i, resume in enumerate(stored_resumes):
        analysis = analyses[i]
        rankings.append({
            "filename": resume["filename"],
            **analysis # Merge all fields from LLM response
        })
    
    # Sort by score descending
    rankings.sort(key=lambda x: x["score"], reverse=True)
    
    return {"rankings": rankings}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
