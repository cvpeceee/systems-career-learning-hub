// Oct 12 job alert. Role strings shown in each lesson's "Which job needs this" tag.
export const JOBS = {
  ant: "Anthropic · Staff+ Software Engineer, Infrastructure (Distributed Systems) (SF / Seattle)",
  gpu: "Roblox · Principal Software Engineer, GPU Compute (San Mateo)",
  ea: "Roblox · Principal Software Engineer, Engineering Acceleration (San Mateo)",
  qc: "Qualcomm · Senior Staff Engineer, automotive telematics platform (San Diego)",
  ms: "Microsoft · Member of Technical Staff (Principal), Microsoft Robotics (Redmond)",
};
export const jobs = (...pairs) => pairs.map(([k, why]) => ({ role: JOBS[k], why }));
