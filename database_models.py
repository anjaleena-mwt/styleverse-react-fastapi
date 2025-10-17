from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(30), unique=True, nullable=False, index=True)
    user_email = Column(String(30), unique=True, nullable=False, index=True)
    password = Column(String(20), nullable=False)
    address = Column(String(200), nullable=False)  
    phone_number = Column(String(20), nullable=False)  
