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
const snapshotData = JSON.parse(
  fs.readFileSync(path.resolve(scriptDirectory, "../src/snapshotData.json"), "utf8"),
);
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
  ["jogger", "Jogger", "JOGGER"],
  ["button-down", "Button down", "SHIRT BUTTON DOWN"],
];
const subtypeByWorksheetValue = new Map(
  subtypeDefinitions.map(([key, label, worksheetValue]) => [worksheetValue, { key, label }]),
);
function isDashboardSubtype(worksheetSubtype, targetSubtype) {
  return worksheetSubtype === targetSubtype;
}

function number(value) {
  if (value === "-" || value === null || value === undefined || value === "") return 0;
  return Number(value) || 0;
}

function firstValue(row, keys) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function findSheet(workbook, expectedName) {
  const sheetName = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === expectedName.trim().toLowerCase(),
  );
  return sheetName ? workbook.Sheets[sheetName] : undefined;
}

function allProductRevenue(row) {
  return number(firstValue(row, ["Total Revenue USD (all zones)", "Total USD", "Total"]));
}

function allProductUnits(row) {
  return number(firstValue(row, [
    "Total Units (all zones)",
    "Total Units (quantity, preserved)",
    "Total Units ",
  ]));
}

function allProductType(row) {
  return String(firstValue(row, ["Product Type (US sheet)", "Product Type"])).trim();
}

function allProductSubtype(row) {
  return String(firstValue(row, ["Sub-Type (US sheet)", "Sub-Type"])).trim().toUpperCase();
}

function allProductTitle(row) {
  return String(row["Product Title (Particl)"] || "").trim();
}

