import requests
import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

urls_to_test = [
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
]

data = {"inputs": ["test sentence"]}

for url in urls_to_test:
    print(f"\n--- Testing {url} ---")
    try:
        r = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {r.status_code}")
        if r.status_code != 200:
            print(f"Response: {r.text[:100]}")
        else:
            print("Success")
    except Exception as e:
        print(e)
