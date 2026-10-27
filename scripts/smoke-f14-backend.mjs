// Read-only production smoke test. No game saves, feedback, or telemetry rows are written.
const api = "https://djdpttltfmwkofdrvkem.supabase.co/functions/v1/f14-backend";
const options = await fetch(api, {
  method: "OPTIONS",
  headers: {
    Origin: "https://bassdrum4.github.io",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type",
  },
});
if (options.status !== 204 || options.headers.get("access-control-allow-origin") !== "*") {
  throw new Error(`F-14 CORS preflight failed: ${options.status}`);
}
const response = await fetch(api, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify({ type: "health" }),
});
const result = await response.json();
if (!response.ok || result.ok !== true || result.service !== "f14-backend") {
  throw new Error(`F-14 Supabase backend unhealthy (${response.status}): ${JSON.stringify(result)}`);
}
console.log("F-14 Edge Function, isolated tables, and CORS are healthy.");
