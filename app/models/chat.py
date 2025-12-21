from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# --- Base Models ---
class TimestampModel(SQLModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# --- Chat Models ---
class Conversation(TimestampModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(default="New Conversation")
    
    # Relationship
    messages: List["Message"] = Relationship(back_populates="conversation")

class Message(TimestampModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str # "user", "assistant", "system"
    content: str
    conversation_id: Optional[int] = Field(default=None, foreign_key="conversation.id")
    
    # Relationship
    conversation: Optional[Conversation] = Relationship(back_populates="messages")
