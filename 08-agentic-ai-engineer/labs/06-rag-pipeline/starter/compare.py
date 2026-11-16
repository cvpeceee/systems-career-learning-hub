"""python compare.py  -> prints recall@3 / MRR for keyword-only, vector-only, hybrid, hybrid+rerank."""
import json, pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "common"))
from rag import load_kb, BM25, VectorIndex, HybridRetriever, rerank, evaluate
chunks = load_kb(HERE.parent / "data" / "kb.json")
gold = json.loads((HERE.parent / "data" / "gold.json").read_text())
bm, vec, hy = BM25(chunks), VectorIndex(chunks), HybridRetriever(chunks)
systems = {
    "keyword (BM25)": lambda q: [c for c, _ in bm.search(q, 10)],
    "vector": lambda q: [c for c, _ in vec.search(q, 10)],
    "hybrid (RRF)": lambda q: hy.search(q, 10),
    "hybrid + rerank": lambda q: rerank(q, hy.search(q, 10), 10),
}
for name, fn in systems.items():
    r = evaluate(fn, gold, k=3)
    print(f"{name:18s} recall@3={r['recall@k']:.2f}  MRR={r['mrr']:.2f}")
