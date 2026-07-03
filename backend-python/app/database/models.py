
from sqlalchemy import Column, Integer, String,Boolean,ForeignKey,DateTime,Numeric
from sqlalchemy.orm import relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "USERS" 

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False,unique=True)
    role = Column(String, default="agent") 

    # allow nullable
    phone_no = Column(String, nullable=True) 
    status = Column(String, nullable=True, default="ACTIVE") # default Active
    joined_date = Column(String, nullable=True) 
    is_deleted = Column(Integer, default=0, nullable=False)

class Airline(Base):
    __tablename__ = 'AIRLINES'
    airline_id = Column(Integer, primary_key=True, index=True)
    airline_name = Column(String, index=True, nullable=False)
    country = Column(String, index=True, nullable=False)
    is_deleted = Column(Integer, default=0, nullable=False)

class Route(Base):
    __tablename__ = 'ROUTES'
    route_id = Column(Integer, primary_key=True, index=True)
    departure_city = Column(String, index=True, nullable=False)
    arrival_city = Column(String, index=True, nullable=False)
    is_deleted = Column(Boolean, default=False)

class Flight(Base):
    __tablename__ = "FLIGHTS"

    flight_id = Column(Integer, primary_key=True, autoincrement=True)
    airline_id = Column(Integer, ForeignKey("AIRLINES.airline_id"), nullable=False)
    flight_no = Column(String, unique=True, nullable=False)
    total_seats = Column(Integer, nullable=False)
    is_deleted = Column(Integer, default=0)

    # Relationships
    airline = relationship("Airline")
