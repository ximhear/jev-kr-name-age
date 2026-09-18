import type { Connect, Plugin } from "vite";
import { COUNTRIES, isCountry } from "../src/countries.ts";
import { predictAge } from "./predict.ts";

const handler: Connect.NextHandleFunction = async (req, res, next) => {
  if (!req.url?.startsWith("/api/age")) return next();
  const params = new URL(req.url, "http://localhost").searchParams;
  const name = params.get("name")?.trim() ?? "";
  const country = params.get("country") ?? "kr";
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!isCountry(country)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "지원하지 않는 나라예요." }));
    return;
  }
  if (!COUNTRIES[country].pattern.test(name)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: COUNTRIES[country].invalid }));
    return;
  }
  try {
    res.end(JSON.stringify(await predictAge(name, country)));
  } catch (err) {
    console.error("[jev]", err);
    res.statusCode = 502;
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Jev 호출에 실패했습니다." }));
  }
};

/** Serves GET /api/age?name=...&country=kr|us|jp|cn from the Vite dev and preview servers so the API key stays server-side. */
export function jevApi(): Plugin {
  return {
    name: "jev-api",
    configureServer: (server) => void server.middlewares.use(handler),
    configurePreviewServer: (server) => void server.middlewares.use(handler),
  };
}
