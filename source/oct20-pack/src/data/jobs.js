// Oct 20 job alert. Role strings shown in each lesson's "Which job needs this" tag. Sources: ../../oct20-docs/new-jobs-oct20-research.md
export const JOBS = {
  nvatg: "NVIDIA · Senior Systems Software Engineer, Advanced Technology Group (Hillsboro OR)",
  tegra: "NVIDIA · Senior System Software Engineer, Tegra (Santa Clara)",
  gpuarch: "NVIDIA · Senior GPU Architect (Durham NC)",
  nvsre: "NVIDIA · Senior SRE, Kubernetes Platform (Austin)",
  gdch: "Google · Senior SWE, Google Distributed Cloud Hosted, Infrastructure (Sunnyvale)",
  aisb: "Google · Senior AI Solution Builder, Cloud Learning Services (Austin)",
  antscale: "Anthropic · Staff + Sr. Software Engineer, Scaling (Seattle)",
  wing: "Wing · Senior Backend Software Engineer (Palo Alto)",
  rtx: "Raytheon (RTX) · Senior Software Engineer (Indianapolis)",
  orapmts: "Oracle · Principal Member of Technical Staff (Austin)",
  oranet: "Oracle · Senior Software Developer, Linux Networking (Austin)",
  crwd: "CrowdStrike · Sr. Software Engineer II, Sensor: Mac/Linux/Windows (Austin)",
  osano: "Osano · Senior Software Engineer, Full Stack (Austin / remote)",
  genesys: "Genesys · AI CX Agent Principal Software Engineer, Go (NC)",
  garmin: "Garmin · Senior Software Engineer, C++/C (Cary NC)",
  garminmap: "Garmin · Senior C++ Software Engineer, Map Navigation (Cary NC)",
  truist: "Truist · Observability Forward Deployed Engineer (Raleigh / Charlotte)",
};
export const jobs = (...pairs) => pairs.map(([k, why]) => ({ role: JOBS[k], why }));
