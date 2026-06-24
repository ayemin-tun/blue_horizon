from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Local SQLite Database File path
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/blue_horizon.db"

# Create Engine for 
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Database Session Build
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Models Main Base
Base = declarative_base()

# Database Session open/close Dependency Function base on api request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()