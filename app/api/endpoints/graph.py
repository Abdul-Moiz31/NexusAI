from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Session
from datetime import datetime

from app.agents.graph import run_graph
from app.models.chat import Conversation, Message
from app.db.session import get_session

router = APIRouter()

class GraphRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class GraphResponse(BaseModel):
    response: str
    conversation_id: Optional[int] = None

@router.post("/agent/graph", response_model=GraphResponse)
async def graph_chat(
    request: GraphRequest,
    session: Session = Depends(get_session)
):
    """
    Chat with the Multi-Agent System.
    The Supervisor will route your request to the Researcher or Tutor.
    """
    response = await run_graph(request.message)
    
    result = GraphResponse(response=response)
    
    # Save to database if conversation_id provided
    if request.conversation_id:
        conversation = session.get(Conversation, request.conversation_id)
        if conversation:
            # Save user message
            user_msg = Message(
                role="user",
                content=request.message,
                conversation_id=request.conversation_id
            )
            session.add(user_msg)
            
            # Save assistant message
            assistant_msg = Message(
                role="assistant",
                content=response,
                conversation_id=request.conversation_id
            )
            session.add(assistant_msg)
            
            # Update conversation
            conversation.updated_at = datetime.utcnow()
            if conversation.title == "New Conversation":
                conversation.title = request.message[:50] + ("..." if len(request.message) > 50 else "")
            
            session.add(conversation)
            session.commit()
            
            result.conversation_id = request.conversation_id
    
    return result
