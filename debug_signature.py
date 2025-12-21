from langgraph.prebuilt import create_react_agent
import inspect

sig = inspect.signature(create_react_agent)
print("PARAMETERS:", list(sig.parameters.keys()))
