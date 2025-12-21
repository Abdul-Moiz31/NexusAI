from fastapi import APIRouter
from app.api.endpoints import chat, rag, agent, graph

api_router = APIRouter()
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(rag.router, tags=["rag"])
api_router.include_router(agent.router, tags=["agent"])
api_router.include_router(graph.router, tags=["graph"])



