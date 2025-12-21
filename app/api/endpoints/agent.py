from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from langchain_core.messages import HumanMessage, AIMessage
from app.agents.simple_agent import run_agent

router = APIRouter()

class AgentRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

@router.post("/agent/chat")
async def agent_chat(request: AgentRequest):
    """
    Chat with the Nexus Agent.
    The agent can use tools like Calculator, Web Search, and Knowledge Base.
    """
    # Convert history to LangChain format
    chat_history = []
    for msg in request.history:
        if msg["role"] == "user":
            chat_history.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            chat_history.append(AIMessage(content=msg["content"]))
            
    response = await run_agent(request.message, chat_history)
    return {"response": response}
