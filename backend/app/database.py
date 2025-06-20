from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv
import logging

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "cv_align")

class Database:
    client = None  # type: Optional[AsyncIOMotorClient]
    db = None

    @classmethod
    async def connect_db(cls):
        cls.client = AsyncIOMotorClient(MONGODB_URL)
        cls.db = cls.client[DATABASE_NAME]
        
        # Initialize collections and indexes
        if "companies" not in await cls.db.list_collection_names():
            await cls.db.create_collection("companies")
            await cls.db.companies.create_index("website", unique=True)
            logging.info("Initialized companies collection with indexes")
        
        # Initialize job_roles collection
        if "job_roles" not in await cls.db.list_collection_names():
            await cls.db.create_collection("job_roles")
            await cls.db.job_roles.create_index([("company_id", 1), ("title", 1)], unique=True)
            logging.info("Initialized job_roles collection with indexes")
        
        logging.info("Connected to MongoDB successfully")

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            logging.info("Closed MongoDB connection")

    @classmethod
    def get_collection(cls, collection_name: str):
        return cls.db[collection_name]

db = Database()

async def get_database():
    return db.db

async def connect_to_mongo():
    try:
        await Database.connect_db()
    except Exception as e:
        logging.error(f"Failed to connect to MongoDB: {str(e)}")
        raise e

async def close_mongo_connection():
    await Database.close_db()
