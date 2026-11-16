"""Lab 01: what a language model actually does, built with nothing but the standard library.

A model outputs a score ("logit") per possible next token. Softmax turns scores into probabilities,
temperature reshapes them, top-p trims the unlikely tail, then we draw one token. Repeat = generation.
"""
from __future__ import annotations
import math, random
from collections import Counter, defaultdict

def softmax(logits: dict[str, float], temperature: float = 1.0) -> dict[str, float]:
    """Scores -> probabilities that sum to 1. temperature<1 sharpens, >1 flattens. temperature==0 means greedy:
    all probability on the highest score (ties: first one)."""
    # TODO-START: handle temperature==0 (greedy), else divide logits by T, subtract the max for numerical stability, exponentiate, normalise
    if temperature == 0:
        best = max(logits, key=logits.get)
        return {t: (1.0 if t == best else 0.0) for t in logits}
    scaled = {t: s / temperature for t, s in logits.items()}
    m = max(scaled.values())
    exps = {t: math.exp(s - m) for t, s in scaled.items()}
    z = sum(exps.values())
    return {t: e / z for t, e in exps.items()}
    # TODO-END

def top_p(probs: dict[str, float], p: float) -> dict[str, float]:
    """Keep the smallest set of most-likely tokens whose probabilities add up to at least p, then renormalise."""
    # TODO-START: sort by probability (desc), keep adding until the running total >= p, renormalise the kept ones
    kept, total = {}, 0.0
    for tok, pr in sorted(probs.items(), key=lambda kv: kv[1], reverse=True):
        kept[tok] = pr; total += pr
        if total >= p - 1e-12:
            break
    return {t: pr / total for t, pr in kept.items()}
    # TODO-END

def sample(probs: dict[str, float], rng: random.Random) -> str:
    """Draw one token. Pass a seeded random.Random so tests are reproducible."""
    # TODO-START: draw r = rng.random() and walk the cumulative distribution
    r, acc = rng.random(), 0.0
    last = None
    for tok, pr in probs.items():
        acc += pr; last = tok
        if r < acc:
            return tok
    return last  # guard against float rounding
    # TODO-END

class BigramModel:
    """The tiniest 'language model': counts which word follows which. Real LLMs learn the same kind of
    next-token statistics, but over thousands of tokens of context with billions of parameters."""
    def __init__(self):
        self.counts: dict[str, Counter] = defaultdict(Counter)

    def train(self, lines: list[str]) -> None:
        # TODO-START: for each line, split into words, add "<s>" at the start and "</s>" at the end, count each (prev, next) pair
        for line in lines:
            words = ["<s>"] + line.lower().split() + ["</s>"]
            for a, b in zip(words, words[1:]):
                self.counts[a][b] += 1
        # TODO-END

    def logits(self, prev: str) -> dict[str, float]:
        """Log-counts act as scores, so softmax(logits, 1.0) gives back the raw frequencies."""
        c = self.counts.get(prev.lower())
        if not c:
            return {"</s>": 0.0}
        return {t: math.log(n) for t, n in c.items()}

    def generate(self, rng: random.Random, temperature: float = 1.0, p: float = 1.0, max_words: int = 20) -> str:
        # TODO-START: start from "<s>", repeatedly softmax -> top_p -> sample until "</s>" or max_words
        out, prev = [], "<s>"
        for _ in range(max_words):
            tok = sample(top_p(softmax(self.logits(prev), temperature), p), rng)
            if tok == "</s>":
                break
            out.append(tok); prev = tok
        return " ".join(out)
        # TODO-END

def estimate_tokens(text: str) -> int:
    """Rule of thumb for English: about 4 characters per token. Use the provider's tokenizer for exact counts."""
    return max(1, math.ceil(len(text) / 4)) if text else 0

def cost_usd(input_tokens: int, output_tokens: int, usd_per_m_in: float, usd_per_m_out: float) -> float:
    """Prices are quoted per million tokens, and output usually costs more than input."""
    # TODO-START: return input_tokens/1e6*price_in + output_tokens/1e6*price_out
    return input_tokens / 1_000_000 * usd_per_m_in + output_tokens / 1_000_000 * usd_per_m_out
    # TODO-END
