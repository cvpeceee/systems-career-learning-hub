"""Newcomer audit: list acronyms / CamelCase jargon in lesson prose (code blocks stripped) that no glossary entry covers
and that the sentence itself does not expand. Run: python3 audit.py"""
import re, html, collections
import lessons_a, lessons_b, lessons_c, lessons_d
from glossary import G
L = []
for m in (lessons_a, lessons_b, lessons_c, lessons_d):
    L += getattr(m, 'L', [])
OK = set("""C C++ CPU RAM USB OS PC IDE UI UX URL HTML CSS JS TS SQL CLI GPIO I2C SPI UART RTOS ISR DMA MCU ECU PID ADC RPC ID OK
TCP IP DNS REST CRUD CI CD PR QA SDE SRE HR VS FAQ PDF CSV TCO AWS GCP S3 ROI IoT OTA BIOS MST NIC LED AC HP
I II III TL DR US UK EU AM PM GB MB KB TB""".split())
def prose(s):
    s = re.sub(r'<pre>.*?</pre>|<code>.*?</code>', ' ', s, flags=re.S)
    return html.unescape(re.sub(r'<[^>]+>', ' ', s))
cov = lambda w: any(g['_rx'].search(w) for g in G)
seen = collections.defaultdict(list)
for i, l in enumerate(L, 1):
    t = prose(' '.join([l.get('why', ''), l.get('an', ''), l.get('d', ''), ' '.join(x if isinstance(x,str) else ' '.join(map(str,x)) for x in (l.get('th') or []))] + [q['q'] + ' ' + ' '.join(q['o']) + ' ' + q['w'] for q in l.get('q', [])]))
    for m in re.finditer(r'\b[A-Z][A-Z0-9]{1,6}s?\b', t):
        w = m.group(0).rstrip('s') if m.group(0).endswith('s') and m.group(0)[:-1].isupper() else m.group(0)
        if w in OK or cov(m.group(0)): continue
        ctx = t[max(0, m.start() - 60): m.end() + 60].replace('\n', ' ')
        if re.search(re.escape(w) + r'\s*\(', ctx) or re.search(r'\(\s*' + re.escape(w) + r'\s*\)', ctx): continue
        seen[w].append((i, ctx))
for w, occ in sorted(seen.items(), key=lambda x: -len(x[1])):
    print(f'{w:10s} x{len(occ):3d}  first: L{occ[0][0]}: ...{occ[0][1]}...')
print(len(L), 'lessons;', len(seen), 'uncovered tokens')
