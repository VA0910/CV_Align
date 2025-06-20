from sqlalchemy.orm import Session
from app.models.company import Company, CompanyCreate
from app.database import get_db
from app.utils.code_utils import generate_unique_code

def create_company(db: Session, company: CompanyCreate):
    code = generate_unique_code()
    # Ensure code uniqueness (basic retry logic)
    while db.query(Company).filter_by(code=code).first():
        code = generate_unique_code()
    
    new_company = Company(
        name=company.name,
        desc=company.description,
        website=company.website,
        code=code
    )
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company
