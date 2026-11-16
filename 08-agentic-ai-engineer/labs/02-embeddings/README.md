# Lab 02: Embeddings and similarity search

Course lessons: 5. Tests: 5 test functions (some are parametrised) in `tests/`.

## Why this matters
Semantic search, RAG and memory all sit on one operation: find the vectors closest to this one.

## Words you'll meet
- **Embedding**: think of GPS coordinates on a map of meaning. Precisely: a fixed-length list of floats; texts with similar meaning get nearby vectors.
- **Cosine similarity**: think of do two arrows point the same way, ignoring their length?. Precisely: dot(a,b) / (|a|·|b|): 1 = same direction, 0 = unrelated.
- **Metadata filter**: think of a WHERE clause on the search. Precisely: only rank documents whose fields match, e.g. product = 'dock'.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `vectors.py` → `cosine`: dot(a,b) / (|a| * |b|); return 0.0 if either vector has zero length
- `vectors.py` → `top_k`: score every vector with cosine, sort descending, return the first k (index, score) pairs
- `vectors.py` → `search`: embed the query; keep only docs whose meta matches every key in `where`; rank with cosine; return top k (Doc, score)

## Run
```bash
cd labs/02-embeddings
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
The toy embedder (`common/toyembed.py`) matches paraphrases only through a small synonym table. To use a real model,
replace the embed function you pass to `VectorIndex`:

```python
from openai import OpenAI
client = OpenAI()
def embed(text: str) -> list[float]:
    return client.embeddings.create(model="text-embedding-3-small", input=text).data[0].embedding
idx = VectorIndex(embed)
```
Batch many texts per request in real use, since `input` accepts a list.

## Stretch
Add an `upsert` (replace by id) and a `delete`. Real vector stores need both to stay in sync with source documents.
