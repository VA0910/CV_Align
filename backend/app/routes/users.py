from fastapi import APIRouter, Depends, HTTPException
from app.database import Database
from app.routes.auth import get_current_user
from app.models.user import User
from app.utils.mongo_utils import convert_id
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter()
db = Database()

def add_recruiter_stats(user):
    user.setdefault('uploaded_cvs', 0)
    user.setdefault('selected_candidates', 0)
    user.setdefault('shortlisted_candidates', 0)
    user.setdefault('status', 'Active')
    # Calculate accuracy
    if user['shortlisted_candidates'] > 0:
        user['accuracy'] = round((user['selected_candidates'] / user['shortlisted_candidates']) * 100, 2)
    else:
        user['accuracy'] = 0.0
    return user

@router.get("/recruiters/")
async def get_all_recruiters(current_user: User = Depends(get_current_user)):
    collection = db.get_collection("users")
    recruiters = await collection.find(
        {"role": "recruiter", "company_code": current_user.company_code}
    ).to_list(length=None)
    return [add_recruiter_stats(convert_id(r)) for r in recruiters]



@router.get("/recruiters/top")
async def get_top_recruiters(current_user: User = Depends(get_current_user)):
    collection = db.get_collection("users")
    recruiters = await collection.find(
        {"role": "recruiter", "company_code": current_user.company_code}
    ).sort("accuracy", -1).limit(3).to_list(length=3)
    return [add_recruiter_stats(convert_id(r)) for r in recruiters]

@router.get("/all/")
async def get_all_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all users.")
    collection = db.get_collection("users")
    users = await collection.find({}).to_list(length=None)
    return [convert_id(u) for u in users]

@router.get("/admin/metrics")
async def get_admin_metrics(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view metrics.")
    users_collection = db.get_collection("users")
    companies_collection = db.get_collection("companies")
    api_logs_collection = db.get_collection("api_logs")
    stats_collection = db.get_collection("stats")
    # Count users, companies, CVs
    total_users = await users_collection.count_documents({})
    total_companies = await companies_collection.count_documents({})
    stats_doc = await stats_collection.find_one({"_id": "total_cvs_processed"})
    total_cvs = stats_doc["count"] if stats_doc and "count" in stats_doc else 0
    # API calls
    total_api_calls = await api_logs_collection.count_documents({})
    # Most accessed endpoint
    pipeline = [
        {"$group": {"_id": "$path", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    result = await api_logs_collection.aggregate(pipeline).to_list(length=1)
    most_accessed_endpoint = result[0]["_id"] if result else "N/A"
    return {
        "total_users": total_users,
        "total_companies": total_companies,
        "total_cvs": total_cvs,
        "total_api_calls": total_api_calls,
        "most_accessed_endpoint": most_accessed_endpoint
    }

@router.get("/metrics/")
async def get_metrics(current_user: User = Depends(get_current_user)):
    if current_user.role == "recruiter":
        # ... recruiter metrics logic ...
        return {...}
    elif current_user.role == "hiring_manager":
        # ... hiring manager metrics logic ...
        return {...}
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

@router.get("/admin/api-calls-over-time")
async def api_calls_over_time(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view metrics.")
    api_logs_collection = db.get_collection("api_logs")
    # Last 14 days
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=13)
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date, "$lte": end_date}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "calls": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    results = await api_logs_collection.aggregate(pipeline).to_list(length=100)
    # Fill missing days
    date_map = {r["_id"]: r["calls"] for r in results}
    dates = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(14)]
    return [{"date": d, "calls": date_map.get(d, 0)} for d in dates]

@router.get("/admin/endpoint-performance")
async def endpoint_performance(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view metrics.")
    api_logs_collection = db.get_collection("api_logs")
    pipeline = [
        {"$group": {
            "_id": "$path",
            "avg": {"$avg": "$response_time"},
            "max": {"$max": "$response_time"}
        }},
        {"$sort": {"avg": -1}}
    ]
    results = await api_logs_collection.aggregate(pipeline).to_list(length=20)
    return [
        {"endpoint": r["_id"], "avg": round(r["avg"], 2), "max": r["max"]}
        for r in results
    ]

@router.patch("/{user_id}/toggle-status")
async def toggle_user_status(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can perform this action.")
    
    users_collection = db.get_collection("users")
    
    # Fetch the user to get their current status
    user_to_update = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Toggle the is_active status
    new_status = not user_to_update.get("is_active", True)
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": new_status}}
    )
    
    return {"message": f"User status updated to {'active' if new_status else 'inactive'}", "is_active": new_status}

@router.delete("/recruiters/{recruiter_id}", status_code=204)
async def delete_recruiter_by_hiring_manager(
    recruiter_id: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["hiring_manager", "admin"]:
        raise HTTPException(status_code=403, detail="Only hiring managers or admins can perform this action.")

    users_collection = db.get_collection("users")

    # Find the recruiter to ensure they belong to the same company
    query = {
        "_id": ObjectId(recruiter_id),
        "role": "recruiter"
    }
    if current_user.role == "hiring_manager":
        query["company_code"] = current_user.company_code

    recruiter_to_delete = await users_collection.find_one(query)

    if not recruiter_to_delete:
        raise HTTPException(status_code=404, detail="Recruiter not found or you do not have permission to delete them.")

    result = await users_collection.delete_one({"_id": ObjectId(recruiter_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete recruiter.")

    return