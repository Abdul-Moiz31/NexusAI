import shutil
import os
from typing import List
from fastapi import UploadFile
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from app.core.config import settings

# Setup Vector Store
# We persist data to ./data/chroma_db
PERSIST_DIRECTORY = "./data/chroma_db"

embeddings = OpenAIEmbeddings(
    api_key=settings.OPENAI_API_KEY,
    model="text-embedding-3-small"
)

vector_store = Chroma(
    collection_name="nexus_knowledge",
    embedding_function=embeddings,
    persist_directory=PERSIST_DIRECTORY
)

async def ingest_file(file: UploadFile):
    """
    Ingests a file into the vector database.
    1. Save temp file
    2. Load content
    3. Split into chunks
    4. Embed and store
    """
    # 1. Save temp file
    temp_path = f"data/{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. Load content (Simple loader for now, can be expanded)
    if file.filename.endswith(".pdf"):
        loader = PyPDFLoader(temp_path)
    else:
        loader = TextLoader(temp_path)
        
    docs = loader.load()
    
    # 3. Split into chunks
    # Chunking is CRITICAL for RAG. It determines the context window usage.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(docs)
    
    # 4. Embed and store
    vector_store.add_documents(documents=splits)
    
    # Cleanup
    os.remove(temp_path)
    return len(splits)

async def query_rag(query: str, k: int = 4) -> List[Document]:
    """
    Retrieves relevant documents for a query.
    """
    # Similarity search finds the most semantically similar chunks
    results = vector_store.similarity_search(query, k=k)
    return results
