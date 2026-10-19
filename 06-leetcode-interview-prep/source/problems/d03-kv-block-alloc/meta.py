def _ref(ops,args):
    out=[];free=[];bs=0;tab={};ln={}
    for o,a in zip(ops,args):
        if o=='KVAlloc':
            n,bs=map(int,a.split(',')); free=list(range(n-1,-1,-1)); tab={}; ln={}; out.append('null')
        elif o=='append':
            s,t=map(int,a.split(',')); cur=ln.get(s,0); need=-(-(cur+t)//bs)-len(tab.get(s,[]))
            if need>len(free): out.append('oom'); continue
            for _ in range(need): tab.setdefault(s,[]).append(free.pop())
            tab.setdefault(s,[]); ln[s]=cur+t; out.append('ok:%d'%len(tab[s]))
        elif o=='free':
            s=int(a); b=tab.pop(s,[]); ln.pop(s,None)
            for x in reversed(b): free.append(x)
            out.append(str(len(b)))
        else:
            out.append('|'.join(map(str,tab.get(int(a),[]))))
    return out
_T=[(['KVAlloc','append','append','append','blocks','append','free','append','blocks','blocks'],['4,16','1,20','2,16','1,12','1','2,40','1','2,40','2','1']),
    (['KVAlloc','append','append','append','blocks'],['2,4','7,5','8,1','7,3','7']),
    (['KVAlloc','append','free','append','blocks'],['3,8','1,24','1','5,1','5'])]
M = dict(
 id='d03-kv-block-alloc', num=103, kind='component', title='Paged KV-Cache Block Allocator (component)', lc=[], difficulty='Medium',
 patterns=['Design','Memory Management','Free List'], companies=['NVIDIA','Anthropic','Google','Meta'],
 course='Main tutorial Ch26 (PagedAttention-style KV memory), Skills Academy KV cache sim; Systems & AI Infra "KV-cache management and memory pressure"',
 similar=[],
 statement='GPU memory for the attention KV cache is split into fixed blocks of B tokens. Each sequence keeps a block table. <code>append "seq,t"</code> adds t tokens, allocating only the blocks needed (all-or-nothing; "oom" if not enough free). <code>free "seq"</code> returns its blocks. <code>blocks "seq"</code> prints its table. Free blocks are reused most-recently-freed first.',
 examples=[dict(i='4 blocks × 16 tokens; seq1 +20 → 2 blocks; seq2 +16 → 1; seq1 +12 → still 2 (32 tokens)',o='ok:2, ok:1, ok:2',e='')],
 constraints=['all-or-nothing allocation'],
 sig=dict(fn='run',params=[['ops','string[]'],['args','string[]']],ret='string[]'),
 tests=[dict(args=[o,a],expect=_ref(o,a)) for o,a in _T], traceCase=0,
 analogy='A parking garage with numbered spaces of equal size. A tour bus group (a sequence) gets spaces one at a time as more people arrive — they do not need to be next to each other, because a clipboard (the block table) lists which spaces they own. When the group leaves, the spaces go back on the "free" board.',
 jargon={'KV cache':'stored attention keys/values for tokens already processed, so the model does not recompute them','block table':'per-sequence list of physical block numbers (like a page table)','fragmentation':'free memory split into pieces too small to use'},
 brute=dict(idea='Reserve max_seq_len contiguous memory per request.',time='O(1)',space='huge waste',plain='Most requests are short; reserving the max wastes most of the GPU memory and limits batch size.'),
 optimal=dict(idea='Free list stack of block ids; blocksNeeded = ceil((len + t)/B) − owned; check, then pop.',time='O(blocks allocated)',space='O(total blocks)',plain='No external fragmentation; waste is at most one partial block per sequence.'),
 walkthrough=['free = [0,1,2,3] (pop order).','seq1 +20 → needs 2: blocks 0,1.','seq2 +16 → block 2. seq1 +12 → 32 tokens, still 2 blocks.','seq2 +40 → needs 3 more, only 1 free → oom.','free seq1 → 0,1 back. seq2 +40 → ok.'],
 hints=['How many blocks does a sequence of L tokens need?','Physical blocks need not be contiguous if you keep a table.','Check availability before popping anything (all-or-nothing).'],
 pitfalls=['Partial allocation leaving a sequence half-grown.','Integer ceil: (x + B − 1) / B.','Leaking blocks on cancelled requests.'],
 followups=['Copy-on-write sharing of prefix blocks (beam search, shared system prompts).','Preemption: swap blocks to CPU vs recompute.','Eviction policy when memory is full.'],
 script=['Why contiguous reservation fails.','Paging analogy with OS virtual memory.','Free list + block tables.','Sharing and preemption follow-ups.'],
 viz=dict(blocks='owner',ptr=['seq','t']),
 rubric=['Ceil math','All-or-nothing','Paging analogy','Prefix sharing follow-up'],
)
