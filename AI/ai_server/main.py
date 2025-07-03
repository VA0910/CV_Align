from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import os
import shutil
from rag import analyze_cv

app = FastAPI()

@app.post("/api/evaluate/")
async def analyze(cv: UploadFile = File(...), jd: str = Form(...)):
    temp_path = f"temp_{cv.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(cv.file, buffer)

    result = analyze_cv(temp_path, jd)

    os.remove(temp_path)
    return JSONResponse(content=result)
