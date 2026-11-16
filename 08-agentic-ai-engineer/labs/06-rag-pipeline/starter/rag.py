"""Lab 06: a complete retrieval-augmented generation (RAG) pipeline you can measure.

Pipeline (like a packet path through a network stack, each layer replaceable):
  documents -> chunk -> index twice (BM25 keywords + vectors) -> retrieve -> fuse (RRF) -> rerank -> grounded answer
and an evaluation harness (recall@k, MRR) so every change is a measured change, not a vibe.
"""
from __future__ import annotations
import json, math, pathlib, re
from collections import Counter
from dataclasses import dataclass, field
from toyembed import embed, tokens

def cosine(a, b):
    return sum(x * y for x, y in zip(a, b))  # toyembed vectors are already unit length

@dataclass
class Chunk:
    id: str
    doc_id: str
    text: str
    meta: dict = field(default_factory=dict)

def chunk_text(text: str, size: int = 40, overlap: int = 10) -> list[str]:
    """Split into windows of `size` words that overlap by `overlap` words, so a fact cut at a boundary
    still appears whole in one chunk."""
    assert 0 <= overlap < size
    # TODO: words = text.split(); step = size - overlap; emit " ".join(words[i:i+size]) for i in range(0, len, step); stop once a window reaches the end
    raise NotImplementedError('TODO: words = text.split(); step = size - overlap; emit " ".join(words[i:i+size]) for i in range(0, len, step); stop once a window reaches the end')

def load_kb(path: pathlib.Path, size: int = 40, overlap: int = 10) -> list[Chunk]:
    chunks = []
    for d in json.loads(path.read_text()):
        for j, t in enumerate(chunk_text(d["title"] + ". " + d["text"], size, overlap)):
            chunks.append(Chunk(f"{d['id']}#{j}", d["id"], t, {"product": d["product"]}))
    return chunks

class BM25:
    """Classic keyword ranking. Rewards rare query words that appear often in a short chunk.
    score = sum over query terms of idf(t) * tf*(k1+1) / (tf + k1*(1 - b + b*len/avg_len))"""
    def __init__(self, chunks: list[Chunk], k1: float = 1.5, b: float = 0.75):
        self.chunks, self.k1, self.b = chunks, k1, b
        self.tfs = [Counter(tokens(c.text)) for c in chunks]
        self.lens = [sum(tf.values()) for tf in self.tfs]
        self.avg = sum(self.lens) / max(1, len(self.lens))
        df = Counter(t for tf in self.tfs for t in tf)
        n = len(chunks)
        self.idf = {t: math.log(1 + (n - d + 0.5) / (d + 0.5)) for t, d in df.items()}

    def search(self, query: str, k: int = 5) -> list[tuple[Chunk, float]]:
        # TODO: score each chunk with the formula above (skip terms not in idf); return top k with score > 0, best first
        raise NotImplementedError('TODO: score each chunk with the formula above (skip terms not in idf); return top k with score > 0, best first')

class VectorIndex:
    def __init__(self, chunks: list[Chunk]):
        self.chunks, self.vecs = chunks, [embed(c.text) for c in chunks]

    def search(self, query: str, k: int = 5, where: dict | None = None) -> list[tuple[Chunk, float]]:
        q = embed(query)
        res = [(c, cosine(q, v)) for c, v in zip(self.chunks, self.vecs)
               if not where or all(c.meta.get(a) == b for a, b in where.items())]
        return sorted(res, key=lambda x: x[1], reverse=True)[:k]

def rrf(rankings: list[list[str]], k: int = 60) -> list[tuple[str, float]]:
    """Reciprocal Rank Fusion: each list votes 1/(k + rank) for each id (rank starts at 1). Uses only positions,
    so BM25 scores and cosine scores never need to be on the same scale."""
    # TODO: accumulate 1/(k+rank) per id across lists; return sorted (id, score) best first
    raise NotImplementedError('TODO: accumulate 1/(k+rank) per id across lists; return sorted (id, score) best first')

