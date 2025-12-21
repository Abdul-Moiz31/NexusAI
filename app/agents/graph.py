from typing import Annotated, Sequence, TypedDict, Literal
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from app.core.config import settings
from app.agents.tools import web_search, knowledge_base, calculator

# 1. Define State
class AgentState(TypedDict):
    messages: Sequence[BaseMessage]
    next_step: str

# 2. Define Nodes
llm = ChatOpenAI(api_key=settings.OPENAI_API_KEY, model="gpt-4o")

def supervisor_node(state: AgentState):
    """
    The Supervisor decides which agent to call next.
    """
    messages = state["messages"]
    last_message = messages[-1]
    
    system_prompt = (
        "You are a supervisor tasked with managing a conversation between the"
        " following workers: [Researcher, Tutor].\n"
        "Given the following user request, respond with the worker to act next.\n"
        "Each worker will perform a task and respond with their results and status.\n"
        "When finished, respond with FINISH."
    )
    
    # We use function calling to force the LLM to choose a valid next step
    options = ["Researcher", "Tutor", "FINISH"]
    
    # Simple router logic for demonstration (can be more complex with structured output)
    # Here we just ask the LLM to classify the intent
    response = llm.invoke(
        [SystemMessage(content=system_prompt)] + list(messages)
    )
    
    # Basic parsing (in production use structured output)
    content = response.content.lower()
    if "researcher" in content:
        return {"next_step": "Researcher"}
    elif "tutor" in content:
        return {"next_step": "Tutor"}
    else:
        return {"next_step": "FINISH"}

def researcher_node(state: AgentState):
    """
    The Researcher uses web search to find information.
    """
    messages = state["messages"]
    last_message = messages[-1]
    
    # Simple invocation of the tool directly for demo
    # In a real agent, this would be another LLM call that decides to use the tool
    query = last_message.content
    results = web_search.invoke(query)
    
    return {"messages": [HumanMessage(content=f"Research Results: {results}")]}

def tutor_node(state: AgentState):
    """
    The Tutor explains concepts using the knowledge base.
    """
    messages = state["messages"]
    last_message = messages[-1]
    
    # Simulate RAG lookup
    # In reality, this would be an agent loop
    response = "Here is a lesson based on your request..." 
    # For now we just return a placeholder to show the flow
    return {"messages": [HumanMessage(content=f"Tutor: I can help you learn about {last_message.content}.")]}

# 3. Define Graph
workflow = StateGraph(AgentState)

workflow.add_node("Supervisor", supervisor_node)
workflow.add_node("Researcher", researcher_node)
workflow.add_node("Tutor", tutor_node)

workflow.set_entry_point("Supervisor")

workflow.add_conditional_edges(
    "Supervisor",
    lambda x: x["next_step"],
    {
        "Researcher": "Researcher",
        "Tutor": "Tutor",
        "FINISH": END
    }
)

workflow.add_edge("Researcher", "Supervisor")
workflow.add_edge("Tutor", "Supervisor")

graph = workflow.compile()

async def run_graph(message: str):
    inputs = {"messages": [HumanMessage(content=message)]}
    output = await graph.ainvoke(inputs)
    return output["messages"][-1].content
