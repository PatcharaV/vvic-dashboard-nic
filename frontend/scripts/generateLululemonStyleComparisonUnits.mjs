import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { LULULEMON_NYG_FUTURE_STYLES } from "../src/lululemonNygFutureStyles.js";
import { LULULEMON_NYG_STYLES } from "../src/lululemonNygStyles.js";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");
const workbookPath = process.argv[2];

if (!workbookPath) {
  throw new Error("Usage: node scripts/generateLululemonStyleComparisonUnits.mjs <workbook.xlsx>");
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
  pant: "PANT",
  jogger: "JOGGER",
  "button-down": "SHIRT BUTTON DOWN",
};

function firstValue(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") return row[key];
  }
  return "";
}

function normalizeName(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/^lululemon\s+/, "")
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9*'\"]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const workbook = XLSX.readFile(workbookPath, { cellFormula: true });
const sheetName = workbook.SheetNames.find(
  (name) => name.trim().toLowerCase() === "all product",
);
if (!sheetName) throw new Error('The workbook does not contain an "All product" sheet.');

const allProducts = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
const productRows = allProducts.map((row) => ({
  subtype: String(firstValue(row, ["Sub-Type (US sheet)", "Sub-Type"])).trim().toUpperCase(),
  title: String(row["Product Title (Particl)"] || "").trim(),
  baseStyle: String(row["Base Style (title before *)"] || row["Product Title (Particl)"] || "").trim(),
  sales: Number(firstValue(row, ["Total Revenue USD (all zones)", "Total USD", "Total"])) || 0,
  units: Number(firstValue(row, [
    "Total Units (all zones)",
    "Total Units (quantity, preserved)",
    "Total Units ",
    "Total Units",
  ])) || 0,
}));

function matchProducts(style) {
  const subtype = subtypeNames[style.subtype];
  const literalName = style.name.trim().toLowerCase();
  const normalizedName = normalizeName(style.name);
  const matchSteps = [
    (row) => row.subtype === subtype && row.title.toLowerCase() === literalName,
    (row) => row.title.toLowerCase() === literalName,
    (row) => row.subtype === subtype && normalizeName(row.title) === normalizedName,
    (row) => normalizeName(row.title) === normalizedName,
    (row) => row.subtype === subtype && normalizeName(row.baseStyle) === normalizedName,
    (row) => normalizeName(row.baseStyle) === normalizedName,
  ];
  for (const matches of matchSteps) {
    const rows = productRows.filter(matches);
    if (rows.length > 0) return rows;
  }
  return [];
}

const styles = [...LULULEMON_NYG_STYLES, ...LULULEMON_NYG_FUTURE_STYLES];
const comparisons = Object.fromEntries(styles.map((style) => {
  const matches = matchProducts(style);
  return [style.key, {
    lululemonUnits: matches.reduce((sum, row) => sum + row.units, 0),
    matchedTitles: matches.length,
  }];
}));

const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lululemonStyleComparisonUnits.js",
);
fs.writeFileSync(
  outputPath,
  `// Generated from ${path.basename(workbookPath)}, All product sheet. Do not edit manually.\n` +
    `export const LULULEMON_STYLE_COMPARISON_UNITS = ${JSON.stringify(comparisons, null, 2)};\n`,
  "utf8",
);

const matched = Object.values(comparisons).filter((row) => row.matchedTitles > 0).length;
console.log(`Generated units for ${styles.length} NYG styles; ${matched} matched to All product.`);
