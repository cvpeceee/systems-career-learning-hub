# Lab 06: A measured RAG pipeline

Course lessons: 14–16. Tests: 12 test functions (some are parametrised) in `tests/`.

## Why this matters
RAG is the most common production pattern in the job postings. Being able to say 'hybrid raised recall@3 from 0.75 to 1.00 on our golden set' is what separates engineers from demo builders.

## Words you'll meet
- **Chunk**: think of a page torn out of a manual so it fits in an envelope. Precisely: a short passage indexed and retrieved on its own; overlap keeps facts from being cut in half.
- **BM25**: think of a librarian matching exact words, giving extra weight to rare ones. Precisely: the classic keyword ranking formula; great for codes like E-4012.
- **RRF (reciprocal rank fusion)**: think of merging two league tables by position, not by points. Precisely: score = Σ 1/(60 + rank) across rankers; needs no score normalisation.
- **Reranker**: think of a second, slower, more careful reviewer for the shortlist. Precisely: a model that reads query and passage together and reorders the top candidates.
- **Grounding / citation check**: think of a datasheet reference for every claim. Precisely: the answer must cite sources that exist; otherwise it is replaced with 'I don't know'.
- **recall@k / MRR**: think of did the right page make the shortlist? / how near the top was it?. Precisely: fraction of relevant docs in the top k / mean of 1 ÷ (rank of first relevant doc).

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `rag.py` → `chunk_text`: words = text.split(); step = size - overlap; emit " ".join(words[i:i+size]) for i in range(0, len, step); stop once a window reaches the end
- `rag.py` → `search`: score each chunk with the formula above (skip terms not in idf); return top k with score > 0, best first
- `rag.py` → `rrf`: accumulate 1/(k+rank) per id across lists; return sorted (id, score) best first
- `rag.py` → `grounded_answer`: if text == REFUSAL return it; valid, invalid = check_citations(...); if invalid or not valid -> refusal; else return answer and the cited doc_ids (deduplicated, in order)
- `rag.py` → `recall_at_k`: len(set(top k) & set(relevant)) / len(relevant)
- `rag.py` → `mrr`: return 1/position (1-based) of the first id in relevant, else 0.0

## Run
```bash
cd labs/06-rag-pipeline
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Run `python solution/compare.py` to see this table on the provided data:

```
keyword (BM25)     recall@3=0.75  MRR=0.77
vector             recall@3=0.75  MRR=0.77
hybrid (RRF)       recall@3=1.00  MRR=0.94
hybrid + rerank    recall@3=1.00  MRR=1.00
```
These numbers come from a 12-document toy corpus and a toy embedder, so they show the *mechanism*, not real-world gains.
For real use, swap `toyembed.embed` for a real embedding model (see Lab 02), pass `llm=lambda m, t=None: call_model(m, backend=..., model=...)`
to `grounded_answer`, and grow `gold.json` from real user questions.

## Stretch
Add a query-rewriting step (the model turns a chatty question into a search query) and measure whether it helps.
