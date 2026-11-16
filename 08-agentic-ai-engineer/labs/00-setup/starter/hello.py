"""Lab 00: prove your environment works and meet the fake LLM used by every later lab."""
from fakellm import ScriptedLLM, say

def ask(llm, question: str) -> str:
    """Send one user message and return the model's text.
    Python note: a list of dicts is the everyday way to pass 'records' around - think of a vector of small structs."""
    # TODO: build messages=[{"role": "user", "content": question}], call llm(messages), return reply.text
    raise NotImplementedError('TODO: build messages=[{"role": "user", "content": question}], call llm(messages), return reply.text')

if __name__ == "__main__":
    print(ask(ScriptedLLM([say("Hello from a fake model. Swap me for a real one in Lab 03.")]), "Hi?"))
