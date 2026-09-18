import type { Connect, Plugin } from "vite";
import { predictAge } from "./predict.ts";

const NAME_RE = /^[가-힣]{1,5}$/;

const handler: Connect.NextHandleFunction = async (req, res, next) => {
  if (!req.url?.startsWith("/api/age")) return next();
  const name = new URL(req.url, "http://localhost").searchParams.get("name")?.trim() ?? "";
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!NAME_RE.test(name)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "한글 이름을 1~5자로 입력해 주세요." }));
    return;
  }
  try {
    res.end(JSON.stringify(await predictAge(name)));
  } catch (err) {
    console.error("[jev]", err);
    res.statusCode = 502;
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Jev 호출에 실패했습니다." }));
  }
};

/** Serves GET /api/age?name=... from the Vite dev and preview servers so the API key stays server-side. */
export function jevApi(): Plugin {
  return {
    name: "jev-api",
    configureServer: (server) => void server.middlewares.use(handler),
    configurePreviewServer: (server) => void server.middlewares.use(handler),
  };
}
