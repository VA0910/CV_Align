
# CV Align - AI-Powered CV Evaluator
Align your CV to job descriptions using intelligent, recruiter-style feedback

</div>
🚀 Introduction
CV Align is a smart, AI-driven CV evaluation platform that analyzes your resume against job descriptions and delivers detailed, structured feedback. Leveraging modern Retrieval-Augmented Generation (RAG) pipelines and GenAI models, it mimics the decision-making process of Applicant Tracking Systems (ATS) and human recruiters.

Perfect for:

Job seekers optimizing their CVs for specific roles
Recruiters screening applications efficiently
Career coaches helping students or clients improve their profiles

# ✨ Key Features

# 🔍 Smart CV Analysis

- Upload your CV and a job description
- Get actionable, section-wise feedback (ATS-style)
- Match score, missing skills, role alignment, and improvement tips

# 🔒 Role-Based Access

- Secure login for Recruiters, Applicants, and Admins
- Dashboards with personalized features

# 🌐 Cloud Storage + Live Dashboard

Cloudinary integration for storing CVs
Live dashboard to track and compare evaluations

# 🧠 RAG-based Evaluation Pipeline

Uses a vector database (FAISS) to retrieve relevant job context
Structured prompts for consistent, high-quality responses
Multi-model integration (Groq, Google GenAI)

# 🛠️ Tech Stack

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

# 📦 Installation
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

# AI CV Evaluation System Setup
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

# Run the Project

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

# How It Works

1️⃣ Upload CV & Job Description
Upload your resume PDF and a job description in the recruiter dashboard.

2️⃣ RAG-Based Evaluation
Your data is parsed, embedded, and compared against the job role using a custom prompt chain.

3️⃣ Structured Feedback
You receive a score, strengths and weaknesses based on the job requirements, and actionable tips.

4️⃣ Real-Time Dashboard
Track past evaluations, compare changes, and view insights.


# 🔐 Role-Based Dashboard

CV Align features a structured access control system with three user roles, each with distinct privileges:

- 👤 Recruiter

Upload and manage candidate CVs
View AI-generated feedback and alignment scores
Accept or Reject candidates based on evaluation

- 🧑‍💼 Hiring Manager

Has all recruiter privileges

Additionally:
Upload and manage job descriptions
View recruiter performance stats
Shortlist or Reject recruiter-selected candidates to create a final list
Manage the recruitment funnel from job posting to final selection

- 🛠 Admin

Full platform oversight
View and manage all users, CVs, and job descriptions

🧩 Initial Setup (Admin Only):
To create the first admin account, run the following script in the backend directory:

```bash
python create_admin.py
```

This script will prompt you for admin credentials and securely store them in the database.

# 📸 Screenshots

Landing Page
![image](https://github.com/user-attachments/assets/c98baa36-66d5-464e-af57-75d383f8374b)

Sign In Page
![image](https://github.com/user-attachments/assets/0ff5c80b-9201-4144-86c6-1a37978bfc7a)

Sign Up Page
![image](https://github.com/user-attachments/assets/4fb5b002-791f-4289-9101-4462ff681b7d)

Upload CV & JD
![image](https://github.com/user-attachments/assets/a756cbe1-ffeb-4556-bbd8-a88840cf693c)

Feedback Section
![image](https://github.com/user-attachments/assets/1bcdda0b-f7f5-410f-b26b-5a3415986b30)

Recruiter Dashboard
![image](https://github.com/user-attachments/assets/1012bd2b-1929-44e5-a4ba-8214f929d3a4)
![image](https://github.com/user-attachments/assets/63f9aa9a-3f3f-4972-bd75-18ddd3ecce28)

Hiring Manager Dashboard
![image](https://github.com/user-attachments/assets/e97b4988-a35e-43e6-b561-4960eff0dacb)
![image](https://github.com/user-attachments/assets/7f594618-7c5e-4e26-ade6-1f7b28023a7d)
![image](https://github.com/user-attachments/assets/4136f3dd-9b53-4d35-9ba5-99dadde3e003)
![image](https://github.com/user-attachments/assets/c7b654e4-c688-4ce5-8370-38ca346c6ff0)
![image](https://github.com/user-attachments/assets/b6e82062-f6ba-41ec-ad78-d2f0326d2dad)

Admin Dashboard
![image](https://github.com/user-attachments/assets/00a6d286-e0ff-4ab4-94df-2c5d70dcbf02)
![image](https://github.com/user-attachments/assets/7558c0f4-abfc-4d20-af17-29aefdb5a74b)

👨‍💻 Authors

-[@Vaishnavi](https://github.com/VA0910)
-[@Sharvani](https://github.com/sharvani2507)
-[@Jinay](https://github.com/jinay-mehta)
-[@Swayam](https://github.com/Swayam8115)

<div align="center"> Built with 💼 and 💡 by the CV Align Team </div>
