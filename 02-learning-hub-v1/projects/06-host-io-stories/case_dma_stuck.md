# Case: DMA stuck

**Symptom:** Capture path runs N frames then freezes; CPU idle; no completion IRQ.  
**Seed facts:** IOMMU on; CMA pool recently reduced; works if buffer size halved.

Practice SCCR. Hints (look after you try): descriptor ownership, cache sync, IOMMU map lifetime, ring wrap, doorbell write ordering.
