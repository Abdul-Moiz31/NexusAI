from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from typing import Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

# Initialize the ChatOpenAI model
# We use streaming=True to enable streaming responses
llm = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY,
    model="gpt-4o", # Or gpt-3.5-turbo
    temperature=0.7,
    streaming=True
)

async def get_chat_response(message: str, system_prompt: str = "You are a helpful AI assistant. Always use Markdown to format your responses. Use bullet points, bold text, and headers to make the content easy to read."):
    """
    Simple function to get a response from the LLM.
    Demonstrates basic Prompt Engineering by combining System and User messages.
    """
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=message)
    ]
    
    # Invoke the LLM
    response = await llm.ainvoke(messages)
    return response.content

async def stream_chat_response(message: str, system_prompt: str = "You are a helpful AI assistant. Always use Markdown to format your responses. Use bullet points, bold text, and headers to make the content easy to read."):
    """
    Generator function to stream the response from the LLM.
    Crucial for good UX in chat applications.
    """
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=message)
    ]
    
    async for chunk in llm.astream(messages):
        yield chunk.content

async def get_structured_response(message: str, model_class: Type[T], system_prompt: str = "You are a helpful tutor.") -> T:
    """
    Uses OpenAI's Function Calling / Structured Output capability to return a Pydantic object.
    This is extremely powerful for building reliable systems.
    """
    structured_llm = llm.with_structured_output(model_class)
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=message)
    ]
    
    response = await structured_llm.ainvoke(messages)
    return response
