import fs from "node:fs";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "titleTranslations.json");
function ensureCache(){ if(!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR); if(!fs.existsSync(CACHE_FILE)) fs.writeFileSync(CACHE_FILE,"{}","utf8"); }

async function translateWithOpenAI(text, lang="ar"){
  const key = process.env.OPENAI_API_KEY;
  if(!key) throw new Error("Missing OPENAI_API_KEY");
  const r = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{ "Content-Type":"application/json","Authorization":`Bearer ${key}` },
    body: JSON.stringify({
      model:"gpt-4o-mini",
      messages:[
        {role:"system",content:"Translate preserving financial terms. Return only the translated string."},
        {role:"user",content:`Translate to ${lang}: ${text}`}
      ],
      max_tokens:120
    })
  });
  const j = await r.json();
  if(!r.ok) throw new Error(JSON.stringify(j));
  const out = j.choices?.[0]?.message?.content?.trim();
  if(!out) throw new Error("Empty translation");
  return out;
}

export default async function handler(req, res){
  try{
    if(req.method!=="POST") return res.status(405).end();
    const { text="", lang="ar" } = req.body || {};
    if(!text.trim()) return res.status(400).json({ ok:false, error:"Missing text" });

    ensureCache();
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE,"utf8"));
    const key = `${lang}::${text}`;
    if(cache[key]) return res.status(200).json({ ok:true, cached:true, translation: cache[key] });

    const translated = await translateWithOpenAI(text, lang);
    cache[key] = translated;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache,null,2), "utf8");
    res.status(200).json({ ok:true, cached:false, translation: translated });
  }catch(e){
    res.status(500).json({ ok:false, error:e.message });
  }
}
