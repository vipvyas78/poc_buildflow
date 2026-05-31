import { generateBoqDraft } from "./boqGenerator.js";

const allowedNrmModes = new Set(["NRM1", "NRM2", "NRM1 + NRM2"]);

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-origin": "*",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function parseBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "object") {
    return body;
  }

  return JSON.parse(body);
}

export async function handleGenerateBoq({ tenderId, body }) {
  const payload = parseBody(body);
  const nrmMode = payload.nrmMode ?? "NRM1 + NRM2";

  if (!tenderId) {
    return response(400, {
      error: "Missing tender id",
    });
  }

  if (!allowedNrmModes.has(nrmMode)) {
    return response(400, {
      error: "Unsupported NRM mode",
      allowedNrmModes: Array.from(allowedNrmModes),
    });
  }

  const drawings = Array.isArray(payload.drawings) ? payload.drawings : [];

  if (drawings.length === 0) {
    return response(400, {
      error: "At least one drawing is required to generate a BOQ",
    });
  }

  return response(
    200,
    generateBoqDraft({
      tenderId,
      nrmMode,
      drawings,
    })
  );
}

export async function lambdaHandler(event) {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return response(204, {});
  }

  const tenderId =
    event.pathParameters?.tenderId ??
    event.pathParameters?.id ??
    event.queryStringParameters?.tenderId;

  try {
    return await handleGenerateBoq({
      tenderId,
      body: event.body,
    });
  } catch (error) {
    return response(500, {
      error: "BOQ generation failed",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await handleGenerateBoq({
    tenderId: "self-test",
    body: {
      nrmMode: "NRM1 + NRM2",
      drawings: [{ name: "A-101 Ground floor GA.pdf" }],
    },
  });

  console.log(result.body);
}
