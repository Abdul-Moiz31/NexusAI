from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.agents.tools import tools

# Initialize LLM
llm = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY,
    model="gpt-4o",
    temperature=0
)

# Create the Agent using LangGraph
# This replaces the legacy AgentExecutor
system_message = "You are a helpful assistant called Nexus. You have access to tools. Use them when needed. Always use Markdown to format your responses. Use bullet points, bold text, and headers to make the output structured and easy to read."
agent_executor = create_react_agent(llm, tools, prompt=system_message)

async def run_agent(message: str, chat_history: list = []):
    """
    Runs the agent with the given message and history.
    """
    # LangGraph expects a list of messages
    messages = chat_history + [HumanMessage(content=message)]
    
    # Run the graph
    response = await agent_executor.ainvoke({"messages": messages})
    
    # Extract the last message content
    return response["messages"][-1].content
