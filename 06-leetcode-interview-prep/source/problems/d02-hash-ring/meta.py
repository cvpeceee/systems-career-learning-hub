import bisect
def _fnv(s):
    h=2166136261
    for b in s.encode(): h^=b; h=(h*16777619)&0xffffffff
    return h
def _ref(ops,args):
    out=[];ring={};V=0
    for o,a in zip(ops,args):
        if o=='HashRing': V=int(a); ring={}; out.append('null')
        elif o=='add':
            for i in range(V): ring[_fnv('n%s#%d'%(a,i))]=int(a)
            out.append('null')
        elif o=='remove':
            ring={h:n for h,n in ring.items() if n!=int(a)}; out.append('null')
        else:
            if not ring: out.append('-1'); continue
            ks=sorted(ring); h=_fnv('k'+a); i=bisect.bisect_left(ks,h)
            out.append(str(ring[ks[i%len(ks)]]))
    return out
_g=['get']*8; _k=[str(x) for x in (1,2,3,42,77,100,512,9999)]
_T=[(['HashRing','add','add','add']+_g+['remove']+_g, ['8','1','2','3']+_k+['2']+_k),
    (['HashRing','get','add']+_g, ['4','5','7']+_k),
    (['HashRing','add','add','add','add']+_g+['add']+_g, ['16','10','20','30','40']+_k+['50']+_k)]
M = dict(
 id='d02-hash-ring', num=102, kind='component', title='Consistent Hash Ring with Virtual Nodes (component)', lc=[], difficulty='Medium',
 patterns=['Design','Hashing','Binary Search'], companies=['Google','Anthropic','NVIDIA','Meta'],
 course='Main tutorial: distributed systems / KV store chapters, Ch27 storage service design; Storage course "Distributed Storage"',
 similar=[],
 statement='A consistent hash ring: each server gets V virtual points at FNV-1a("n&lt;id&gt;#&lt;i&gt;"). A key maps to the first point clockwise from FNV-1a("k&lt;key&gt;"). Ops: <code>HashRing "V"</code>, <code>add "id"</code>, <code>remove "id"</code>, <code>get "key"</code> (server id or −1).',
 examples=[dict(i='V=8; add 1,2,3; get keys; remove 2; get again',o='only keys that were on server 2 move',e='')],
 constraints=['FNV-1a 32-bit, identical in all three languages'],
 sig=dict(fn='run',params=[['ops','string[]'],['args','string[]']],ret='string[]'),
 tests=[dict(args=[o,a],expect=_ref(o,a)) for o,a in _T], traceCase=1,
 analogy='Seats around a round table, and every guest (server) holds several name cards scattered around it (virtual nodes). A dish (key) is placed at a spot and slides clockwise to the next name card. If a guest leaves, only the dishes that were sliding to THEIR cards move — to the next guest — instead of reshuffling the whole table like hash % N would.',
 jargon={'consistent hashing':'mapping keys to servers so that adding/removing one server only moves ~1/N of keys','virtual node':'one server appearing at many ring positions to even out load','FNV-1a':'a simple, fast, non-cryptographic hash'},
 brute=dict(idea='server = hash(key) % N.',time='O(1)',space='O(1)',plain='Changing N remaps almost every key — a cache stampede.'),
 optimal=dict(idea='Sorted map hash → server. get = lower_bound(hash(key)), wrap to begin.',time='get O(log(N·V)), add/remove O(V log(N·V))',space='O(N·V)',plain='Binary search over the ring points.'),
 walkthrough=['Ring holds 8 points per server, sorted.','get(k): hash, binary-search the next point clockwise.','remove 2: delete its 8 points; its keys fall to the next point.'],
 hints=['Why is % N bad when N changes?','Put servers and keys on the same circle.','Virtual nodes smooth out uneven gaps.'],
 pitfalls=['Not wrapping around at the end of the ring.','Too few vnodes → hot spots.','Hash differences across languages (signedness!) — this course uses identical unsigned 32-bit FNV-1a.'],
 followups=['Rendezvous (HRW) hashing.','Replication: walk clockwise for R distinct servers.','Bounded-load consistent hashing.'],
 script=['Problem with modulo.','Ring + binary search.','Vnodes for balance.','Replication and rebalancing.'],
 viz=dict(ringmap='ring',ptr=['key','h']),
 rubric=['Explains minimal movement','Wraparound','Vnodes','Replication follow-up'],
)
