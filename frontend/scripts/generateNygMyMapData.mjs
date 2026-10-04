import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");
const workbookPath = process.argv[2];

if (!workbookPath) {
  throw new Error("Usage: node scripts/generateNygMyMapData.mjs <workbook.xlsx>");
}

const workbook = XLSX.readFile(workbookPath, { cellFormula: true });
const sheetName = workbook.SheetNames.find(
  (name) => name.trim().toLowerCase() === "nyg",
);
if (!sheetName) throw new Error("NYG sheet not found");

const sheetRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
  header: 1,
  defval: "",
});
const fields = [
  ["group", 16],
  ["gender", 20],
  ["businessSegment", 19],
  ["productCategory", 17],
  ["productGroup", 18],
  ["productType", 22],
  ["styleNo", 3],
  ["styleName", 4],
];

function normalizeGender(value, businessSegment) {
  const segment = String(businessSegment || "").trim().toUpperCase();
  if (/^M(?:\s|$)/.test(segment)) return "MEN";
  if (/^W(?:\s|$)/.test(segment)) return "WOMEN";

  const gender = String(value || "").trim().toUpperCase();
  if (gender === "M" || gender === "MEN") return "MEN";
  if (gender === "W" || gender === "WOMEN") return "WOMEN";
  return gender;
}

const aggregatedRows = new Map();
const availableSeasons = new Set();
for (const sourceRow of sheetRows.slice(2)) {
  const row = Object.fromEntries(
    fields.map(([field, columnIndex]) => [field, String(sourceRow[columnIndex] || "").trim()]),
  );
  row.gender = normalizeGender(row.gender, row.businessSegment);
  const season = String(sourceRow[1] || "").trim();
  const status = String(sourceRow[6] || "").trim().toUpperCase();
  if (!season || Object.values(row).some((value) => !value)) continue;

  const key = fields.map(([field]) => row[field]).join("\u001f");
  const current = aggregatedRows.get(key) || {
    ...row,
    seasonMetrics: {},
  };
  const metrics = current.seasonMetrics[season] || { salesRevenue: 0, units: 0, statuses: new Set() };
  metrics.salesRevenue += Number(sourceRow[7]) || 0;
  metrics.units += Number(sourceRow[8]) || 0;
  if (status) metrics.statuses.add(status);
  current.seasonMetrics[season] = metrics;
  availableSeasons.add(season);
  aggregatedRows.set(key, current);
}

const seasonOrder = { SP: 0, SU: 1, FA: 2, WT: 3 };
const sortSeasons = (a, b) => {
  const [, prefixA = "", yearA = "0"] = a.match(/^([A-Z]+)(\d{2})$/) || [];
  const [, prefixB = "", yearB = "0"] = b.match(/^([A-Z]+)(\d{2})$/) || [];
  return Number(yearA) - Number(yearB)
    || (seasonOrder[prefixA] ?? 9) - (seasonOrder[prefixB] ?? 9)
    || a.localeCompare(b);
};
const seasons = [...availableSeasons].sort(sortSeasons);
const rows = [...aggregatedRows.values()].map((row) => ({
  ...Object.fromEntries(fields.map(([field]) => [field, row[field]])),
  seasonMetrics: Object.entries(row.seasonMetrics)
    .sort(([a], [b]) => sortSeasons(a, b))
    .map(([season, metrics]) => ({
      season,
      salesRevenue: metrics.salesRevenue,
      units: metrics.units,
      fobPrice: metrics.units > 0 ? metrics.salesRevenue / metrics.units : 0,
      statuses: [...metrics.statuses].sort((a, b) => a.localeCompare(b)),
    })),
}));
const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/nygMyMapData.js",
);
fs.writeFileSync(
  outputPath,
  `// Generated from ${path.basename(workbookPath)}, NYG sheet. Do not edit manually.\n` +
    `export const NYG_MY_MAP_SEASONS = ${JSON.stringify(seasons, null, 2)};\n` +
    `export const NYG_MY_MAP_ROWS = ${JSON.stringify(rows, null, 2)};\n`,
  "utf8",
);

console.log(
  `Generated ${rows.length} unique paths and ${new Set(rows.map((row) => row.styleNo)).size} unique style numbers.`,
);
