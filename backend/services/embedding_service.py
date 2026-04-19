import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

# Official HF Inference Model
MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = os.getenv("HF_TOKEN", "")

# Initialize Client
client = InferenceClient(model=MODEL_ID, token=HF_TOKEN)

def get_embeddings(texts: list[str]) -> list[np.ndarray]:
    """Generate embeddings using HuggingFace InferenceClient."""
    if not texts:
        return []
    
    try:
        # Use feature_extraction which returns embeddings
        # InferenceClient handles batching and retries internally
        embeddings = client.feature_extraction(texts)
        
        # Convert to numpy array
        if isinstance(embeddings, np.ndarray):
            return [embeddings] if embeddings.ndim == 1 else [v for v in embeddings]
        
        return [np.array(v) for v in embeddings]
        
    except Exception as e:
        print(f"HF Embedding Error: {str(e)}")
        raise e

def compute_similarity(query_embedding: np.ndarray, document_embeddings: list[np.ndarray]) -> list[float]:
    """Compute cosine similarity between a query and multiple documents."""
    if not document_embeddings:
        return []
    
    query_vec = query_embedding.reshape(1, -1)
    doc_matrix = np.vstack(document_embeddings)
    similarities = cosine_similarity(query_vec, doc_matrix)
    
    return similarities[0].tolist()
