import os
import requests
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()

# Use HuggingFace Inference API (free) instead of loading model locally
# This saves ~500MB RAM (no torch/sentence-transformers needed)
HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = os.getenv("HF_TOKEN", "")

import time

def get_embeddings(texts: list[str]) -> list[np.ndarray]:
    """Generate embeddings using HuggingFace Inference API with batching and retries."""
    if not texts:
        return []
    
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
    
    all_embeddings = []
    batch_size = 5
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        batch_sent_successfully = False
        
        # Retry logic
        for attempt in range(5): # Increased retries
            try:
                response = requests.post(
                    HF_API_URL,
                    headers=headers,
                    json={"inputs": batch, "options": {"wait_for_model": True}},
                    timeout=60 # Increased timeout
                )
                
                if response.status_code == 200:
                    batch_results = response.json()
                    
                    # Ensure batch_results is a list
                    if not isinstance(batch_results, list):
                        # HF sometimes returns a single vector for a single input text
                        if len(batch) == 1:
                            batch_results = [batch_results]
                        else:
                            raise Exception(f"Unexpected HF response format: {type(batch_results)}")
                    
                    if len(batch_results) != len(batch):
                        raise Exception(f"HF returned {len(batch_results)} embeddings for {len(batch)} texts")
                        
                    all_embeddings.extend(batch_results)
                    batch_sent_successfully = True
                    break 
                
                # If loading (503) or Rate Limited (429), wait and retry
                if response.status_code in [429, 503]:
                    wait_time = (2 ** attempt) + (5 if response.status_code == 503 else 2)
                    time.sleep(wait_time)
                    continue
                
                raise Exception(f"HF API error: {response.status_code} - {response.text}")
            except requests.exceptions.RequestException as e:
                if attempt < 4:
                    time.sleep(2)
                    continue
                raise e
        
        if not batch_sent_successfully:
            raise Exception(f"Failed to get embeddings for batch starting at index {i} after multiple attempts.")
        
    return [np.array(emb) for emb in all_embeddings]

def compute_similarity(query_embedding: np.ndarray, document_embeddings: list[np.ndarray]) -> list[float]:
    """Compute cosine similarity between a query and multiple documents."""
    if not document_embeddings:
        return []
    
    query_vec = query_embedding.reshape(1, -1)
    doc_matrix = np.vstack(document_embeddings)
    similarities = cosine_similarity(query_vec, doc_matrix)
    
    return similarities[0].tolist()
