<div align="center"> <img src="./frontend/public/vite.svg" alt="CV Align" width="200"/>
CV Align - AI-Powered CV Evaluator
Align your CV to job descriptions using intelligent, recruiter-style feedback

</div>
🚀 Introduction
CV Align is a smart, AI-driven CV evaluation platform that analyzes your resume against job descriptions and delivers detailed, structured feedback. Leveraging modern Retrieval-Augmented Generation (RAG) pipelines and GenAI models, it mimics the decision-making process of Applicant Tracking Systems (ATS) and human recruiters.

Perfect for:

Job seekers optimizing their CVs for specific roles
Recruiters screening applications efficiently
Career coaches helping students or clients improve their profiles

✨ Key Features

🔍 Smart CV Analysis

Upload your CV and a job description
Get actionable, section-wise feedback (ATS-style)
Match score, missing skills, role alignment, and improvement tips

🔒 Role-Based Access

Secure login for Recruiters, Applicants, and Admins
Dashboards with personalized features

🌐 Cloud Storage + Live Dashboard

Cloudinary integration for storing CVs
Live dashboard to track and compare evaluations

🧠 RAG-based Evaluation Pipeline

Uses a vector database (FAISS) to retrieve relevant job context
Structured prompts for consistent, high-quality responses
Multi-model integration (Groq, Google GenAI)

🛠️ Tech Stack

Frontend
Framework: React.js
UI: Tailwind CSS
Charting: Recharts


Backend
Framework: FastAPI
Language: Python
Database: MongoDB
Authentication: JWT
File Storage: Cloudinary

AI Models: Groq API, Google Generative AI

Embeddings: FAISS 

📦 Installation
Prerequisites
Node.js (v14+), npm
Python 3.9+ with pip
MongoDB instance
Cloudinary account

API keys: Groq, Google Generative AI

1. Clone the Repository
```bash
git clone https://github.com/your-username/CV_Align.git
cd CV_Align
```

2. Setup the Frontend
```bash
cd frontend
npm install
```

3. Setup the Backend
```bash
cd ../backend
pip install -r requirements.txt
```

4. Add Environment Variables
Create a .env file in  backend:


📁 /backend/.env
```
PORT=8000

# MongoDB
MONGO_URI=your_mongodb_uri
DATABASE_NAME=cv_align 

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. AI CV Evaluation System Setup
The AI logic for CV parsing and evaluation resides in the separate AI directory. It runs as a standalone FastAPI microservice that the main backend communicates with.

Directory: AI/
This module uses Retrieval-Augmented Generation (RAG) to compare CVs with job descriptions and return structured feedback.

Setup Instructions
Navigate to the AI Directory

```bash
cd AI
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Configure API Keys

Run the setup script:

```bash
python setup.py
```

Then edit the generated .env file to include:

```env
GROQ_API_KEY=your_actual_groq_api_key
GOOGLE_API_KEY=your_actual_google_api_key
```

Run the AI Microservice Locally

Since the deployed version is not currently functional, run the AI service locally using:

```bash
cd ai_server
uvicorn main:app --reload
```

Make sure this service is running before starting the main backend so it can send analysis requests successfully.

The backend communicates with this local AI service (via HTTP) from the parse_cv_with_ai function in:

```bash
backend/app/routes/candidate.py
```

It:

Sends the uploaded CV and job description
Receives structured feedback (skills, score, suggestions)
Saves the result in MongoDB

6. Run the Project

Make sure the AI server is running.

Run the backend using the following command:
```bash
cd backend
uvicorn app.main:app --reload
```
Run the fronted using the following command:
```bash
cd frontend
npm run dev
```

How It Works

1️⃣ Upload CV & Job Description
Upload your resume PDF and a job description in the recruiter dashboard.

2️⃣ RAG-Based Evaluation
Your data is parsed, embedded, and compared against the job role using a custom prompt chain.

3️⃣ Structured Feedback
You receive a score, strengths and weaknesses based on the job requirements, and actionable tips.

4️⃣ Real-Time Dashboard
Track past evaluations, compare changes, and view insights.


🔐 Role-Based Dashboard

CV Align features a structured access control system with three user roles, each with distinct privileges:

👤 Recruiter

Upload and manage candidate CVs
View AI-generated feedback and alignment scores
Accept or Reject candidates based on evaluation

🧑‍💼 Hiring Manager

Has all recruiter privileges

Additionally:
Upload and manage job descriptions
View recruiter performance stats
Shortlist or Reject recruiter-selected candidates to create a final list
Manage the recruitment funnel from job posting to final selection

🛠 Admin

Full platform oversight
View and manage all users, CVs, and job descriptions

🧩 Initial Setup (Admin Only):
To create the first admin account, run the following script in the backend directory:

```bash
python create_admin.py
```

This script will prompt you for admin credentials and securely store them in the database.

📸 Screenshots
Recruiter Dashboard

Upload CV & JD

Feedback Section

Performance Chart

👨‍💻 Authors

-[@Vaishnavi](https://github.com/VA0910)
-[@Sharvani](https://github.com/sharvani2507)
-[@Jinay](https://github.com/jinay-mehta)
-[@Swayam](https://github.com/Swayam8115)

<div align="center"> Built with 💼 and 💡 by the CV Align Team </div>