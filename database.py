from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

db_url = "postgresql://postgres:askr@localhost:5432/StyleverseReact"  # postgresql:askr is username:password, StyleverseReact is the dbname
engine = create_engine(db_url, future=True) 
session = sessionmaker(autocommit=False, autoflush=False, bind=engine) #autoflush=False - the session will not automatically flush changes to the DB before you query

