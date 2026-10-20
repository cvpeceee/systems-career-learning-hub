def _ref(rs):
    xs=sorted({x for r in rs for x in (r[0],r[2])}); a=0
    for i in range(len(xs)-1):
        x0,x1=xs[i],xs[i+1]; iv=sorted((r[1],r[3]) for r in rs if r[0]<=x0 and r[2]>=x1); cov=0; cur=None
        for s,e in iv:
            if cur is None or s>cur[1]:
                if cur: cov+=cur[1]-cur[0]
                cur=[s,e]
            else: cur[1]=max(cur[1],e)
        if cur: cov+=cur[1]-cur[0]
        a+=cov*(x1-x0)
    return a%(10**9+7)
_T=[[[0,0,2,2],[1,0,2,3],[1,0,3,1]],[[0,0,1000000000,1000000000]],[[0,0,1,1],[2,2,3,3]],[[0,0,3,3],[1,1,2,2]],[[0,0,2,2],[2,0,4,2],[1,1,3,3]],[[0,0,1,1]]]
M = dict(
 id='p108-rectangle-area-ii', num=108, title='Rectangle Area II (Chip-Layout Coverage)', lc=[(850,'Rectangle Area II')], difficulty='Hard',
 patterns=['Sweep Line','Coordinate Compression','Intervals'], companies=['NVIDIA','Google'],
 course='04 tutorial ch37.3 (tiled halo run of the same algorithm); interview-mastery-courses: none',
 similar=[(223,'Rectangle Area'),(56,'Merge Intervals'),(218,'The Skyline Problem')],
 statement='Given axis-aligned rectangles [x1,y1,x2,y2], return the total area they cover (overlaps counted once), modulo 10⁹+7.<br><i>Systems flavor:</i> how much silicon do these layout shapes cover? This is the core of a design-rule or density check, and the reason EDA tools split layouts into tiles.',
 examples=[dict(i='[[0,0,2,2],[1,0,2,3],[1,0,3,1]]',o='6',e='overlaps are counted once')],
 constraints=['1 ≤ n ≤ 200','0 ≤ coordinates ≤ 10⁹','use 64-bit math before the modulo'],
 sig=dict(fn='rectangleArea',params=[['rects','int[][]']],ret='int'),
 tests=[dict(args=[r],expect=_ref(r)) for r in _T], traceCase=0,
 analogy='Slice a cake into vertical strips at every rectangle edge. Inside one strip nothing starts or stops, so the covered height is the same all the way across: merge the y-ranges of the rectangles spanning that strip, multiply by the strip width, add up the strips.',
 jargon={'sweep line':'move an imaginary line across the plane, handling events where something changes','coordinate compression':'only the distinct edge coordinates matter, so work with those instead of every unit','strip':'the slab between two neighbouring x edges'},
 brute=dict(idea='Mark every unit cell covered.',time='O(area)',space='O(area)',plain='Impossible for coordinates up to 10⁹.'),
 optimal=dict(idea='Sort distinct x edges. For each strip, collect y-intervals of rectangles spanning it, merge them, add merged length × width.',time='O(n² log n)',space='O(n)',plain='n ≤ 200 makes this easily fast; a segment tree gives O(n log n).'),
 walkthrough=['x edges: 0,1,2,3','strip [0,1): rect A covers y 0..2 → 2×1','strip [1,2): A, B, C → merged 0..3 → 3×1','strip [2,3): C covers 0..1 → 1×1 → total 6'],
 hints=['Only edge coordinates matter.','Inside one x strip the covered height is constant.','Merge the y intervals per strip.'],
 pitfalls=['32-bit overflow: 10⁹ × 10⁹ needs 64-bit.','Applying the modulo before multiplying.','Counting touching intervals as a gap or double-counting overlaps.'],
 followups=['Segment tree with cover counts for O(n log n).','Split the plane into tiles for a cluster: each tile clips rectangles to its window, sums are exact without double counting (04 ch37.3).','Report area per layer or per net.'],
 script=['Clarify half-open edges and modulo.','Strip sweep idea.','Merge intervals per strip.','Complexity and the segment-tree follow-up.'],
 viz=dict(intervals='rects',ptr=['i']),
 rubric=['Strip decomposition','Correct merge','64-bit math','Scaling follow-up'],
)