class HybridRetriever:
    def __init__(self, chunks: list[Chunk]):
        self.by_id = {c.id: c for c in chunks}
        self.bm25, self.vec = BM25(chunks), VectorIndex(chunks)

    def search(self, query: str, k: int = 5, pool: int = 10) -> list[Chunk]:
        kw = [c.id for c, _ in self.bm25.search(query, pool)]
        ve = [c.id for c, _ in self.vec.search(query, pool)]
        return [self.by_id[i] for i, _ in rrf([kw, ve])[:k]]

def rerank(query: str, chunks: list[Chunk], top_n: int = 3) -> list[Chunk]:
    """Stand-in for a cross-encoder reranker (in production: a model such as Cohere Rerank, Voyage rerank, or an
    open cross-encoder, which reads query and chunk TOGETHER). Here: cosine similarity plus a bonus for exact
    rare-token matches like error codes. The point of the lab is where reranking sits, not this scoring."""
    q_tokens = set(tokens(query)); qv = embed(query)
    def score(c):
        exact = sum(1 for t in q_tokens if t in set(tokens(c.text)) and any(ch.isdigit() for ch in t))
        return cosine(qv, embed(c.text)) + 0.5 * exact + 0.05 * len(q_tokens & set(tokens(c.text)))
    return sorted(chunks, key=score, reverse=True)[:top_n]

# ---------- grounded answering ----------
REFUSAL = "I don't know based on the provided documents."

def build_prompt(query: str, chunks: list[Chunk]) -> list[dict]:
    sources = "\n".join(f"[S{i}] ({c.doc_id}) {c.text}" for i, c in enumerate(chunks, start=1))
    return [{"role": "system", "content": "Answer ONLY from the sources. Cite every claim like [S1]. If the sources "
             f"do not contain the answer, reply exactly: {REFUSAL}"},
            {"role": "user", "content": f"Sources:\n{sources}\n\nQuestion: {query}"}]

def check_citations(answer: str, n_sources: int) -> tuple[list[int], list[int]]:
    """Return (valid_citation_numbers, invalid_citation_numbers) found as [S<n>] in the answer."""
    nums = [int(n) for n in re.findall(r"\[S(\d+)\]", answer)]
    return [n for n in nums if 1 <= n <= n_sources], [n for n in nums if not 1 <= n <= n_sources]

def grounded_answer(llm, query: str, chunks: list[Chunk]) -> dict:
    """Ask the model, then VERIFY: an answer with no citations, or citations to sources that don't exist,
    is replaced by the refusal. Returns {"answer", "sources": [doc_ids actually cited]}."""
    if not chunks:
        return {"answer": REFUSAL, "sources": []}
    text = llm(build_prompt(query, chunks)).text.strip()
    # TODO: if text == REFUSAL return it; valid, invalid = check_citations(...); if invalid or not valid -> refusal; else return answer and the cited doc_ids (deduplicated, in order)
    raise NotImplementedError('TODO: if text == REFUSAL return it; valid, invalid = check_citations(...); if invalid or not valid -> refusal; else return answer and the cited doc_ids (deduplicated, in order)')

# ---------- evaluation ----------
def recall_at_k(ranked_doc_ids: list[str], relevant: list[str], k: int) -> float:
    """Fraction of the relevant docs that appear in the top k."""
    # TODO: len(set(top k) & set(relevant)) / len(relevant)
    raise NotImplementedError('TODO: len(set(top k) & set(relevant)) / len(relevant)')

def mrr(ranked_doc_ids: list[str], relevant: list[str]) -> float:
    """1/rank of the first relevant doc (0 if none). Rewards putting the right doc FIRST."""
    # TODO: return 1/position (1-based) of the first id in relevant, else 0.0
    raise NotImplementedError('TODO: return 1/position (1-based) of the first id in relevant, else 0.0')

def dedup_docs(chunks: list[Chunk]) -> list[str]:
    return list(dict.fromkeys(c.doc_id for c in chunks))

def evaluate(search_fn, gold: list[dict], k: int = 3) -> dict:
    """search_fn(query) -> list[Chunk] ranked. Returns mean recall@k and MRR over the gold set."""
    r = [recall_at_k(dedup_docs(search_fn(g["q"])), g["relevant"], k) for g in gold]
    m = [mrr(dedup_docs(search_fn(g["q"])), g["relevant"]) for g in gold]
    return {"recall@k": sum(r) / len(r), "mrr": sum(m) / len(m), "k": k, "n": len(gold)}
