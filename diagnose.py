from pdf_utils import extract_text_from_pdf
from services.embedding_service import get_embeddings, compute_similarity
import os
from dotenv import load_dotenv
import requests

def test_diagnostics():
    print("--- Diagnostic Test ---")
    
    # 1. Test PDF extraction
    test_pdf = "test_resume.pdf"
    if os.path.exists(test_pdf):
        with open(test_pdf, "rb") as f:
            content = f.read()
            text = extract_text_from_pdf(content)
            print(f"PDF Extraction: OK ({len(text)} chars)")
    else:
        print("PDF Extraction: FAILED (test_resume.pdf not found)")

    # 2. Test Embedding Service
    try:
        texts = ["Python developer with FastAPI experience.", "Frontend engineer with React."]
        embeddings = get_embeddings(texts)
        print(f"Embedding Service: OK (Generated {len(embeddings)} embeddings)")
        
        # 3. Test Similarity
        scores = compute_similarity(embeddings[0], embeddings)
        print(f"Similarity Logic: OK (Score with self: {scores[0]:.4f})")
    except Exception as e:
        print(f"Embedding/Similarity: FAILED ({str(e)})")

    # 4. Test Groq Service
    load_dotenv()
    # The user has the key at the start of .env as a bare string in line 1? 
    # Let me check .env again.
    
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        # Check if it was pasted without a key name in line 1
        with open(".env", "r") as f:
            first_line = f.readline().strip()
            if first_line.startswith("gsk_"):
                groq_key = first_line.split()[0] # Take the first token
    
    if groq_key:
        print(f"Groq API Key: FOUND ({groq_key[:10]}...)")
        try:
            headers = {"Authorization": f"Bearer {groq_key}"}
            response = requests.get("https://api.groq.com/openai/v1/models", headers=headers)
            if response.status_code == 200:
                print("Groq Connection: OK (API is working)")
            else:
                print(f"Groq Connection: FAILED (Status {response.status_code})")
        except Exception as e:
            print(f"Groq Connection: EXCEPTION ({str(e)})")
    else:
        print("Groq API Key: NOT FOUND in .env")

if __name__ == "__main__":
    test_diagnostics()
