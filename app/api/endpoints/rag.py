from fastapi import APIRouter, UploadFile, File, Depends
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Session
from datetime import datetime

from app.services.rag_service import ingest_file, query_rag
from app.services.llm_service import llm
from app.models.chat import Conversation, Message
from app.db.session import get_session
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

class RAGQueryRequest(BaseModel):
    query: str
    conversation_id: Optional[int] = None

class RAGResponse(BaseModel):
    response: str
    sources: list
    conversation_id: Optional[int] = None

@router.post("/rag/ingest")
async def ingest_document(file: UploadFile = File(...)):
    """
    Uploads and ingests a document into the knowledge base.
    """
    num_chunks = await ingest_file(file)
    return {"message": f"Successfully ingested {file.filename}", "chunks": num_chunks}

@router.post("/rag/query", response_model=RAGResponse)
async def query_document(
    request: RAGQueryRequest = None,
    query: str = None,
    session: Session = Depends(get_session)
):
    """
    Ask a question based on the ingested documents.
    Supports both query parameter and request body.
    """
    # Handle both query param and request body
    actual_query = query if query else (request.query if request else None)
    conversation_id = request.conversation_id if request else None
    
    if not actual_query:
        return RAGResponse(response="No query provided", sources=[])
    
    # 1. Retrieve context
    docs = await query_rag(actual_query)
    context_text = "\n\n".join([d.page_content for d in docs])
    
    # 2. Generate Answer
    template = """Answer the question based only on the following context:
    {context}
    
    Question: {question}
    
    If you cannot find the answer in the context, say so clearly.
    Always format your response using Markdown for readability.
    """
    prompt = ChatPromptTemplate.from_template(template)
    
    chain = (
        {"context": lambda x: context_text, "question": lambda x: x}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    response = await chain.ainvoke(actual_query)
    sources = [d.metadata.get("source", "unknown") for d in docs]
    
    result = RAGResponse(response=response, sources=sources)
    
    # Save to database if conversation_id provided
    if conversation_id:
        conversation = session.get(Conversation, conversation_id)
        if conversation:
            # Save user message
            user_msg = Message(
                role="user",
                content=actual_query,
                conversation_id=conversation_id
            )
            session.add(user_msg)
            
            # Save assistant message with sources
            full_response = response + f"\n\n📎 **Sources:** {', '.join(sources)}"
            assistant_msg = Message(
                role="assistant",
                content=full_response,
                conversation_id=conversation_id
            )
            session.add(assistant_msg)
            
            # Update conversation
            conversation.updated_at = datetime.utcnow()
            if conversation.title == "New Conversation":
                conversation.title = actual_query[:50] + ("..." if len(actual_query) > 50 else "")
            
            session.add(conversation)
            session.commit()
            
            result.conversation_id = conversation_id
    
    return result
