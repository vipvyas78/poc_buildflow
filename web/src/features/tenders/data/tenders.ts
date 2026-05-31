export type StageId =
  | "pre-tender"
  | "estimating"
  | "submission"
  | "negotiation"
  | "award";

export type SemanticTone = "blue" | "green" | "amber" | "red" | "slate";

export type NrmMode = "NRM1" | "NRM2" | "NRM1 + NRM2";

export type DrawingUpload = {
  name: string;
  discipline: string;
  status: string;
  tone: SemanticTone;
};

export type GeneratedBoqItem = {
  nrm: string;
  nrm2: string;
  item: string;
  source: string;
  quantity: string;
  confidence: number;
  action: string;
  tone: SemanticTone;
};

export type TenderStage = {
  id: StageId;
  label: string;
  shortLabel: string;
  status: "complete" | "active" | "locked";
};

export const stages: TenderStage[] = [
  {
    id: "pre-tender",
    label: "Pre-Tender",
    shortLabel: "Pre",
    status: "complete",
  },
  {
    id: "estimating",
    label: "Estimating",
    shortLabel: "Estimate",
    status: "active",
  },
  {
    id: "submission",
    label: "Submission",
    shortLabel: "Submit",
    status: "locked",
  },
  {
    id: "negotiation",
    label: "Negotiation",
    shortLabel: "Negotiate",
    status: "locked",
  },
  {
    id: "award",
    label: "Award",
    shortLabel: "Award",
    status: "locked",
  },
];

export const tenderOptions = [
  "Cambridge Civic Quarter",
  "Bristol Hospital Retrofit",
  "Leeds Student Living",
];

export const tenderSummary = {
  client: "Cambridge City Council",
  value: "£8.6M",
  bidDue: "12 Jun 2026",
  countdown: "18d 04h",
  confidence: 78,
  margin: "11.8%",
  risk: "Medium",
};

export const estimateRows = [
  {
    code: "1.0",
    item: "Site preliminaries",
    supplier: "BuildFlow internal",
    quantity: "16 wks",
    cost: "£428K",
    delta: "+2.1%",
    tone: "amber" as SemanticTone,
  },
  {
    code: "2.0",
    item: "Substructure package",
    supplier: "East Anglia Groundworks",
    quantity: "1 lot",
    cost: "£1.42M",
    delta: "-1.8%",
    tone: "green" as SemanticTone,
  },
  {
    code: "2.1",
    item: "Piling attendance",
    supplier: "Fen Piling Ltd",
    quantity: "112 piles",
    cost: "£386K",
    delta: "+4.6%",
    tone: "red" as SemanticTone,
  },
  {
    code: "3.0",
    item: "Frame and envelope",
    supplier: "Northern Steelworks",
    quantity: "1 lot",
    cost: "£2.31M",
    delta: "+0.4%",
    tone: "blue" as SemanticTone,
  },
];

export const nrmModes: Array<{
  id: NrmMode;
  label: string;
  description: string;
}> = [
  {
    id: "NRM1",
    label: "NRM1",
    description: "Order of cost estimate and cost planning structure",
  },
  {
    id: "NRM2",
    label: "NRM2",
    description: "Detailed measurement rules for tender BoQ production",
  },
  {
    id: "NRM1 + NRM2",
    label: "NRM1 + NRM2",
    description: "Cost-plan alignment with measured work item detail",
  },
];

export const drawingUploads: DrawingUpload[] = [
  {
    name: "A-101 Ground floor GA.pdf",
    discipline: "Architecture",
    status: "Parsed",
    tone: "green" as SemanticTone,
  },
  {
    name: "S-220 Substructure sections.dwg",
    discipline: "Structural",
    status: "Queued",
    tone: "blue" as SemanticTone,
  },
  {
    name: "M-310 Plant room layout.pdf",
    discipline: "MEP",
    status: "Needs review",
    tone: "amber" as SemanticTone,
  },
];

export const generatedBoqItems: GeneratedBoqItem[] = [
  {
    nrm: "NRM1 2.1",
    nrm2: "NRM2 E10",
    item: "Reinforced concrete strip foundations",
    source: "S-220",
    quantity: "184 m3",
    confidence: 86,
    action: "Ready for pricing",
    tone: "green" as SemanticTone,
  },
  {
    nrm: "NRM1 2.2",
    nrm2: "NRM2 F10",
    item: "Ground floor slab with insulation build-up",
    source: "A-101",
    quantity: "1,420 m2",
    confidence: 79,
    action: "Check build-up",
    tone: "amber" as SemanticTone,
  },
  {
    nrm: "NRM1 3.1",
    nrm2: "NRM2 G20",
    item: "Structural steel frame and connections",
    source: "S-410",
    quantity: "286 t",
    confidence: 72,
    action: "Drawing missing",
    tone: "red" as SemanticTone,
  },
  {
    nrm: "NRM1 8.1",
    nrm2: "NRM2 T31",
    item: "Mechanical plant distribution allowance",
    source: "M-310",
    quantity: "1 item",
    confidence: 68,
    action: "Estimator review",
    tone: "amber" as SemanticTone,
  },
];

export const submissionFiles = [
  {
    name: "Form of tender",
    owner: "Commercial",
    status: "Verified",
    tone: "green" as SemanticTone,
  },
  {
    name: "Programme narrative",
    owner: "Planning",
    status: "Draft review",
    tone: "amber" as SemanticTone,
  },
  {
    name: "Health and safety method",
    owner: "HSEQ",
    status: "Missing",
    tone: "red" as SemanticTone,
  },
  {
    name: "Social value response",
    owner: "Bid team",
    status: "Ready",
    tone: "green" as SemanticTone,
  },
];

export const preTenderCriteria = [
  {
    label: "Client fit",
    score: 82,
    tone: "green" as SemanticTone,
  },
  {
    label: "Resource capacity",
    score: 64,
    tone: "amber" as SemanticTone,
  },
  {
    label: "Contract exposure",
    score: 41,
    tone: "red" as SemanticTone,
  },
];

export const negotiationLog = [
  {
    time: "09:20",
    title: "Client requested VE option for facade finish",
    impact: "-£186K",
    tone: "blue" as SemanticTone,
  },
  {
    time: "11:45",
    title: "Legal flagged liquidated damages clause",
    impact: "Blocker",
    tone: "red" as SemanticTone,
  },
  {
    time: "14:10",
    title: "MEP subcontractor held price for 21 days",
    impact: "Clear",
    tone: "green" as SemanticTone,
  },
];

export const awardTasks = [
  "Initialize project instance",
  "Map tender BoQ to project cost plan",
  "Create handover pack",
  "Log post-bid criteria",
];

export const aiSignals = [
  {
    label: "Clause risk",
    value: "2 critical",
    tone: "red" as SemanticTone,
  },
  {
    label: "Supplier coverage",
    value: "84%",
    tone: "green" as SemanticTone,
  },
  {
    label: "Pricing drift",
    value: "+1.6%",
    tone: "amber" as SemanticTone,
  },
];
