from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime

class CandidateBase(BaseModel):
    candidate_name: str
    degree: Optional[str] = None
    course: Optional[str] = None
    cgpa: Optional[str] = None
    ats_score: Optional[int] = None
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    feedback: Optional[str] = None
    detailed_feedback: Optional[str] = None
    cv_url: Optional[HttpUrl] = None
    recruiter_id: str
    job_role_id: Optional[str] = None
    job_role_title: str
    status: str = "uploaded"  # uploaded, selected, rejected, shortlisted
    created_at: Optional[datetime] = None

class CandidateCreate(BaseModel):
    job_role_id: str
    # The file will be uploaded as form-data

class CandidateResponse(CandidateBase):
    id: str
    class Config:
        from_attributes = True 