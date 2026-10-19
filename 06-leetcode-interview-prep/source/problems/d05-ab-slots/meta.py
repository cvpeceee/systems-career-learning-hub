def _ref(ops,args):
    out=[];act=0;ver=['1','0'];pend=False;tries=0;N='AB'
    for o,a in zip(ops,args):
        if o=='ABSlots': act=0;ver=[a,'0'];pend=False;tries=0;out.append('null')
        elif o=='install':
            if pend: out.append('busy')
            else: ver[1-act]=a;pend=True;tries=3;out.append('ok')
        elif o=='boot':
            if not pend: out.append('booted:%s:%s'%(N[act],ver[act]))
            elif a=='good': act=1-act;pend=False;out.append('switched:%s:%s'%(N[act],ver[act]))
            else:
                tries-=1
                if tries==0: pend=False;out.append('rollback:%s:%s'%(N[act],ver[act]))
                else: out.append('retry:%d'%tries)
        else:
            out.append(','.join('%s:%s%s%s'%(N[i],ver[i],'*' if i==act else '','?' if pend and i!=act else '') for i in (0,1)))
    return out
_T=[(['ABSlots','install','boot','status','install','boot','boot','boot','status','boot'],['1','2','good','','3','bad','bad','bad','','good']),
    (['ABSlots','install','install','status','boot','status'],['5','6','7','','good','']),
    (['ABSlots','boot','install','boot','boot','status'],['9','','10','bad','good',''])]
M = dict(
 id='d05-ab-slots', num=105, kind='component', title='A/B Slot OTA Update State Machine (component)', lc=[], difficulty='Medium',
 patterns=['Design','State Machine'], companies=['Tesla','Qualcomm','Apple','Microsoft Robotics'],
 course='Main tutorial Ch34 (dual-slot updates that roll back, verified boot); Systems & AI Infra "Safe OTA design including validation, atomicity, and fleet rollout"',
 similar=[],
 statement='Two firmware slots A and B. <code>install "v"</code> writes v into the inactive slot and marks it pending with 3 boot tries ("busy" if one is already pending). <code>boot "good|bad"</code>: with a pending slot, a good boot switches the active slot; a bad boot spends a try, and after 3 bad tries the update is abandoned (rollback). <code>status</code> prints slots, * = active, ? = pending.',
 examples=[dict(i='install 2; boot good → switched:B:2',o='',e='')],
 constraints=['the active slot is never overwritten'],
 sig=dict(fn='run',params=[['ops','string[]'],['args','string[]']],ret='string[]'),
 tests=[dict(args=[o,a],expect=_ref(o,a)) for o,a in _T], traceCase=0,
 analogy='Moving house while keeping the old house. You furnish the new house (inactive slot) while still living in the old one. You try sleeping in the new one; if three nights go badly, you simply go back home — the old house was never touched. Only after a good night do you hand back the old keys.',
 jargon={'OTA':'over-the-air software update','A/B slots':'two copies of the system so one is always known-good','rollback':'returning to the previous working version','state machine':'a system that is always in one named state and moves between states on events'},
 brute=dict(idea='Overwrite the single firmware partition in place.',time='—',space='1×',plain='Power loss mid-write = bricked device. Never acceptable for cars or robots.'),
 optimal=dict(idea='Write only the inactive slot; bootloader tries it with a counter; commit on health-check success, auto-revert on exhaustion.',time='O(1) per event',space='2× storage',plain='Doubling storage buys "can never brick".'),
 walkthrough=['A:1* active. install 2 → B:2 pending.','boot good → active B.','install 3 → A:3 pending. 3 bad boots → rollback, still B:2.'],
 hints=['Which slot must never be written while it is running?','What decides if a new image is "good"?','Bound the retries so a bad image can\'t boot-loop forever.'],
 pitfalls=['Committing before health checks pass.','Not bounding retries (boot loop).','Ignoring the case of a second install while one is pending.'],
 followups=['Staged fleet rollout (1% → 10% → 100%) with automatic halt.','Signed images + anti-rollback counters (verified boot).','Delta updates and bandwidth limits.'],
 script=['Failure model: power loss, bad image.','Two slots + tries counter.','Commit protocol and health checks.','Fleet rollout & security.'],
 viz=dict(slots='ver',ptr=['act','pend','tries']),
 rubric=['Never-overwrite-active invariant','Bounded retries','Commit/rollback','Fleet rollout'],
)
