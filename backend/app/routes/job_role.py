from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
import logging
from pymongo.errors import DuplicateKeyError

from app.models.job_role import JobRoleModel, JobRoleCreate, JobRoleUpdate, JobRoleResponse
from app.database import Database
from app.routes.auth import get_current_user
from app.models.user import User
from app.utils.mongo_utils import convert_id

router = APIRouter()
db = Database()

def validate_object_id(job_id: str) -> ObjectId:
       """Validate and convert string ID to ObjectId."""
       if not ObjectId.is_valid(job_id):
           raise HTTPException(status_code=400, detail="Invalid job role ID")
       return ObjectId(job_id)

@router.post("/", response_model=JobRoleResponse)
async def create_job_role(job_role: JobRoleCreate, current_user: User = Depends(get_current_user)):
    logging.info(f"Creating job role for company: {current_user.company_code}")
    if current_user.role != "hiring_manager":
        raise HTTPException(status_code=403, detail="Only hiring managers can create job roles")
    
    # Convert skills string to list if it's a string
    if isinstance(job_role.skills, str):
        job_role.skills = [skill.strip() for skill in job_role.skills.split(",")]
    
    job_role_dict = job_role.model_dump()
    job_role_dict["company_id"] = current_user.company_code
    job_role_dict["created_at"] = datetime.utcnow()
    job_role_dict["updated_at"] = datetime.utcnow()
    # Add required fields with default values
    job_role_dict["status"] = "Active"
    job_role_dict["applications_count"] = 0
    job_role_dict["shortlisted_count"] = 0
    
    logging.info(f"Job role data: {job_role_dict}")
    
    collection = db.get_collection("job_roles")
    try:
        result = await collection.insert_one(job_role_dict)
        logging.info(f"Inserted job role with ID: {result.inserted_id}")
        
        created_job_role = await collection.find_one({"_id": result.inserted_id})
        logging.info(f"Retrieved created job role: {created_job_role}")
        
        return JobRoleResponse(**convert_id(created_job_role))
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail=f"A job role with title '{job_role.title}' already exists for your company. Please use a different title."
        )

@router.get("/", response_model=List[JobRoleResponse])
async def get_job_roles(current_user: User = Depends(get_current_user)):
    logging.info(f"Fetching job roles for company: {current_user.company_code}")
    query = {"company_id": current_user.company_code}
    collection = db.get_collection("job_roles")
    job_roles = await collection.find(query).to_list(length=None)
    logging.info(f"Found {len(job_roles)} job roles")
    
    # Add default values for missing fields
    for job_role in job_roles:
        if "status" not in job_role:
            job_role["status"] = "Active"
        if "applications_count" not in job_role:
            job_role["applications_count"] = 0
        if "shortlisted_count" not in job_role:
            job_role["shortlisted_count"] = 0
    
    return [JobRoleResponse(**convert_id(job_role)) for job_role in job_roles]

@router.get("/top/", response_model=List[JobRoleResponse])
async def get_top_job_roles(current_user: User = Depends(get_current_user)):
    logging.info(f"Fetching top job roles for company: {current_user.company_code}")
    query = {"company_id": current_user.company_code}
    collection = db.get_collection("job_roles")
    job_roles = await collection.find(query).sort("applications_count", -1).limit(3).to_list(length=None)
    logging.info(f"Found {len(job_roles)} top job roles")
    
    # Add default values for missing fields
    for job_role in job_roles:
        if "status" not in job_role:
            job_role["status"] = "Active"
        if "applications_count" not in job_role:
            job_role["applications_count"] = 0
        if "shortlisted_count" not in job_role:
            job_role["shortlisted_count"] = 0
    
    return [JobRoleResponse(**convert_id(job_role)) for job_role in job_roles]

@router.get("/{job_id}", response_model=JobRoleResponse)
async def get_job_role(job_id: str, current_user: User = Depends(get_current_user)):
    try:
        object_id = validate_object_id(job_id)
    except HTTPException as e:
        raise e
    
    collection = db.get_collection("job_roles")
    job_role = await collection.find_one({
        "_id": object_id,
        "company_id": current_user.company_code
    })
    
    if not job_role:
        raise HTTPException(status_code=404, detail="Job role not found")
    
    # Add default values for missing fields
    if "status" not in job_role:
        job_role["status"] = "Active"
    if "applications_count" not in job_role:
        job_role["applications_count"] = 0
    if "shortlisted_count" not in job_role:
        job_role["shortlisted_count"] = 0
    
    return JobRoleResponse(**convert_id(job_role))

@router.delete("/{job_id}")
async def delete_job_role(job_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "hiring_manager":
        raise HTTPException(status_code=403, detail="Only hiring managers can delete job roles")
    try:
        object_id = validate_object_id(job_id)
    except HTTPException as e:
        raise e
    collection = db.get_collection("job_roles")
    result = await collection.delete_one({
        "_id": object_id,
        "company_id": current_user.company_code
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job role not found")
    
    return {"message": "Job role deleted successfully"}

@router.put("/{job_id}", response_model=JobRoleResponse)
async def update_job_role(
    job_id: str,
    job_role_update: JobRoleUpdate,
    current_user: User = Depends(get_current_user)
):
    try:
        object_id = validate_object_id(job_id)
    except HTTPException as e:
        raise e
    
    if current_user.role != "hiring_manager":
        raise HTTPException(status_code=403, detail="Only hiring managers can update job roles")
    
    # Convert skills string to list if it's a string
    if isinstance(job_role_update.skills, str):
        job_role_update.skills = [skill.strip() for skill in job_role_update.skills.split(",")]
    
    update_data = job_role_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    collection = db.get_collection("job_roles")
    result = await collection.find_one_and_update(
        {
            "_id": object_id,
            "company_id": current_user.company_code
        },
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Job role not found")
    
    return JobRoleResponse(**convert_id(result))

@router.get("/metrics/")
async def get_recruiter_metrics(current_user: User = Depends(get_current_user)):
    """Get recruiter-specific metrics"""
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can access metrics")
    
    try:
        collection = db.get_collection("candidates")
        
        # Get all candidates for this recruiter
        candidates = await collection.find({"recruiter_id": str(current_user.id)}).to_list(length=None)
        
        if not candidates:
            return {
                "mostAppliedRole": "No applications yet",
                "avgFitScore": 0,
                "totalCVs": 0,
                "rejected": 0,
                "shortlisted": 0
            }
        
        # Calculate metrics
        total_cvs = len(candidates)
        
        # Most applied role
        role_counts = {}
        for candidate in candidates:
            role = candidate.get("job_role_title", "Unknown")
            role_counts[role] = role_counts.get(role, 0) + 1
        
        most_applied_role = max(role_counts.items(), key=lambda x: x[1])[0] if role_counts else "No applications"
        
        # Average fit score
        valid_scores = [c.get("ats_score", 0) for c in candidates if c.get("ats_score") is not None]
        avg_fit_score = round(sum(valid_scores) / len(valid_scores), 1) if valid_scores else 0
        
        # Rejected count (status = "rejected")
        rejected_count = len([c for c in candidates if c.get("status") == "rejected"])
        
        # Shortlisted count (status = "shortlisted" - recruiter's accuracy metric)
        shortlisted_count = len([c for c in candidates if c.get("status") == "shortlisted"])
        
        return {
            "mostAppliedRole": most_applied_role,
            "avgFitScore": avg_fit_score,
            "totalCVs": total_cvs,
            "rejected": rejected_count,
            "shortlisted": shortlisted_count
        }
        
    except Exception as e:
        logging.error(f"Error fetching recruiter metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch metrics: {str(e)}") 