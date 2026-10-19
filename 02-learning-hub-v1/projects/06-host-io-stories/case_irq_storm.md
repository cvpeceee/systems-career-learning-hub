# Case: IRQ storm

**Symptom:** System jank; softlockup warnings; one device's interrupt line hot.  
**Seed facts:** Recent firmware enabled a status IRQ per descriptor; threaded IRQ not used.

Practice SCCR. Hints: coalesce, mask in ISR, move work to thread, rate limit, check spurious level-triggered IRQs.
