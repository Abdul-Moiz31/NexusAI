from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.llm_service import get_chat_response, stream_chat_response, get_structured_response
from app.models.structured import TutoringPlan

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    system_prompt: str = "You are a helpful AI assistant."

@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Basic chat endpoint. Waits for the full response.
    """
    response = await get_chat_response(request.message, request.system_prompt)
    return {"response": response}

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint. Returns a stream of characters.
    """
    return StreamingResponse(
        stream_chat_response(request.message, request.system_prompt),
        media_type="text/event-stream"
    )

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
