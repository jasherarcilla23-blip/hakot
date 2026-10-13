# Hakot

University assistant backend using Node.js, TypeScript, Express, and local Ollama.
The React chat frontend is served by Express at http://localhost:3000/.

## Run

Install dependencies with `npm install`, then start Ollama and pull both models:

```sh
ollama pull nomic-embed-text
ollama pull qwen3.5:4b
npm run build
npm run ingest -- documents
npm start
```

Ingestion replaces knowledge.json with all supplied documents, embedding all chunks
in one batch. Supply all documents together. Restart the server after ingestion,
since retrieval loads knowledge once at startup. Missing knowledge allows only the
fallback flow. Document titles use filenames without extensions.

Automatic directory detection uses short standalone headings and bullet lists.
Use `npm run ingest -- --format=directory documents/directory.txt` or
`--format=narrative` to override it. Directory sections stay intact. Narrative
chunks target 600 characters, retain whole sentences even when longer, and drop
fragments shorter than 80 characters. Explicit standalone "Page 3" or "p. 3"
markers become locators; page numbers are never inferred.

## Configuration

Set environment variables in your shell before starting (no .env loader):

- `OLLAMA_URL`: defaults to http://localhost:11434.
- `KNOWLEDGE_PATH`: defaults to knowledge.json in the working directory.
- `PORT`: defaults to 3000.
- `HELP_TOPICS`: defaults to UMak scholarships, college requirements, campus locations, and university offices.
- `HELP_TOPICS_KEYWORD`: a keyword required in fallback chat; defaults to UMak, or the custom HELP_TOPICS value if set.
- `API_KEY` / `OPENAI_API_KEY`: if present, output guards reject verbatim disclosures.
  Ollama does not require these keys.

Re-tune the 0.6 similarity threshold in src/search.ts using real document score
distributions before relying on it. Prompt and output guards implement the supplied
policy; evaluate grounding and injection behavior against the actual local model.

## API

POST /ask with JSON `{"question":"What does the admissions office handle?"}`.

Returns `{ answer, sources: [{ title, locator?, text }] }`.
Questions must be nonempty strings shorter than 300 characters.
Each IP may make 30 requests per minute. The limit is in memory per process.
Proxy trust stays disabled; configure it only for a known deployment proxy.
Malformed JSON returns generic JSON errors, and details stay in server logs.

Serve a future React build from public, or configure its development server to proxy
/ask to this backend. Render source passages as React text children, with no
dangerouslySetInnerHTML. Citation locators may be office names, sections, or pages.

## Checks

`npm test` builds TypeScript and runs offline tests using mocked model/retrieval calls.
Live Ollama and real university documents are needed for end-to-end answer evaluation.
The supplied campus map, college requirements, scholarship guide, and office directory
use document-aware section boundaries. Chunks preserve building/floor/wing context,
program-specific requirements, scholarship audiences, and complete office service lists.
Run `npm run ingest -- documents` to regenerate all supplied documents together.

Generation uses qwen3.5:4b with thinking disabled and temperature 0.

## Chat frontend

Run npm start and visit http://localhost:3000/. Startup builds both the React
frontend and TypeScript backend. The chat calls POST /ask on the same server,
shows loading and error states, and renders source passages safely as React text.
Frontend source lives in frontend/; scripts/build-frontend.cjs emits public/.
Use npm run build:client after frontend edits. Stop and restart the server after
backend edits. No cloud deployment is needed for this local Ollama application.