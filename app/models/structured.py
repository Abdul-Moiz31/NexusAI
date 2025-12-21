from pydantic import BaseModel, Field
from typing import List

class Concept(BaseModel):
    name: str = Field(description="Name of the concept")
    description: str = Field(description="Brief explanation of the concept")
    importance: int = Field(description="Importance score from 1-10")

class TutoringPlan(BaseModel):
    topic: str = Field(description="The main topic being taught")
    concepts: List[Concept] = Field(description="List of key concepts to cover")
    practice_question: str = Field(description="A practice question for the student")
