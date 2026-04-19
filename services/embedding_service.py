import os
import requests
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()

# Use HuggingFace Inference API (free) instead of loading model locally
# This saves ~500MB RAM (no torch/sentence-transformers needed)
HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = os.getenv("HF_TOKEN", "")

def get_embeddings(texts: list[str]) -> list[np.ndarray]:
    """Generate embeddings using HuggingFace Inference API with batching."""
    if not texts:
        return []
    
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
    
    all_embeddings = []
    batch_size = 5 # Small batches to avoid timeout
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": batch, "options": {"wait_for_model": True}},
            timeout=20 # 20 second timeout per batch
        )
        
        if response.status_code != 200:
            raise Exception(f"HF API error: {response.status_code} - {response.text}")
        
        batch_results = response.json()
        all_embeddings.extend(batch_results)
        
    return [np.array(emb) for emb in all_embeddings]

def compute_similarity(query_embedding: np.ndarray, document_embeddings: list[np.ndarray]) -> list[float]:
    """Compute cosine similarity between a query and multiple documents."""
    if not document_embeddings:
        return []
    
    query_vec = query_embedding.reshape(1, -1)
    doc_matrix = np.vstack(document_embeddings)
    similarities = cosine_similarity(query_vec, doc_matrix)
    
    return similarities[0].tolist()
