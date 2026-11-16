# Lab 11: Guardrails that hold even when the model is fooled

Course lessons: 26–27. Tests: 8 test functions (some are parametrised) in `tests/`.

## Why this matters
Prompt injection is unsolved at the model level. Interviewers want to hear 'least privilege, enforced in code, with approval for anything destructive', and this lab is that answer in working code.

## Words you'll meet
- **Prompt injection**: think of a malicious command hidden inside a data packet. Precisely: instructions planted in content the agent reads (web pages, emails, tickets).
- **Taint tracking**: think of marking memory written by an untrusted DMA (direct memory access) source. Precisely: once outside content is in the context, block write and destructive actions.
- **Least privilege**: think of an MPU (memory protection unit) region allowing only what a task needs. Precisely: each tool gets a risk level, and the agent gets only the tools the task needs.
- **Redaction**: think of masking serial numbers in a log before you share it. Precisely: replace emails, phone numbers, keys and card numbers before logging or returning text.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `guard.py` → `authorize`: implement the five rules above; include the taint source names in the deny reason
- `guard.py` → `safe_path`: root = Path(base).resolve(); p = (root / user_path).resolve(); if p is not root and root not in p.parents -> PermissionError
- `guard.py` → `redact`: apply each (label, regex) in _PATTERNS in order with regex.sub(f"[{label}]", text)
- `guard.py` → `run_guarded`: if denied -> record {"tool", "reason"} in blocked and append an is_error tool message "BLOCKED: <reason>"; else run tool, record name in executed, and if policy says untrusted_output: mark ctx tainted (add source) and wrap_untrusted the result; always redact() tool output

## Run
```bash
cd labs/11-security-guardrails
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Put `authorize()` in front of the real dispatch in your Lab 05 loop. Use a real approval channel (a Slack button, a ticket, a CLI prompt) for `approver`. Add provider-side moderation or classifier guardrails on top if you like, but never instead of the code checks.

## Stretch
Add per-argument rules (e.g. `delete_logs` only for one device at a time) and an audit log of every decision.
