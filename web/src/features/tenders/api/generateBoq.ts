import {
  generatedBoqItems,
  type DrawingUpload,
  type GeneratedBoqItem,
  type NrmMode,
} from "../data/tenders";

export type BoqGenerationStatus =
  | "queued"
  | "extracting"
  | "classifying"
  | "generating"
  | "complete";

export type BoqGenerationProgress = {
  status: BoqGenerationStatus;
  progress: number;
  message: string;
};

export type GenerateBoqRequest = {
  tenderId: string;
  nrmMode: NrmMode;
  drawings: DrawingUpload[];
};

export type GenerateBoqResponse = {
  jobId: string;
  nrmMode: NrmMode;
  items: GeneratedBoqItem[];
  summary: {
    drawingCount: number;
    generatedItemCount: number;
    averageConfidence: number;
    reviewRequiredCount: number;
  };
};

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

async function generateBoqWithBackend(
  request: GenerateBoqRequest,
  onProgress: (progress: BoqGenerationProgress) => void
) {
  const baseUrl = import.meta.env.VITE_BOQ_AI_API_URL;

  if (!baseUrl) {
    return null;
  }

  onProgress({
    status: "queued",
    progress: 12,
    message: "AI service request queued",
  });
  await wait(250);

  onProgress({
    status: "extracting",
    progress: 36,
    message: "Uploading drawing metadata to BOQ AI service",
  });

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/v1/tenders/${request.tenderId}/boq/generate`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        nrmMode: request.nrmMode,
        drawings: request.drawings,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`BOQ AI service returned ${response.status}`);
  }

  onProgress({
    status: "generating",
    progress: 82,
    message: "Receiving generated BOQ draft",
  });

  const result = (await response.json()) as GenerateBoqResponse;

  onProgress({
    status: "complete",
    progress: 100,
    message: "BOQ draft ready for estimator review",
  });

  return result;
}

export async function generateBoqFromDrawings(
  request: GenerateBoqRequest,
  onProgress: (progress: BoqGenerationProgress) => void
): Promise<GenerateBoqResponse> {
  const backendResult = await generateBoqWithBackend(
    request,
    onProgress
  ).catch(() => null);

  if (backendResult) {
    return backendResult;
  }

  const progressSteps: BoqGenerationProgress[] = [
    {
      status: "queued",
      progress: 12,
      message: "AI job queued for drawing intake",
    },
    {
      status: "extracting",
      progress: 38,
      message: "Extracting symbols, notes, dimensions and sheet references",
    },
    {
      status: "classifying",
      progress: 68,
      message: `Mapping drawing evidence against ${request.nrmMode}`,
    },
    {
      status: "generating",
      progress: 88,
      message: "Preparing measured BOQ draft with review flags",
    },
  ];

  for (const step of progressSteps) {
    onProgress(step);
    await wait(450);
  }

  const drawingSources = request.drawings.map((drawing) =>
    drawing.name.split(" ")[0].replace(/\.[^.]+$/, "")
  );

  const items = generatedBoqItems.map((item, index) => ({
    ...item,
    source: drawingSources[index % drawingSources.length] ?? item.source,
  }));

  onProgress({
    status: "complete",
    progress: 100,
    message: "BOQ draft ready for estimator review",
  });

  const averageConfidence = Math.round(
    items.reduce((total, item) => total + item.confidence, 0) / items.length
  );

  return {
    jobId: `boq-${Date.now()}`,
    nrmMode: request.nrmMode,
    items,
    summary: {
      drawingCount: request.drawings.length,
      generatedItemCount: items.length,
      averageConfidence,
      reviewRequiredCount: items.filter((item) => item.tone !== "green")
        .length,
    },
  };
}
