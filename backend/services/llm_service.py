import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def get_groq_key():
    key = os.getenv("GROQ_API_KEY")
    if not key:
        # Fallback check for common mistake where key is pasted as raw string in .env
        env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                first_line = f.readline().strip()
                if first_line.startswith("gsk_"):
                    return first_line.split()[0]
    return key

client = None
try:
    groq_api_key = get_groq_key()
    if groq_api_key:
        client = Groq(api_key=groq_api_key)
    else:
        print("WARNING: GROQ_API_KEY not found in environment.")
except Exception as e:
    print(f"Error initializing Groq client: {e}")

def analyze_resume(job_description: str, resume_text: str):
    """Analyze a resume against a job description using Groq LLM."""
    
    prompt = f"""
    Act as an Expert Technical Recruiter. Analyze this Resume against the JD.
    
    Job Description:
    {job_description}
    
    Resume:
    {resume_text}
    
    Return a JSON object with:
    - score: 0-100
    - matched_skills: list of strings
    - missing_skills: list of strings
    - strengths: string
    - weaknesses: string
    - experience_years: number (candidate's total years)
    - required_experience: number (years required in JD)
    - decision: "Shortlist" or "Reject"
    
    Return ONLY JSON.
    """
    
    if not client:
        return {
            "score": 0, "matched_skills": [], "missing_skills": [], 
            "strengths": "Groq client not initialized", "weaknesses": "Check API key", 
            "experience_years": 0, "required_experience": 0, "decision": "Reject"
        }

    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        content = completion.choices[0].message.content
        if not content:
            raise ValueError("Empty response from Groq")
        return json.loads(content)
    except Exception as e:
        print(f"Groq analyze error: {e}")
        return {
            "score": 0, "matched_skills": [], "missing_skills": [], 
            "strengths": f"Error: {str(e)}", "weaknesses": "Error", 
            "experience_years": 0, "required_experience": 0, "decision": "Reject"
        }

def compare_candidates(job_description: str, candidate_a: dict, candidate_b: dict):
    """Compare two candidates."""
    prompt = f"""
    Compare Candidate A ({candidate_a['filename']}) and Candidate B ({candidate_b['filename']}) for this JD:
    {job_description}
    
    Data A: {json.dumps(candidate_a)}
    Data B: {json.dumps(candidate_b)}
    
    Return JSON:
    {{ "better_candidate": "filename", "reason": "concise explanation" }}
    """
    if not client:
        return {"better_candidate": "N/A", "reason": "Groq client not initialized"}

    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        content = completion.choices[0].message.content
        if not content:
            raise ValueError("Empty response from Groq")
        return json.loads(content)
    except Exception as e:
        print(f"Groq compare error: {e}")
        return {"better_candidate": "N/A", "reason": f"Error comparing: {str(e)}"}
