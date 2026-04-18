import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_resume(job_description: str, resume_text: str):
    """Analyze a resume against a job description using Groq LLM."""
    
    prompt = f"""
    Act as an Expert Technical Recruiter. Compare the following Resume against the Job Description.
    
    Job Description:
    {job_description}
    
    Resume:
    {resume_text}
    
    Analyze the skill alignment and return a structured JSON response.
    Focus on extracting specific technical skills and tools.
    
    Expected JSON Structure:
    {{
      "score": <float between 0 and 1>,
      "matched_skills": [<list of strings>],
      "missing_skills": [<list of strings>],
      "strengths": "<brief paragraph about what the candidate excels at>",
      "weaknesses": "<brief paragraph about gaps or areas for improvement>",
      "decision": "Shortlist" or "Reject"
    }}
    
    Return ONLY valid JSON. No preamble or explanation.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        return {
            "score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "strengths": "Error in analysis.",
            "weaknesses": "Error in analysis.",
            "decision": "Reject"
        }
