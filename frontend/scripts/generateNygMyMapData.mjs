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
  ["businessSegment", 19],
  ["productCategory", 17],
  ["productGroup", 18],
  ["productType", 22],
  ["styleNo", 3],
  ["styleName", 4],
];

const aggregatedRows = new Map();
for (const sourceRow of sheetRows.slice(2)) {
  const row = Object.fromEntries(
    fields.map(([field, columnIndex]) => [field, String(sourceRow[columnIndex] || "").trim()]),
  );
  if (Object.values(row).some((value) => !value)) continue;

  const key = fields.map(([field]) => row[field]).join("\u001f");
  const current = aggregatedRows.get(key) || {
    ...row,
    salesRevenue: 0,
    units: 0,
  };
  current.salesRevenue += Number(sourceRow[7]) || 0;
  current.units += Number(sourceRow[8]) || 0;
  aggregatedRows.set(key, current);
}

const rows = [...aggregatedRows.values()].map((row) => ({
  ...row,
  fobPrice: row.units > 0 ? row.salesRevenue / row.units : 0,
}));
const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/nygMyMapData.js",
);
fs.writeFileSync(
  outputPath,
  `// Generated from ${path.basename(workbookPath)}, NYG sheet. Do not edit manually.\n` +
    `export const NYG_MY_MAP_ROWS = ${JSON.stringify(rows, null, 2)};\n`,
  "utf8",
);

console.log(
  `Generated ${rows.length} unique paths and ${new Set(rows.map((row) => row.styleNo)).size} unique style numbers.`,
);
