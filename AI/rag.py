from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.llms import Ollama
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.prompts import ChatPromptTemplate
import streamlit as st
import os
from dotenv import load_dotenv

load_dotenv()

# os.environ["LANGCHAIN_TRACING_V2"]="true"
# os.environ["LANGCHAIN_API_KEY"]=os.getenv("LANGCHAIN_API_KEY")
os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

loader=PyPDFLoader("AAGAM_220123002.pdf")
docs=loader.load()

text_splitter= RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
documents=text_splitter.split_documents(docs)

embedding_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
db = FAISS.from_documents(documents, embedding_model)
# emd=OllamaEmbeddings(model="llama3.2")
# db=FAISS.from_documents(documents,emd)

llm=ChatGroq(model="gemma2-9b-it")

prompt = ChatPromptTemplate.from_template("""
You are an experienced HR and recruitment assistant tasked with evaluating a candidate's CV against a provided job description to determine their eligibility and suitability for the role. Your analysis must be fair, objective, and based solely on the CV and job description.
                                          
**Task**:
1. Extract the **applicant’s name**, **CGPA/percentage in college**, **degree**, and **course/major** from the CV’s education section.
2. Check the **eligibility criteria** explicitly stated in the job description (e.g., required experience, specific skills, education, certifications).
   - If the candidate does not meet *any* eligibility criterion, return only:  
     ```
     **Applicant Name**: [Name]
     **Eligibility**: Candidate is not eligible.  
     **Reason**: [Specify which criterion is not met].
     ```
   - If all eligibility criteria are met, proceed with the full evaluation.
3. For eligible candidates, provide:
   - A **score out of 100** for suitability.
   - **Two strengths**, each in one concise sentence (minimal words).
   - **Two weaknesses**, each in one concise sentence (minimal words).
   - A **feedback paragraph** (three lines, 2'3 concise sentences) for recruiters, stating if the candidate is eligible and suitable for the role.

**Scoring Criteria** (total 100%):
- **Skill Match (30%)**: Align technical/soft skills with job requirements.
- **Relevant Experience (25%)**: Assess professional, internship, or project experience.
- **Education (10%)**: Check relevant degrees or academic performance.
- **Certifications or Courses (5%)**: Verify relevant certifications/coursework.
- **Soft Skills (10%)**: Evaluate implied/explicit soft skills (e.g., teamwork).
- **Projects and Achievements (10%)**: Assess relevant projects/awards.
- **Formatting & Professionalism (5%)**: Evaluate CV clarity and presentation.
- **Customization to Job Role (5%)**: Check tailoring to job requirements.

**Instructions**:
- **Extraction**:
  - Identify the applicant's name from the first few lines of the CV (likely in the header or personal details section). If not found, note as 'Not specified'.
  - Extract CGPA or percentage from the college education entry (e.g., B.Tech, undergraduate degree). Look for patterns like 'CGPA: X', 'X (Current)', or 'X%'. If both are present, report CGPA; if none, note as 'Not specified'.
  - Extract the degree (e.g., B.Tech, B.Sc.) from the education section, often in a table or line starting with 'B.' or 'Bachelor'. If ongoing (e.g., '2022-Present'), note the degree with 'In progress'. If not found, note as 'Not specified'.
  - Extract the course/major (e.g., Mathematics and Computing, Computer Science) from the education section, typically after the degree (e.g., 'B.Tech - Mathematics and Computing'). If not specified, note as 'Not specified'.
- **Eligibility Check**:
  - Identify all explicit eligibility criteria in the job description (e.g., specific skills like 'JavaScript/React.js,' experience level like '1'3 years,' specific degrees).
  - Compare CV content to each criterion.
  - If *any* criterion is not met (e.g., missing a required skill like Docker, insufficient experience), halt evaluation and return the ineligibility message.
- **Scoring (if eligible)**:
  - For each criterion, assign a score (0'100%):
    - **Full Match**: Explicitly meets requirements (e.g., skill used in projects) → 80'100%.
    - **Partial Match**: Implied/limited evidence (e.g., coursework, less experience) → 40'79%.
    - **No Match**: No evidence → 0'39%.
  - Calculate total score:  
    ```
    Total Score = (Skill Match x 0.3) + (Relevant Experience x 0.25) + (Education x 0.1) + (Certifications/Courses x 0.05) + (Soft Skills x 0.1) + (Projects/Achievements x 0.1) + (Formatting x 0.05) + (Customization x 0.05)
    ```
  - If a criterion is not applicable (e.g., no certifications required), assign 50%.
- **Output**:
  - Use only CV content in <context> tags and job description in {input}.
  - Do not assume skills/experience not mentioned unless strongly implied.
  - If CV or job description is incomplete, note limitations in feedback (if eligible).
  - Strengths/weaknesses must be one sentence each, using minimal words.
  - Feedback must be three bullet points (2-3 sentences total), stating eligibility and suitability..
  - Detailed feedback must be 8-9 bullet points (8-9 sentences, 150-200 words) assessing eligibility, suitability, strengths, gaps, and improvement suggestions.
                                          
- **Only show those informations which are mention in the output sections below don't show anything extra**
- **And don't display name , course , degree and cgpa in same lines use seperate line**
                                          
**Output Format** (if eligible):
```
**Applicant Name**: [Name]
                                          
**College CGPA/Percentage**: [CGPA or Percentage]
                                          
**Degree**: [Degree]
                                          
**Course/Major**: [Course or Major]
                                          
**ATS Score**: [Score]/100

**Strengths**:
- [Strength 1, one concise sentence]
- [Strength 2, one concise sentence but focusing on a specific thing]

**Weaknesses**:
- [Weakness 1, one concise sentence]
- [Weakness 2, one concise sentence but focusing on a specific thing]

**Feedback**:
- [concise Sentence on eligibility]
- [concise Sentence on suitability]
- [concise Sentence with rationale or improvement suggestion]

**Detailed Feedback**:
- [Sentence 1 on eligibility]
- [Sentence 2 on suitability]
- [Sentence 3 on strength 1]
- [Sentence 4 on strength 2]
- [Sentence 5 on weakness 1]
- [Sentence 6 on weakness 2]
- [Sentence 7 on additional observation, e.g., education or formatting]
- [Sentence 8 on improvement suggestion 1]
- [Sentence 9 on improvement suggestion 2]                                                                       
```

**Output Format** (if not eligible):
```                               
**Applicant Name**: [Name]
                                          
**Eligibility**: Candidate is not eligible.
**Reason**: [Specify unmet criterion]
```

---
**Candidate CV**:
<context>
{context}
</context>

**Job Description**:
{input}
""")

document_chain=create_stuff_documents_chain(llm,prompt)

retriever=db.as_retriever(search_kwargs={"k": 5})
retrieval_chain=create_retrieval_chain(retriever,document_chain)

st.title('CV_Align')
input_text=st.text_input("Provide Job Description")

output_parser=StrOutputParser()

if input_text:
    st.write(retrieval_chain.invoke({"input":input_text})['answer'])


