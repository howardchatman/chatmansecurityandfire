// Generate cinematic hero images for the homepage using the OpenAI Images API.
// Usage: node scripts/generate-hero-images.mjs [--only <name>]
// Reads OPENAI_API_KEY from .env.local. Saves PNGs to public/.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

// Minimal .env.local parser (no dotenv dependency needed)
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const API_KEY = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("OPENAI_API_KEY not found in .env.local");
  process.exit(1);
}

const IMAGES = [
  {
    name: "hero-sprinkler-dark",
    size: "1536x1024",
    prompt:
      "Extreme macro photograph of a commercial brass fire sprinkler head mounted on a dark ceiling, " +
      "fine water mist just beginning to release, near-black background, single warm amber rim light " +
      "from the side, glowing ember-orange highlights on the brass, cinematic, shallow depth of field, " +
      "photorealistic, moody, high contrast, dark navy shadows",
  },
  {
    name: "hero-alarm-corridor",
    size: "1536x1024",
    prompt:
      "Red commercial fire alarm pull station on a dark concrete corridor wall, single dramatic beam " +
      "of warm emergency lighting from above, faint smoke haze in the air, cinematic moody atmosphere, " +
      "photorealistic, deep navy-black shadows, ember-orange glow accents, shallow depth of field",
  },
  {
    name: "bg-embers-dark",
    size: "1536x1024",
    prompt:
      "Abstract background: glowing orange embers and sparks rising slowly through darkness against a " +
      "near-black deep navy background, subtle orange bokeh, soft focus, cinematic, elegant, minimal, " +
      "no objects, no text, suitable as a dark website section background",
  },
];

const only = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;

async function generate(model, img) {
  const body = {
    model,
    prompt: img.prompt,
    n: 1,
    size: img.size,
  };
  if (model === "dall-e-3") {
    body.size = "1792x1024"; // dall-e-3 landscape size
    body.quality = "hd";
    body.response_format = "b64_json";
  } else {
    body.quality = "high";
  }

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${model} ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.data[0].b64_json;
}

for (const img of IMAGES) {
  if (only && img.name !== only) continue;
  process.stdout.write(`Generating ${img.name}... `);
  try {
    let b64;
    try {
      b64 = await generate("gpt-image-1", img);
    } catch (err) {
      console.log(`\n  gpt-image-1 failed (${err.message.slice(0, 120)}), falling back to dall-e-3...`);
      b64 = await generate("dall-e-3", img);
    }
    const out = resolve(root, "public", `${img.name}.png`);
    writeFileSync(out, Buffer.from(b64, "base64"));
    console.log(`saved public/${img.name}.png`);
  } catch (err) {
    console.error(`FAILED: ${err.message}`);
  }
}
