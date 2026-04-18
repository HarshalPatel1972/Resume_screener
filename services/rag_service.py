import numpy as np
from services.embedding_service import get_embeddings, compute_similarity

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    """
    Split text into chunks of roughly `chunk_size` words with `overlap` words.
    """
    words = text.split()
    if not words:
        return []
        
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end >= len(words):
            break
        start += (chunk_size - overlap)
        
    return chunks

def get_rag_score(jd_embedding: np.ndarray, resume_chunks: list[dict]) -> float:
    """
    Compute RAG-based score for a single resume.
    Compare JD with all chunks of the resume, take top 2 highest scores, and average them.
    resume_chunks: list of {"embedding": np.ndarray, ...}
    """
    if not resume_chunks:
        return 0.0
        
    chunk_embeddings = [c["embedding"] for c in resume_chunks]
    
    # compute_similarity returns a list of scores for each chunk compared to JD
    scores = compute_similarity(jd_embedding, chunk_embeddings)
    
    # Sort scores descending
    scores.sort(reverse=True)
    
    # Take top 2 (or 1 if only one chunk exists)
    top_scores = scores[:2]
    
    return float(np.mean(top_scores))
