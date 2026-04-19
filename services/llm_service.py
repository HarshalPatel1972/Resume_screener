import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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
    
    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        return {
            "score": 0, "matched_skills": [], "missing_skills": [], 
            "strengths": "Error", "weaknesses": "Error", 
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
    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        return json.loads(completion.choices[0].message.content)
    except:
        return {"better_candidate": "N/A", "reason": "Error comparing"}
