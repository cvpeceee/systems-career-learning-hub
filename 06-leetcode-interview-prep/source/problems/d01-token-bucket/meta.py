def _ref(ops,args):
    out=[];cap=rate=tok=last=0
    for o,a in zip(ops,args):
        if o=='TokenBucket': cap,rate=map(int,a.split(',')); tok=cap*1000; last=0; out.append('null')
        else:
            t=int(a); tok=min(cap*1000,tok+(t-last)*rate); last=t
            if tok>=1000: tok-=1000; out.append('true')
            else: out.append('false')
    return out
_T=[(['TokenBucket']+['allow']*7,['3,1','0','0','0','0','500','1000','3000']),
    (['TokenBucket']+['allow']*6,['2,10','0','0','0','50','100','100']),
    (['TokenBucket']+['allow']*4,['1,1','0','999','1000','1000'])]
M = dict(
 id='d01-token-bucket', num=101, kind='component', title='Token Bucket Rate Limiter (component)', lc=[], difficulty='Medium',
 patterns=['Design','Rate Limiting'], companies=['Microsoft','Google','Anthropic','NVIDIA'],
 course='interview-mastery-courses: Microsoft "System design: rate limiter", Apple "LRU cache, rate limiter"',
 similar=[(359,'Logger Rate Limiter'),(362,'Design Hit Counter')],
 statement='Token bucket with capacity C tokens and refill rate R tokens/second. <code>allow(t_ms)</code> refills lazily based on elapsed time, then spends one token if available. Integer milli-tokens avoid floating-point drift. Ops: <code>TokenBucket "C,R"</code>, <code>allow "t"</code>.',
 examples=[dict(i='C=3,R=1; allow at 0,0,0,0,500,1000,3000',o='[null,true,true,true,false,false,true,true]',e='burst of 3, then 1/sec')],
 constraints=['t is non-decreasing'],
 sig=dict(fn='run',params=[['ops','string[]'],['args','string[]']],ret='string[]'),
 tests=[dict(args=[o,a],expect=_ref(o,a)) for o,a in _T], traceCase=0,
 analogy='A jar that a tap fills with tickets at a steady drip, up to the brim. Each request must take a ticket. Bursts are OK while the jar has tickets; once empty, requests wait for the drip.',
 jargon={'burst':'many requests at once','lazy refill':'compute tokens only when asked, from elapsed time, instead of a timer'},
 brute=dict(idea='Log every request timestamp and count those in the last second.',time='O(requests in window)',space='O(window)',plain='Memory grows with traffic.'),
 optimal=dict(idea='Store tokens and lastTime. On allow(t): tokens = min(C, tokens + (t − last)·R); spend 1 if ≥ 1.',time='O(1)',space='O(1)',plain='Two numbers per client.'),
 walkthrough=['C=3: three instant allows drain the jar.','4th at t=0 → false. t=500 → +0.5 token → still false.','t=1000 → 1 token → true.'],
 hints=['What two numbers summarize the bucket?','Refill from elapsed time, not a background thread.','Use integer milli-tokens to stay exact.'],
 pitfalls=['Floating-point drift.','Clock going backwards (use monotonic clocks).','Per-node buckets in a cluster allow N× the limit.'],
 followups=['Distributed limiter with Redis + Lua or a token server.','Sliding-window log vs counter.','Fairness across tenants.'],
 script=['Algorithm options, pick token bucket.','State = tokens, last.','Lazy refill math.','Distributed concerns.'],
 viz=dict(gauge='tokens',cap='capm',ptr=['t']),
 rubric=['Correct refill','Integer math','Distributed discussion'],
)
