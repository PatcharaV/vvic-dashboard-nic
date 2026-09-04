import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Treemap,
} from "recharts";
import { demoDashboard, demoOptions } from "./demoData";
import snapshotData from "./snapshotData.json";

const COLORS = [
  "#ef3e42",
  "#101820",
  "#f5a623",
  "#4976ba",
  "#6f5bd3",
  "#2f9e74",
  "#d76596",
  "#866143",
  "#6c7a89",
  "#a8b400",
  "#00a3a3",
  "#9b59b6",
];

const DEFAULT_BRAND_OPTIONS = [
  { value: "strauss", label: "Strauss" },
  { value: "rhone", label: "Rhone" },
  { value: "arcteryx", label: "Arc'Teryx" },
  { value: "lululemon", label: "lululemon" },
  { value: "tommybahama", label: "Tommy Bahama" },
  { value: "travismathew", label: "TravisMathew" },
];

const BRAND_WORKSPACE_PAGES = [
  { value: "profile", label: "Brand Profile" },
  { value: "wallet", label: "Brand Wallet Shared" },
  { value: "product", label: "Product Dashboard" },
];

const PROFILE_WORKSPACE_BRANDS = new Set(["arcteryx", "travismathew"]);

const BRAND_LOGOS = {
  strauss: { mark: "S", wordmark: "STRAUSS", subline: "WORKWEAR", src: "/brand-logos/strauss.png" },
  rhone: { mark: "R", wordmark: "RHONE", subline: "PERFORMANCE", src: "/brand-logos/rhone.png" },
  arcteryx: { mark: "ARC", wordmark: "ARC'TERYX", subline: "OUTDOOR", src: "/brand-logos/arcteryx.svg" },
  lululemon: { mark: "L", wordmark: "LULULEMON", subline: "ATHLETIC", src: "/brand-logos/lululemon.svg" },
  tommybahama: { mark: "TB", wordmark: "TOMMY BAHAMA", subline: "ISLAND", src: "/brand-logos/tommy-bahama.svg" },
  travismathew: { mark: "TM", wordmark: "TRAVISMATHEW", subline: "GOLF", src: "/brand-logos/travismathew.svg" },
};

const ARCTERYX_PROFILE_STATS = [
  { value: "59.2%", label: "Male visitors" },
  { value: "40.8%", label: "Female visitors" },
  { value: "25-45", label: "Core age range" },
  { value: "#1 US", label: "Top traffic market" },
  { value: "$80-110", label: "T-shirt price band" },
  { value: "$6.57B", label: "Amer Sports revenue, FY2025" },
];

const ARCTERYX_PROFILE_POINTS = [
  {
    title: "Lifestyle",
    text: "Hiking, climbing, skiing, snowboarding and mountaineering, with gear expected to hold up in rugged conditions.",
  },
  {
    title: "Fashion preference",
    text: "Function and performance first, while the clean, minimalist technical aesthetic still matters.",
  },
  {
    title: "Brand loyalty",
    text: "Strong repeat trust in quality and innovation across successive outdoor adventures.",
  },
  {
    title: "Values",
    text: "Sustainability, durability and ethical manufacturing influence purchase decisions.",
  },
];

const ARCTERYX_COMPETITORS = [
  { brand: "Arc'teryx", price: "$80-$110", gender: "59% / 41%", satisfaction: "4/5", revenue: "$760.6M" },
  { brand: "Columbia", price: "$28-$50", gender: "42% / 58%", satisfaction: "4/5", revenue: "$3,400M" },
  { brand: "The North Face", price: "$30-$45", gender: "53% / 47%", satisfaction: "5/5", revenue: "$11,600M" },
  { brand: "Moncler", price: "$345-$440", gender: "53% / 47%", satisfaction: "3/5", revenue: "$2,200M" },
  { brand: "Patagonia", price: "$55-$89", gender: "51% / 49%", satisfaction: "4/5", revenue: "$1,700M" },
];

const TRAVISMATHEW_PROFILE_STATS = [
  { value: "56.0%", label: "Male visitors" },
  { value: "44.0%", label: "Female visitors" },
  { value: "35-54", label: "Core age range" },
  { value: "#1 US", label: "Top traffic market" },
  { value: "$89.95-119.95", label: "Polo price band" },
  { value: "$685M", label: "Apparel / Gear / Other net sales, FY2025" },
];

const TRAVISMATHEW_PROFILE_POINTS = [
  {
    title: "Lifestyle",
    text: "Golf-centered, plus hiking, tennis and fitness. Wants pieces that move from the course to everyday wear.",
  },
  {
    title: "Fashion preference",
    text: "Athletic-inspired with a contemporary twist: clean lines, modern cuts and casual sophistication.",
  },
  {
    title: "Brand loyalty",
    text: "Loyal to the brand's reputation for high-quality materials and innovative design.",
  },
  {
    title: "Values",
    text: "Comfort, functionality and performance drive the purchase decision as much as style.",
  },
];

const TRAVISMATHEW_COMPETITORS = [
  { brand: "TravisMathew", price: "$89.95-$119.95", gender: "62% / 38%", satisfaction: "4/5", revenue: "$300M" },
  { brand: "Peter Millar", price: "$98-$225", gender: "57% / 43%", satisfaction: "4/5", revenue: "$175M" },
  { brand: "FootJoy (FJ)", price: "$78-$145", gender: "72% / 28%", satisfaction: "4/5", revenue: "$618M" },
  { brand: "TaylorMade", price: "$110-$188", gender: "72% / 28%", satisfaction: "4/5", revenue: "$1,100M" },
  { brand: "Rhoback", price: "$96-$98", gender: "53% / 47%", satisfaction: "5/5", revenue: "$17.6M" },
];

const BRAND_ROUTES = new Set(DEFAULT_BRAND_OPTIONS.map((brand) => brand.value));

function mergeBrandOptions(options = []) {
  const merged = new Map(DEFAULT_BRAND_OPTIONS.map((brand) => [brand.value, brand]));
  for (const brand of options) {
    if (brand?.value) {
      merged.set(brand.value, { ...merged.get(brand.value), ...brand });
    }
  }
  return DEFAULT_BRAND_OPTIONS.map((brand) => merged.get(brand.value) || brand);
}

function snapshotForBrand(brand) {
  return brand ? snapshotData.brands?.[brand] : null;
}

function snapshotMessage(brand, options = DEFAULT_BRAND_OPTIONS) {
  const label =
    options.find((item) => item.value === brand)?.label ||
    DEFAULT_BRAND_OPTIONS.find((item) => item.value === brand)?.label ||
    "brand";
  return `Cached snapshot for ${label}`;
}

function BrandLogo({ brand }) {
  const logo = BRAND_LOGOS[brand.value] || {
    mark: brand.label.slice(0, 2).toUpperCase(),
    wordmark: brand.label,
  };

  return (
    <span className={`brand-card-logo brand-logo-${brand.value}`} aria-label={`${brand.label} logo`}>
      <span className="brand-card-logo-mark">{logo.mark}</span>
      <span className="brand-card-logo-copy">
        <span className="brand-card-logo-wordmark">{logo.wordmark}</span>
        <span className="brand-card-logo-subline">{logo.subline}</span>
      </span>
    </span>
  );
}

function BrandHeroLogo({ brand }) {
  const logo = BRAND_LOGOS[brand.value] || {
    mark: brand.label.slice(0, 2).toUpperCase(),
    wordmark: brand.label,
    subline: "BRAND",
  };

  return (
    <span className={`brand-hero-logo brand-logo-${brand.value}`} aria-label={`${brand.label} logo`}>
      <img className="brand-hero-logo-image" src={logo.src} alt={`${brand.label} logo`} />
    </span>
  );
}

