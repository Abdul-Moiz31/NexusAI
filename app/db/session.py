from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# We use check_same_thread=False for SQLite to allow multiple threads (FastAPI) to use the connection
# In production with PostgreSQL, this argument is not needed.
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

def get_session():
    """Dependency to get a database session."""
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    """Create the database and tables."""
    SQLModel.metadata.create_all(engine)
