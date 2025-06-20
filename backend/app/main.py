from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection, Database
from app.routes import company, auth, job_role, users, candidate
from app.routes import evaluate
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- App Initialization ---
app = FastAPI(
    title="CV Align API",
    description="Backend for the CV Align recruitment platform",
    version="1.0.0"
)

# --- Event Handlers ---
@app.on_event("startup")
async def startup():
    await connect_to_mongo()
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def shutdown():
    await close_mongo_connection()
    logger.info("Application shutdown complete")

# --- CORS Settings ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

class APILogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = datetime.utcnow()
        response = await call_next(request)
        end_time = datetime.utcnow()
        duration = (end_time - start_time).total_seconds()
        # Log to MongoDB
        try:
            await Database.get_collection("api_logs").insert_one({
                "path": request.url.path,
                "method": request.method,
                "timestamp": start_time,
                "duration": duration
            })
        except Exception as e:
            pass  # Avoid breaking the app if logging fails
        return response

app.add_middleware(APILogMiddleware)

# --- Routers ---
app.include_router(company.router)
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(job_role.router, prefix="/job-roles", tags=["Job Roles"])
app.include_router(users.router, prefix="/users")
app.include_router(candidate.router)
app.include_router(evaluate.router, prefix="/api")

# --- Root Endpoint ---
@app.get("/")
def root():
    return {"message": "Welcome to CV Align API"}




