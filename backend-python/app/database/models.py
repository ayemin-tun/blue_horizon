
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

class Flight(Base):
    __tablename__ = "FLIGHTS"

    flight_id = Column(Integer, primary_key=True, autoincrement=True)
    airline_id = Column(Integer, ForeignKey("AIRLINES.airline_id"), nullable=False)
    route_id = Column(Integer, ForeignKey("ROUTES.route_id"), nullable=False)
    
    flight_no = Column(String, unique=True, nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    economy_price = Column(Numeric(10, 2), nullable=False)
    business_price = Column(Numeric(10, 2), nullable=False)
    is_deleted = Column(Integer, default=0)

    # Relationships
    airline = relationship("Airline")
    route = relationship("Route")
