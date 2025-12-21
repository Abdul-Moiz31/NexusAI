try:
    from langchain_tavily import TavilySearchResults
    print("SUCCESS: from langchain_tavily import TavilySearchResults")
except ImportError as e:
    print(f"FAILED: from langchain_tavily import TavilySearchResults ({e})")

try:
    from langchain_tavily import TavilySearch
    print("SUCCESS: from langchain_tavily import TavilySearch")
except ImportError as e:
    print(f"FAILED: from langchain_tavily import TavilySearch ({e})")

import langchain_tavily
print(f"Dir: {dir(langchain_tavily)}")
