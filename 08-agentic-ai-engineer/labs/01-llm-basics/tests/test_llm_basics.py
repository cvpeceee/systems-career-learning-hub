import math, random
import pytest
from llm_basics import softmax, top_p, sample, BigramModel, estimate_tokens, cost_usd

LOG = {"bug": 2.0, "fix": 1.0, "cat": -1.0}

def test_softmax_sums_to_one_and_keeps_order():
    p = softmax(LOG)
    assert math.isclose(sum(p.values()), 1.0)
    assert p["bug"] > p["fix"] > p["cat"]

def test_low_temperature_sharpens_high_flattens():
    assert softmax(LOG, 0.5)["bug"] > softmax(LOG, 1.0)["bug"] > softmax(LOG, 2.0)["bug"]

def test_temperature_zero_is_greedy():
    assert softmax(LOG, 0) == {"bug": 1.0, "fix": 0.0, "cat": 0.0}

def test_softmax_is_numerically_stable():
    p = softmax({"a": 1000.0, "b": 999.0})
    assert math.isclose(p["a"], 1 / (1 + math.exp(-1)))

def test_top_p_keeps_smallest_nucleus():
    probs = {"a": 0.5, "b": 0.3, "c": 0.15, "d": 0.05}
    kept = top_p(probs, 0.8)
    assert set(kept) == {"a", "b"}
    assert math.isclose(sum(kept.values()), 1.0)
    assert set(top_p(probs, 1.0)) == {"a", "b", "c", "d"}

def test_sampling_matches_distribution_and_is_reproducible():
    probs = {"x": 0.7, "y": 0.3}
    draws = [sample(probs, random.Random(42 + i)) for i in range(2000)]
    assert 0.65 < draws.count("x") / 2000 < 0.75
    assert sample(probs, random.Random(7)) == sample(probs, random.Random(7))

CORPUS = ["the device is not detected", "the device is charging", "the host resets the device"]

def test_bigram_counts_and_frequencies():
    m = BigramModel(); m.train(CORPUS)
    assert m.counts["the"]["device"] == 3
    p = softmax(m.logits("is"))
    assert math.isclose(p["not"], 0.5) and math.isclose(p["charging"], 0.5)

def test_greedy_generation_is_deterministic():
    m = BigramModel(); m.train(CORPUS)
    a = m.generate(random.Random(1), temperature=0)
    b = m.generate(random.Random(99), temperature=0)
    assert a == b and a.startswith("the device")

def test_generation_only_uses_seen_transitions():
    m = BigramModel(); m.train(CORPUS)
    words = ["<s>"] + m.generate(random.Random(3)).split()
    for a, b in zip(words, words[1:]):
        assert m.counts[a][b] > 0

def test_token_estimate_and_cost():
    assert estimate_tokens("") == 0
    assert estimate_tokens("abcd" * 10) == 10
    assert cost_usd(1_000_000, 0, 3.0, 15.0) == pytest.approx(3.0)
    assert cost_usd(2000, 500, 3.0, 15.0) == pytest.approx(0.006 + 0.0075)
