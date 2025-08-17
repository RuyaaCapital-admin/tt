export default async function handler(req, res) {
  try {
    const { from, to, country, limit, offset } = req.query || {};
    const token = process.env.EODHD_TOKEN;
    if (!token) return res.status(500).json({ ok:false, error:"Missing EODHD_TOKEN" });

    const p = new URLSearchParams({
      api_token: token, fmt: "json",
      from: from || new Date(Date.now()-7*864e5).toISOString().slice(0,10),
      to: to || new Date(Date.now()+30*864e5).toISOString().slice(0,10),
    });
    if (country) p.set("country", country);
    if (limit) p.set("limit", String(limit));
    if (offset) p.set("offset", String(offset));

    const r = await fetch(`https://eodhd.com/api/economic-events?${p}`, { cache: "no-store" });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ ok:false, error:data });
    res.status(200).json({ ok:true, count:Array.isArray(data)?data.length:0, data });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
}
