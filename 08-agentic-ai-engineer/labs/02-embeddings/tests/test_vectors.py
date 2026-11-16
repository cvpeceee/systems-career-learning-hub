import math
from toyembed import embed
from vectors import cosine, top_k, Doc, VectorIndex

def test_cosine_basics():
    assert math.isclose(cosine([1, 0], [1, 0]), 1.0)
    assert math.isclose(cosine([1, 0], [0, 1]), 0.0)
    assert math.isclose(cosine([1, 0], [-1, 0]), -1.0)
    assert math.isclose(cosine([2, 0], [5, 0]), 1.0)  # length doesn't matter, only direction
    assert cosine([0, 0], [1, 1]) == 0.0

def test_top_k_order():
    vs = [[1, 0], [0.7, 0.7], [0, 1]]
    res = top_k([1, 0.1], vs, 2)
    assert [i for i, _ in res] == [0, 1]
    assert res[0][1] >= res[1][1]

def test_paraphrase_is_closer_than_unrelated():
    q = embed("laptop does not detect the dock")
    para = embed("host fails to enumerate the device")
    other = embed("sourdough bread recipe with rye flour")
    assert cosine(q, para) > cosine(q, other) + 0.2

DOCS = [
    Doc("kb1", "Dock is not detected after the host goes to sleep; reconnect or update firmware", {"product": "dock"}),
    Doc("kb2", "Laptop battery stops charging above 80 percent when battery care mode is on", {"product": "laptop"}),
    Doc("kb3", "Monitor shows no signal over DisplayPort until the dock is power-cycled", {"product": "dock"}),
    Doc("kb4", "Signed firmware images are verified by secure boot before the update is applied", {"product": "laptop"}),
]

def test_index_search_finds_meaning():
    idx = VectorIndex(embed); idx.add(DOCS)
    top = idx.search("my computer can't see the dock anymore", k=1)[0][0]
    assert top.id == "kb1"
    assert idx.search("power is not charging", k=1)[0][0].id == "kb2"

def test_metadata_filter_applies_before_ranking():
    idx = VectorIndex(embed); idx.add(DOCS)
    res = idx.search("firmware update", k=4, where={"product": "dock"})
    assert {d.id for d, _ in res} <= {"kb1", "kb3"} and len(res) == 2
