from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load model once globally
model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embeddings(texts: list[str]) -> list[np.ndarray]:
    """Generate embeddings for a list of strings."""
    if not texts:
        return []
    embeddings = model.encode(texts)
    return [emb for emb in embeddings]

def compute_similarity(query_embedding: np.ndarray, document_embeddings: list[np.ndarray]) -> list[float]:
    """Compute cosine similarity between a query and multiple documents."""
    if not document_embeddings:
        return []
    
    # Reshape query embedding for sklearn
    query_vec = query_embedding.reshape(1, -1)
    # Stack document embeddings into a matrix
    doc_matrix = np.vstack(document_embeddings)
    
    # Compute similarities (returns a matrix of shape [1, len(doc_embs)])
    similarities = cosine_similarity(query_vec, doc_matrix)
    
    return similarities[0].tolist()
