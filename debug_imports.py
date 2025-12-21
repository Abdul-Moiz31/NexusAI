import sys
try:
    from langchain.agents import AgentExecutor
    print("SUCCESS: from langchain.agents import AgentExecutor")
except ImportError as e:
    print(f"FAILED: from langchain.agents import AgentExecutor ({e})")

try:
    from langchain.agents.agent import AgentExecutor
    print("SUCCESS: from langchain.agents.agent import AgentExecutor")
except ImportError as e:
    print(f"FAILED: from langchain.agents.agent import AgentExecutor ({e})")

try:
    from langchain.agents import create_openai_tools_agent
    print("SUCCESS: from langchain.agents import create_openai_tools_agent")
except ImportError as e:
    print(f"FAILED: from langchain.agents import create_openai_tools_agent ({e})")

import langchain
print(f"LangChain Version: {langchain.__version__}")
