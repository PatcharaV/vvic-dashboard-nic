import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");
const workbookPath = process.argv[2];

if (!workbookPath) {
  throw new Error("Usage: node scripts/generateLululemonOpportunityUnits.mjs <workbook.xlsx>");
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const opportunitiesPath = path.resolve(scriptDirectory, "../src/lululemonOpportunities.js");
const { LULULEMON_REMAINING_OPPORTUNITIES } = await import(
  `${pathToFileURL(opportunitiesPath).href}?updated=${Date.now()}`
);

const subtypeNames = {
  jacket: "JACKET",
  short: "SHORT",
  pullover: "PULLOVER",
  tee: "TEE",
  "tank-top": "TANK TOP",
  "boxer-brief": "BOXER BRIEF",
  polo: "POLO",
  skirt: "SKIRT",
  pant: "PANT",
  jogger: "JOGGER",
  "button-down": "SHIRT BUTTON DOWN",
};

function displayFamilyName(value = "") {
  return String(value)
    .replace(/\s*\*.*$/, "")
    .replace(/\s+\b(?:23|25|26|27|28|29|30|31|32|34|35|36|37)(?:L)?(?:\s*(?:in|inch(?:es)?)|")?(?=\s|$)/gi, "")
    .replace(/\s+\b(?:Tall|Regular|Shorter)\b$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFamilyName(value = "") {
  return displayFamilyName(value)
    .toLowerCase()
    .replace(/^lululemon\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const workbook = XLSX.readFile(workbookPath, { cellFormula: true });
const sheetName = workbook.SheetNames.find(
  (name) => name.trim().toLowerCase() === "all product",
);
if (!sheetName) throw new Error("All product sheet not found");

const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
const groupedUnits = new Map();
for (const row of rows) {
  const subtype = String(row["Sub-Type"] || row["Sub-Type (US sheet)"] || "")
    .trim()
    .toUpperCase();
  const title = String(row["Product Title (Particl)"] || "").trim();
  const units = Number(
    row["Total Units "] ??
    row["Total Units (all zones)"] ??
    row["Total Units (quantity, preserved)"] ??
    0,
  ) || 0;
  const key = `${subtype}|${normalizeFamilyName(title)}`;
  groupedUnits.set(key, (groupedUnits.get(key) || 0) + units);
}

const opportunityUnits = {};
const unmatched = [];
for (const [subtypeKey, opportunities] of Object.entries(LULULEMON_REMAINING_OPPORTUNITIES)) {
  opportunityUnits[subtypeKey] = {};
  for (const opportunity of opportunities) {
    const key = `${subtypeNames[subtypeKey]}|${normalizeFamilyName(opportunity.name)}`;
    if (!groupedUnits.has(key)) {
      unmatched.push(`${subtypeKey}: ${opportunity.name}`);
      continue;
    }
    opportunityUnits[subtypeKey][opportunity.name] = groupedUnits.get(key);
  }
}

const outputPath = path.resolve(scriptDirectory, "../src/lululemonOpportunityUnits.js");
const sourceName = path.basename(workbookPath);
fs.writeFileSync(
  outputPath,
  `// Generated from ${sourceName}, All product sheet. Do not edit manually.\n` +
    `export const LULULEMON_OPPORTUNITY_UNITS = ${JSON.stringify(opportunityUnits, null, 2)};\n`,
  "utf8",
);

console.log(`Generated units for ${Object.values(opportunityUnits).reduce((sum, group) => sum + Object.keys(group).length, 0)} opportunity families.`);
if (unmatched.length) {
  console.warn(`Skipped ${unmatched.length} families not present in this workbook snapshot.`);
}
