import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import { LULULEMON_NYG_STYLES } from "../src/lululemonNygStyles.js";
import { LULULEMON_REMAINING_OPPORTUNITIES } from "../src/lululemonOpportunities.js";

const workbookPath = process.argv[2];
if (!workbookPath) {
  throw new Error("Pass the updated Lululemon workbook path as the first argument.");
}

const futureSeasons = ["FA26", "WT26", "SU27", "SP27"];
const futureSeasonSet = new Set(futureSeasons);
const subtypeKeys = new Set([
  "jacket",
  "short",
  "pullover",
  "tee",
  "tank-top",
  "boxer-brief",
  "polo",
  "skirt",
  "pant",
  "jogger",
  "button-down",
]);

function normalizeName(value = "") {
  return value
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/^lululemon\s+/, "")
    .replace(/\b(?:women'?s|men'?s)\b/g, "")
    .replace(/\b(?:23|25|26|27|28|29|30|31|32|34|35|36)(?:\s*(?:in|inch(?:es)?|"))?\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function inferGender(styleCode) {
  const normalizedCode = String(styleCode || "").trim().toUpperCase();
  if (normalizedCode.startsWith("LM")) return "Men";
  if (normalizedCode.startsWith("LW")) return "Women";
  return "Women";
}

function inferSubtype(productType, name) {
  const normalizedType = String(productType || "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
  const aliases = {
    "tank-top": "tank-top",
    "boxer-brief": "boxer-brief",
    "shirt-button-down": "button-down",
  };
  const directType = aliases[normalizedType] || normalizedType;
  if (subtypeKeys.has(directType)) return directType;

  const normalizedName = normalizeName(name);
  if (/jacket|coat/.test(normalizedName)) return "jacket";
  if (/boxer|brief/.test(normalizedName)) return "boxer-brief";
  if (/button up|button down|overshirt/.test(normalizedName)) return "button-down";
  if (/jogger/.test(normalizedName)) return "jogger";
  if (/short/.test(normalizedName)) return "short";
  if (/pant|trouser|tight/.test(normalizedName)) return "pant";
  if (/skirt/.test(normalizedName)) return "skirt";
  if (/tank/.test(normalizedName)) return "tank-top";
  if (/polo/.test(normalizedName)) return "polo";
  if (/hoodie|half zip|pullover|sweatshirt|crew/.test(normalizedName)) return "pullover";
  return "tee";
}

const existingByNameAndGender = new Map(
  LULULEMON_NYG_STYLES.map((style) => [
    `${normalizeName(style.name)}|${style.gender}`,
    style,
  ]),
);
const opportunitiesByName = new Map(
  Object.values(LULULEMON_REMAINING_OPPORTUNITIES)
    .flat()
    .map((style) => [normalizeName(style.name), style]),
);

const workbook = XLSX.readFile(workbookPath);
const rawSheet = workbook.Sheets["Raw Data"];
if (!rawSheet) throw new Error('The workbook does not contain a "Raw Data" sheet.');

const rows = XLSX.utils.sheet_to_json(rawSheet, { defval: "" });
const groupedStyles = new Map();

for (const row of rows) {
  const season = String(row.Season || "").trim().toUpperCase();
  if (!futureSeasonSet.has(season)) continue;

  const name = String(row["Commercial Name"] || row.Name || row.Style || "").trim();
  if (!name) continue;
  const gender = inferGender(row.Style);
  const normalizedName = normalizeName(name);
  const groupKey = `${normalizedName}|${gender}`;
  const existing = existingByNameAndGender.get(groupKey);
  const style = groupedStyles.get(groupKey) || {
    name,
    gender,
    subtype: existing?.subtype || inferSubtype(row["Product Type"], name),
    masterSubtype: existing?.masterSubtype,
    seasons: new Set(),
    styleCodes: new Set(),
    nygSales: 0,
    nygUnits: 0,
    workbookRevenue: 0,
  };

  style.seasons.add(season);
  if (row.Style) style.styleCodes.add(String(row.Style).trim());
  style.nygSales += Number(row.sales_revenue) || 0;
  style.nygUnits += Number(row.PCS) || 0;
  style.workbookRevenue = Math.max(style.workbookRevenue, Number(row.Revenue_Status) || 0);
  groupedStyles.set(groupKey, style);
}

const generatedStyles = [...groupedStyles.values()]
  .map((style, index) => {
    const existing = existingByNameAndGender.get(`${normalizeName(style.name)}|${style.gender}`);
    const opportunity = opportunitiesByName.get(normalizeName(style.name));
    return {
      key: `future-style-${index + 1}`,
      period: "future",
      subtype: style.subtype,
      ...(style.masterSubtype ? { masterSubtype: style.masterSubtype } : {}),
      name: style.name,
      gender: style.gender,
      season: futureSeasons.filter((season) => style.seasons.has(season)).join(", "),
      styleCodes: [...style.styleCodes].sort(),
      nygSales: Number(style.nygSales.toFixed(2)),
      nygUnits: Math.round(style.nygUnits),
      lululemonRevenue:
        existing?.lululemonRevenue || opportunity?.sales || style.workbookRevenue || 0,
      lululemonTitles: existing?.lululemonTitles || opportunity?.variants || 1,
    };
  })
  .sort((left, right) => right.nygSales - left.nygSales);

const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lululemonNygFutureStyles.js",
);
const sourceName = path.basename(workbookPath);
const output = `// Generated from ${sourceName}, Raw Data.\nexport const LULULEMON_NYG_FUTURE_STYLES = ${JSON.stringify(generatedStyles, null, 2)};\n`;
fs.writeFileSync(outputPath, output, "utf8");

const totals = generatedStyles.reduce(
  (summary, style) => {
    summary.sales += style.nygSales;
    summary.units += style.nygUnits;
    summary[style.gender] += 1;
    return summary;
  },
  { sales: 0, units: 0, Men: 0, Women: 0 },
);
console.log(
  `Generated ${generatedStyles.length} future style rows (${totals.Men} Men, ${totals.Women} Women), ` +
    `$${totals.sales.toFixed(2)} and ${totals.units} units.`,
);
