import asyncio
from app.database import Database
from app.auth.utils import get_password_hash
from app.models.user import UserRole

async def create_admin():
    await Database.connect_db()
    users = Database.get_collection("users")
    email = input("Enter admin email: ")
    password = input("Enter admin password: ")
    full_name = input("Enter admin full name: ")
    company_code = input("Enter company code (or 'admin' if not applicable): ")
    existing = await users.find_one({"email": email})
    if existing:
        print("Admin user already exists.")
        return
    hashed_password = get_password_hash(password)
    admin_doc = {
        "email": email,
        "full_name": full_name,
        "company_code": company_code,
        "role": UserRole.ADMIN.value,
        "hashed_password": hashed_password,
        "is_active": True
    }
    result = await users.insert_one(admin_doc)
    print(f"Admin user created with id: {result.inserted_id}")
    await Database.close_db()

if __name__ == "__main__":
    asyncio.run(create_admin()) 