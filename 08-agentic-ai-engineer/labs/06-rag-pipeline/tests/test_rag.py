import json, pathlib
import pytest
from fakellm import ScriptedLLM, say
from rag import (chunk_text, load_kb, BM25, VectorIndex, HybridRetriever, rrf, rerank, grounded_answer,
                 check_citations, recall_at_k, mrr, evaluate, REFUSAL, Chunk)

DATA = pathlib.Path(__file__).resolve().parents[1] / "data"
import functools
@functools.cache
def chunks():
    return load_kb(DATA / "kb.json")
GOLD = json.loads((DATA / "gold.json").read_text())

def test_chunking_overlaps_and_covers_everything():
    words = [f"w{i}" for i in range(25)]
    parts = chunk_text(" ".join(words), size=10, overlap=3)
    assert parts[0].split() == words[:10]
    assert parts[1].split()[:3] == words[7:10]            # 3-word overlap
    assert parts[-1].split()[-1] == "w24"                  # nothing lost at the end
    assert len(parts) == 4 and chunk_text("", 10, 3) == []

def test_bm25_finds_exact_codes():
    top = BM25(chunks()).search("E-4012", 1)[0][0]
    assert top.doc_id == "KB-102"

def test_vector_finds_paraphrases_bm25_misses():
    q = "accessory keeps restarting itself"
    assert VectorIndex(chunks()).search(q, 1)[0][0].doc_id == "KB-109"

def test_vector_metadata_filter():
    res = VectorIndex(chunks()).search("firmware update", 5, where={"product": "laptop"})
    assert res and all(c.meta["product"] == "laptop" for c, _ in res)

def test_rrf_rewards_agreement():
    fused = dict(rrf([["a", "b", "c"], ["b", "c", "a"]]))
    assert max(fused, key=fused.get) == "b"
    assert rrf([["x"]])[0] == ("x", pytest.approx(1 / 61))

def test_metrics():
    assert recall_at_k(["a", "b", "c"], ["c", "z"], 3) == 0.5
    assert recall_at_k(["a", "b", "c"], ["c"], 2) == 0.0
    assert mrr(["a", "b", "c"], ["b"]) == 0.5 and mrr(["a"], ["q"]) == 0.0

def _systems():
    bm, vec, hy = BM25(chunks()), VectorIndex(chunks()), HybridRetriever(chunks())
    return (lambda q: [c for c, _ in bm.search(q, 10)], lambda q: [c for c, _ in vec.search(q, 10)],
            lambda q: hy.search(q, 10), lambda q: rerank(q, hy.search(q, 10), 10))

def test_hybrid_beats_each_retriever_alone():
    kw, ve, hy, _ = (evaluate(f, GOLD, k=3)["recall@k"] for f in _systems())
    assert hy > kw and hy > ve, (kw, ve, hy)
    assert hy >= 0.9

def test_rerank_does_not_hurt_mrr():
    _, _, hy, rr = (evaluate(f, GOLD, k=3)["mrr"] for f in _systems())
    assert rr >= hy

def test_grounded_answer_with_valid_citation():
    hits = HybridRetriever(chunks()).search("what does E-4012 mean", 3)
    llm = ScriptedLLM([lambda msgs, t: say("It means the update image failed signature verification [S1].")])
    out = grounded_answer(llm, "what does E-4012 mean", hits)
    assert out["sources"] == [hits[0].doc_id] and "[S1]" in out["answer"]
    assert "[S1]" in llm.calls[0]["messages"][1]["content"]   # sources were numbered in the prompt

@pytest.mark.parametrize("model_says", ["It is a cosmic ray.", "See [S9] for details.", REFUSAL])
def test_uncited_or_invented_citations_become_refusal(model_says):
    hits = chunks()[:2]
    out = grounded_answer(ScriptedLLM([say(model_says)]), "q", hits)
    assert out == {"answer": REFUSAL, "sources": []}

def test_no_hits_refuses_without_calling_model():
    llm = ScriptedLLM([])
    assert grounded_answer(llm, "q", [])["answer"] == REFUSAL and llm.calls == []

def test_check_citations():
    assert check_citations("a [S1] b [S3] c [S2]", 2) == ([1, 2], [3])
