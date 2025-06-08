import requests

AI_API_URL = "https://cv-align.onrender.com/analyze/"  # replace with your deployed Render URL

def send_cv_to_ai_server(cv_file, jd_text):
    files = {"cv": ("cv.pdf", cv_file, "application/pdf")}
    data = {"job_description": jd_text}
    response = requests.post(AI_API_URL, files=files, data=data)
    return response.json()
