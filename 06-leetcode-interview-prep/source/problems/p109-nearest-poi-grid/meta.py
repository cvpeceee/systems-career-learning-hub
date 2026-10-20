import random
def _ref(p,q,c):
    out=[]
    for x,y in q:
        best=None;bi=-1
        for i,(a,b) in enumerate(p):
            d=(a-x)**2+(b-y)**2
            if best is None or d<best: best=d;bi=i
        out.append(bi)
    return out
_r=random.Random(20)
_P=[[_r.randint(-5000,5000),_r.randint(-5000,5000)] for _ in range(60)]
_Q=[[_r.randint(-7000,7000),_r.randint(-7000,7000)] for _ in range(40)]
_T=[([[0,0],[10,10],[3,4]],[[1,1],[9,9],[3,3],[100,100]],5),
    ([[0,0],[2,0]],[[1,0],[-1,0]],1),
    (_P,_Q,700),(_P,_Q,4000),([[7,7]],[[-9000,9000]],10)]
M = dict(
 id='p109-nearest-poi-grid', num=109, title='Nearest Point of Interest (Grid Index)', lc=[(973,'K Closest Points to Origin'),(1779,'Find Nearest Point That Has the Same X or Y')], difficulty='Medium',
 patterns=['Spatial Hashing','Geometry','Hash Map'], companies=['Garmin','Wing','Google'],
 course='04 tutorial ch41.1 (map search); interview-mastery-courses: none',
 similar=[(973,'K Closest Points to Origin'),(1779,'Find Nearest Point That Has the Same X or Y'),(2250,'Count Number of Rectangles Containing Each Point')],
 statement='Given points of interest and query positions on an integer map, return for each query the index of the nearest POI by Euclidean distance (ties → smaller index). Build a uniform grid with the given cell size and search outward in rings instead of scanning every POI per query.',
 examples=[dict(i='pois=[[0,0],[10,10],[3,4]], queries=[[1,1],[9,9]], cell=5',o='[0,1]',e='')],
 constraints=['1 ≤ pois ≤ 10⁵, coordinates within ±10⁶','cell ≥ 1','compare squared distances in 64-bit'],
 sig=dict(fn='nearest',params=[['pois','int[][]'],['queries','int[][]'],['cell','int']],ret='int[]'),
 tests=[dict(args=[p,q,c],expect=_ref(p,q,c)) for p,q,c in _T], traceCase=0,
 analogy='Looking for the nearest coffee shop in a city laid out in blocks. You check your own block, then the ring of blocks around it, then the next ring. Once the best shop you found is closer than anything a further ring could possibly hold, you stop walking.',
 jargon={'uniform grid / spatial hash':'bucket points by (floor(x/cell), floor(y/cell))','ring r':'cells whose block distance from the query cell is exactly r','floor division':'rounds toward −∞, so negative coordinates land in the right cell'},
 brute=dict(idea='Scan every POI for every query.',time='O(P·Q)',space='O(1)',plain='Fine for a few hundred, too slow for a map.'),
 optimal=dict(idea='Hash POIs into grid cells. For each query visit rings r = 0,1,2…; any POI in ring r+1 or further is at least r·cell away, so stop once best² < (r·cell)².',time='O(P) build, ~O(points near the query) per query',space='O(P)',plain='Search effort follows local density, not map size.'),
 walkthrough=['cell=5: (0,0)→cell(0,0), (3,4)→(0,0), (10,10)→(2,2)','query (1,1): ring 0 has idx 0 (d²=2) and 2 (d²=13) → best 0','after ring 0 the bound is 0·5 = 0, so keep going; after ring 1 anything unseen is ≥ 5 away and 2 < 25 → stop'],
 hints=['Bucket points by cell.','Search the query cell, then grow rings.','When can you prove no further ring can win?'],
 pitfalls=['C-style division rounds negatives toward zero → wrong cell.','Stopping after the first non-empty ring (a corner of ring 1 can be farther than ring 2\'s edge).','No upper bound on rings when the query is far from every POI.'],
 followups=['k nearest (keep a max-heap of size k).','Road distance instead of straight-line (graph search).','Quadtree / k-d tree for very uneven density.'],
 script=['Clarify distance and ties.','Grid index.','Ring search and stopping rule.','Density follow-ups.'],
 viz=dict(ptr=['r']),
 rubric=['Correct bucketing incl. negatives','Proven stopping rule','64-bit distances','Follow-ups'],
)
