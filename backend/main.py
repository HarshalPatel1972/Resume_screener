from __future__ import annotations
import asyncio
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Internal Imports
from utils.pdf_parser import extract_text_from_pdf
from utils.chunking import chunk_text
from services.embedding_service import get_embeddings
from services.llm_service import analyze_resume, compare_candidates
from services.rag_service import calculate_rag_rankings

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Resume Screener API")

# Enable CORS for React frontend (Must be added before other middlewares for preflight)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
chunk_repository: list[dict] = []
resume_full_texts: dict[str, str] = {}
latest_rankings: list[dict] = []

class RankRequest(BaseModel):
    job_description: str

class CompareRequest(BaseModel):
    job_description: str
    candidates: list[str]

@app.get("/")
def health_check():
    return {"status": "healthy"}

from dotenv import load_dotenv
load_dotenv()

@app.post("/upload-resumes")
async def upload_resumes(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
        
    try:
        logger.info(f"--- Starting Upload Process for {len(files)} files ---")
        new_chunks_count = 0
        processing_errors = []

        for file in files:
            fname = file.filename
            logger.info(f"Processing candidate file: {fname}")
            
            try:
                content = await file.read()
                if not content:
                    processing_errors.append(f"{fname}: File is empty")
                    continue
                    
                # Extract text
                text = await asyncio.to_thread(extract_text_from_pdf, content)
                logger.info(f"Extracted {len(text)} chars from {fname}")
                
                if not text.strip():
                    processing_errors.append(f"{fname}: No readable text (might be scanned/image-only PDF)")
                    continue
                    
                resume_full_texts[fname] = text
                
                # Chunk text
                chunks = chunk_text(text)
                if not chunks:
                    processing_errors.append(f"{fname}: Text too short to process")
                    continue
                
                # Generate embeddings
                logger.info(f"Generating embeddings for {len(chunks)} chunks of {fname}")
                embeddings = await asyncio.to_thread(get_embeddings, chunks)
                
                if not embeddings or len(embeddings) != len(chunks):
                    processing_errors.append(f"{fname}: Embedding generation mismatch or failure")
                    continue
                
                for i, chunk_content in enumerate(chunks):
                    chunk_repository.append({
                        "filename": fname,
                        "chunk": chunk_content,
                        "embedding": embeddings[i]
                    })
                    new_chunks_count += 1
                    
                logger.info(f"Successfully processed {fname}")
                
            except Exception as file_error:
                error_msg = f"{fname}: {str(file_error)}"
                logger.error(f"Failed to process file {fname}: {error_msg}")
                processing_errors.append(error_msg)
                continue
                
        logger.info(f"Batch processing complete. Total new chunks added: {new_chunks_count}")
        
        if new_chunks_count == 0:
            error_details = "; ".join(processing_errors) if processing_errors else "Unknown processing error"
            raise HTTPException(
                status_code=400, 
                detail=f"Upload Failed: {error_details}"
            )

        return {
            "count": len(files), 
            "chunks": new_chunks_count, 
            "status": "success",
            "errors": processing_errors # Return partial errors if any
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"CRITICAL Upload error: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/rank")
async def rank_resumes(request: RankRequest):
    if not chunk_repository:
        raise HTTPException(status_code=400, detail="No resumes uploaded")
    
    # 1. Embed JD
    jd_embedding = get_embeddings([request.job_description])[0]
    
    # 2. RAG Ranking + Evidence
    rag_data = calculate_rag_rankings(jd_embedding, chunk_repository)
    
    # 3. LLM Analysis
    filenames = list(resume_full_texts.keys())
    llm_analyses = await asyncio.gather(*[
        asyncio.to_thread(analyze_resume, request.job_description, resume_full_texts[f])
        for f in filenames
    ])
    
    # 4. Normalize and Merge
    results = []
    for i, fname in enumerate(filenames):
        llm = llm_analyses[i]
        rag = rag_data[fname]
        
        # Scorer: 0.7 * Sim + 0.3 * (AI/100)
        final_score = (0.7 * rag["score"]) + (0.3 * (llm["score"] / 100))
        
        results.append({
            "filename": fname,
            "final_score": round(final_score, 2),
            "similarity_score": round(rag["score"], 2),
            "ai_score": llm["score"],
            "matched_skills": llm["matched_skills"],
            "missing_skills": llm["missing_skills"],
            "experience_years": llm["experience_years"],
            "meets_experience": llm["experience_years"] >= llm["required_experience"],
            "evidence": rag["evidence"],
            "decision": llm["decision"]
        })
    
    # 5. Filter & Sort
    # score >= 0.3, unique filenames (already unique in our dict keys), sort desc
    filtered = [r for r in results if r["final_score"] >= 0.3]
    filtered.sort(key=lambda x: x["final_score"], reverse=True)
    
    global latest_rankings
    latest_rankings = filtered[:5] # Top 5 only
    
    # Add Rank Number
    for idx, item in enumerate(latest_rankings):
        item["rank"] = idx + 1
        
    return latest_rankings

@app.post("/compare")
async def compare_endpoint(request: CompareRequest):
    c1 = next((r for r in latest_rankings if r["filename"] == request.candidates[0]), None)
    c2 = next((r for r in latest_rankings if r["filename"] == request.candidates[1]), None)
    
    if not c1 or not c2:
        raise HTTPException(status_code=404, detail="Candidates not found")
        
    res = await asyncio.to_thread(compare_candidates, request.job_description, c1, c2)
    return {
        "better_candidate": res["better_candidate"],
        "reason": res["reason"],
        "comparison": { c1["filename"]: c1, c2["filename"]: c2 }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
