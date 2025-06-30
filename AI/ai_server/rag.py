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
import argparse
import json
import re
import logging
import sys

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import validate_api_keys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# os.environ["LANGCHAIN_TRACING_V2"]="true"
# os.environ["LANGCHAIN_API_KEY"]=os.getenv("LANGCHAIN_API_KEY")
os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

def analyze_cv(cv_path, job_description):
    """Analyze a CV against a job description using AI."""
    try:
        # Validate API keys first
        if not validate_api_keys():
            raise ValueError("Missing required API keys. Please check your configuration.")
        
        # Get file extension
        file_ext = os.path.splitext(cv_path)[1].lower()
        
        # Load and split the CV based on file type
        if file_ext == '.pdf':
            loader = PyPDFLoader(cv_path)
        elif file_ext in ['.doc', '.docx']:
            # For DOC/DOCX files, we'll need to convert to text first
            # You might want to add a proper DOC/DOCX loader here
            raise NotImplementedError("DOC/DOCX parsing not implemented yet")
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
            
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        documents = text_splitter.split_documents(docs)

        # Set up embeddings and vector store
        embedding_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        db = FAISS.from_documents(documents, embedding_model)

        # Set up the LLM
        llm = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model_name="gemma2-9b-it"
        )

        prompt = ChatPromptTemplate.from_template("""
        You are an experienced HR and recruitment assistant tasked with evaluating a candidate's CV against a provided job description to determine their eligibility and suitability for the role. Your analysis must be fair, objective, and based solely on the CV and job description.
                                                
        **Task**:
        1. Extract the **applicant's name**, **CGPA/percentage in college**, **degree**, and **course/major** from the CV's education section.
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

        # Create and run the chain
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = db.as_retriever(search_kwargs={"k": 5})
        retrieval_chain = create_retrieval_chain(retriever, document_chain)

        # Run the analysis
        output = retrieval_chain.invoke({"input": job_description})['answer']
        
        # Parse and return the results
        return parse_output(output)

    except Exception as e:
        logger.error(f"Error analyzing CV: {str(e)}")
        return {
            "candidate_name": "Error analyzing CV",
            "eligibility": "error",
            "reason": f"Failed to analyze CV: {str(e)}",
            "ats_score": 0
        }

def parse_output(output):
    """Parse the AI model output into a structured format."""
    try:
        # Use regex to extract fields from the output string
        def extract(pattern, text, default="", flags=0):
            match = re.search(pattern, text, flags)
            return match.group(1).strip() if match else default

        # Check if candidate is eligible
        if "**Eligibility**: Candidate is not eligible" in output:
            return {
                "candidate_name": extract(r"\*\*Applicant Name\*\*:\s*(.*)", output),
                "eligibility": "not_eligible",
                "reason": extract(r"\*\*Reason\*\*:\s*(.*)", output),
                "ats_score": 0
            }

        # Parse eligible candidate data
        return {
            "candidate_name": extract(r"\*\*Applicant Name\*\*:\s*(.*)", output),
            "cgpa": extract(r"\*\*College CGPA/Percentage\*\*:\s*(.*)", output),
            "degree": extract(r"\*\*Degree\*\*:\s*(.*)", output),
            "course": extract(r"\*\*Course/Major\*\*:\s*(.*)", output),
            "ats_score": int(extract(r"\*\*ATS Score\*\*:\s*(\d+)", output) or 0),
            "strengths": re.findall(r"- (.*)", extract(r"\*\*Strengths\*\*:(.*?)(?=\*\*Weaknesses\*\*)", output, flags=re.DOTALL)),
            "weaknesses": re.findall(r"- (.*)", extract(r"\*\*Weaknesses\*\*:(.*?)(?=\*\*Feedback\*\*)", output, flags=re.DOTALL)),
            "feedback": extract(r"\*\*Feedback\*\*:(.*?)(?=\*\*Detailed Feedback\*\*|$)", output, flags=re.DOTALL).strip(),
            "detailed_feedback": extract(r"\*\*Detailed Feedback\*\*:(.*)", output, flags=re.DOTALL).strip()
        }

    except Exception as e:
        logger.error(f"Error parsing AI output: {str(e)}")
        return {
            "candidate_name": "Error parsing CV",
            "eligibility": "error",
            "reason": f"Failed to parse AI output: {str(e)}",
            "ats_score": 0
        }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--cv", required=True, help="Path to the CV PDF file")
    parser.add_argument("--job", required=True, help="Job description text")
    args = parser.parse_args()

    try:
        result = analyze_cv(args.cv, args.job)
        print(json.dumps(result))
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        print(json.dumps({
            "candidate_name": "Error processing CV",
            "eligibility": "error",
            "reason": str(e),
            "ats_score": 0
        }))
