from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from pydantic import BaseModel

# --- Base Models ---
class TimestampModel(SQLModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# --- Database Models ---
class Conversation(TimestampModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(default="New Conversation")
    mode: str = Field(default="chat")  # chat, agent, graph, rag
    
    # Relationship
    messages: List["Message"] = Relationship(back_populates="conversation", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class Message(TimestampModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str  # "user", "assistant", "system"
    content: str
    conversation_id: Optional[int] = Field(default=None, foreign_key="conversation.id")
    
    # Relationship
    conversation: Optional[Conversation] = Relationship(back_populates="messages")

# --- Pydantic Models for API ---
class MessageCreate(BaseModel):
    role: str
    content: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    title: str = "New Conversation"
    mode: str = "chat"

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    mode: Optional[str] = None

class ConversationResponse(BaseModel):
    id: int
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    
    class Config:
        from_attributes = True

class ConversationWithMessages(BaseModel):
    id: int
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse]
    
    class Config:
        from_attributes = True
