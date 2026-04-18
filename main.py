from __future__ import annotations

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn

from pdf_utils import extract_text_from_pdf
from services.embedding_service import get_embeddings, compute_similarity

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
                font-family: 'Inter', sans-serif;
                background-color: var(--bg);
                color: var(--text);
                max-width: 900px;
                margin: 40px auto;
                padding: 0 24px;
            }
            .container {
                background: var(--card);
                padding: 32px;
                border-radius: 16px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            h1 { color: var(--primary); margin-bottom: 8px; }
            .section { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #334155; }
            form { display: grid; gap: 16px; }
            textarea {
                background: #0f172a;
                color: white;
                border: 1px solid #334155;
                border-radius: 8px;
                padding: 12px;
                min-height: 100px;
            }
            button {
                background: var(--primary);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            button:hover { opacity: 0.9; }
            pre {
                background: #0f172a;
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
                font-size: 14px;
                border: 1px solid #334155;
            }
            .result-card {
                background: #334155;
                padding: 12px;
                border-radius: 8px;
                margin-top: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>AI Resume Screener</h1>
            <p style="color: #94a3b8; margin-bottom: 32px;">Extract text and rank resumes against job descriptions.</p>

            <div class="section">
                <h3>1. Upload Resumes</h3>
                <form id="upload-form">
                    <input id="files" name="files" type="file" accept=".pdf" multiple required />
                    <button type="submit">Upload & Embed</button>
                </form>
                <pre id="upload-result">No resumes uploaded yet.</pre>
            </div>

            <div class="section">
                <h3>2. Rank Resumes</h3>
                <form id="rank-form">
                    <textarea id="job-desc" placeholder="Paste the job description here..." required></textarea>
                    <button type="submit">Compute Similarity Scores</button>
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
                uploadResult.textContent = "Processing and embedding...";
                
                try {
                    const res = await fetch("/upload-resumes", { method: "POST", body: formData });
                    const data = await res.json();
                    uploadResult.textContent = `Successfully processed ${data.count} resumes.`;
                } catch (err) {
                    uploadResult.textContent = "Upload failed.";
                }
            });

            rankForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const jd = document.getElementById("job-desc").value;
                rankResult.innerHTML = "Ranking...";

                try {
                    const res = await fetch("/rank", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ job_description: jd })
                    });
                    const data = await res.json();
                    
                    rankResult.innerHTML = data.rankings.map(r => `
                        <div class="result-card">
                            <strong>${r.filename}</strong>
                            <div style="color: #818cf8">Match Score: ${(r.score * 100).toFixed(2)}%</div>
                        </div>
                    `).join("");
                } catch (err) {
                    rankResult.innerHTML = "Ranking failed.";
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
    
    # Get embedding for job description
    jd_embedding = get_embeddings([request.job_description])[0]
    
    # Extract all stored embeddings
    doc_embeddings = [r["embedding"] for r in stored_resumes]
    
    # Compute similarities
    scores = compute_similarity(jd_embedding, doc_embeddings)
    
    # Prepare results
    rankings = []
    for i, resume in enumerate(stored_resumes):
        rankings.append({
            "filename": resume["filename"],
            "score": float(scores[i])
        })
    
    # Sort by score descending
    rankings.sort(key=lambda x: x["score"], reverse=True)
    
    return {"rankings": rankings}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
