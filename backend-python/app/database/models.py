
from sqlalchemy import Column, Integer, String
from app.database.database import Base

class User(Base):
    __tablename__ = "USERS" 

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False,unique=True)
    role = Column(String, default="agent") 