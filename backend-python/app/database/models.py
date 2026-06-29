
from sqlalchemy import Column, Integer, String,Boolean
from app.database.database import Base

class User(Base):
    __tablename__ = "USERS" 

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False,unique=True)
    role = Column(String, default="agent") 

class Airline(Base):
    __tablename__ = 'AIRLINES'
    airline_id = Column(Integer, primary_key=True, index=True)
    airline_name = Column(String, index=True, nullable=False)
    country = Column(String, index=True, nullable=False)
    is_deleted = Column(Boolean, default=False)

class Route(Base):
    __tablename__ = 'ROUTES'
    route_id = Column(Integer, primary_key=True, index=True)
    departure_city = Column(String, index=True, nullable=False)
    arrival_city = Column(String, index=True, nullable=False)
    is_deleted = Column(Boolean, default=False)
