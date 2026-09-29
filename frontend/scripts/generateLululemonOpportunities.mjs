import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { LULULEMON_NYG_STYLES } from "../src/lululemonNygStyles.js";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workbookPath = process.argv[2];

if (!workbookPath) {
  throw new Error("Usage: node scripts/generateLululemonOpportunities.mjs <workbook.xlsx>");
}

const subtypeNames = {
  jacket: "JACKET",
  short: "SHORT",
  pullover: "PULLOVER",
  tee: "TEE",
  "tank-top": "TANK TOP",
  "boxer-brief": "BOXER BRIEF",
  polo: "POLO",
  skirt: "SKIRT",
  jogger: "JOGGER",
  "button-down": "SHIRT BUTTON DOWN",
};

function normalizeStyleName(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/^lululemon\s+/, "")
    .replace(/\s*\*.*$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const workbook = XLSX.readFile(workbookPath);
const worksheet = workbook.Sheets["Master Apparel USD & Units"];
const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });
const opportunities = {};

for (const [subtypeKey, worksheetSubtype] of Object.entries(subtypeNames)) {
  const securedNames = new Set(
    LULULEMON_NYG_STYLES.filter((style) => style.subtype === subtypeKey).map((style) =>
      normalizeStyleName(style.name),
    ),
  );
  const groupedStyles = new Map();

  for (const row of rows) {
    if (row["Sub-Type (US sheet)"] !== worksheetSubtype) continue;
    const name = row["Base Style (title before *)"] || row["Product Title (Particl)"];
    const normalizedName = normalizeStyleName(name);
    if (!normalizedName || securedNames.has(normalizedName)) continue;

    const current = groupedStyles.get(normalizedName) || { name, sales: 0 };
    current.sales += Number(row["Total Revenue USD (all zones)"]) || 0;
    groupedStyles.set(normalizedName, current);
  }

  opportunities[subtypeKey] = [...groupedStyles.values()].sort(
    (left, right) => right.sales - left.sales,
  );
}

const output = `// Generated from LLL_1.xlsx, Master Apparel USD & Units.\nexport const LULULEMON_REMAINING_OPPORTUNITIES = ${JSON.stringify(opportunities, null, 2)};\n`;
const outputPath = path.resolve(scriptDirectory, "../src/lululemonOpportunities.js");
fs.writeFileSync(outputPath, output, "utf8");
console.log(`Wrote ${outputPath}`);
