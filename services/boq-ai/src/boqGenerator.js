const baseBoqItems = [
  {
    nrm: "NRM1 2.1",
    nrm2: "NRM2 E10",
    item: "Reinforced concrete strip foundations",
    quantity: "184 m3",
    confidence: 86,
    action: "Ready for pricing",
    tone: "green",
  },
  {
    nrm: "NRM1 2.2",
    nrm2: "NRM2 F10",
    item: "Ground floor slab with insulation build-up",
    quantity: "1,420 m2",
    confidence: 79,
    action: "Check build-up",
    tone: "amber",
  },
  {
    nrm: "NRM1 3.1",
    nrm2: "NRM2 G20",
    item: "Structural steel frame and connections",
    quantity: "286 t",
    confidence: 72,
    action: "Drawing missing",
    tone: "red",
  },
  {
    nrm: "NRM1 8.1",
    nrm2: "NRM2 T31",
    item: "Mechanical plant distribution allowance",
    quantity: "1 item",
    confidence: 68,
    action: "Estimator review",
    tone: "amber",
  },
];

function drawingSourceName(drawing, index) {
  const fallback = `DRW-${String(index + 1).padStart(3, "0")}`;

  if (!drawing?.name) {
    return fallback;
  }

  return drawing.name.split(" ")[0].replace(/\.[^.]+$/, "") || fallback;
}

function applyNrmMode(item, nrmMode) {
  if (nrmMode === "NRM1") {
    return {
      ...item,
      nrm2: "To be measured",
      action: item.tone === "green" ? "Cost plan ready" : item.action,
    };
  }

  if (nrmMode === "NRM2") {
    return {
      ...item,
      nrm: "Cost plan pending",
    };
  }

  return item;
}

export function generateBoqDraft({ tenderId, nrmMode, drawings }) {
  const safeDrawings = Array.isArray(drawings) ? drawings : [];
  const items = baseBoqItems.map((item, index) => {
    const source = drawingSourceName(
      safeDrawings[index % Math.max(safeDrawings.length, 1)],
      index
    );

    return applyNrmMode(
      {
        ...item,
        source,
      },
      nrmMode
    );
  });

  const averageConfidence = Math.round(
    items.reduce((total, item) => total + item.confidence, 0) / items.length
  );

  return {
    jobId: `boq-${tenderId}-${Date.now()}`,
    nrmMode,
    items,
    summary: {
      drawingCount: safeDrawings.length,
      generatedItemCount: items.length,
      averageConfidence,
      reviewRequiredCount: items.filter((item) => item.tone !== "green")
        .length,
    },
  };
}
