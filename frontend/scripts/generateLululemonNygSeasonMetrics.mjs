import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import { LULULEMON_NYG_STYLES } from "../src/lululemonNygStyles.js";
import { LULULEMON_NYG_FUTURE_STYLES } from "../src/lululemonNygFutureStyles.js";

const workbookPath = process.argv[2];
if (!workbookPath) {
  throw new Error("Usage: node scripts/generateLululemonNygSeasonMetrics.mjs <workbook.xlsx>");
}

const seasonOrder = [
  "FA25",
  "WT25",
  "SP26",
  "SU26",
  "FA26",
  "WT26",
  "SP27",
  "SU27",
  "FA27",
  "WT27",
];

function exactName(value = "") {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function styleSeasons(style) {
  return String(style.season || "")
    .split(",")
    .map((season) => season.trim().toUpperCase())
    .filter(Boolean);
}

const workbook = XLSX.readFile(workbookPath);
const sheetName = workbook.SheetNames.find((name) => name.trim().toLowerCase() === "nyg");
if (!sheetName) throw new Error('The workbook does not contain an "NYG" sheet.');

const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { range: 1, defval: "" });
const styles = [...LULULEMON_NYG_STYLES, ...LULULEMON_NYG_FUTURE_STYLES];
const mismatches = [];

const seasonMetrics = Object.fromEntries(styles.map((style) => {
  const seasons = styleSeasons(style);
  const seasonSet = new Set(seasons);
  const styleCodes = new Set((style.styleCodes || []).map((code) => String(code).trim()));
  const matchingRows = rows.filter((row) => {
    const rowSeason = String(row.Season || "").trim().toUpperCase();
    if (!seasonSet.has(rowSeason)) return false;
    if (styleCodes.size > 0) return styleCodes.has(String(row.Style || "").trim());
    return exactName(row["Commercial Name"] || row.Name) === exactName(style.name);
  });
  const metrics = seasons.map((season) => {
    const seasonRows = matchingRows.filter(
      (row) => String(row.Season || "").trim().toUpperCase() === season,
    );
    return {
      season,
      nygSales: Number(seasonRows
        .reduce((sum, row) => sum + (Number(row.sales_revenue) || 0), 0)
        .toFixed(2)),
      nygUnits: Math.round(seasonRows.reduce((sum, row) => sum + (Number(row.PCS) || 0), 0)),
    };
  }).sort((left, right) => seasonOrder.indexOf(left.season) - seasonOrder.indexOf(right.season));

  const salesTotal = metrics.reduce((sum, metric) => sum + metric.nygSales, 0);
  const unitTotal = metrics.reduce((sum, metric) => sum + metric.nygUnits, 0);
  if (Math.abs(salesTotal - style.nygSales) > 0.02 || unitTotal !== style.nygUnits) {
    mismatches.push({
      key: style.key,
      name: style.name,
      expectedSales: style.nygSales,
      actualSales: salesTotal,
      expectedUnits: style.nygUnits,
      actualUnits: unitTotal,
    });
  }
  return [style.key, metrics];
}));

if (mismatches.length > 0) {
  throw new Error(`Season metrics do not reconcile:\n${JSON.stringify(mismatches, null, 2)}`);
}

const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lululemonNygSeasonMetrics.js",
);
const sourceName = path.basename(workbookPath);
const output = `// Generated from ${sourceName}, NYG sheet. Do not edit manually.\n` +
  `export const LULULEMON_NYG_SEASON_METRICS = ${JSON.stringify(seasonMetrics, null, 2)};\n`;
fs.writeFileSync(outputPath, output, "utf8");

console.log(`Generated reconciled season metrics for ${styles.length} NYG styles.`);
