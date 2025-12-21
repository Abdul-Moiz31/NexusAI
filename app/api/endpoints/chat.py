from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Session
from datetime import datetime

from app.services.llm_service import get_chat_response, stream_chat_response, get_structured_response
from app.models.structured import TutoringPlan
from app.models.chat import Conversation, Message, MessageResponse
from app.db.session import get_session

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    system_prompt: str = "You are a helpful AI assistant. Always use Markdown to format your responses."
    conversation_id: Optional[int] = None  # If provided, saves to this conversation

class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[int] = None
    message_id: Optional[int] = None

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    session: Session = Depends(get_session)
):
    """
    Basic chat endpoint. Waits for the full response.
    Optionally saves to a conversation if conversation_id is provided.
    """
    response = await get_chat_response(request.message, request.system_prompt)
    
    result = ChatResponse(response=response)
    
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
            session.refresh(assistant_msg)
            
            result.conversation_id = request.conversation_id
            result.message_id = assistant_msg.id
    
    return result

@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    session: Session = Depends(get_session)
):
    """
    Streaming chat endpoint. Returns a stream of characters.
    Note: For streaming, we save messages after the stream completes via a separate endpoint.
    """
    return StreamingResponse(
        stream_chat_response(request.message, request.system_prompt),
        media_type="text/event-stream"
    )

class SaveStreamedMessage(BaseModel):
    conversation_id: int
    user_message: str
    assistant_message: str

@router.post("/chat/save-streamed")
async def save_streamed_message(
    data: SaveStreamedMessage,
    session: Session = Depends(get_session)
):
    """
    Save messages after streaming completes.
    Called by frontend after stream finishes.
    """
    conversation = session.get(Conversation, data.conversation_id)
    if not conversation:
        return {"error": "Conversation not found"}
    
    # Save user message
    user_msg = Message(
        role="user",
        content=data.user_message,
        conversation_id=data.conversation_id
    )
    session.add(user_msg)
    
    # Save assistant message
    assistant_msg = Message(
        role="assistant",
        content=data.assistant_message,
        conversation_id=data.conversation_id
    )
    session.add(assistant_msg)
    
    # Update conversation
    conversation.updated_at = datetime.utcnow()
    if conversation.title == "New Conversation":
        conversation.title = data.user_message[:50] + ("..." if len(data.user_message) > 50 else "")
    
    session.add(conversation)
    session.commit()
    session.refresh(assistant_msg)
    
    return {
        "success": True,
        "conversation_id": data.conversation_id,
        "message_id": assistant_msg.id,
        "title": conversation.title
    }

@router.post("/chat/structured", response_model=TutoringPlan)
async def chat_structured(request: ChatRequest):
    """
    Generates a structured tutoring plan for a given topic.
    """
    return await get_structured_response(
        request.message, 
        TutoringPlan, 
        system_prompt="You are an expert curriculum designer."
    )
