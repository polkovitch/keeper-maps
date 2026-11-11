// Usage: node tools/encode.js <map.json> > maps/<id>.js   — light obfuscation so the full plan isn't readable at a glance.
const fs = require("fs"); const KEY = "keeper";
const src = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const bytes = Buffer.from(JSON.stringify(src), "utf8");
for (let i = 0; i < bytes.length; i++) bytes[i] ^= KEY.charCodeAt(i % KEY.length);
process.stdout.write(`KeeperMap.define(${JSON.stringify(src.id)},"${bytes.toString("base64")}");\n`);