function allProductBaseStyle(row) {
  return String(row["Base Style (title before *)"] || allProductTitle(row)).trim();
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

function normalizeAudienceName(value = "") {
  return normalizeName(value)
    .replace(/\b(?:women'?s|men'?s)\b/g, "")
    .replace(/\b(?:23|25|26|27|28|29|30|31|32|34|35|36)l?\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const womenStyleTerms = [
  "high rise", "mid rise", "super high rise", "low rise", "align", "wunder",
  "groove", "dance studio", "softstreme", "swift speed", "fast and free",
  "tight", "legging", "flare", "flared", "palazzo", "wide leg", "barrel leg",
  "city sleek", "adapted state", "ready to rulu", "nulu", "skirt", "bra",
];
const menStyleTerms = [
  "abc", "slim fit", "classic fit", "relaxed fit", "zeroed in", "commission",
  "utilitech", "golf", "jogger", "trouser", "license to train", "pace breaker",
  "steady state", "smooth spacer", "balancer", "surge", "bowline", "boxer", "polo",
];
const scrapedAudienceByStyle = new Map();
for (const product of snapshotData.brands?.lululemon?.dashboard?.products || []) {
  const name = normalizeAudienceName(product.title);
  if (!scrapedAudienceByStyle.has(name)) scrapedAudienceByStyle.set(name, new Set());
  (product.audience_labels || [])
    .filter((gender) => gender === "Men" || gender === "Women")
    .forEach((gender) => scrapedAudienceByStyle.get(name).add(gender));
}

function inferAllProductGender(row) {
  const title = allProductTitle(row);
  const normalizedName = normalizeAudienceName(title);
  const matchedGenders = scrapedAudienceByStyle.get(normalizedName) || new Set();
  if (matchedGenders.size === 1) return [...matchedGenders][0];
  if (/\bwomen'?s\b/i.test(title)) return "Women";
  if (/\bmen'?s\b/i.test(title)) return "Men";
  if (womenStyleTerms.some((term) => normalizedName.includes(term))) return "Women";
  if (menStyleTerms.some((term) => normalizedName.includes(term))) return "Men";
  const subtype = allProductSubtype(row);
  if (subtype === "SKIRT" || subtype === "TANK TOP") return "Women";
  if (subtype === "BOXER BRIEF") return "Men";
  return "Unclassified";
}

function aggregateLululemonGenderSales(rows) {
  const totals = { Men: 0, Women: 0, Unclassified: 0 };
  rows.forEach((row) => {
    totals[inferAllProductGender(row)] += allProductRevenue(row);
  });
  return {
    lululemonMenSales: totals.Men,
    lululemonWomenSales: totals.Women,
    lululemonUnclassifiedSales: totals.Unclassified,
  };
}

function displayFamilyName(value = "") {
  return String(value)
    .replace(/\s*\*.*$/, "")
    .replace(/\s+\b(?:23|25|26|27|28|29|30|31|32|34|35|36|37)(?:L)?(?:\s*(?:in|inch(?:es)?)|")?(?=\s|$)/gi, "")
    .replace(/\s+\b(?:Tall|Regular|Shorter)\b$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFamilyName(value = "") {
  return normalizeName(displayFamilyName(value));
}

function classifyNygSubtype(row) {
  const worksheetSubtype = String(row["Sub-Type"] || "").trim().toUpperCase();
  return /\bjogger\b/.test(normalizeName(row.Name)) ? "JOGGER" : worksheetSubtype;
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
const allProductSheet = findSheet(workbook, "All Product");
const lululemonSheet = findSheet(workbook, "Lululemon");
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
  (sum, row) => sum + allProductRevenue(row),
  0,
);
const totalUnits = allProducts.reduce(
  (sum, row) => sum + allProductUnits(row),
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
  const productType = allProductType(row);
  if (!productType) continue;
  productTypeTotals.set(
    productType,
    (productTypeTotals.get(productType) || 0) + allProductRevenue(row),
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

function averageFobMultiplier(rows) {
  const multipliers = rows
    .map((row) => number(row["FOB Multiplier"]))
    .filter((value) => value > 0);
  return multipliers.length > 0
    ? multipliers.reduce((sum, value) => sum + value, 0) / multipliers.length
    : fobMultiplier;
}

const comparisons = [
  {
    key: "overall",
    label: "All sub-types",
    lululemonSales: totalSales,
    lululemonUnits: totalUnits,
    lululemonProducts: allProducts.length,
    fobMultiplier,
    ...aggregateLululemonGenderSales(allProducts),
    ...aggregateNygRows(nygRows),
  },
  ...subtypeDefinitions.map(([key, label, worksheetSubtype]) => {
    const productRows = allProducts.filter(
      (row) =>
        isDashboardSubtype(
          allProductSubtype(row),
          worksheetSubtype,
        ),
    );
    const matchingNygRows = nygRows.filter(
      (row) => isDashboardSubtype(classifyNygSubtype(row), worksheetSubtype),
    );
    return {
      key,
      label,
      lululemonSales: productRows.reduce(
        (sum, row) => sum + allProductRevenue(row),
        0,
      ),
      lululemonUnits: productRows.reduce(
        (sum, row) => sum + allProductUnits(row),
        0,
      ),
      lululemonProducts: productRows.length,
      fobMultiplier: averageFobMultiplier(matchingNygRows),
      ...aggregateLululemonGenderSales(productRows),
      ...aggregateNygRows(matchingNygRows),
    };
  }),
];

function matchPortfolioRows(styleName, subtype) {
  const literalStyleName = String(styleName || "").trim().toLowerCase();
  const literalTitleRows = allProducts.filter(
    (row) =>
      allProductSubtype(row) === subtype &&
      allProductTitle(row).toLowerCase() === literalStyleName,
  );
  if (literalTitleRows.length) return literalTitleRows;
  const crossSubtypeLiteralRows = allProducts.filter(
    (row) => allProductTitle(row).toLowerCase() === literalStyleName,
  );
  if (crossSubtypeLiteralRows.length) return crossSubtypeLiteralRows;
  const normalizedStyleName = normalizeName(styleName);
  const exactTitleRows = allProducts.filter(
    (row) =>
      allProductSubtype(row) === subtype &&
      normalizeName(allProductTitle(row)) === normalizedStyleName,
  );
  if (exactTitleRows.length) return exactTitleRows;
  const crossSubtypeTitleRows = allProducts.filter(
    (row) => normalizeName(allProductTitle(row)) === normalizedStyleName,
  );
  if (crossSubtypeTitleRows.length) return crossSubtypeTitleRows;
  const exactBaseRows = allProducts.filter(
    (row) =>
      allProductSubtype(row) === subtype &&
      normalizeName(allProductBaseStyle(row)) === normalizedStyleName,
  );
  if (exactBaseRows.length) return exactBaseRows;
  return allProducts.filter(
    (row) => normalizeName(allProductBaseStyle(row)) === normalizedStyleName,
  );
}

const styles = nygRows.map((row, index) => {
  const worksheetSubtype = classifyNygSubtype(row);
  const subtype = subtypeByWorksheetValue.get(worksheetSubtype)?.key || "tee";
  const portfolioRows = matchPortfolioRows(row.Name, worksheetSubtype);
  const matchedWorksheetSubtype = String(
    (portfolioRows[0] ? allProductSubtype(portfolioRows[0]) : "") || worksheetSubtype,
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
    nygFabricYards: number(row["Total Fabric Value NYG Used (YDS)"]),
    nykFabricYards: number(row["Total NYK Fabric Value Used (YDS)"]),
    walletSize: number(row["Brand Wallet Size"]),
    walletShare: number(row["NYG Wallet Share %"]),
    walletRevenue: number(row.Total),
    fobMultiplier: number(row["FOB Multiplier"]) || fobMultiplier,
    lululemonRevenue: portfolioRows.reduce(
      (sum, product) => sum + allProductRevenue(product),
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
  let rawRemaining = 0;
  for (const row of allProducts) {
    if (
      !isDashboardSubtype(
        allProductSubtype(row),
        worksheetSubtype,
      )
    ) continue;
    const name = allProductBaseStyle(row) || allProductTitle(row);
    const normalizedName = normalizeFamilyName(name);
    if (!normalizedName || securedNames.has(normalizedName)) continue;
    rawRemaining += 1;
    const current = groupedStyles.get(normalizedName) || {
      name: displayFamilyName(name),
      sales: 0,
      variants: 0,
    };
    current.sales += allProductRevenue(row);
    current.variants += 1;
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
    ...(rawRemaining > opportunities[subtypeKey].length
      ? {
          rawRemaining,
          consolidatedVariants: rawRemaining - opportunities[subtypeKey].length,
        }
      : {}),
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
