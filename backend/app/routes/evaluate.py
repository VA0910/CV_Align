from fastapi import APIRouter, UploadFile, File, Form
from utils.ai_forward import send_cv_to_ai_server

router = APIRouter()

@router.post("/evaluate/")
async def evaluate(cv: UploadFile = File(...), jd: str = Form(...)):
    result = send_cv_to_ai_server(cv.file, jd)
    return result
