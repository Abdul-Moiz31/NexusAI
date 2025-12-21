from fastapi import APIRouter, UploadFile, File
from app.services.rag_service import ingest_file, query_rag
from app.services.llm_service import llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

@router.post("/rag/ingest")
async def ingest_document(file: UploadFile = File(...)):
    """
    Uploads and ingests a document into the knowledge base.
    """
    num_chunks = await ingest_file(file)
    return {"message": f"Successfully ingested {file.filename}", "chunks": num_chunks}

@router.post("/rag/query")
async def query_document(query: str):
    """
    Ask a question based on the ingested documents.
    """
    # 1. Retrieve context
    docs = await query_rag(query)
    context_text = "\n\n".join([d.page_content for d in docs])
    
    # 2. Generate Answer
    # We use a simple prompt template here
    template = """Answer the question based only on the following context:
    {context}
    
    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)
    
    chain = (
        {"context": lambda x: context_text, "question": lambda x: x}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    response = await chain.ainvoke(query)
    
    return {
        "response": response,
        "sources": [d.metadata.get("source", "unknown") for d in docs]
    }
