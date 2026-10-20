def _ref(n,rows):
    out=[]
    for c in range(n):
        ok=0
        for a in rows:
            for b in rows:
                if a[c]!=b[c] and a[n]!=b[n] and all(a[k]==b[k] for k in range(n) if k!=c): ok=1
        out.append(ok)
    return out
_T=[(3,[[1,1,0,1],[0,1,0,0],[1,0,0,0],[1,0,1,1]]),
    (3,[[1,1,0,1],[0,1,0,0],[1,0,0,0]]),
    (3,[[1,1,1,1],[0,1,1,1],[1,0,1,1],[0,0,0,0]]),
    (2,[[1,1,1],[0,1,0],[1,0,0]]),
    (1,[[0,0]]),(2,[[0,0,0],[1,1,1]])]
M = dict(
 id='p110-mcdc-coverage', num=110, title='MC/DC Coverage Check (Avionics Testing)', lc=[], difficulty='Medium',
 patterns=['Bit Manipulation','Hashing','Pairs'], companies=['Raytheon','Garmin','Wing'],
 course='04 tutorial ch41.2 (DO-178C MC/DC); interview-mastery-courses: none',
 similar=[(1,'Two Sum'),(1239,'Maximum Length of a Concatenated String with Unique Characters')],
 statement='A decision has n boolean conditions. Each test row lists the n condition values (0/1) followed by the decision outcome. For each condition, return 1 if the tests show it <b>independently affects</b> the outcome: two rows that differ only in that condition and have different outcomes (unique-cause MC/DC). Otherwise 0.',
 examples=[dict(i='n=3 (A and B) or C; rows TTF→1, FTF→0, TFF→0, TFT→1',o='[1,1,1]',e='A: TTF/FTF, B: TTF/TFF, C: TFF/TFT')],
 constraints=['1 ≤ n ≤ 20','1 ≤ rows ≤ 10⁴'],
 sig=dict(fn='mcdc',params=[['n','int'],['rows','int[][]']],ret='int[]'),
 tests=[dict(args=[n,r],expect=_ref(n,r)) for n,r in _T], traceCase=0,
 analogy='Proving a light switch matters: hold every other switch still, flip just this one, and watch the bulb change. If you never ran that exact experiment, you have not shown the switch does anything on its own.',
 jargon={'MC/DC':'modified condition/decision coverage, required by DO-178C for the most critical (Level A) avionics software','independence pair':'two tests differing only in one condition, with different outcomes','masking':'another condition hides this one (e.g. C=1 makes (A and B) irrelevant)'},
 brute=dict(idea='Compare every pair of rows for every condition.',time='O(n·R²·n)',space='O(1)',plain='Fine for small suites.'),
 optimal=dict(idea='Encode each row as a bitmask. For condition c, a partner of mask m is m ^ (1<<c); look it up in a hash map of mask → outcome.',time='O(R·n)',space='O(R)',plain='One hash lookup per row per condition.'),
 walkthrough=['TTF=0b011→1, FTF=0b010→0, TFF=0b001→0, TFT=0b101→1 (bit0=A)','A: 011 vs 010 differ only in A, outcomes differ → 1','B: 011 vs 001 → 1','C: 001 vs 101 → 1'],
 hints=['Pack the conditions into a bitmask.','The partner row for condition c is the mask with bit c flipped.','Store mask → outcome in a hash map.'],
 pitfalls=['Accepting pairs where two conditions changed.','Forgetting duplicate rows with the same mask.','Assuming n+1 tests always suffice without checking masking.'],
 followups=['Pick a minimal test set achieving MC/DC.','Masking MC/DC (coupled conditions).','Generate the truth table from an expression parser.'],
 script=['Define MC/DC in one sentence.','Bitmask + hash map.','Masking example.','How this fits DO-178C evidence.'],
 viz=dict(ptr=['c']),
 rubric=['Correct definition','Bitmask partner lookup','Edge cases','Domain context'],
)
