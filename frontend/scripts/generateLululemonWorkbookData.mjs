import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");
const workbookPath = process.argv[2];
if (!workbookPath) {
  throw new Error("Usage: node scripts/generateLululemonWorkbookData.mjs <workbook.xlsx>");
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const subtypeDefinitions = [
  ["jacket", "Jacket", "JACKET"],
  ["short", "Short", "SHORT"],
  ["pullover", "Pullover", "PULLOVER"],
  ["tee", "Tee", "TEE"],
  ["tank-top", "Tank top", "TANK TOP"],
  ["boxer-brief", "Boxer brief", "BOXER BRIEF"],
  ["polo", "Polo", "POLO"],
  ["skirt", "Skirt", "SKIRT"],
  ["pant", "Pant", "PANT"],
  ["button-down", "Button down", "SHIRT BUTTON DOWN"],
];
const subtypeByWorksheetValue = new Map(
  subtypeDefinitions.map(([key, label, worksheetValue]) => [worksheetValue, { key, label }]),
);
subtypeByWorksheetValue.set("JOGGER", { key: "pant", label: "Pant" });

function isDashboardSubtype(worksheetSubtype, targetSubtype) {
  return (
    worksheetSubtype === targetSubtype ||
    (targetSubtype === "PANT" && worksheetSubtype === "JOGGER")
  );
}

function number(value) {
  if (value === "-" || value === null || value === undefined || value === "") return 0;
  return Number(value) || 0;
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

function normalizeFamilyName(value = "") {
  return normalizeName(value).replace(/\s*\*.*$/, "").trim();
}

function compactCurrency(value) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function compactNumber(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.round(value).toLocaleString("en-US");
}

const workbook = XLSX.readFile(workbookPath, { cellFormula: true });
const allProductSheet = workbook.Sheets["All Product"];
const lululemonSheet = workbook.Sheets.Lululemon;
if (!allProductSheet || !lululemonSheet) {
  throw new Error('The workbook must contain "All Product" and "Lululemon" sheets.');
}

const allProducts = XLSX.utils.sheet_to_json(allProductSheet, { defval: "" });
const nygRows = XLSX.utils.sheet_to_json(lululemonSheet, { range: 2, defval: "" });
const walletRows = XLSX.utils.sheet_to_json(workbook.Sheets["Wallet Size & Wallet Share"], {
  defval: "",
});
const walletRow = walletRows.find((row) => row.Brand === "Lululemon") || {};
const fobMultiplier = number(walletRow["FOB Multiple (brand-specific)"]) || 7.11;

const totalSales = allProducts.reduce(
  (sum, row) => sum + number(row["Total Revenue USD (all zones)"]),
  0,
);
const totalUnits = allProducts.reduce(
  (sum, row) => sum + number(row["Total Units (all zones)"]),
  0,
);
const nygSales = nygRows.reduce((sum, row) => sum + number(row["NYG Sale"]), 0);
const nygUnits = nygRows.reduce(
  (sum, row) => sum + number(row["NYG Sale (PCS) - FA25,WT25,SP26,SU26 only"]),
  0,
);

const businessMetrics = [
  {
    icon: "$",
    label: "Total sales*",
    value: compactCurrency(totalSales),
    note: "Apparel sales only; accessories excluded.",
  },
  { icon: "ON", label: "Online sales*", value: compactCurrency(totalSales * 0.3) },
  { icon: "FOB", label: "FOB spend*", value: compactCurrency(totalSales / fobMultiplier) },
  { icon: "U", label: "Total units*", value: compactNumber(totalUnits) },
  { icon: "%", label: "Avg. discount", value: "15.4%" },
  { icon: "#", label: "Product titles", value: allProducts.length.toLocaleString("en-US") },
];

const productTypeTotals = new Map();
for (const row of allProducts) {
  const productType = String(row["Product Type (US sheet)"] || "").trim();
  if (!productType) continue;
  productTypeTotals.set(
    productType,
    (productTypeTotals.get(productType) || 0) + number(row["Total Revenue USD (all zones)"]),
  );
}
const recognizedProductSales = [...productTypeTotals.values()].reduce((sum, value) => sum + value, 0);
const salesMix = ["Bottom", "Outerwear", "Tops", "Underwear"].map((label) => ({
  label: label === "Bottom" ? "Bottoms" : label,
  value: recognizedProductSales ? (productTypeTotals.get(label) / recognizedProductSales) * 100 : 0,
  ...(label === "Underwear" ? { muted: true } : {}),
}));

function aggregateNygRows(rows) {
  return {
    nygSales: rows.reduce((sum, row) => sum + number(row["NYG Sale"]), 0),
    nygUnits: rows.reduce(
      (sum, row) => sum + number(row["NYG Sale (PCS) - FA25,WT25,SP26,SU26 only"]),
      0,
    ),
    nygProducts: rows.length,
    nygFabricYards: rows.reduce(
      (sum, row) => sum + number(row["Total Fabric Value NYG Used (YDS)"]),
      0,
    ),
    nygFabricProducts: rows.filter((row) => number(row["Total Fabric Value NYG Used (YDS)"]) > 0).length,
    nykFabricYards: rows.reduce(
      (sum, row) => sum + number(row["Total NYK Fabric Value Used (YDS)"]),
      0,
    ),
    nykFabricProducts: rows.filter((row) => number(row["Total NYK Fabric Value Used (YDS)"]) > 0).length,
    menSales: rows
      .filter((row) => String(row.Gender).trim().toUpperCase() === "MEN")
      .reduce((sum, row) => sum + number(row["NYG Sale"]), 0),
    womenSales: rows
      .filter((row) => String(row.Gender).trim().toUpperCase() === "WOMEN")
      .reduce((sum, row) => sum + number(row["NYG Sale"]), 0),
  };
}

const comparisons = [
  {
    key: "overall",
    label: "All sub-types",
    lululemonSales: totalSales,
    lululemonUnits: totalUnits,
    lululemonProducts: allProducts.length,
    ...aggregateNygRows(nygRows),
  },
  ...subtypeDefinitions.map(([key, label, worksheetSubtype]) => {
    const productRows = allProducts.filter(
      (row) =>
        isDashboardSubtype(
          String(row["Sub-Type (US sheet)"]).trim().toUpperCase(),
          worksheetSubtype,
        ),
    );
    const matchingNygRows = nygRows.filter(
      (row) =>
        isDashboardSubtype(
          String(row["Sub-Type"]).trim().toUpperCase(),
          worksheetSubtype,
        ),
    );
    return {
      key,
      label,
      lululemonSales: productRows.reduce(
        (sum, row) => sum + number(row["Total Revenue USD (all zones)"]),
        0,
      ),
      lululemonUnits: productRows.reduce(
        (sum, row) => sum + number(row["Total Units (all zones)"]),
        0,
      ),
      lululemonProducts: productRows.length,
      ...aggregateNygRows(matchingNygRows),
    };
  }),
];

function matchPortfolioRows(styleName, subtype) {
  const normalizedStyleName = normalizeName(styleName);
  const exactTitleRows = allProducts.filter(
    (row) =>
      String(row["Sub-Type (US sheet)"]).trim().toUpperCase() === subtype &&
      normalizeName(row["Product Title (Particl)"]) === normalizedStyleName,
  );
  if (exactTitleRows.length) return exactTitleRows;
  const crossSubtypeTitleRows = allProducts.filter(
    (row) => normalizeName(row["Product Title (Particl)"]) === normalizedStyleName,
  );
  if (crossSubtypeTitleRows.length) return crossSubtypeTitleRows;
  const exactBaseRows = allProducts.filter(
    (row) =>
      String(row["Sub-Type (US sheet)"]).trim().toUpperCase() === subtype &&
      normalizeName(row["Base Style (title before *)"]) === normalizedStyleName,
  );
  if (exactBaseRows.length) return exactBaseRows;
  return allProducts.filter(
    (row) => normalizeName(row["Base Style (title before *)"]) === normalizedStyleName,
  );
}

const styles = nygRows.map((row, index) => {
  const worksheetSubtype = String(row["Sub-Type"] || "").trim().toUpperCase();
  const subtype = subtypeByWorksheetValue.get(worksheetSubtype)?.key || "tee";
  const portfolioRows = matchPortfolioRows(row.Name, worksheetSubtype);
  const matchedWorksheetSubtype = String(
    portfolioRows[0]?.["Sub-Type (US sheet)"] || worksheetSubtype,
  ).trim().toUpperCase();
  const masterSubtype = subtypeByWorksheetValue.get(matchedWorksheetSubtype)?.key;
  return {
    key: `style-${index + 1}`,
    subtype,
    ...(masterSubtype && masterSubtype !== subtype ? { masterSubtype } : {}),
    name: String(row.Name || "").trim(),
    gender: String(row.Gender || "Women").trim().toLowerCase() === "men" ? "Men" : "Women",
    season: String(row.Season || "").trim(),
    nygSales: number(row["NYG Sale"]),
    nygUnits: number(row["NYG Sale (PCS) - FA25,WT25,SP26,SU26 only"]),
    walletSize: number(row["Brand Wallet Size"]),
    walletShare: number(row["NYG Wallet Share %"]),
    walletRevenue: number(row.Total),
    fobMultiplier: number(row["FOB Multiplier"]) || fobMultiplier,
    lululemonRevenue: portfolioRows.reduce(
      (sum, product) => sum + number(product["Total Revenue USD (all zones)"]),
      0,
    ),
    lululemonTitles: portfolioRows.length,
  };
});

const opportunities = {};
const coverage = [];
for (const [subtypeKey, , worksheetSubtype] of subtypeDefinitions) {
  const securedForSubtype = styles.filter((style) => style.subtype === subtypeKey);
  const securedNames = new Set(securedForSubtype.map((style) => normalizeFamilyName(style.name)));
  const groupedStyles = new Map();
  for (const row of allProducts) {
    if (
      !isDashboardSubtype(
        String(row["Sub-Type (US sheet)"]).trim().toUpperCase(),
        worksheetSubtype,
      )
    ) continue;
    const name = row["Base Style (title before *)"] || row["Product Title (Particl)"];
    const normalizedName = normalizeFamilyName(name);
    if (!normalizedName || securedNames.has(normalizedName)) continue;
    const current = groupedStyles.get(normalizedName) || { name, sales: 0 };
    current.sales += number(row["Total Revenue USD (all zones)"]);
    groupedStyles.set(normalizedName, current);
  }
  opportunities[subtypeKey] = [...groupedStyles.values()].sort(
    (left, right) => right.sales - left.sales,
  );
  coverage.push({
    key: subtypeKey,
    secured: securedForSubtype.length,
    matchedWithinSubtype: securedForSubtype.filter((style) => style.lululemonTitles > 0).length,
    remaining: opportunities[subtypeKey].length,
    total: securedForSubtype.length + opportunities[subtypeKey].length,
  });
}

const sourceName = path.basename(workbookPath);
const generatedHeader = `// Generated from ${sourceName}. Do not edit manually.\n`;
fs.writeFileSync(
  path.resolve(scriptDirectory, "../src/lululemonWorkbookData.js"),
  `${generatedHeader}export const LULULEMON_FOB_MULTIPLIER = ${fobMultiplier};\n` +
    `export const LULULEMON_BUSINESS_METRICS = ${JSON.stringify(businessMetrics, null, 2)};\n` +
    `export const LULULEMON_SALES_MIX = ${JSON.stringify(salesMix, null, 2)};\n` +
    `export const LULULEMON_NYG_COMPARISON = ${JSON.stringify(comparisons, null, 2)};\n`,
  "utf8",
);
fs.writeFileSync(
  path.resolve(scriptDirectory, "../src/lululemonNygStyles.js"),
  `${generatedHeader}export const LULULEMON_NYG_STYLES = ${JSON.stringify(styles, null, 2)};\n` +
    `export const LULULEMON_STYLE_COVERAGE = ${JSON.stringify(coverage, null, 2)};\n`,
  "utf8",
);
fs.writeFileSync(
  path.resolve(scriptDirectory, "../src/lululemonOpportunities.js"),
  `${generatedHeader}export const LULULEMON_REMAINING_OPPORTUNITIES = ${JSON.stringify(opportunities, null, 2)};\n`,
  "utf8",
);

const unmatchedStyles = styles.filter((style) => style.lululemonTitles === 0);
console.log(
  `Generated ${allProducts.length} products, ${styles.length} NYG styles, ` +
    `${compactCurrency(totalSales)}, ${compactNumber(totalUnits)} units, FOB ${fobMultiplier.toFixed(4)}x.`,
);
console.log(
  unmatchedStyles.length
    ? `Unmatched NYG styles (${unmatchedStyles.length}): ${unmatchedStyles.map((style) => style.name).join(" | ")}`
    : "All NYG styles matched to All Product.",
);
