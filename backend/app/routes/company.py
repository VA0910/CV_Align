from fastapi import APIRouter, HTTPException, Depends
from app.models.company import CompanyCreate, CompanyResponse, CompanyModel
from app.database import get_database
from app.utils.code_utils import generate_unique_code
from datetime import datetime
import logging

router = APIRouter(prefix="/company", tags=["Company"])

@router.post("/register", response_model=CompanyResponse)
async def register_company(company: CompanyCreate, db=Depends(get_database)):
    try:
        logging.info(f"Attempting to register company: {company.model_dump()}")
        
        # Check if company with this website already exists
        existing = await db.companies.find_one({"website": company.website})
        if existing:
            logging.warning(f"Company with website {company.website} already exists")
            raise HTTPException(
                status_code=400,
                detail=f"A company with the website {company.website} is already registered. Please use a different website or contact support if this is your company."
            )

        # Generate unique code
        code = generate_unique_code()
        while await db.companies.find_one({"code": code}):
            code = generate_unique_code()
        logging.info(f"Generated unique code: {code}")

        # Create new company
        company_model = CompanyModel(
            name=company.name,
            description=company.description,
            website=company.website,
            code=code,
            created_at=datetime.utcnow()
        )
        
        # Convert to dict and log
        company_data = company_model.model_dump(by_alias=True)
        logging.info(f"Company data to insert: {company_data}")

        # Insert into database
        result = await db.companies.insert_one(company_data)
        logging.info(f"Insert result: {result.inserted_id}")
        
        # Get the created company
        created_company = await db.companies.find_one({"_id": result.inserted_id})
        logging.info(f"Retrieved company: {created_company}")
        
        if not created_company:
            logging.error("Failed to retrieve created company after insertion")
            raise HTTPException(
                status_code=500,
                detail="Failed to create company. Please try again or contact support."
            )
        
        # Convert ObjectId to string for response
        created_company["id"] = str(created_company["_id"])
        
        return CompanyResponse(**created_company)
    except Exception as e:
        logging.error(f"Error in register_company: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again or contact support."
        ) 