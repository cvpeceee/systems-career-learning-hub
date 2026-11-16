# Lab 01: What a model does, by hand

Course lessons: 3–4. Tests: 10 test functions (some are parametrised) in `tests/`.

## Why this matters
If you can explain temperature and top-p with code you wrote, interview questions on sampling become easy, and so does debugging an agent that behaves differently on every run.

## Words you'll meet
- **Logit**: think of the raw score on a judge's card before it is turned into a ranking. Precisely: the model's unnormalised score for each possible next token.
- **Softmax**: think of turning vote counts into percentages that add up to 100. Precisely: exp(score) divided by the sum of exp(all scores). Subtract the max first so huge numbers don't overflow.
- **Temperature**: think of a contrast knob: low = only the brightest option shows, high = everything looks similar. Precisely: divide logits by T before softmax. T=0 means always pick the top token (greedy).
- **Top-p (nucleus sampling)**: think of only consider the shortlist that covers p% of the votes. Precisely: keep the most likely tokens until their probabilities add to at least p, renormalise, then sample.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `llm_basics.py` → `softmax`: handle temperature==0 (greedy), else divide logits by T, subtract the max for numerical stability, exponentiate, normalise
- `llm_basics.py` → `top_p`: sort by probability (desc), keep adding until the running total >= p, renormalise the kept ones
- `llm_basics.py` → `sample`: draw r = rng.random() and walk the cumulative distribution
- `llm_basics.py` → `train`: for each line, split into words, add "<s>" at the start and "</s>" at the end, count each (prev, next) pair
- `llm_basics.py` → `generate`: start from "<s>", repeatedly softmax -> top_p -> sample until "</s>" or max_words
- `llm_basics.py` → `cost_usd`: return input_tokens/1e6*price_in + output_tokens/1e6*price_out

## Run
```bash
cd labs/01-llm-basics
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Real APIs expose these as `temperature` and `top_p` parameters. Some newer reasoning models fix or ignore them, so check the provider's docs for the model you use.

## Stretch
Train the bigram model on 200 lines of real logs (any text file) and compare generations at T=0.2, 1.0 and 2.0.
