from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List
from datetime import datetime

from app.db.session import get_session
from app.models.chat import (
    Conversation, Message,
    ConversationCreate, ConversationUpdate, ConversationResponse,
    ConversationWithMessages, MessageCreate, MessageResponse
)

router = APIRouter()

# --- Conversation CRUD ---

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    data: ConversationCreate,
    session: Session = Depends(get_session)
):
    """Create a new conversation."""
    conversation = Conversation(
        title=data.title,
        mode=data.mode
    )
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    
    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        mode=conversation.mode,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=0
    )

@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    skip: int = 0,
    limit: int = 50,
    mode: str = None,
    session: Session = Depends(get_session)
):
    """List all conversations with message count."""
    query = select(Conversation)
    
    if mode:
        query = query.where(Conversation.mode == mode)
    
    query = query.order_by(Conversation.updated_at.desc()).offset(skip).limit(limit)
    conversations = session.exec(query).all()
    
    result = []
    for conv in conversations:
        msg_count = session.exec(
            select(func.count(Message.id)).where(Message.conversation_id == conv.id)
        ).one()
        
        result.append(ConversationResponse(
            id=conv.id,
            title=conv.title,
            mode=conv.mode,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=msg_count
        ))
    
    return result

@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(
    conversation_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific conversation with all messages."""
    conversation = session.get(Conversation, conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    ).all()
    
    return ConversationWithMessages(
        id=conversation.id,
        title=conversation.title,
        mode=conversation.mode,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=[MessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            created_at=m.created_at
        ) for m in messages]
    )

@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    data: ConversationUpdate,
    session: Session = Depends(get_session)
):
    """Update conversation title or mode."""
    conversation = session.get(Conversation, conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if data.title is not None:
        conversation.title = data.title
    if data.mode is not None:
        conversation.mode = data.mode
    
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    
    msg_count = session.exec(
        select(func.count(Message.id)).where(Message.conversation_id == conversation.id)
    ).one()
    
    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        mode=conversation.mode,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=msg_count
    )

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    session: Session = Depends(get_session)
):
    """Delete a conversation and all its messages."""
    conversation = session.get(Conversation, conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    session.delete(conversation)
    session.commit()
    
    return {"message": "Conversation deleted successfully"}

# --- Message CRUD ---

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def add_message(
    conversation_id: int,
    data: MessageCreate,
    session: Session = Depends(get_session)
):
    """Add a message to a conversation."""
    conversation = session.get(Conversation, conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    message = Message(
        role=data.role,
        content=data.content,
        conversation_id=conversation_id
    )
    session.add(message)
    
    # Update conversation's updated_at
    conversation.updated_at = datetime.utcnow()
    
    # Auto-generate title from first user message if still default
    if conversation.title == "New Conversation" and data.role == "user":
        # Use first 50 chars of message as title
        conversation.title = data.content[:50] + ("..." if len(data.content) > 50 else "")
    
    session.add(conversation)
    session.commit()
    session.refresh(message)
    
    return MessageResponse(
        id=message.id,
        role=message.role,
        content=message.content,
        created_at=message.created_at
    )

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: int,
    session: Session = Depends(get_session)
):
    """Get all messages in a conversation."""
    conversation = session.get(Conversation, conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    ).all()
    
    return [MessageResponse(
        id=m.id,
        role=m.role,
        content=m.content,
        created_at=m.created_at
    ) for m in messages]

