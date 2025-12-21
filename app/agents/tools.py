from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults
from app.core.config import settings

# 1. Calculator Tool
@tool
def calculator(operation: str) -> str:
    """
    Perform basic arithmetic operations. 
    Input should be a math expression string like "2 + 2" or "10 * 5".
    """
    try:
        return str(eval(operation))
    except Exception as e:
        return f"Error: {str(e)}"

# 2. Web Search Tool
# We use Tavily if key is present and not a placeholder, otherwise a mock
tavily_key = settings.TAVILY_API_KEY
use_tavily = tavily_key and not tavily_key.startswith("tvly-placeholder")

if use_tavily:
    # Explicitly pass the key to avoid validation errors
    web_search = TavilySearchResults(max_results=2, tavily_api_key=tavily_key)
else:
    @tool
    def web_search(query: str) -> str:
        """
        Mock web search tool when no API key is provided.
        """
        return f"Mock search results for: {query}. (Please add a valid TAVILY_API_KEY to .env for real results)"

# 3. RAG Tool (Wrapping our RAG service)
from app.services.rag_service import query_rag

@tool
async def knowledge_base(query: str) -> str:
    """
    Search the internal knowledge base (uploaded documents) for information.
    Use this when the user asks about specific documents or internal data.
    """
    docs = await query_rag(query)
    return "\n\n".join([d.page_content for d in docs])

tools = [calculator, web_search, knowledge_base]
