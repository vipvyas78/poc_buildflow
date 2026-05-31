# BuildFlow BOQ AI Service

Dependency-free local service for generating NRM-based BOQ drafts from drawing metadata. The code is split into:

- `src/boqGenerator.js`: pure generation logic, later replaceable with LLM/document extraction calls.
- `src/handler.js`: AWS Lambda-compatible handler shape.
- `src/server.js`: local HTTP adapter for development.

## Local Development

```bash
cd services/boq-ai
npm run dev
```

Health check:

```bash
curl http://127.0.0.1:8787/health
```

Generate BOQ:

```bash
curl -X POST http://127.0.0.1:8787/api/v1/tenders/cambridge-civic-quarter/boq/generate \
  -H "content-type: application/json" \
  -d '{"nrmMode":"NRM1 + NRM2","drawings":[{"name":"A-101 Ground floor GA.pdf","discipline":"Architecture","status":"Parsed","tone":"green"}]}'
```

## Frontend Wiring

Set this for the Vite app:

```bash
VITE_BOQ_AI_API_URL=http://127.0.0.1:8787
```

If this variable is not set or the service is unavailable, the frontend keeps using its local mock fallback.
