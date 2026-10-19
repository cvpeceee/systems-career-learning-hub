def _ref(ops,args):
    out=[];W=0;hits=[]
    for o,a in zip(ops,args):
        if o=='HitCounter': W=int(a); hits=[]; out.append('null')
        elif o=='hit': hits.append(int(a)); out.append('null')
        else: t=int(a); out.append(str(sum(1 for h in hits if t-W<h<=t)))
    return out
_T=[(['HitCounter','hit','hit','hit','getHits','hit','getHits','getHits'],['300','1','2','3','4','300','300','301']),
    (['HitCounter','hit','hit','hit','getHits','getHits','hit','getHits'],['5','1','1','2','5','6','10','12']),
    (['HitCounter','getHits','hit','getHits','getHits'],['3','1','100','100','103'])]
M = dict(
 id='d04-hit-counter', num=104, kind='component', title='Windowed Hit Counter for Telemetry (component)', lc=[(362,'Design Hit Counter')], difficulty='Medium',
 patterns=['Design','Queue','Ring Buffer'], companies=['Tesla','NVIDIA','Qualcomm','Microsoft'],
 course='Main tutorial: telemetry / observability chapters; Storage course "Design monitoring and alerting for a large storage cluster"',
 similar=[(362,'Design Hit Counter'),(346,'Moving Average from Data Stream'),(933,'Number of Recent Calls')],
 statement='Count events in the last W seconds: <code>hit "t"</code>, <code>getHits "t"</code> returns hits with t−W &lt; time ≤ t. Uses a fixed ring of W buckets — O(W) memory no matter the traffic. Times are non-decreasing.',
 examples=[dict(i='W=300; hit 1,2,3; getHits 4 → 3; hit 300; getHits 300 → 4; getHits 301 → 3',o='',e='')],
 constraints=['t non-decreasing','many hits per second allowed'],
 sig=dict(fn='run',params=[['ops','string[]'],['args','string[]']],ret='string[]'),
 tests=[dict(args=[o,a],expect=_ref(o,a)) for o,a in _T], traceCase=1,
 analogy='A wall of W mailboxes, one per second, reused in a circle. Each box has a date sticker. When a letter for second t arrives, go to box t % W: if its sticker is old, empty it and restick it with t. To count recent mail, add up boxes whose sticker is still inside the window.',
 jargon={'bucket':'a slot that aggregates all events of one second','sliding window':'the most recent W seconds'},
 brute=dict(idea='Keep a queue of every timestamp; pop old ones on query.',time='amortized O(1)',space='O(hits in window)',plain='Memory grows with traffic — dangerous for a telemetry agent on a robot or car.'),
 optimal=dict(idea='times[W], counts[W]. hit: i=t%W; if times[i]≠t reset; counts[i]++. getHits: sum counts[i] where t−times[i] < W.',time='hit O(1), getHits O(W)',space='O(W)',plain='Memory is fixed by the window, not by traffic.'),
 walkthrough=['W=5: hit 1,1,2 → box1=2, box2=1.','getHits 5 → window (0,5] → 3.','getHits 6 → window (1,6] → box1 expired → 1.'],
 hints=['Do you need each hit, or just counts per second?','Fixed number of buckets + modulo.','Each bucket remembers which second it represents.'],
 pitfalls=['Forgetting to reset a reused bucket.','Window boundary off-by-one (strict vs inclusive).','Concurrency: atomics per bucket.'],
 followups=['Percentiles instead of counts (HDR histogram / t-digest per bucket).','Multi-node aggregation.','Out-of-order timestamps.'],
 script=['Clarify granularity/window.','Queue baseline.','Bucket ring for bounded memory.','Concurrency & percentiles.'],
 viz=dict(ring='counts',aux='times',ptr=['t','i']),
 rubric=['Bounded memory','Reset logic','Boundary correctness'],
)
