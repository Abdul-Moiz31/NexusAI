from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.session import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create DB tables
    create_db_and_tables()
    yield
    # Shutdown: Clean up if needed

from app.api.api import api_router

app = FastAPI(
    title="NexusAI",
    description="Advanced AI Research & Tutoring System",
    version="0.1.0",
    lifespan=lifespan
)

app.include_router(api_router, prefix="/api/v1")


# Mount static files for frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "Welcome to NexusAI - Your Advanced AI Tutor"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
