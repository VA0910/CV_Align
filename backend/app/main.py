from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import company, auth, job_role, users, candidate
from app.routes import evaluate
import logging

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

# --- Routers ---
app.include_router(company.router, prefix="/company", tags=["Company"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(job_role.router, prefix="/job-roles", tags=["Job Roles"])
app.include_router(users.router)
app.include_router(candidate.router, prefix="/candidates", tags=["Candidates"])
app.include_router(evaluate.router, prefix="/api")

# --- Root Endpoint ---
@app.get("/")
def root():
    return {"message": "Welcome to CV Align API"}




