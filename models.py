from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=30)
    user_email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    address: str = Field(..., min_length=5, max_length=200)
    phone_number: str = Field(..., min_length=10, max_length=15)

class UserLogin(BaseModel):
    user_email: EmailStr
    password: str = Field(..., min_length=1)

