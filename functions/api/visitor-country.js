// Country-only helper. No IP addresses or personal data are stored.
// Cloudflare supplies the visitor's country at the edge.
export function onRequestGet({ request }) {
  const country = request.cf?.country === "US" ? "US" : "OTHER";
  return new Response(JSON.stringify({ country }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff"
    }
  });
}
