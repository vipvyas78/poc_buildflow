export type Project = {
  id: number;
  name: string;
  code: string;
  type: string;
  status: string;
  progress: number;
  value: string;
  budgetVariance: string;
  budgetStatus: string;
  deadline: string;
  location: string;
  coordinates: [number, number];
  phase: string;
  team: string[];
};

export const projects: Project[] = [
  {
    id: 1,
    name: "Canary Wharf Fit-Out",
    code: "PRJ-0042",
    type: "Fit-out",
    status: "At Risk",
    progress: 55,
    value: "£2.54M",
    budgetVariance: "+£8K",
    budgetStatus: "On budget",
    deadline: "Oct 2025",
    location: "Canary Wharf, London",
    coordinates: [51.5054, -0.0235],
    phase: "Phase 3 of 5",
    team: ["GA", "PR", "LT"],
  },

  {
    id: 2,
    name: "Central Station Refurb",
    code: "PRJ-0039",
    type: "Refurb",
    status: "On Track",
    progress: 44,
    value: "£3.1M",
    budgetVariance: "+£5K",
    budgetStatus: "On budget",
    deadline: "Dec 2025",
    location: "Birmingham",
    coordinates: [52.4862, -1.8904],
    phase: "Phase 2 of 5",
    team: ["TH", "SW", "NP"],
  },

  {
    id: 3,
    name: "Highbury Estate Phase 2",
    code: "PRJ-0038",
    type: "Residential",
    status: "At Risk",
    progress: 23,
    value: "£2.1M",
    budgetVariance: "+£28K",
    budgetStatus: "Over budget",
    deadline: "Mar 2026",
    location: "Highbury",
    coordinates: [51.5465, -0.1026],
    phase: "Phase 1 of 4",
    team: ["AB", "KS"],
  },
];
