from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.graph import run_graph

router = APIRouter()

class GraphRequest(BaseModel):
    message: str

@router.post("/agent/graph")
async def graph_chat(request: GraphRequest):
    """
    Chat with the Multi-Agent System.
    The Supervisor will route your request to the Researcher or Tutor.
    """
    response = await run_graph(request.message)
    return {"response": response}
