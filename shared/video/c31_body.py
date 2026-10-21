"""c31 body re-rendered with the synced 07 renderer (fixes the old caption drift in the election scene)."""
import os,sys; H=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,H)
os.environ['OUTDIR']='/workspace/.vwork/c31-leader-election'
import render07 as RD; RD.OUTDIR=os.environ['OUTDIR']
V=dict(id='orig',short='Interview Prep · Concept video',title='Leader Election & Leases',scenes=[
 dict(k='title',title='Leader election',sub='One node in charge, safely',items=['The marker analogy','A Raft-style election','Avoiding split brain'],say=[
  'Many systems need exactly one node in charge. Leader election picks it, and leases make sure an old leader steps down.']),
 dict(k='analogy',title='Plain analogy: one whiteboard marker',items=['One person holds the only marker','Marker holder writes; everyone else reads','Gone too long? The group votes a new holder','The old holder must know the marker expired'],say=[
  'Think of a group project where one person holds the only marker for the whiteboard.',
  'Whoever holds the marker writes; everyone else reads.',
  'If that person leaves the room for too long, the group votes and gives a new marker to someone else.',
  'The old person must know their marker has expired, or two people would write over each other.']),
 dict(k='seq',title='A Raft-style election',lanes=['Node A (leader)','Node B','Node C'],msgs=[(0,1,'heartbeat'),(0,2,'heartbeat'),(0,0,'crash ✗'),(1,1,'timer fires → candidate, term 2'),(1,2,'RequestVote(term 2)'),(2,1,'vote yes → majority 2 of 3')],say=[
  'Here is a Raft style election. The leader sends heartbeats.','Followers reset their timers.',
  'The leader crashes, and heartbeats stop.',
  "One follower's random timer fires first. It becomes a candidate for term two.",
  'It asks for votes,',
  'and wins with a majority of three.']),
 dict(k='bullets',title='Avoiding two leaders (split brain)',items=['Require a majority: two groups can never both win','Term / epoch number + fencing token: storage rejects older terms','Lease: a time-limited right to act; stop before it ends'],say=[
  'Avoiding two leaders, called split brain.',
  'Require a majority, so two groups can never both win.',
  'Use a term or epoch number, a fencing token, and reject writes from older terms.',
  'Leases give the leader a time limited right to act; it must stop before the lease ends.']),
 dict(k='recap',title='In one line',items=['Majority votes pick one leader; terms and fencing tokens reject old leaders; leases bound how long anyone acts alone'],say=[
  'Majority votes pick one leader, terms and fencing tokens reject old leaders, and leases bound how long anyone can act alone.']),
])
RD.build(V)
