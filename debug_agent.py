from langgraph.prebuilt import create_react_agent
import inspect

print("SIGNATURE:")
print(inspect.signature(create_react_agent))

print("\nDOCSTRING:")
print(create_react_agent.__doc__)
