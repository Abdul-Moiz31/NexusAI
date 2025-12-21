from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlmodel import Session
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage

from app.agents.simple_agent import run_agent
from app.models.chat import Conversation, Message
from app.db.session import get_session

router = APIRouter()

class AgentRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []
    conversation_id: Optional[int] = None

class AgentResponse(BaseModel):
    response: str
    conversation_id: Optional[int] = None

@router.post("/agent/chat", response_model=AgentResponse)
async def agent_chat(
    request: AgentRequest,
    session: Session = Depends(get_session)
):
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
    
    result = AgentResponse(response=response)
    
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
