"""Lab 02: embeddings and similarity search, from scratch.

An embedding is a list of numbers that places a piece of text on a 'map of meaning'. Similar meanings sit close.
Cosine similarity measures the angle between two vectors: 1 = same direction, 0 = unrelated.
"""
from __future__ import annotations
import math
from dataclasses import dataclass, field
from typing import Callable

def cosine(a: list[float], b: list[float]) -> float:
    # TODO: dot(a,b) / (|a| * |b|); return 0.0 if either vector has zero length
    raise NotImplementedError('TODO: dot(a,b) / (|a| * |b|); return 0.0 if either vector has zero length')

def top_k(query: list[float], vectors: list[list[float]], k: int) -> list[tuple[int, float]]:
    """Return [(index, score)] of the k most similar vectors, best first. This is 'brute force' / exact search;
    vector databases use approximate indexes (e.g. HNSW) to do the same thing fast over millions of vectors."""
    # TODO: score every vector with cosine, sort descending, return the first k (index, score) pairs
    raise NotImplementedError('TODO: score every vector with cosine, sort descending, return the first k (index, score) pairs')

@dataclass
class Doc:
    id: str
    text: str
    meta: dict = field(default_factory=dict)

class VectorIndex:
    """A minimal in-memory vector store: add documents, search by meaning, optionally filter by metadata
    (like WHERE product = 'dock' in SQL). Filtering BEFORE ranking means you never return off-limits docs."""
    def __init__(self, embed_fn: Callable[[str], list[float]]):
        self.embed_fn, self.docs, self.vecs = embed_fn, [], []

    def add(self, docs: list[Doc]) -> None:
        for d in docs:
            self.docs.append(d); self.vecs.append(self.embed_fn(d.text))

    def search(self, query: str, k: int = 3, where: dict | None = None) -> list[tuple[Doc, float]]:
        # TODO: embed the query; keep only docs whose meta matches every key in `where`; rank with cosine; return top k (Doc, score)
        raise NotImplementedError('TODO: embed the query; keep only docs whose meta matches every key in `where`; rank with cosine; return top k (Doc, score)')
