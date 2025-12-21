from typing import Generator
from sqlmodel import Session
from app.db.session import get_session

# This is a common pattern in FastAPI. 
# It allows us to inject the database session into any endpoint that needs it.
# It also ensures the session is closed after the request is finished.
