import { createServer } from "node:http";

import { handleGenerateBoq } from "./handler.js";
import { query } from "./db.js";

const port = Number(process.env.PORT ?? 8787);

function send(res, result) {
  res.writeHead(result.statusCode, result.headers);
  res.end(result.body);
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-origin": "*",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  };
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");

      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function getTenderDetails(tenderId) {
  const tender = await query("SELECT * FROM tenders WHERE id = $1", [tenderId]);

  if (tender.rowCount === 0) {
    return null;
  }

  const [stages, nrmModes, estimateRows, drawingUploads, boqItems, submissionFiles, preTenderCriteria, negotiationLogs, awardTasks, aiSignals] =
    await Promise.all([
      query("SELECT * FROM tender_stages ORDER BY order_index"),
      query("SELECT * FROM nrm_modes ORDER BY id"),
      query("SELECT * FROM estimate_rows WHERE tender_id = $1 ORDER BY code", [tenderId]),
      query("SELECT * FROM drawing_uploads WHERE tender_id = $1", [tenderId]),
      query("SELECT * FROM generated_boq_items WHERE tender_id = $1", [tenderId]),
      query("SELECT * FROM submission_files WHERE tender_id = $1", [tenderId]),
      query("SELECT * FROM pre_tender_criteria WHERE tender_id = $1", [tenderId]),
      query("SELECT * FROM negotiation_logs WHERE tender_id = $1", [tenderId]),
      query("SELECT * FROM award_tasks WHERE tender_id = $1 ORDER BY order_index", [tenderId]),
      query("SELECT * FROM ai_signals WHERE tender_id = $1", [tenderId]),
    ]);

  return {
    ...tender.rows[0],
    stages: stages.rows,
    nrmModes: nrmModes.rows,
    estimateRows: estimateRows.rows,
    drawingUploads: drawingUploads.rows,
    generatedBoqItems: boqItems.rows,
    submissionFiles: submissionFiles.rows,
    preTenderCriteria: preTenderCriteria.rows,
    negotiationLog: negotiationLogs.rows,
    awardTasks: awardTasks.rows,
    aiSignals: aiSignals.rows,
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    send(res, {
      statusCode: 204,
      headers: {
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-origin": "*",
      },
      body: "",
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    send(res, jsonResponse(200, { status: "ok", service: "boq-ai" }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/projects") {
    try {
      const result = await query("SELECT * FROM projects ORDER BY id");
      const mappedRows = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        type: row.type,
        status: row.status,
        progress: row.progress,
        value: row.value,
        budgetVariance: row.budget_variance,
        budgetStatus: row.budget_status,
        deadline: row.deadline,
        location: row.location,
        coordinates: [Number(row.latitude), Number(row.longitude)],
        phase: row.phase,
        team: row.team,
      }));

      send(res, jsonResponse(200, mappedRows));
    } catch (error) {
      console.error("Failed to load projects:", error);
      send(res, jsonResponse(500, { error: "Failed to load projects" }));
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/tasks") {
    try {
      const result = await query("SELECT * FROM tasks ORDER BY due_date");
      send(res, jsonResponse(200, result.rows));
    } catch (error) {
      console.error("Failed to load tasks:", error);
      send(res, jsonResponse(500, { error: "Failed to load tasks" }));
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/tenders") {
    try {
      const result = await query("SELECT * FROM tenders ORDER BY id");
      send(res, jsonResponse(200, result.rows));
    } catch (error) {
      console.error("Failed to load tenders:", error);
      send(res, jsonResponse(500, { error: "Failed to load tenders" }));
    }
    return;
  }

  const tenderMatch = url.pathname.match(/^\/api\/tenders\/([^/]+)$/);

  if (req.method === "GET" && tenderMatch) {
    try {
      const tenderDetails = await getTenderDetails(decodeURIComponent(tenderMatch[1]));

      if (!tenderDetails) {
        send(res, jsonResponse(404, { error: "Tender not found" }));
        return;
      }

      send(res, jsonResponse(200, tenderDetails));
    } catch (error) {
      console.error("Failed to load tender details:", error);
      send(res, jsonResponse(500, { error: "Failed to load tender details" }));
    }
    return;
  }

  const match = url.pathname.match(
    /^\/api\/v1\/tenders\/([^/]+)\/boq\/generate$/
  );

  if (req.method === "POST" && match) {
    try {
      const body = await readJson(req);
      send(
        res,
        await handleGenerateBoq({
          tenderId: decodeURIComponent(match[1]),
          body,
        })
      );
    } catch (error) {
      send(res, jsonResponse(400, {
        error: "Invalid request body",
        detail: error instanceof Error ? error.message : "Unknown error",
      }));
    }
    return;
  }

  send(res, jsonResponse(404, { error: "Not found" }));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`BOQ AI service listening on http://127.0.0.1:${port}`);
});
