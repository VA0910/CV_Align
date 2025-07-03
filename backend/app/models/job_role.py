from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

class JobRoleModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: str
    description: str
    company_id: str
    status: str = "Active"
    applications_count: int = 0
    shortlisted_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True
        from_attributes = True

    def model_dump(self, by_alias=True, **kwargs):
        data = super().model_dump(by_alias=by_alias, **kwargs)
        if '_id' in data and data['_id'] is None:
            del data['_id']
        return data

class JobRoleCreate(BaseModel):
    title: str
    description: str

class JobRoleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class JobRoleResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    company_id: str
    status: str
    applications_count: int
    shortlisted_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True
        from_attributes = True 