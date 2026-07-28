import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { callGemini } from "./api/_gemini";

function geminiDevApiPlugin(): Plugin {
  return {
    name: "ieum-gemini-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/gemini", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "허용되지 않은 방식이에요." }));
          return;
        }
        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", () => {
          void (async () => {
            let body: unknown = {};
            try {
              body = raw ? JSON.parse(raw) : {};
            } catch {
              res.statusCode = 400;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: "요청 형식이 올바르지 않아요." }));
              return;
            }
            const result = await callGemini(body as never);
            res.statusCode = result.ok ? 200 : result.status;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify(result.ok ? { text: result.text } : { error: result.error }));
          })();
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL;

  return {
    plugins: [react(), geminiDevApiPlugin()],
    build: { target: "es2022" }
  };
});