function ArcteryxBrandProfile() {
  return (
    <section className="panel arcteryx-profile">
      <div className="profile-hero">
        <div>
          <p className="eyebrow">FIELD BRIEF - 01 / OUTDOOR TECHNICAL APPAREL</p>
          <h2>Who shows up on the Arc&apos;teryx trailhead.</h2>
          <p>
            A read on the customer base, competitive set and category economics
            behind Arc&apos;teryx, built for NYTG fabric portfolio pitch prep.
          </p>
        </div>
        <a
          className="profile-download"
          href="/brand-profiles/arcteryx-profile.pptx"
          download
        >
          Download source deck
        </a>
      </div>

      <div className="profile-stat-grid">
        {ARCTERYX_PROFILE_STATS.map((stat) => (
          <div className="profile-stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="profile-grid">
        <article className="profile-card wide">
          <p className="eyebrow">01 - Profile</p>
          <h3>An adventurous, functionality-first buyer.</h3>
          <div className="profile-point-grid">
            {ARCTERYX_PROFILE_POINTS.map((point) => (
              <div className="profile-point" key={point.title}>
                <strong>{point.title.slice(0, 1)}</strong>
                <div>
                  <h4>{point.title}</h4>
                  <p>{point.text}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="profile-card">
          <p className="eyebrow">02 - Demographics</p>
          <h3>Traffic still peaks at 25-34.</h3>
          <p>
            Similarweb&apos;s public view confirms 25-34 as the leading age
            bracket for arcteryx.com. Exact per-bracket shares are not
            published publicly, so age bars in the source deck are directional.
          </p>
        </article>

        <article className="profile-card">
          <p className="eyebrow">04 - Parent Company</p>
          <h3>Amer Sports revenue nearly tripled since 2020.</h3>
          <p>
            Technical Apparel, the segment housing Arc&apos;teryx, led the mix
            shift from 28.0% in 2020 to 43.5% in 2025.
          </p>
        </article>
      </div>

      <article className="profile-card">
        <p className="eyebrow">03 - Competitive Set</p>
        <h3>Premium price, mid-pack satisfaction.</h3>
        <div className="profile-table-wrap">
          <table className="profile-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>T-shirt price</th>
                <th>Gender ratio (M/F)</th>
                <th>Satisfaction</th>
                <th>Revenue Y2022</th>
              </tr>
            </thead>
            <tbody>
              {ARCTERYX_COMPETITORS.map((row) => (
                <tr key={row.brand}>
                  <td>{row.brand}</td>
                  <td>{row.price}</td>
                  <td>{row.gender}</td>
                  <td>{row.satisfaction}</td>
                  <td>{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="profile-summary-card">
        <p className="eyebrow">Summary</p>
        <h3>Premium, performance-first and scaling fast.</h3>
        <p>
          Arc&apos;teryx buyers are 25-45, middle-to-upper income and willing to
          pay a premium for technical apparel. The brand has room to
          differentiate further on fabric performance while Amer Sports&apos;
          Technical Apparel segment continues to scale.
        </p>
        <small>
          Data noted in source deck: Similarweb 2025, Amer Sports SEC filings
          and Thingtesting.
        </small>
      </article>
    </section>
  );
}

function TravisMathewBrandProfile() {
  return (
    <section className="panel arcteryx-profile travismathew-profile">
      <div className="profile-hero travismathew-profile-hero">
        <div>
          <p className="eyebrow">FIELD BRIEF - 02 / GOLF & ACTIVE LIFESTYLE APPAREL</p>
          <h2>Who&apos;s on the TravisMathew back nine.</h2>
          <p>
            A read on the customer base, competitive set and category economics
            behind TravisMathew, built for NYTG fabric portfolio pitch prep.
          </p>
        </div>
        <a
          className="profile-download"
          href="/brand-profiles/travismathew-intel.pptx"
          download
        >
          Download source deck
        </a>
      </div>

      <article className="profile-brand-dna">
        <p className="eyebrow">Brand DNA</p>
        <h3>Laidback performance, built course-to-street.</h3>
        <p>
          Inspired by Southern California&apos;s laidback yet active lifestyle,
          TravisMathew balances innovative design, superior style and everyday
          versatility.
        </p>
        <div className="profile-dna-grid">
          <span>Laidback, not sloppy</span>
          <span>Performance, not flashy</span>
          <span>Course-to-street versatility</span>
          <span>SoCal origin, 2007</span>
        </div>
      </article>

      <div className="profile-stat-grid">
        {TRAVISMATHEW_PROFILE_STATS.map((stat) => (
          <div className="profile-stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="profile-grid">
        <article className="profile-card wide">
          <p className="eyebrow">01 - Profile</p>
          <h3>A performance-first golfer who dresses for the 19th hole too.</h3>
          <div className="profile-point-grid">
            {TRAVISMATHEW_PROFILE_POINTS.map((point) => (
              <div className="profile-point" key={point.title}>
                <strong>{point.title.slice(0, 1)}</strong>
                <div>
                  <h4>{point.title}</h4>
                  <p>{point.text}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="profile-card">
          <p className="eyebrow">02 - Demographics</p>
          <h3>Traffic peaks at 45-54.</h3>
          <p>
            Similarweb 2025 shows a 55.97% male / 44.03% female split and a
            core audience older than Arc&apos;teryx. United States traffic is
            highly concentrated at 94.9% of visits.
          </p>
        </article>

        <article className="profile-card">
          <p className="eyebrow">04 - Parent Company</p>
          <h3>Callaway Golf is refocused on golf and soft goods.</h3>
          <p>
            After selling Jack Wolfskin and a 60% stake in Topgolf, the parent
            returned to Callaway Golf Company and now houses TravisMathew inside
            Apparel, Gear & Other.
          </p>
        </article>
      </div>

      <article className="profile-card">
        <p className="eyebrow">03 - Competitive Set</p>
        <h3>TravisMathew undercuts most golf apparel on price.</h3>
        <div className="profile-table-wrap">
          <table className="profile-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Polo price</th>
                <th>Gender ratio (M/F)</th>
                <th>Satisfaction</th>
                <th>Revenue Y2022</th>
              </tr>
            </thead>
            <tbody>
              {TRAVISMATHEW_COMPETITORS.map((row) => (
                <tr key={row.brand}>
                  <td>{row.brand}</td>
                  <td>{row.price}</td>
                  <td>{row.gender}</td>
                  <td>{row.satisfaction}</td>
                  <td>{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="profile-summary-card travismathew-summary-card">
        <p className="eyebrow">Summary</p>
        <h3>Value-priced, performance-first and newly refocused.</h3>
        <p>
          TravisMathew buyers are 35-54, middle-to-upper income and looking for
          premium activewear that can move between golf, leisure and everyday
          life. The brand now sits in a smaller $685M Apparel, Gear & Other
          segment under Callaway Golf Company.
        </p>
        <small>
          Data noted in source deck: Similarweb 2025, Callaway Golf filings and
          practical-golf.com.
        </small>
      </article>
    </section>
  );
}

function brandCardNumber(brandOptions, value) {
  return String(brandOptions.findIndex((item) => item.value === value) + 1).padStart(2, "0");
}

const DEFAULT_SECTIONS = {
  summary: true,
  audience: true,
  categoryDonut: true,
  treemap: true,
  products: true,
};

const SCRAPE_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const HISTORY_START = { month: "JUN", year: 2026 };
const CURRENT_PERIOD = {
  month: SCRAPE_MONTHS[new Date().getMonth()],
  year: new Date().getFullYear(),
};
const SCRAPE_YEARS = Array.from(
  { length: Math.max(HISTORY_START.year, CURRENT_PERIOD.year) - HISTORY_START.year + 1 },
  (_, index) => 2026 + index,
);

const formatNumber = new Intl.NumberFormat("en-US");
const formatMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatPrice(product) {
  if (product.price_known === false) return "Not captured";
  const minimum = formatMoney.format(product.price_min);
  const maximum = formatMoney.format(product.price_max);
  return product.price_min === product.price_max
    ? minimum
    : `${minimum} - ${maximum}`;
}

function formatDate(value) {
  if (!value) return "Demo data";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatList(values, fallback = "Not specified") {
  return values?.length ? values.join(", ") : fallback;
}

function formatMultilineList(values, fallback = "Not specified") {
  return values?.length ? values.join("\n") : fallback;
}

function emptyDashboardForPeriod(month, year) {
  return {
    source: [],
    scraped_at: null,
    scrape_period: { month, year, label: `${month} ${year}` },
    summary: {
      total_products: 0,
      brands: 0,
      categories: 0,
      average_price: 0,
      available_products: 0,
      collection_memberships: 0,
      named_collection_products: 0,
      unassigned_collection_products: 0,
      multi_collection_products: 0,
      overlap_memberships: 0,
      category_memberships: 0,
      multi_category_products: 0,
      category_overlap_memberships: 0,
      availability_rate: 0,
    },
    brands: [],
    audiences: [],
    collections: [],
    categories: [],
    subcategories: [],
    activities: [],
    products: [],
  };
}

function getMaterialValues(product) {
  const values = [
    ...(product.material_details || []),
    ...String(product.material || "")
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean),
  ];
  const bodyValues = values.filter((value) =>
    value.toLowerCase().startsWith("body:")
  );
  return [...new Set(bodyValues)];
}

function DetailList({ values, fallback = "Not specified" }) {
  if (!values?.length) return <span className="muted-detail">{fallback}</span>;
  return (
    <ul className="detail-list">
      {values.map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  );
}

async function exportProductsToExcel(products) {
  const XLSX = await import("xlsx");
  const rows = products.map((product) => ({
    Product: product.title,
    Brand: product.brand_label,
    Season: product.season_range || "",
    Category: (product.categories || [product.category]).join(", "),
    "Sub Category": (product.subcategories || []).join(", "),
    Collection: (product.collections || []).join(", "),
    "Available Colors": (product.available_colors || []).join(", ") || "None",
    "Unavailable Colors": (product.unavailable_colors || []).join(", "),
    Material: formatMultilineList(getMaterialValues(product)),
    Innovation: formatMultilineList(product.innovations),
    "Technical Features": formatMultilineList(product.technical_features),
    "Fabric Treatment": formatMultilineList(product.fabric_treatment),
    Construction: formatMultilineList(product.construction),
    "Shop Highlights": (product.shop_highlights || []).join(", "),
    "Price Min": product.price_min,
    "Price Max": product.price_max,
    "Price Range": formatPrice(product),
    Status: product.available ? "Available" : "Unavailable",
    URL: product.url,
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 42 },
    { wch: 14 },
    { wch: 18 },
    { wch: 24 },
    { wch: 28 },
    { wch: 28 },
    { wch: 32 },
    { wch: 32 },
    { wch: 50 },
    { wch: 40 },
    { wch: 42 },
    { wch: 50 },
    { wch: 24 },
    { wch: 10 },
    { wch: 10 },
    { wch: 18 },
    { wch: 12 },
    { wch: 64 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Product Details");
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `brand-analysis-products-${today}.xlsx`);
}

function buildQuery(filters, period) {
  const params = new URLSearchParams();
  if (period?.month && period?.year) {
    params.set("month", period.month);
    params.set("year", String(period.year));
  }
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.brands.length) {
    params.set("brands", filters.brands.join(","));
  }
  if (filters.audiences.length) {
    params.set("audiences", filters.audiences.join(","));
  }
  if (filters.collections.length) {
    params.set("collections", filters.collections.join(","));
  }
  if (filters.activities.length) {
    params.set("activities", filters.activities.join(","));
  }
  if (filters.categories.length) {
    params.set("categories", filters.categories.join(","));
  }
  if (filters.subcategories.length) {
    params.set("subcategories", filters.subcategories.join(","));
  }
  if (filters.minPrice !== "") params.set("min_price", filters.minPrice);
  if (filters.maxPrice !== "") params.set("max_price", filters.maxPrice);
  if (filters.availability !== "all") {
    params.set("availability", filters.availability);
  }
  if (filters.shopHighlight !== "all") {
    params.set("shop_highlight", filters.shopHighlight);
  }
  if (filters.material !== "all") {
    params.set("material", filters.material);
  }
  if (filters.season !== "all") {
    params.set("season", filters.season);
  }
  return params.toString();
}

function getBrandFromPath(pathname = window.location.pathname) {
  const match = pathname.match(/^\/brand\/([^/]+)/);
  if (!match) return null;
  const brand = decodeURIComponent(match[1]).toLowerCase();
  return BRAND_ROUTES.has(brand) ? brand : null;
}

function brandPath(brand) {
  return `/brand/${brand}`;
}

function compactChartRows(data, limit = 12) {
  const sortedRows = [...data].sort(
    (left, right) => Number(right.value || 0) - Number(left.value || 0),
  );
  if (!sortedRows.length || sortedRows.length <= limit) return sortedRows;
  const topRows = sortedRows.slice(0, limit);
  const otherValue = sortedRows
    .slice(limit)
    .reduce((sum, item) => sum + Number(item.value || 0), 0);
  return otherValue > 0
    ? [...topRows, { name: "Other", value: otherValue, grouped: true }]
    : topRows;
}

function wait(ms, value = null) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });
}

function MaintenanceOverlay({ maintenance }) {
  if (!maintenance?.active) return null;
  return (
    <section className="maintenance-screen" role="status" aria-live="polite">
      <div className="maintenance-card">
        <p className="eyebrow">MONTHLY CATALOG UPDATE</p>
        <h1>Dashboard temporarily closed for maintenance</h1>
        <p>
          We are scraping and validating this month&apos;s product catalog. The
          dashboard is scheduled to reopen after 08:30 Bangkok time.
        </p>
        <div className="maintenance-meta">
          <span>Window: 08:00-08:30</span>
          <span>Timezone: Asia/Bangkok</span>
          {maintenance.latest_run?.status && (
            <span>Status: {maintenance.latest_run.status}</span>
          )}
        </div>
      </div>
    </section>
  );
}

function MainPage({
  brandOptions,
  maintenance,
  navigateToBrand,
}) {
  return (
    <main className="landing-page">
      <MaintenanceOverlay maintenance={maintenance} />
      <header className="topbar main-hero">
        <div className="brand-block">
          <div className="brand-mark">N</div>
          <div>
            <p className="eyebrow">NAN YANG TEXTILE</p>
            <h1>NIC DASHBOARD</h1>
            <p className="page-description">
              Choose a brand workspace to review public catalog movement,
              monthly snapshots, and product details.
            </p>
          </div>
        </div>
        <div className="landing-hero-note">
          <span>{brandOptions.length} brand workspaces</span>
          <span>Monthly catalog archive</span>
        </div>
      </header>

      <div className="landing-section-heading">
        <p className="eyebrow">AVAILABLE BRANDS</p>
        <h2>Select dashboard</h2>
      </div>
      <section className="brand-landing-grid" aria-label="Brand dashboards">
        {brandOptions.map((brand) => {
          return (
            <button
              type="button"
              className={`brand-landing-card brand-card-${brand.value}`}
              key={brand.value}
              onClick={() => navigateToBrand(brand.value)}
            >
              <BrandHeroLogo brand={brand} />
              <span className="brand-card-watermark" aria-hidden="true">
                {(BRAND_LOGOS[brand.value]?.mark || brand.label.slice(0, 2)).toUpperCase()}
              </span>
              <span className="brand-card-index">
                {brandCardNumber(brandOptions, brand.value)}
              </span>
              <span className="brand-card-body">
                <span className="brand-card-copy">
                  <strong>{brand.label}</strong>
                  <span className="brand-card-action">Open workspace</span>
                </span>
              </span>
            </button>
          );
        })}
      </section>
    </main>
  );
}

function DonutChart({
  data,
  centerLabel,
  centerValue,
  onSelect,
  selectedNames = [],
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = compactChartRows(data);
  return (
    <div className="chart-shell">
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={104}
              paddingAngle={1}
              onClick={(entry) => !entry.grouped && onSelect?.(entry.name)}
              className="clickable-chart"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                  opacity={
                    selectedNames.length === 0 ||
                    selectedNames.includes(entry.name) ||
                    entry.grouped
                      ? 1
                      : 0.28
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 11, padding: "7px 9px" }}
              itemStyle={{ fontSize: 11 }}
              formatter={(value, name) => [
                `${formatNumber.format(value)} (${total ? ((value / total) * 100).toFixed(1) : 0}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{formatNumber.format(centerValue ?? total)}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <div className="chart-legend-list" aria-label={`${centerLabel} legend`}>
        {chartData.map((entry, index) => {
          const selected =
            selectedNames.length === 0 ||
            selectedNames.includes(entry.name) ||
            entry.grouped;
          return (
            <button
              type="button"
              className={selected ? "chart-legend-row" : "chart-legend-row muted"}
              key={entry.name}
              onClick={() => !entry.grouped && onSelect?.(entry.name)}
              disabled={entry.grouped}
            >
              <span
                className="legend-dot"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{entry.name}</span>
              <strong>{formatNumber.format(entry.value)}</strong>
            </button>
          );
        })}
        {data.length > chartData.length && (
          <small className="legend-note">
            Showing top {chartData.length - 1} groups. Remaining groups are combined as Other.
          </small>
        )}
      </div>
    </div>
  );
}

function TreemapContent(props) {
  const {
    depth,
    x,
    y,
    width,
    height,
    index,
    name,
    value,
    onSelect,
    selectedNames = [],
  } = props;
  if (depth !== 1) return null;
  const showValue = width > 105 && height > 54;
  const maxLabelLength = Math.max(5, Math.floor(width / 7));
  const displayName =
    name.length > maxLabelLength
      ? `${name.slice(0, Math.max(4, maxLabelLength - 3))}...`
      : name;
  const selected = selectedNames.length === 0 || selectedNames.includes(name);
  return (
    <g className="clickable-chart" onClick={() => onSelect?.(name)}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={COLORS[index % COLORS.length]}
        stroke="#fff"
        strokeWidth={3}
        opacity={selected ? 1 : 0.32}
      />
      {width > 62 && height > 30 && (
        <text x={x + 8} y={y + 19} fill="#fff" fontSize={11} fontWeight={700}>
          {displayName}
        </text>
      )}
      {showValue && (
        <text x={x + 8} y={y + 35} fill="rgba(255,255,255,.82)" fontSize={10}>
          {formatNumber.format(value)} products
        </text>
      )}
    </g>
  );
}

function FilterGroup({ title, options, selected, onChange }) {
  return (
    <div className="filter-group">
      <span className="filter-title">{title}</span>
      <div className="chip-list">
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          const active = selected.includes(value);
          return (
            <button
              className={active ? "filter-chip active" : "filter-chip"}
              key={value}
              type="button"
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((item) => item !== value)
                    : [...selected, value],
                )
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  const [routePath, setRoutePath] = useState(window.location.pathname);
  const routeBrand = getBrandFromPath(routePath);
  const initialSnapshot = snapshotForBrand(routeBrand);
  const [options, setOptions] = useState(initialSnapshot?.options || demoOptions);
  const [dashboard, setDashboard] = useState(
    initialSnapshot?.dashboard || demoDashboard,
  );
  const [filters, setFilters] = useState({
    search: "",
    brands: routeBrand ? [routeBrand] : [],
    audiences: [],
    collections: [],
    activities: [],
    categories: [],
    subcategories: [],
    color: "",
    minPrice: "",
    maxPrice: "",
    availability: "all",
    shopHighlight: "all",
    material: "all",
    season: "all",
  });
  const sections = DEFAULT_SECTIONS;
  const [loading, setLoading] = useState(!initialSnapshot);
  const [scraping, setScraping] = useState(false);
  const [message, setMessage] = useState(
    initialSnapshot ? snapshotMessage(routeBrand, initialSnapshot.options?.brands) : "Loading dashboard data...",
  );
  const [autoScrapeRuns, setAutoScrapeRuns] = useState({});
  const [maintenance, setMaintenance] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [brandWorkspacePage, setBrandWorkspacePage] = useState("product");
  const [productPage, setProductPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(50);
  const loadRequestRef = useRef(0);
  const periodInitializedRef = useRef(false);
  const [scrapeMonth, setScrapeMonth] = useState(CURRENT_PERIOD.month);
  const [scrapeYear, setScrapeYear] = useState(CURRENT_PERIOD.year);
  const [periodOptions, setPeriodOptions] = useState([]);

  const selectedPeriod = useMemo(
    () => ({ month: scrapeMonth, year: scrapeYear }),
    [scrapeMonth, scrapeYear],
  );
  const availableYears = useMemo(() => {
    if (!periodOptions.length) return SCRAPE_YEARS;
    return [...new Set(periodOptions.map((period) => period.year))];
  }, [periodOptions]);
  const availableMonths = useMemo(() => {
    if (periodOptions.length) {
      return periodOptions
        .filter((period) => period.year === scrapeYear)
        .map((period) => period.month);
    }
    let months = SCRAPE_MONTHS;
    if (scrapeYear === HISTORY_START.year) {
      months = months.slice(SCRAPE_MONTHS.indexOf(HISTORY_START.month));
    }
    if (scrapeYear === CURRENT_PERIOD.year) {
      months = months.slice(0, SCRAPE_MONTHS.indexOf(CURRENT_PERIOD.month) + 1);
    }
    return months;
  }, [scrapeYear]);
  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      brands: routeBrand ? [routeBrand] : filters.brands,
    }),
    [filters, routeBrand],
  );
  const query = useMemo(
    () => buildQuery(effectiveFilters, selectedPeriod),
    [effectiveFilters, selectedPeriod],
  );
  const brandOptions = mergeBrandOptions(options.brands);
  const isProfileWorkspace = PROFILE_WORKSPACE_BRANDS.has(routeBrand);
  const brandWorkspacePageLabel =
    BRAND_WORKSPACE_PAGES.find(
      (page) => page.value === brandWorkspacePage,
    )?.label || "Product Dashboard";
  const productCategories = options.categories;
  const availableShopHighlights = options.shop_highlights || [];
  const activityOptions = options.activities || [];
  const materialKeywords = options.material_keywords || [];
  const seasonOptions = options.seasons || [];
  const showCategoryTreemap = effectiveFilters.brands.includes("lululemon");
  const treemapRows = showCategoryTreemap
    ? dashboard.categories || []
    : dashboard.subcategories || [];
  const treemapSelectedNames = showCategoryTreemap
    ? filters.categories
    : filters.subcategories;
  const treemapSelectHandler = showCategoryTreemap
    ? toggleCategory
    : toggleSubcategory;
  const hasCollectionData =
    (dashboard.collections || []).length > 0 ||
    dashboard.products.some((product) => product.collections?.length);
  const hasSubcategoryData = dashboard.products.some(
    (product) => product.subcategories?.length,
  );
  const hasMaterialData = dashboard.products.some(
    (product) => getMaterialValues(product).length,
  );
  const hasProductImageData = dashboard.products.some(
    (product) => product.image || product.color_variants?.length,
  );
  const hasInnovationData = dashboard.products.some(
    (product) => product.innovations?.length,
  );
  const hasTechnicalFeatureData = dashboard.products.some(
    (product) => product.technical_features?.length,
  );
  const hasFabricTreatmentData = dashboard.products.some(
    (product) => product.fabric_treatment?.length,
  );
  const hasConstructionData = dashboard.products.some(
    (product) => product.construction?.length,
  );
  const hasSeasonData = dashboard.products.some(
    (product) => Boolean(String(product.season_range || "").trim()),
  );
  const hasSubcategoryFilter =
    (options.subcategories || []).length > 0 || filters.subcategories.length > 0;
  const hasCollectionFilter =
    (options.collections || []).length > 0 || filters.collections.length > 0;
  const hasActivityFilter =
    activityOptions.length > 0 || filters.activities.length > 0;
  const hasShopHighlightFilter =
    availableShopHighlights.length > 0 || filters.shopHighlight !== "all";
  const hasMaterialFilter =
    filters.material !== "all" || materialKeywords.length > 0;
  const hasSeasonFilter =
    filters.season !== "all" || seasonOptions.length > 0;
  const hasUnavailableProducts = dashboard.products.some(
    (product) => !product.available,
  ) || filters.availability !== "all";
  const totalProductPages = Math.max(
    1,
    Math.ceil(dashboard.products.length / productsPerPage),
  );
  const currentProductPage = Math.min(productPage, totalProductPages);
  const paginatedProducts = dashboard.products.slice(
    (currentProductPage - 1) * productsPerPage,
    currentProductPage * productsPerPage,
  );
  const latestAutoScrapeRun = useMemo(() => {
    const runs = Object.values(autoScrapeRuns || {});
    if (!runs.length) return null;
    return runs.sort((left, right) =>
      String(right.completed_at || right.scheduled_for || "").localeCompare(
        String(left.completed_at || left.scheduled_for || ""),
      ),
    )[0];
  }, [autoScrapeRuns]);

  useEffect(() => {
    const handlePopState = () => setRoutePath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailablePeriods() {
      try {
        const response = await fetch("/api/periods");
        if (!response.ok) return;
        const payload = await response.json();
        if (cancelled) return;
        const available = (payload.available || []).sort((left, right) =>
          String(left.key).localeCompare(String(right.key)),
        );
        setPeriodOptions(available);
        if (!periodInitializedRef.current && available.length) {
          const latest = available[available.length - 1];
          setScrapeMonth(latest.month);
          setScrapeYear(latest.year);
          periodInitializedRef.current = true;
        }
      } catch {
        // Keep the built-in current period when the API is not reachable.
      }
    }

    loadAvailablePeriods();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const nextSnapshot = snapshotForBrand(routeBrand);
    if (nextSnapshot) {
      setOptions(nextSnapshot.options);
      setDashboard(nextSnapshot.dashboard);
      setMessage(snapshotMessage(routeBrand, nextSnapshot.options?.brands));
      setLoading(false);
      if (nextSnapshot.dashboard?.scrape_period?.month && nextSnapshot.dashboard?.scrape_period?.year) {
        setScrapeMonth(nextSnapshot.dashboard.scrape_period.month);
        setScrapeYear(Number(nextSnapshot.dashboard.scrape_period.year));
      }
    }
    setFilters((current) => ({
      ...current,
      brands: routeBrand ? [routeBrand] : [],
      audiences: [],
      collections: [],
      activities: [],
      categories: [],
      subcategories: [],
      color: "",
      minPrice: "",
      maxPrice: "",
      availability: "all",
      shopHighlight: "all",
      material: "all",
      season: "all",
    }));
    setBrandWorkspacePage("product");
  }, [routeBrand]);

  function navigateTo(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setRoutePath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateToBrand(brand) {
    navigateTo(brandPath(brand));
  }

  function navigateHome() {
    navigateTo("/");
  }

  async function loadMaintenanceStatus() {
    try {
      const response = await fetch("/api/health");
      if (!response.ok) return;
      const health = await response.json();
      setAutoScrapeRuns(health.auto_scrape_runs || {});
      setMaintenance(health.maintenance || null);
    } catch {
      // The landing page can still render without the API.
    }
  }

  async function loadDashboard({ background = false } = {}) {
    if (!routeBrand) {
      loadRequestRef.current += 1;
      setLoading(false);
      return;
    }
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    const showLoading = !background || !dashboard.products?.length;
    if (showLoading) {
      setLoading(true);
    }
    try {
      const healthPromise = fetch("/api/health").catch(() => null);
      const optionsPromise = fetch(`/api/options${query ? `?${query}` : ""}`);
      const dashboardPromise = fetch(`/api/dashboard${query ? `?${query}` : ""}`);
      let healthWasHandled = false;
      const quickHealthResponse = await Promise.race([
        healthPromise,
        wait(900),
      ]);
      if (requestId !== loadRequestRef.current) return;
      if (quickHealthResponse?.ok) {
        const health = await quickHealthResponse.json();
        if (requestId !== loadRequestRef.current) return;
        healthWasHandled = true;
        setAutoScrapeRuns(health.auto_scrape_runs || {});
        setMaintenance(health.maintenance || null);
        if (health.maintenance?.active) {
          setMessage("Monthly maintenance in progress");
          return;
        }
      }

      const [optionsResponse, dashboardResponse] = await Promise.all([
        optionsPromise,
        dashboardPromise,
      ]);
      if (requestId !== loadRequestRef.current) return;
      if (optionsResponse.status === 404 || dashboardResponse.status === 404) {
        setDashboard(emptyDashboardForPeriod(scrapeMonth, scrapeYear));
        setMessage(`No saved snapshot for ${scrapeMonth} ${scrapeYear}. Run scrape once for this month.`);
        return;
      }
      if (!optionsResponse.ok || !dashboardResponse.ok) {
        throw new Error("API response was not successful");
      }
      const nextOptions = await optionsResponse.json();
      const nextDashboard = await dashboardResponse.json();
      if (requestId !== loadRequestRef.current) return;
      const selectedBrands = new Set(effectiveFilters.brands);
      const visibleBrandLabels = (nextOptions.brands || DEFAULT_BRAND_OPTIONS)
        .filter((brand) => !selectedBrands.size || selectedBrands.has(brand.value))
        .map((brand) => brand.label);
      setOptions(nextOptions);
      setDashboard(nextDashboard);
      setMessage(`Live data from ${visibleBrandLabels.join(", ")}`);
      if (!healthWasHandled) {
        const healthResponse = await healthPromise;
        if (requestId !== loadRequestRef.current) return;
        if (healthResponse?.ok) {
          const health = await healthResponse.json();
          if (requestId !== loadRequestRef.current) return;
          setAutoScrapeRuns(health.auto_scrape_runs || {});
          setMaintenance(health.maintenance || null);
        }
      }
    } catch {
      if (requestId !== loadRequestRef.current) return;
      if (!background) {
        setMessage("Demo preview: start the Python API for live data");
      }
    } finally {
      if (showLoading && requestId === loadRequestRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!routeBrand) {
      loadRequestRef.current += 1;
      setLoading(false);
      loadMaintenanceStatus();
      return undefined;
    }
    const timer = setTimeout(
      () => loadDashboard({ background: Boolean(snapshotForBrand(routeBrand)) }),
      250,
    );
    return () => clearTimeout(timer);
  }, [query, routeBrand]);

  useEffect(() => {
    if (!maintenance?.active) return undefined;
    const timer = setInterval(async () => {
      try {
        const response = await fetch("/api/health");
        if (!response.ok) return;
        const health = await response.json();
        setAutoScrapeRuns(health.auto_scrape_runs || {});
        setMaintenance(health.maintenance || null);
        if (!health.maintenance?.active) {
          await loadDashboard();
        }
      } catch {
        // Keep the maintenance message visible if the API is briefly unavailable.
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [maintenance?.active, query]);

  useEffect(() => {
    if (periodOptions.length) {
      const hasSelectedPeriod = periodOptions.some(
        (period) => period.month === scrapeMonth && period.year === scrapeYear,
      );
      if (!hasSelectedPeriod) {
        const latest = periodOptions[periodOptions.length - 1];
        setScrapeMonth(latest.month);
        setScrapeYear(latest.year);
      }
      return;
    }
    if (
      scrapeYear === HISTORY_START.year &&
      SCRAPE_MONTHS.indexOf(scrapeMonth) < SCRAPE_MONTHS.indexOf(HISTORY_START.month)
    ) {
      setScrapeMonth(HISTORY_START.month);
      return;
    }
    if (
      scrapeYear === CURRENT_PERIOD.year &&
      SCRAPE_MONTHS.indexOf(scrapeMonth) > SCRAPE_MONTHS.indexOf(CURRENT_PERIOD.month)
    ) {
      setScrapeMonth(CURRENT_PERIOD.month);
    }
  }, [periodOptions, scrapeMonth, scrapeYear]);

  useEffect(() => {
    setProductPage(1);
  }, [query, productsPerPage]);

  useEffect(() => {
    if (productPage > totalProductPages) {
      setProductPage(totalProductPages);
    }
  }, [productPage, totalProductPages]);

  async function reloadSavedSnapshot() {
    setScraping(true);
    const periodLabel = `${scrapeMonth} ${scrapeYear}`;
    setMessage(`Loading saved ${periodLabel} snapshot...`);
    try {
      await loadDashboard();
    } catch {
      setMessage("Could not load the saved monthly snapshot.");
    } finally {
      setScraping(false);
    }
  }

  function resetFilters() {
    setFilters({
      search: "",
      brands: routeBrand ? [routeBrand] : filters.brands,
      audiences: [],
      collections: [],
      activities: [],
      categories: [],
      subcategories: [],
      color: "",
      minPrice: "",
      maxPrice: "",
      availability: "all",
      shopHighlight: "all",
      material: "all",
      season: "all",
    });
  }

  if (!routeBrand) {
    return (
      <MainPage
        brandOptions={brandOptions}
        maintenance={maintenance}
        navigateToBrand={navigateToBrand}
      />
    );
  }

  function toggleCategory(category) {
    setFilters({
      ...filters,
      categories: filters.categories.includes(category)
        ? filters.categories.filter((item) => item !== category)
        : [...filters.categories, category],
      subcategories: [],
    });
  }

  function toggleSubcategory(subcategory) {
    setFilters({
      ...filters,
      subcategories: filters.subcategories.includes(subcategory)
        ? filters.subcategories.filter((item) => item !== subcategory)
        : [subcategory],
    });
  }

  function toggleAudienceLabel(label) {
    const option = options.audiences.find((item) => item.label === label);
    if (!option) return;
    setFilters({
      ...filters,
      audiences: filters.audiences.includes(option.value)
        ? filters.audiences.filter((item) => item !== option.value)
        : [...filters.audiences, option.value],
    });
  }

  function toggleCollection(collection) {
    setFilters({
      ...filters,
      collections: filters.collections.includes(collection)
        ? filters.collections.filter((item) => item !== collection)
        : [...filters.collections, collection],
    });
  }

  return (
    <main>
      <MaintenanceOverlay maintenance={maintenance} />
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">M</div>
          <div>
            <p className="eyebrow">PUBLIC CLOTHING CATALOG ANALYTICS</p>
            <h1>
              {brandOptions.find((brand) => brand.value === routeBrand)?.label || "Brand"} Dashboard
            </h1>
            <p className="page-description">
              Monthly product analytics for the selected public clothing catalog.
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button className="secondary-link home-link" type="button" onClick={navigateHome}>
            Main page
          </button>
          <div className="status">
            <span
              className={
                maintenance?.active
                  ? "dot maintenance"
                  : message.startsWith("Live") || message.startsWith("Cached")
                    ? "dot live"
                    : "dot"
              }
            />
            <div>
              <strong>
                {maintenance?.active ? "Monthly maintenance in progress" : message}
              </strong>
              <small>Updated {formatDate(dashboard.scraped_at)}</small>
              {dashboard.scrape_period?.label && (
                <small>Scrape period {dashboard.scrape_period.label}</small>
              )}
              {latestAutoScrapeRun && (
                <small>
                  Auto scrape {latestAutoScrapeRun.status}{" "}
                  {formatDate(latestAutoScrapeRun.completed_at)} -{" "}
                  {formatNumber.format(latestAutoScrapeRun.product_count || 0)} products
                </small>
              )}
            </div>
          </div>
          <div className="scrape-scheduler" aria-label="Select scrape period">
            <label>
              Month
              <select
                value={scrapeMonth}
                onChange={(event) => setScrapeMonth(event.target.value)}
                disabled={scraping}
              >
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Year
              <select
                value={scrapeYear}
                onChange={(event) => setScrapeYear(Number(event.target.value))}
                disabled={scraping}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <small>
              View saved monthly catalog snapshots from JUN 2026 onward.
            </small>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={reloadSavedSnapshot}
            disabled={scraping}
          >
            {scraping ? "Loading..." : "Reload saved month"}
          </button>
        </div>
      </header>

      <nav
        className="page-nav"
        aria-label={
          isProfileWorkspace
            ? "Brand workspace pages"
            : "Page navigation"
        }
      >
        {isProfileWorkspace ? (
          BRAND_WORKSPACE_PAGES.map((page) => (
            <button
              key={page.value}
              className={
                brandWorkspacePage === page.value ? "active" : undefined
              }
              type="button"
              onClick={() => setBrandWorkspacePage(page.value)}
            >
              {page.label}
            </button>
          ))
        ) : (
          <>
            <a href="#overview">Overview</a>
            <a href="#charts">Charts</a>
            <a href="#products">Product details</a>
            <span>Click any chart or table label to filter the dashboard</span>
          </>
        )}
      </nav>

      {isProfileWorkspace && brandWorkspacePage === "profile" ? (
        routeBrand === "travismathew" ? (
          <TravisMathewBrandProfile />
        ) : (
          <ArcteryxBrandProfile />
        )
      ) : isProfileWorkspace && brandWorkspacePage !== "product" ? (
        <section className="panel workspace-placeholder">
          <p className="eyebrow">
            {brandWorkspacePageLabel === "Brand Profile"
              ? "BRAND PROFILE"
              : "BRAND WALLET SHARED"}
          </p>
          <h2>{brandWorkspacePageLabel}</h2>
          <p className="section-description">
            This page is intentionally blank for the next brand planning phase.
          </p>
        </section>
      ) : (
        <>
      <section
        className={filtersOpen ? "control-panel" : "control-panel collapsed"}
      >
        <div className="control-heading">
          <div>
            <p className="eyebrow">DASHBOARD CONTROLS</p>
            <h2>Filter your view</h2>
            <p className="section-description">
              Select one or more options. All cards, charts and products update
              together.
            </p>
          </div>
          <div className="control-actions">
            <button className="text-button" type="button" onClick={resetFilters}>
              Reset filters
            </button>
            <button
              className="collapse-button"
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
            >
              {filtersOpen ? "Hide filters" : "Show filters"}
            </button>
          </div>
        </div>

        <div className="filter-content streamlined-filters">
          <div className="filter-quick-row">
            <label className="search-filter">
              <span className="filter-title">Search</span>
              <input
                type="search"
                placeholder="Search product, material, collection..."
                value={filters.search}
                onChange={(event) =>
                  setFilters({ ...filters, search: event.target.value })
                }
              />
            </label>

            <section className="audience-filter">
              <FilterGroup
                title="Audience"
                options={options.audiences}
                selected={filters.audiences}
                onChange={(audiences) => setFilters({ ...filters, audiences })}
              />
            </section>
          </div>

          <div className="filter-select-grid">
            <label>
              <span className="filter-title">Category</span>
              <select
                value={
                  filters.categories.length === 1
                    ? filters.categories[0]
                    : "all"
                }
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    categories:
                      event.target.value === "all" ? [] : [event.target.value],
                    subcategories: [],
                  })
                }
              >
                <option value="all">All categories</option>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            {hasSubcategoryFilter && (
              <label>
                <span className="filter-title">Sub category</span>
                <select
                  value={
                    filters.subcategories.length === 1
                      ? filters.subcategories[0]
                      : "all"
                  }
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      subcategories:
                        event.target.value === "all" ? [] : [event.target.value],
                    })
                  }
                >
                  <option value="all">All sub categories</option>
                  {options.subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {hasCollectionFilter && (
              <label>
                <span className="filter-title">Collection</span>
                <select
                  value={
                    filters.collections.length === 1
                      ? filters.collections[0]
                      : "all"
                  }
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      collections:
                        event.target.value === "all" ? [] : [event.target.value],
                    })
                  }
                >
                  <option value="all">All collections</option>
                  {(options.collections || []).map((collection) => (
                    <option key={collection} value={collection}>
                      {collection}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {hasActivityFilter && (
              <label>
                <span className="filter-title">Activities</span>
                <select
                  value={
                    filters.activities.length === 1
                      ? filters.activities[0]
                      : "all"
                  }
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      activities:
                        event.target.value === "all" ? [] : [event.target.value],
                    })
                  }
                >
                  <option value="all">All activities</option>
                  {activityOptions.map((activity) => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {hasShopHighlightFilter && (
              <label>
                <span className="filter-title">Shop Highlights</span>
                <select
                  value={filters.shopHighlight}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      shopHighlight: event.target.value,
                    })
                  }
                >
                  <option value="all">All products</option>
                  {availableShopHighlights.map((highlight) => (
                    <option key={highlight} value={highlight}>
                      {highlight}
                    </option>
                  ))}
                  <option value="none">No highlights</option>
                </select>
              </label>
            )}

            {hasUnavailableProducts && (
              <label>
                <span className="filter-title">Availability</span>
                <select
                  value={filters.availability}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      availability: event.target.value,
                    })
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </label>
            )}

            {hasMaterialFilter && (
              <label>
                <span className="filter-title">Material</span>
                <select
                  value={filters.material}
                  onChange={(event) =>
                    setFilters({ ...filters, material: event.target.value })
                  }
                >
                  <option value="all">All materials</option>
                  {materialKeywords.map((keyword) => (
                    <option key={keyword} value={keyword}>
                      {keyword}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {hasSeasonFilter && (
              <label>
                <span className="filter-title">Season</span>
                <select
                  value={filters.season}
                  onChange={(event) =>
                    setFilters({ ...filters, season: event.target.value })
                  }
                >
                  <option value="all">All seasons</option>
                  {seasonOptions.map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="price-control compact-price">
              <span className="filter-title">Price range (USD)</span>
              <div className="price-inputs">
                <input
                  type="number"
                  min="0"
                  aria-label="Minimum price"
                  placeholder={`Min ${options.price.min}`}
                  value={filters.minPrice}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      minPrice: event.target.value,
                    })
                  }
                />
                <span>to</span>
                <input
                  type="number"
                  min="0"
                  aria-label="Maximum price"
                  placeholder={`Max ${options.price.max}`}
                  value={filters.maxPrice}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      maxPrice: event.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className={loading ? "loading-bar active" : "loading-bar"} />

      {sections.summary && (
        <section className="kpi-grid" id="overview">
          <button
            className="kpi-card accent interactive-card"
            type="button"
            onClick={resetFilters}
            title="Clear all dashboard filters"
          >
            <span>Total products</span>
            <strong>{formatNumber.format(dashboard.summary.total_products)}</strong>
            <small>Unique product IDs after filters</small>
          </button>
          <button
            className="kpi-card interactive-card"
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                maxPrice:
                  filters.maxPrice === ""
                    ? String(Math.ceil(dashboard.summary.average_price))
                    : "",
              })
            }
            title="Toggle products priced up to the current average"
          >
            <span>Average starting price</span>
            <strong>{formatMoney.format(dashboard.summary.average_price)}</strong>
            <small>Across the current selection</small>
          </button>
          <button
            className="kpi-card dark interactive-card"
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                availability:
                  filters.availability === "available" ? "all" : "available",
              })
            }
            title="Toggle available products"
          >
            <span>Available products</span>
            <strong>{dashboard.summary.availability_rate}%</strong>
            <small>
              {formatNumber.format(dashboard.summary.available_products)} available
            </small>
          </button>
        </section>
      )}

      <section className="dashboard-grid" id="charts">
        {sections.audience && hasCollectionData && (
          <article className="panel audience-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">COLLECTION MIX</p>
                <h2>Product collection</h2>
              </div>
              <span className="panel-tag">
                {formatNumber.format(dashboard.summary.collection_memberships)} memberships
              </span>
            </div>
            <p className="panel-help">
              {formatNumber.format(
                dashboard.summary.named_collection_products ?? 0,
              )} products have a named collection. {formatNumber.format(
                dashboard.summary.unassigned_collection_products ?? 0,
              )} have no named collection, and {formatNumber.format(
                dashboard.summary.multi_collection_products,
              )} appear in more than one collection, creating{" "}
              {formatNumber.format(dashboard.summary.overlap_memberships)} extra
              collection memberships.
            </p>
            <DonutChart
              data={dashboard.collections || []}
              centerValue={dashboard.summary.named_collection_products ?? 0}
              centerLabel="named products"
              onSelect={toggleCollection}
              selectedNames={filters.collections}
            />
          </article>
        )}

        {sections.categoryDonut && (
          <article className="panel category-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">PRODUCT MIX</p>
                <h2>Product category</h2>
              </div>
              <span className="panel-tag">
                {formatNumber.format(dashboard.summary.category_memberships)} memberships
              </span>
            </div>
            <p className="panel-help">
              {formatNumber.format(dashboard.summary.total_products)} unique
              product cards. {formatNumber.format(
                dashboard.summary.multi_category_products,
              )} cards appear in more than one product category.
            </p>
            <DonutChart
              data={dashboard.categories}
              centerValue={dashboard.summary.total_products}
              centerLabel="product cards"
              onSelect={toggleCategory}
              selectedNames={filters.categories}
            />
          </article>
        )}

        {sections.treemap && (
          <article className="panel treemap-panel">
            <div className="panel-heading">
              <div>
                <h2>{showCategoryTreemap ? "Product category treemap" : "Sub category treemap"}</h2>
              </div>
              <span className="panel-tag">Click a block</span>
            </div>
            <ResponsiveContainer width="100%" height={410}>
              <Treemap
                data={treemapRows}
                dataKey="value"
                nameKey="name"
                stroke="#fff"
                content={
                  <TreemapContent
                    onSelect={treemapSelectHandler}
                    selectedNames={treemapSelectedNames}
                  />
                }
              >
                <Tooltip
                  contentStyle={{ fontSize: 11, padding: "7px 9px" }}
                  itemStyle={{ fontSize: 11 }}
                  formatter={(value) => `${value} products`}
                />
              </Treemap>
            </ResponsiveContainer>
          </article>
        )}
      </section>

      {sections.products && (
        <section className="panel product-panel" id="products">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">PRODUCT DETAILS</p>
              <h2>Product details</h2>
              <p className="section-description">
                Search the current selection or refine it with the controls below.
              </p>
            </div>
            <div className="panel-actions">
              <button
                className="export-button"
                type="button"
                onClick={() => exportProductsToExcel(dashboard.products)}
                disabled={!dashboard.products.length}
              >
                Export Excel
              </button>
              <span className="panel-tag">
                Showing {dashboard.products.length} products
              </span>
            </div>
          </div>

          <div className="product-pagination">
            <div>
              Page {currentProductPage} of {totalProductPages}
              <span>
                Showing{" "}
                {dashboard.products.length
                  ? (currentProductPage - 1) * productsPerPage + 1
                  : 0}
                -
                {Math.min(
                  currentProductPage * productsPerPage,
                  dashboard.products.length,
                )}{" "}
                of {dashboard.products.length}
              </span>
            </div>
            <label>
              Rows
              <select
                value={productsPerPage}
                onChange={(event) =>
                  setProductsPerPage(Number(event.target.value))
                }
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setProductPage(Math.max(1, currentProductPage - 1))}
              disabled={currentProductPage === 1}
            >
              Prev
            </button>
            <input
              type="number"
              min="1"
              max={totalProductPages}
              value={currentProductPage}
              aria-label="Product page number"
              onChange={(event) =>
                setProductPage(
                  Math.min(
                    totalProductPages,
                    Math.max(1, Number(event.target.value) || 1),
                  ),
                )
              }
            />
            <button
              type="button"
              onClick={() =>
                setProductPage(Math.min(totalProductPages, currentProductPage + 1))
              }
              disabled={currentProductPage === totalProductPages}
            >
              Next
            </button>
          </div>

          {dashboard.products.length ? (
            <div className="table-wrap">
                <table>
                  <thead>
                    <tr className="table-heading-row">
                      <th>No.</th>
                      {hasProductImageData && <th>Image</th>}
                      <th>Product</th>
                      {hasSeasonData && <th>Season</th>}
                      <th>Gender</th>
                      <th>Category</th>
                      {hasSubcategoryData && <th>Sub category</th>}
                      {hasCollectionData && <th>Collection</th>}
                      <th>Color</th>
                      {hasMaterialData && <th>Material</th>}
                      {hasInnovationData && <th>Innovation</th>}
                      {hasTechnicalFeatureData && <th>Technical features</th>}
                      {hasFabricTreatmentData && <th>Fabric treatment</th>}
                      {hasConstructionData && <th>Construction</th>}
                      <th>Shop Highlights</th>
                      <th>Price range</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product, index) => (
                      <tr key={product.id}>
                        <td className="number-cell">
                          {(currentProductPage - 1) * productsPerPage + index + 1}
                        </td>
                        {hasProductImageData && (
                          <td className="product-image-cell">
                            {product.color_variants?.length ? (
                              <div className="product-image-gallery">
                                {product.color_variants.map((variant) => (
                                  <a
                                    key={`${variant.color}-${variant.url}`}
                                    href={variant.url || product.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Open ${product.title} in ${variant.color}`}
                                    title={`${variant.color}${
                                      variant.available
                                        ? " - Available"
                                        : " - Unavailable"
                                    }`}
                                  >
                                    <img
                                      src={variant.image || product.image}
                                      alt={`${product.title} - ${variant.color}`}
                                      loading="lazy"
                                      decoding="async"
                                    />
                                    <span>{variant.color}</span>
                                  </a>
                                ))}
                              </div>
                            ) : product.image ? (
                              <a href={product.url} target="_blank" rel="noreferrer">
                                <img src={product.image} alt={product.title} />
                              </a>
                            ) : (
                              <span className="product-image-placeholder">
                                No image
                              </span>
                            )}
                          </td>
                        )}
                        <td className="product-title-cell">
                          <a href={product.url} target="_blank" rel="noreferrer">
                            {product.title}
                          </a>
                        </td>
                        {hasSeasonData && (
                          <td className="detail-cell">
                            {product.season_range || (
                              <span className="muted-detail">Not specified</span>
                            )}
                          </td>
                        )}
                        <td>
                          {product.audience_labels?.length
                            ? product.audience_labels.map((label, labelIndex) => {
                                const option = options.audiences.find(
                                  (item) => item.label === label,
                                );
                                return (
                                  <span key={label}>
                                    {labelIndex > 0 && ", "}
                                    <button
                                      className="table-filter-button"
                                      type="button"
                                      onClick={() =>
                                        option &&
                                        setFilters({
                                          ...filters,
                                          audiences: [option.value],
                                        })
                                      }
                                    >
                                      {label}
                                    </button>
                                  </span>
                                );
                              })
                            : "Not specified"}
                        </td>
                        <td>
                          {(product.categories || [product.category]).map(
                            (category, index) => (
                              <span key={category}>
                                {index > 0 && ", "}
                                <button
                                  className="table-filter-button"
                                  type="button"
                                  onClick={() => toggleCategory(category)}
                                >
                                  {category}
                                </button>
                              </span>
                            ),
                          )}
                        </td>
                        {hasSubcategoryData && (
                          <td>
                            {product.subcategories?.length
                              ? product.subcategories.map((subcategory, index) => (
                                  <span key={subcategory}>
                                    {index > 0 && ", "}
                                    <button
                                      className="table-filter-button"
                                      type="button"
                                      onClick={() =>
                                        setFilters({
                                          ...filters,
                                          subcategories: [subcategory],
                                        })
                                      }
                                    >
                                      {subcategory}
                                    </button>
                                  </span>
                                ))
                              : "Not specified"}
                          </td>
                        )}
                        {hasCollectionData && (
                          <td className="collection-cell">
                            {product.collections?.length
                              ? product.collections.map((collection, index) => (
                                  <span key={collection}>
                                    {index > 0 && ", "}
                                    <button
                                      className="table-filter-button"
                                      type="button"
                                      onClick={() => toggleCollection(collection)}
                                    >
                                      {collection}
                                    </button>
                                  </span>
                                ))
                              : "No named collection"}
                          </td>
                        )}
                        <td className="color-cell">
                          <DetailList
                            values={
                              product.available_colors ||
                              (product.color ? [product.color] : [])
                            }
                            fallback="No available colors"
                          />
                          {product.unavailable_colors?.length ? (
                            <div className="unavailable-colors">
                              <span>Unavailable:</span>{" "}
                              {product.unavailable_colors.join(", ")}
                            </div>
                          ) : null}
                        </td>
                        {hasMaterialData && (
                          <td className="material-cell">
                            <DetailList values={getMaterialValues(product)} />
                          </td>
                        )}
                        {hasInnovationData && (
                          <td className="detail-cell">
                            <DetailList values={product.innovations} />
                          </td>
                        )}
                        {hasTechnicalFeatureData && (
                          <td className="detail-cell">
                            <DetailList values={product.technical_features} />
                          </td>
                        )}
                        {hasFabricTreatmentData && (
                          <td className="detail-cell">
                            <DetailList values={product.fabric_treatment} />
                          </td>
                        )}
                        {hasConstructionData && (
                          <td className="detail-cell">
                            <DetailList values={product.construction} />
                          </td>
                        )}
                        <td>
                          {product.shop_highlights?.length ? (
                            product.shop_highlights.map((highlight) => (
                              <button
                                key={highlight}
                                type="button"
                                onClick={() =>
                                  setFilters({
                                    ...filters,
                                    shopHighlight: highlight,
                                  })
                                }
                                className="seller-badge yes"
                              >
                                {highlight}
                              </button>
                            ))
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setFilters({
                                  ...filters,
                                  shopHighlight: "none",
                                })
                              }
                              className="seller-badge no"
                            >
                              No highlights
                            </button>
                          )}
                        </td>
                        <td className="price-cell">{formatPrice(product)}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              setFilters({
                                ...filters,
                                availability: product.available
                                  ? "available"
                                  : "unavailable",
                              })
                            }
                            className={
                              product.available
                                ? "availability yes"
                                : "availability no"
                            }
                          >
                            {product.available ? "Available" : "Unavailable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          ) : (
            <div className="empty-state">
              <strong>No product rows in preview mode</strong>
              <span>Start the Python API to load the live product table.</span>
            </div>
          )}
        </section>
      )}

        </>
      )}

      <footer>
        Public clothing catalog analysis from{" "}
        <a href="https://us.strauss.com" target="_blank" rel="noreferrer">
          Strauss
        </a>
        ,{" "}
        <a href="https://www.rhone.com" target="_blank" rel="noreferrer">
          Rhone
        </a>{" "}
        ,{" "}
        <a href="https://arcteryx.com/us/en" target="_blank" rel="noreferrer">
          Arc&apos;teryx
        </a>
        {" "}and{" "}
        <a href="https://shop.lululemon.com" target="_blank" rel="noreferrer">
          lululemon
        </a>
        . Product names and data belong to their respective owners.
      </footer>
    </main>
  );
}

export default App;


