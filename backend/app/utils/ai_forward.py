import requests
import logging
import os
import subprocess
import tempfile
import json

logger = logging.getLogger(__name__)

AI_API_URL = "https://cv-align.onrender.com/api/evaluate/"  #  deployed Render URL with trailing slash

def send_cv_to_ai_server(cv_file, jd_text):
    """Send CV file and job description to the deployed AI API."""
    try:
        files = {"cv": ("cv.pdf", cv_file, "application/pdf")}
        data = {"jd": jd_text}  # Changed from "job_description" to "jd"
        
        logger.info(f"Sending request to deployed AI API: {AI_API_URL}")
        logger.info(f"Job description length: {len(jd_text)}")
        logger.info(f"CV file size: {len(cv_file)} bytes")
        
        response = requests.post(AI_API_URL, files=files, data=data, timeout=60)
        
        logger.info(f"AI API response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"AI API response: {result}")
            return result
        else:
            logger.error(f"AI API error: {response.status_code} - {response.text}")
            raise Exception(f"AI API returned status {response.status_code}: {response.text}")
            
    except requests.exceptions.Timeout:
        logger.error("AI API request timed out - trying local fallback")
        return use_local_ai_fallback(cv_file, jd_text)
    except requests.exceptions.RequestException as e:
        logger.error(f"AI API request failed: {str(e)} - trying local fallback")
        return use_local_ai_fallback(cv_file, jd_text)
    except Exception as e:
        logger.error(f"Unexpected error in AI API call: {str(e)} - trying local fallback")
        return use_local_ai_fallback(cv_file, jd_text)

def use_local_ai_fallback(cv_file, jd_text):
    """Fallback to local AI script if deployed API fails"""
    try:
        logger.info("Using local AI script fallback")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            tmp.write(cv_file)
            tmp_path = tmp.name
        
        try:
            # Get the path to the AI script
            current_dir = os.path.dirname(os.path.abspath(__file__))
            ai_script_path = os.path.join(current_dir, '..', '..', '..', 'AI', 'ai_server', 'rag.py')
            
            # Call the local AI script
            result = subprocess.run(
                ["python", ai_script_path, "--cv", tmp_path, "--job", jd_text],
                capture_output=True,
                text=True,
                check=True,
                timeout=120
            )
            
            # Parse the output
            output = result.stdout.strip()
            if output:
                try:
                    return json.loads(output)
                except json.JSONDecodeError:
                    logger.error("Failed to parse local AI script output as JSON")
                    return create_fallback_response("Local AI script returned invalid JSON")
            else:
                logger.error("Local AI script returned empty output")
                return create_fallback_response("Local AI script returned empty output")
                
        except subprocess.TimeoutExpired:
            logger.error("Local AI script timed out")
            return create_fallback_response("Local AI script timed out")
        except subprocess.CalledProcessError as e:
            logger.error(f"Local AI script failed: {e.stderr}")
            return create_fallback_response(f"Local AI script failed: {e.stderr}")
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        logger.error(f"Local AI fallback failed: {str(e)}")
        return create_fallback_response(f"Both deployed API and local AI failed: {str(e)}")

def create_fallback_response(error_message):
    """Create a fallback response when all AI methods fail"""
    return {
        "candidate_name": "Analysis Failed",
        "degree": "Not Available",
        "course": "Not Available",
        "cgpa": "Not Available",
        "ats_score": 0,
        "strengths": ["Analysis pending"],
        "weaknesses": ["Analysis pending"],
        "feedback": f"AI analysis failed: {error_message}",
        "detailed_feedback": f"The CV was uploaded successfully but AI analysis failed. Error: {error_message}. Please try again later or contact support.",
        "eligibility": "unknown"
    }
