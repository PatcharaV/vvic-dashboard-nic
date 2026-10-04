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
import {
  LULULEMON_NYG_STYLES,
  LULULEMON_STYLE_COVERAGE,
} from "./lululemonNygStyles";
import { LULULEMON_NYG_FUTURE_STYLES } from "./lululemonNygFutureStyles";
import {
  enrichFutureStyleWithNykFabric,
  LULULEMON_NYG_FUTURE_STYLES_WITH_NYK,
} from "./lululemonFutureNykFabrics";
import { LULULEMON_REMAINING_OPPORTUNITIES } from "./lululemonOpportunities";
import { LULULEMON_OPPORTUNITY_UNITS } from "./lululemonOpportunityUnits";
import { LULULEMON_OPPORTUNITY_MEDIA } from "./lululemonOpportunityMedia";
import { LULULEMON_PANT_STYLE_FAMILIES } from "./lululemonPantFamilies";
import { LULULEMON_STYLE_COMPARISON_UNITS } from "./lululemonStyleComparisonUnits";
import { LULULEMON_NYG_SEASON_METRICS } from "./lululemonNygSeasonMetrics";
import {
  LULULEMON_FORECAST_FABRICS,
  LULULEMON_FORECAST_FLAGSHIPS,
  LULULEMON_FORECAST_NEXT_STEPS,
  LULULEMON_FORECAST_PROGRAMS,
  LULULEMON_FORECAST_QUICK_WINS,
  LULULEMON_FORECAST_SUMMARY,
} from "./lululemonSeasonForecast";
import {
  LULULEMON_BUSINESS_METRICS,
  LULULEMON_FOB_MULTIPLIER,
  LULULEMON_NYG_COMPARISON,
  LULULEMON_SALES_MIX,
} from "./lululemonWorkbookData";
import { NYG_MY_MAP_ROWS, NYG_MY_MAP_SEASONS } from "./nygMyMapData";
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

const LULULEMON_WORKSPACE_PAGES = [
  { value: "overview", label: "Brand Overview" },
  { value: "forecast", label: "Season Forecast" },
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

const BRAND_BASE_URLS = {
  strauss: "https://us.strauss.com",
  rhone: "https://www.rhone.com",
  arcteryx: "https://arcteryx.com/us/en",
  lululemon: "https://shop.lululemon.com",
  tommybahama: "https://www.tommybahama.com",
  travismathew: "https://www.travismathew.com",
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

const LULULEMON_REVENUE_HISTORY = [
  { year: 2021, value: 6.26, display: "$6.26B" },
  { year: 2022, value: 8.11, display: "$8.11B" },
  { year: 2023, value: 9.62, display: "$9.62B" },
  { year: 2024, value: 10.59, display: "$10.59B" },
  { year: 2025, value: 11.1, display: "$11.10B" },
  { year: 2026, value: 10.425, display: "$10.43B*", estimate: true },
];

const LULULEMON_REGIONAL_REVENUE = [
  {
    year: "2026 H1",
    rows: [
      { label: "Americas", value: 66.0, color: "#cf0035" },
      { label: "China Mainland", value: 18.3, color: "#242122" },
      { label: "Rest of World", value: 15.7, color: "#aaa4a6" },
    ],
  },
  {
    year: 2025,
    rows: [
      { label: "Americas", value: 70.7, color: "#cf0035" },
      { label: "China Mainland", value: 15.8, color: "#242122" },
      { label: "Rest of World", value: 13.5, color: "#aaa4a6" },
    ],
  },
  {
    year: 2024,
    rows: [
      { label: "Americas", value: 74.8, color: "#cf0035" },
      { label: "China Mainland", value: 12.9, color: "#242122" },
      { label: "Rest of World", value: 12.3, color: "#aaa4a6" },
    ],
  },
  {
    year: 2023,
    rows: [
      { label: "Americas", value: 79.4, color: "#cf0035" },
      { label: "China Mainland", value: 10, color: "#242122" },
      { label: "Rest of World", value: 10.6, color: "#aaa4a6" },
    ],
  },
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

function LululemonOverviewLogo() {
  return (
    <span className="lululemon-overview-logo" aria-label="Lululemon">
      <img src="/brand-logos/lululemon.svg" alt="" aria-hidden="true" />
      <span>lululemon</span>
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

function LululemonMetricGrid({ metrics, compact = false, showIcons = true }) {
  return (
    <div className={`lululemon-metric-grid ${compact ? "compact" : ""} ${showIcons ? "" : "no-icons"}`}>
      {metrics.map((metric) => (
        <article className="lululemon-metric-card" key={metric.label}>
          {showIcons && (
            <span className="lululemon-metric-icon" aria-hidden="true">
              {metric.icon}
            </span>
          )}
          <span className="lululemon-metric-label">{metric.label}</span>
          <strong>{metric.value}</strong>
          {metric.note && <small>{metric.note}</small>}
        </article>
      ))}
    </div>
  );
}

function LululemonBarChart({
  rows,
  compact = false,
  onSelect,
  selectedKey,
}) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className={`lululemon-bars ${compact ? "compact" : ""}`}>
      {rows.map((row) => {
        const RowElement = onSelect ? "button" : "div";
        const rowKey = row.key || row.label;
        return (
          <RowElement
            className={`lululemon-bar-row ${selectedKey === rowKey ? "selected" : ""}`}
            key={rowKey}
            type={onSelect ? "button" : undefined}
            aria-pressed={onSelect ? selectedKey === rowKey : undefined}
            onClick={onSelect ? () => onSelect(rowKey) : undefined}
          >
            <span>{row.label}</span>
            <span className="lululemon-bar-track">
              <i
                className={row.muted ? "muted" : undefined}
                style={{ width: `${Math.max((row.value / maxValue) * 100, 0.7)}%` }}
              />
            </span>
            <strong>{row.value.toFixed(1)}%</strong>
          </RowElement>
        );
      })}
    </div>
  );
}

function formatComparisonValue(value, metric) {
  if (metric === "products") {
    return `${formatNumber.format(Math.round(value))} products`;
  }
  const prefix = metric === "sales" ? "$" : "";
  const suffix = metric === "sales" ? "" : " units";
  if (value >= 1_000_000_000) {
    return `${prefix}${(value / 1_000_000_000).toFixed(2)}B${suffix}`;
  }
  if (value >= 1_000_000) {
    const digits = value >= 100_000_000 ? 1 : 2;
    return `${prefix}${(value / 1_000_000).toFixed(digits)}M${suffix}`;
  }
  if (value >= 1_000) {
    return `${prefix}${(value / 1_000).toFixed(1)}K${suffix}`;
  }
  return `${prefix}${formatNumber.format(Math.round(value))}${suffix}`;
}

function formatComparisonShare(value) {
  if (value < 0.1) return `${value.toFixed(3)}%`;
  return `${value.toFixed(2)}%`;
}

function formatFabricYards(value, compact = false) {
  if (compact && value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M YDS`;
  if (compact && value >= 100_000) return `${(value / 1_000).toFixed(1)}K YDS`;
  return `${formatNumber.format(Math.round(value))} YDS`;
}

const LULULEMON_GENDERS = ["Men", "Women"];

function normalizeLululemonProductName(value = "") {
  return value
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/^lululemon\s+/, "")
    .replace(/\b(?:women'?s|men'?s)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeLululemonStyleName(value = "") {
  return normalizeLululemonProductName(value)
    .replace(/\b(?:23|25|26|27|28|29|30|31|32|34|35|36)l?\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const LULULEMON_SCRAPED_PRODUCTS = (
  snapshotData.brands?.lululemon?.dashboard?.products || []
).map((product) => ({
  ...product,
  exactName: normalizeLululemonProductName(product.title),
  name: normalizeLululemonStyleName(product.title),
}));

const LULULEMON_SCRAPED_STYLE_AUDIENCES = LULULEMON_SCRAPED_PRODUCTS.map((product) => ({
  name: product.name,
  genders: (product.audience_labels || []).filter((gender) =>
    LULULEMON_GENDERS.includes(gender),
  ),
}));

const LULULEMON_OPPORTUNITY_PRODUCT_CACHE = new Map();

function findLululemonOpportunityProduct(styleName) {
  if (LULULEMON_OPPORTUNITY_PRODUCT_CACHE.has(styleName)) {
    return LULULEMON_OPPORTUNITY_PRODUCT_CACHE.get(styleName);
  }
  const exactName = normalizeLululemonProductName(styleName);
  const normalizedName = normalizeLululemonStyleName(styleName);
  const candidates = LULULEMON_SCRAPED_PRODUCTS.map((product) => {
    let score = Number.POSITIVE_INFINITY;
    if (product.exactName === exactName) score = 0;
    else if (product.exactName.startsWith(`${exactName} `)) score = 1;
    else if (exactName.startsWith(`${product.exactName} `)) score = 2;
    else if (product.name === normalizedName) score = 3;
    else if (product.name.startsWith(`${normalizedName} `)) score = 4;
    else if (normalizedName.startsWith(`${product.name} `)) score = 5;
    return { product, score };
  })
    .filter((candidate) => Number.isFinite(candidate.score))
    .sort((left, right) =>
      left.score - right.score ||
      Number(Boolean(right.product.available)) - Number(Boolean(left.product.available)) ||
      Number(Boolean(right.product.image)) - Number(Boolean(left.product.image)) ||
      left.product.title.length - right.product.title.length,
    );
  const product = candidates[0]?.product;
  const imageProduct = candidates.find(({ product: candidate }) =>
    candidate.image || (candidate.color_variants || []).some((variant) => variant.image),
  )?.product || product;
  const images = imageProduct
    ? [...new Set([
        imageProduct.image,
        ...(imageProduct.color_variants || []).map((variant) => variant.image),
      ].filter(Boolean))].slice(0, 2)
    : [];
  const media = LULULEMON_OPPORTUNITY_MEDIA[styleName];
  const match = {
    url:
      media?.url ||
      product?.url ||
      `https://shop.lululemon.com/search?Ntt=${encodeURIComponent(styleName)}`,
    images: media?.images?.length ? media.images : images,
    productTitle: product?.title || styleName,
  };
  LULULEMON_OPPORTUNITY_PRODUCT_CACHE.set(styleName, match);
  return match;
}

const LULULEMON_WOMEN_STYLE_TERMS = [
  "high rise",
  "mid rise",
  "super high rise",
  "low rise",
  "align",
  "wunder",
  "groove",
  "dance studio",
  "softstreme",
  "swift speed",
  "fast and free",
  "tight",
  "legging",
  "flare",
  "flared",
  "palazzo",
  "wide leg",
  "barrel leg",
  "city sleek",
  "adapted state",
  "ready to rulu",
  "nulu",
  "skirt",
  "bra",
];

const LULULEMON_MEN_STYLE_TERMS = [
  "abc",
  "slim fit",
  "classic fit",
  "relaxed fit",
  "zeroed in",
  "commission",
  "utilitech",
  "golf",
  "jogger",
  "trouser",
  "license to train",
  "pace breaker",
  "steady state",
  "smooth spacer",
  "balancer",
  "surge",
  "bowline",
  "boxer",
  "polo",
];

function inferLululemonStyleGender(styleName, subtypeKey) {
  const normalizedName = normalizeLululemonStyleName(styleName);
  const matchedGenders = new Set();

  for (const product of LULULEMON_SCRAPED_STYLE_AUDIENCES) {
    if (
      product.name === normalizedName ||
      product.name.startsWith(`${normalizedName} `) ||
      normalizedName.startsWith(`${product.name} `)
    ) {
      product.genders.forEach((gender) => matchedGenders.add(gender));
    }
  }

  if (matchedGenders.size === 1) return [...matchedGenders][0];
  if (LULULEMON_WOMEN_STYLE_TERMS.some((term) => normalizedName.includes(term))) {
    return "Women";
  }
  if (LULULEMON_MEN_STYLE_TERMS.some((term) => normalizedName.includes(term))) {
    return "Men";
  }
  if (subtypeKey === "skirt" || subtypeKey === "tank-top") return "Women";
  if (subtypeKey === "boxer-brief") return "Men";
  return "Women";
}

function getLululemonComparisonBase(value, metric) {
  return metric === "sales" ? value / LULULEMON_FOB_MULTIPLIER : value;
}

function getNygShare(nygValue, lululemonValue, metric) {
  const comparisonBase = getLululemonComparisonBase(lululemonValue, metric);
  return comparisonBase ? (nygValue / comparisonBase) * 100 : 0;
}

function LululemonNygMetricGrid({ selectedKey }) {
  const selected =
    LULULEMON_NYG_COMPARISON.find((row) => row.key === selectedKey) ||
    LULULEMON_NYG_COMPARISON[0];
  const scopeLabel = selected.key === "overall" ? "" : `${selected.label} `;
  const metrics = [
    {
      icon: "PCS",
      label: `${scopeLabel}NYG pcs`,
      value: formatComparisonValue(selected.nygUnits, "units").replace(" units", ""),
    },
    {
      icon: "PCS",
      label: `${scopeLabel}Lululemon units`,
      value: formatComparisonValue(selected.lululemonUnits, "units").replace(
        " units",
        "",
      ),
    },
    {
      icon: "YDS",
      label: `${scopeLabel}NYG fabric used`,
      value: formatFabricYards(selected.nygFabricYards, true),
      note: `${formatNumber.format(selected.nygFabricProducts)} NYG products with recorded fabric use`,
    },
    {
      icon: "YDS",
      label: `${scopeLabel}NYK fabric used`,
      value: formatFabricYards(selected.nykFabricYards, true),
      note: `${formatNumber.format(selected.nykFabricProducts)} NYG products with NYK fabric`,
    },
  ];

  return <LululemonMetricGrid metrics={metrics} compact />;
}

function LululemonSubtypeComparisonChart({ metric, selectedKey, onSelect }) {
  const [tableMetric, setTableMetric] = useState("sales");
  const isSales = metric === "sales";
  const isUnits = metric === "units";
  const lululemonField = isSales
    ? "lululemonSales"
    : isUnits
      ? "lululemonUnits"
      : "lululemonProducts";
  const nygField = isSales
    ? "nygSales"
    : isUnits
      ? "nygUnits"
      : "nygProducts";
  const rows = LULULEMON_NYG_COMPARISON.filter((row) => row.key !== "overall")
    .map((row) => ({
      ...row,
      comparisonBase: getLululemonComparisonBase(row[lululemonField], metric),
      nygValue: row[nygField],
      share: getNygShare(row[nygField], row[lululemonField], metric),
    }))
    .sort((a, b) => b.comparisonBase - a.comparisonBase);
  const maxBase = Math.max(...rows.map((row) => row.comparisonBase), 1);
  const baseLabel = isSales
    ? "Lululemon"
    : `Lululemon ${isUnits ? "Total Units" : "Products"}`;
  const tableIsSales = tableMetric === "sales";
  const tableNygField = tableIsSales ? "nygSales" : "nygUnits";
  const tableLululemonField = tableIsSales ? "lululemonSales" : "lululemonUnits";
  const tableLabel = tableIsSales ? "Total Sale" : "Total Unit";
  const tooltipMetricLabel = isSales
    ? "Sales"
    : isUnits
      ? "Units"
      : "Products";

  return (
    <div className="lululemon-subtype-comparison">
      <div className="lululemon-subtype-legend">
        <span>
          <i className="lululemon-key" />
          {baseLabel}
        </span>
        <span><i className="nyg-key" />NYG</span>
      </div>
      <div className="lululemon-subtype-chart-layout">
        <div className="lululemon-subtype-plot">
          {rows.map((row) => {
            const tooltipId = `lululemon-subtype-tooltip-${row.key}`;
            return (
              <button
                className={selectedKey === row.key ? "selected" : undefined}
                key={row.key}
                type="button"
                aria-describedby={tooltipId}
                aria-pressed={selectedKey === row.key}
                onClick={() => onSelect(row.key)}
              >
                <strong>{row.label}</strong>
                <span className="lululemon-subtype-scale">
                  <span
                    className="lululemon-subtype-total"
                    style={{ width: `${(row.comparisonBase / maxBase) * 100}%` }}
                  >
                    <i
                      className={row.share <= 0 ? "empty" : undefined}
                      style={{ width: `${Math.min(row.share, 100)}%` }}
                    />
                  </span>
                </span>
                <b className={row.share <= 0 ? "empty" : undefined}>
                  {formatComparisonShare(row.share)}
                </b>
                <span className="lululemon-subtype-tooltip" id={tooltipId} role="tooltip">
                  <span>
                    <i className="nyg-key" />
                    NYG {tooltipMetricLabel}
                    <b>{formatComparisonValue(row[nygField], metric)}</b>
                  </span>
                  <span>
                    <i className="lululemon-key" />
                    Lululemon {tooltipMetricLabel}
                    <b>{formatComparisonValue(row[lululemonField], metric)}</b>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="lululemon-subtype-table-wrap">
          <div className="lululemon-subtype-table-controls" aria-label="Table value">
            {[
              { value: "sales", label: "Sale" },
              { value: "units", label: "Units" },
            ].map((option) => (
              <button
                className={tableMetric === option.value ? "active" : undefined}
                key={option.value}
                type="button"
                aria-pressed={tableMetric === option.value}
                onClick={() => setTableMetric(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <table className="lululemon-subtype-table">
            <thead>
              <tr>
                <th>Sub-type</th>
                <th>NYG</th>
                <th>{tableLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className={selectedKey === row.key ? "selected" : undefined} key={row.key}>
                  <td>
                    <button type="button" onClick={() => onSelect(row.key)}>
                      {row.label}
                    </button>
                  </td>
                  <td>{formatComparisonValue(row[tableNygField], tableMetric)}</td>
                  <td>{formatComparisonValue(row[tableLululemonField], tableMetric)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LululemonOpportunityList({
  coverage,
  groups,
  total,
  expandedGenders,
  onToggleGender,
  selectionKey,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedItemRef = useRef(null);
  const normalizedQuery = normalizeLululemonProductName(searchQuery);
  const isSearching = normalizedQuery.length > 0;
  const filteredGroups = groups.map((group) => ({
    ...group,
    styles: isSearching
      ? group.styles.filter((style) =>
          normalizeLululemonProductName(
            `${style.name} ${style.productTitle || ""}`,
          ).includes(normalizedQuery),
        )
      : group.styles,
  }));
  const filteredTotal = filteredGroups.reduce(
    (sum, group) => sum + group.styles.length,
    0,
  );
  const selectedMatch = groups
    .flatMap((group) => group.styles.map((style) => ({ ...style, gender: group.gender })))
    .find((style) => style.linkedSelection);

  useEffect(() => {
    setSearchQuery("");
  }, [coverage.key]);

  useEffect(() => {
    if (selectionKey) setSearchQuery("");
  }, [selectionKey]);

  useEffect(() => {
    if (!selectedMatch) return undefined;
    const frame = window.requestAnimationFrame(() => {
      selectedItemRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectionKey, coverage.key]);

  return (
    <div className="lululemon-style-portfolio-list remaining">
      <div className="lululemon-style-portfolio-heading">
        <span>Lululemon opportunities</span>
        <strong>
          {isSearching
            ? `${formatNumber.format(filteredTotal)} found / ${formatNumber.format(total)}`
            : selectedMatch
              ? `${selectedMatch.gender} rank #${formatNumber.format(selectedMatch.rank)}`
            : `Top 5 each / ${formatNumber.format(total)}`}
        </strong>
      </div>
      {coverage.rawRemaining && (
        <p className="lululemon-style-family-note">
          {formatNumber.format(coverage.rawRemaining)} raw Base Styles consolidated into {formatNumber.format(coverage.remaining)} grouped styles; {formatNumber.format(coverage.consolidatedVariants)} length variants grouped (25&quot;, 28&quot;, 30L, Tall, Regular, Shorter).
        </p>
      )}
      <div className="lululemon-opportunity-search">
        <label htmlFor={`lululemon-style-search-${coverage.key}`}>
          <span>Find a Lululemon style</span>
          <input
            className="lululemon-style-family-search"
            id={`lululemon-style-search-${coverage.key}`}
            type="search"
            value={searchQuery}
            placeholder="Search style name to compare with NYG..."
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        {isSearching && (
          <button type="button" onClick={() => setSearchQuery("")}>
            Clear
          </button>
        )}
        <small>
          {isSearching
            ? `${formatNumber.format(filteredTotal)} matching styles, ranked by sales.`
            : selectedMatch
              ? `${selectedMatch.name} is highlighted at its original sales rank.`
              : "Search results keep the current sales ranking."}
        </small>
      </div>
      <div className="lululemon-style-opportunity-groups ranked-list">
        {filteredGroups.map((group) => {
          const isExpanded = expandedGenders[group.gender];
          const hasSelectedStyle = group.styles.some((style) => style.linkedSelection);
          const displayedStyles = isSearching || isExpanded || hasSelectedStyle
            ? group.styles
            : group.styles.slice(0, 5);
          return (
            <section className={`lululemon-style-gender-group ${group.gender.toLowerCase()}`} key={group.gender}>
              <div className="lululemon-style-gender-heading">
                <span>{group.gender}</span>
                <b>
                  {isSearching
                    ? `${group.styles.length} ${group.styles.length === 1 ? "match" : "matches"}`
                    : isExpanded
                    ? `All ${group.styles.length}`
                    : `Top ${Math.min(5, group.styles.length)}`}
                </b>
              </div>
              <ol className={isSearching || isExpanded || hasSelectedStyle ? "expanded" : undefined}>
                {displayedStyles.map((style) => {
                  const isSelectedStyle = Boolean(style.linkedSelection);
                  return (
                  <li
                    className={isSelectedStyle ? "selected" : undefined}
                    data-rank={style.rank}
                    key={style.name}
                    ref={isSelectedStyle ? selectedItemRef : undefined}
                  >
                    <a
                      className="lululemon-opportunity-product-link"
                      href={style.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${style.productTitle} on Lululemon`}
                    >
                      <span className="lululemon-opportunity-images" aria-hidden="true">
                        {style.images.length > 0 ? (
                          style.images.map((imageUrl, imageIndex) => (
                            <img
                              alt=""
                              key={imageUrl}
                              loading="lazy"
                              src={imageUrl}
                              style={{ "--image-index": imageIndex }}
                            />
                          ))
                        ) : (
                          <span className="lululemon-opportunity-image-placeholder">L</span>
                        )}
                      </span>
                      <span className="lululemon-opportunity-product-name">
                        <strong>{style.name}</strong>
                        <small>View on Lululemon</small>
                      </span>
                    </a>
                    <span className="lululemon-style-opportunity-value">
                      {style.sales !== null && (
                        <strong>{formatComparisonValue(style.sales, "sales")}</strong>
                      )}
                      {style.units > 0 && (
                        <small>{formatComparisonValue(style.units, "units")}</small>
                      )}
                      {style.variants > 1 && <b>{style.variants} length variants</b>}
                    </span>
                  </li>
                  );
                })}
              </ol>
              {!isSearching && group.styles.length > 5 && (
                <button
                  className="lululemon-style-view-more"
                  type="button"
                  aria-expanded={Boolean(isExpanded)}
                  onClick={() => onToggleGender(group.gender)}
                >
                  {isExpanded
                    ? "Show top 5"
                    : `View more (${formatNumber.format(group.styles.length - 5)})`}
                </button>
              )}
              {group.styles.length === 0 && (
                <small className="lululemon-style-gender-empty">No matching styles</small>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function LululemonNykFabricPanel({ subtypeKey }) {
  const recordedStyles = LULULEMON_NYG_STYLES.filter(
    (style) => style.subtype === subtypeKey && style.nykFabricYards > 0,
  ).sort((left, right) => right.nykFabricYards - left.nykFabricYards);
  const recordedYards = recordedStyles.reduce(
    (sum, style) => sum + style.nykFabricYards,
    0,
  );
  const futureStyles = LULULEMON_NYG_FUTURE_STYLES_WITH_NYK(
    LULULEMON_NYG_FUTURE_STYLES.filter((style) => style.subtype === subtypeKey),
  )
    .filter((style) => style.nykFabricYards > 0)
    .sort((left, right) => right.nykFabricYards - left.nykFabricYards);
  const futureYards = futureStyles.reduce(
    (sum, style) => sum + style.nykFabricYards,
    0,
  );

  const renderStyles = (styles, emptyMessage, ordered = false) => (
    styles.length > 0 ? (
      <div className="lululemon-nyk-fabric-list">
        {styles.map((style) => (
          <div key={style.key}>
            <span>
              <strong>{style.name}</strong>
              <small>
                {ordered
                  ? style.nykFabricSeasons
                    .map(({ season, yards }) => `${season} ${formatNumber.format(Math.round(yards))}`)
                    .join(" | ")
                  : style.season}
              </small>
              {ordered && (
                <small className="lululemon-nyk-materials">
                  {style.nykFabrics
                    .map(({ itemCode, construction }) => `${itemCode} ${construction}`)
                    .join(" + ")}
                </small>
              )}
            </span>
            <b>{formatNumber.format(Math.round(style.nykFabricYards))} YDS</b>
          </div>
        ))}
      </div>
    ) : (
      <div className="lululemon-nyk-empty compact">
        <span>{emptyMessage}</span>
      </div>
    )
  );

  return (
    <div className="lululemon-style-portfolio-list nyk-fabric">
      <div className="lululemon-style-portfolio-heading">
        <span>NYK fabric</span>
        <strong>{futureStyles.length} future {futureStyles.length === 1 ? "match" : "matches"}</strong>
      </div>
      <div className="lululemon-nyk-period">
        <div className="lululemon-nyk-period-heading">
          <span>FA25-SU26 recorded usage</span>
          <b>{formatNumber.format(Math.round(recordedYards))} YDS</b>
        </div>
        {renderStyles(recordedStyles, "No recorded NYK usage for this sub-type.")}
      </div>
      <div className="lululemon-nyk-period future">
        <div className="lululemon-nyk-period-heading">
          <span>FA26-SP27 ordered fabric</span>
          <b>{formatNumber.format(Math.round(futureYards))} YDS</b>
        </div>
        {renderStyles(futureStyles, "No matched NYK fabric PO for this sub-type.", true)}
      </div>
    </div>
  );
}

function LululemonNygStyleComparison({
  style,
  onClear,
  overview = false,
  aggregate = false,
  filters = null,
}) {
  const unitMatch = LULULEMON_STYLE_COMPARISON_UNITS[style.key];
  const lululemonUnits = unitMatch?.lululemonUnits ?? style.lululemonUnits ?? 0;
  const lululemonRetailSales = unitMatch?.lululemonSales ?? style.lululemonRevenue;
  const salesCoverage = lululemonRetailSales ? (style.nygSales / lululemonRetailSales) * 100 : 0;
  const unitsCoverage = lululemonUnits ? (style.nygUnits / lululemonUnits) * 100 : 0;
  const partnerSummaries = [
    {
      key: "lululemon",
      label: "Lululemon",
      sales: formatComparisonValue(lululemonRetailSales, "sales"),
      units: lululemonUnits > 0
        ? formatComparisonValue(lululemonUnits, "units").replace(" units", " pcs")
        : "N/A",
      detail: "Revenue period 1 SEP 25 - 31 AUG 26",
    },
    {
      key: "nyg",
      label: "NYG",
      sales: formatComparisonValue(style.nygSales, "sales"),
      units: formatComparisonValue(style.nygUnits, "units").replace(" units", " pcs"),
      detail: `${formatComparisonShare(salesCoverage)} of Lululemon sales · ${formatComparisonShare(unitsCoverage)} unit coverage`,
    },
  ];
  const coverageMetrics = [
    {
      key: "sales",
      label: "Sales coverage",
      share: salesCoverage,
      nygValue: formatComparisonValue(style.nygSales, "sales"),
      lululemonValue: formatComparisonValue(lululemonRetailSales, "sales"),
      lululemonLabel: "Lululemon Sale Total",
      hasBenchmark: lululemonRetailSales > 0,
    },
    {
      key: "units",
      label: "Units coverage",
      share: unitsCoverage,
      nygValue: formatComparisonValue(style.nygUnits, "units").replace(" units", " pcs"),
      lululemonValue: lululemonUnits > 0
        ? formatComparisonValue(lululemonUnits, "units").replace(" units", " pcs")
        : "N/A",
      lululemonLabel: "Lululemon units",
      hasBenchmark: lululemonUnits > 0,
    },
  ];

  return (
    <section className="lululemon-style-linked-comparison" aria-live="polite">
      <div className="lululemon-style-linked-heading">
        <div>
          <span>
            {overview
              ? "All sub-types · Overall comparison"
              : aggregate
                ? `${style.name} sub-type · Overall comparison`
                : "Selected NYG style · Overall comparison"}
          </span>
          <h4>{style.name}</h4>
          <p>
            {style.season} · {style.gender} · {overview || aggregate
              ? "Current season selection"
              : "Total across all listed seasons"}
          </p>
        </div>
        {(filters || onClear) && (
          <div className="lululemon-style-linked-actions">
            {filters}
            {onClear && <button type="button" onClick={onClear}>Clear selection</button>}
          </div>
        )}
      </div>
      <div className="lululemon-style-comparison-body">
        <div className="lululemon-style-partner-summary-grid">
          {partnerSummaries.map((partner) => (
            <article className={`lululemon-style-partner-summary ${partner.key}`} key={partner.key}>
              <span className="lululemon-style-partner-name">{partner.label}</span>
              <div className="lululemon-style-partner-values">
                <span><small>Sales</small><strong>{partner.sales}</strong></span>
                <span><small>Units</small><strong>{partner.units}</strong></span>
              </div>
              <p>{partner.detail}</p>
            </article>
          ))}
        </div>
        <div className="lululemon-style-coverage-chart">
          <div className="lululemon-style-coverage-chart-heading">
            <span>{style.name} · NYG coverage of Lululemon</span>
            <small>Overall comparison</small>
          </div>
          <div className="lululemon-style-mirror-heading" aria-hidden="true">
            <span>Lululemon</span>
            <span>Comparison</span>
            <span>NYG</span>
          </div>
          <div className="lululemon-style-coverage-chart-grid">
            {coverageMetrics.map((metric) => (
              <article className="lululemon-style-mirror-row" key={metric.key}>
                <div className="lululemon-style-mirror-side lululemon">
                  <div className="lululemon-style-mirror-value">
                    <small>{metric.lululemonLabel}</small>
                    <strong>{metric.lululemonValue}</strong>
                  </div>
                  <div className="lululemon-style-mirror-track">
                    <i style={{ width: metric.hasBenchmark ? "100%" : "0%" }} />
                  </div>
                </div>
                <div className="lululemon-style-mirror-axis">
                  <span>{metric.label}</span>
                  <strong>{formatComparisonShare(metric.share)}</strong>
                </div>
                <div className="lululemon-style-mirror-side nyg">
                  <div className="lululemon-style-mirror-value">
                    <small>NYG</small>
                    <strong>{metric.nygValue}</strong>
                  </div>
                  <div
                    className="lululemon-style-mirror-track"
                    aria-label={`${metric.label}: ${formatComparisonShare(metric.share)}`}
                  >
                    <i style={{ width: `${Math.max(0, Math.min(metric.share, 100))}%` }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LululemonNykComparison({ summary, overview = false, filters = null }) {
  const recordedYards = summary.nykRecordedYards || 0;
  const futureYards = summary.nykFutureYards || 0;
  const maxYards = Math.max(recordedYards, futureYards, 1);
  const fabricRows = [
    { key: "recorded", label: "Recorded usage", value: recordedYards },
    { key: "future", label: "Future orders", value: futureYards },
  ];

  return (
    <section className="lululemon-style-linked-comparison lululemon-nyk-linked-comparison" aria-live="polite">
      <div className="lululemon-style-linked-heading">
        <div>
          <span>{overview ? "All sub-types · NYK fabric summary" : `${summary.name} · NYK fabric summary`}</span>
          <h4>{summary.name}</h4>
          <p>{summary.season} · NYK fabric coverage</p>
        </div>
        {filters && <div className="lululemon-style-linked-actions">{filters}</div>}
      </div>
      <div className="lululemon-style-comparison-body">
        <div className="lululemon-style-partner-summary-grid">
          <article className="lululemon-style-partner-summary lululemon">
            <span className="lululemon-style-partner-name">Lululemon</span>
            <div className="lululemon-style-partner-values">
              <span><small>Sales</small><strong>{formatComparisonValue(summary.lululemonRevenue, "sales")}</strong></span>
              <span><small>Units</small><strong>{formatComparisonValue(summary.lululemonUnits, "units").replace(" units", " pcs")}</strong></span>
            </div>
          </article>
          <article className="lululemon-style-partner-summary nyk">
            <span className="lululemon-style-partner-name">NYK</span>
            <div className="lululemon-style-partner-values">
              <span><small>Fabric</small><strong>{formatFabricYards(summary.nykFabricYards || 0, true)}</strong></span>
              <span><small>Matched styles</small><strong>{formatNumber.format(summary.nykMatchedStyles || 0)}</strong></span>
            </div>
          </article>
        </div>
        <div className="lululemon-style-coverage-chart lululemon-nyk-fabric-chart">
          <div className="lululemon-style-coverage-chart-heading">
            <span>{summary.name} · NYK fabric by period</span>
            <small>Total {formatFabricYards(summary.nykFabricYards || 0, true)}</small>
          </div>
          <div className="lululemon-nyk-fabric-chart-grid">
            {fabricRows.map((row) => (
              <div key={row.key}>
                <span>{row.label}</span>
                <i><b style={{ width: `${(row.value / maxYards) * 100}%` }} /></i>
                <strong>{formatFabricYards(row.value, true)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      <small className="lululemon-style-partner-source">
        NYK source contains fabric usage and purchase orders; sales and garment units are not available.
      </small>
    </section>
  );
}

const LULULEMON_DEFAULT_STYLE_SEASONS = ["FA25", "WT25", "SP26", "SU26"];

function LululemonStyleShare({ subtypeKey, subtypeLabel, onSelect }) {
  const allStyles = useMemo(
    () => [
      ...LULULEMON_NYG_STYLES.filter(
        (style) => subtypeKey === "overall" || style.subtype === subtypeKey,
      ).map(
        (style) => ({
          ...style,
          period: "current",
          seasonMetrics: LULULEMON_NYG_SEASON_METRICS[style.key] || [],
        }),
      ),
      ...LULULEMON_NYG_FUTURE_STYLES.filter(
        (style) => subtypeKey === "overall" || style.subtype === subtypeKey,
      )
        .map(enrichFutureStyleWithNykFabric)
        .map((style) => ({
          ...style,
          seasonMetrics: LULULEMON_NYG_SEASON_METRICS[style.key] || [],
        })),
    ].sort((a, b) => {
      if (a.period !== b.period) return a.period === "current" ? -1 : 1;
      return b.nygSales - a.nygSales;
    }),
    [subtypeKey],
  );
  const availableSeasons = useMemo(() => NYG_MY_MAP_SEASONS.filter((season) =>
    allStyles.some((style) => style.season.split(",").map((value) => value.trim()).includes(season)),
  ), [allStyles]);
  const coverage = LULULEMON_STYLE_COVERAGE.find(
    (row) => row.key === subtypeKey,
  );
  const [expandedOpportunityGenders, setExpandedOpportunityGenders] = useState({});
  const [partnerView, setPartnerView] = useState("nyg");
  const [selectedNygStyleKey, setSelectedNygStyleKey] = useState(null);
  const [selectedNygSeason, setSelectedNygSeason] = useState(null);
  const [selectedSeasons, setSelectedSeasons] = useState(LULULEMON_DEFAULT_STYLE_SEASONS);
  const styles = useMemo(() => (
    selectedSeasons.length === 0 || partnerView !== "nyg"
      ? allStyles
      : allStyles.filter((style) => style.season
        .split(",")
        .map((value) => value.trim())
        .some((season) => selectedSeasons.includes(season)))
  ), [allStyles, partnerView, selectedSeasons]);
  const activeSelectedSeasons = selectedSeasons.length === 0 ? availableSeasons : selectedSeasons;
  const aggregateStyleForSelectedSeasons = (style) => {
    const styleSeasons = style.season.split(",").map((season) => season.trim());
    const matchedSeasons = activeSelectedSeasons.filter((season) => styleSeasons.includes(season));
    const matchedMetrics = (style.seasonMetrics || [])
      .filter((metric) => matchedSeasons.includes(metric.season));
    return {
      ...style,
      season: matchedSeasons.join(", ") || style.season,
      nygSales: matchedMetrics.length > 0
        ? matchedMetrics.reduce((sum, metric) => sum + metric.nygSales, 0)
        : style.nygSales,
      nygUnits: matchedMetrics.length > 0
        ? matchedMetrics.reduce((sum, metric) => sum + metric.nygUnits, 0)
        : style.nygUnits,
    };
  };
  const selectedNygBaseStyle = styles.find((style) => style.key === selectedNygStyleKey);
  const selectedNygStyle = selectedNygBaseStyle
    ? aggregateStyleForSelectedSeasons(selectedNygBaseStyle)
    : null;

  useEffect(() => {
    setExpandedOpportunityGenders({});
    setSelectedNygStyleKey(null);
    setSelectedNygSeason(null);
  }, [styles]);

  useEffect(() => {
    setSelectedSeasons(
      LULULEMON_DEFAULT_STYLE_SEASONS.filter((season) => availableSeasons.includes(season)),
    );
  }, [subtypeKey, availableSeasons]);

  const toggleSeason = (season) => {
    setSelectedSeasons((current) => (
      current.includes(season)
        ? current.filter((item) => item !== season)
        : availableSeasons.filter((item) => [...current, season].includes(item))
    ));
  };

  const subtypeControls = (
    <div className="lululemon-comparison-controls lululemon-style-controls">
      <div className="lululemon-partner-filter">
        <span>Partner view</span>
        <div role="group" aria-label="Partner view">
          {[
            { key: "nyg", label: "NYG" },
            { key: "nyk", label: "NYK" },
            { key: "map", label: "MY MAP" },
          ].map((option) => (
            <button
              className={partnerView === option.key ? "active" : undefined}
              key={option.key}
              type="button"
              aria-pressed={partnerView === option.key}
              onClick={() => setPartnerView(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <button
        className="lululemon-comparison-reset"
        type="button"
        onClick={() => onSelect("overall")}
        disabled={subtypeKey === "overall"}
      >
        Reset
      </button>
      <label>
        <span>Sub-type</span>
        <select
          value={subtypeKey}
          onChange={(event) => onSelect(event.target.value)}
        >
          {LULULEMON_NYG_COMPARISON.map((row) => (
            <option key={row.key} value={row.key}>
              {row.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
  const seasonFilter = partnerView === "nyg" && (
    <div className="lululemon-style-season-filter">
      <div className="lululemon-style-season-summary">
        <span>Season filter</span>
        <strong>
          {selectedSeasons.length === 0
            ? `All ${availableSeasons.length} seasons`
            : `${selectedSeasons.length} seasons selected`}
        </strong>
      </div>
      <div className="lululemon-style-season-options" role="group" aria-label="Filter NYG secured styles by season">
        <button
          className={selectedSeasons.length === 0 ? "active" : undefined}
          type="button"
          aria-pressed={selectedSeasons.length === 0}
          onClick={() => setSelectedSeasons([])}
        >
          All seasons
        </button>
        {availableSeasons.map((season) => (
          <button
            className={selectedSeasons.includes(season) ? "active" : undefined}
            type="button"
            key={season}
            aria-pressed={selectedSeasons.includes(season)}
            onClick={() => toggleSeason(season)}
          >
            {season}
          </button>
        ))}
      </div>
      <p className="lululemon-revenue-period-note">
        <strong>Lululemon revenue period:</strong> 1 SEP 25 - 31 AUG 26
      </p>
    </div>
  );
  const summaryFilters = (
    <div className="lululemon-style-summary-filters" aria-label="Comparison summary filters">
      <label>
        <span>Partner</span>
        <select value={partnerView} onChange={(event) => setPartnerView(event.target.value)}>
          <option value="nyg">NYG</option>
          <option value="nyk">NYK</option>
        </select>
      </label>
      <label>
        <span>Sub-type</span>
        <select value={subtypeKey} onChange={(event) => onSelect(event.target.value)}>
          {LULULEMON_NYG_COMPARISON.map((row) => (
            <option key={row.key} value={row.key}>{row.label}</option>
          ))}
        </select>
      </label>
    </div>
  );

  if (partnerView === "map") {
    return (
      <article className="lululemon-overview-card lululemon-style-card">
        <div className="lululemon-style-card-heading">
          <div>
            <h3>{subtypeLabel} NYG My Map</h3>
            <p>Explore the NYG product hierarchy from Group through Style Name.</p>
          </div>
          {subtypeControls}
        </div>
        <NygMyMap subtypeKey={subtypeKey} />
      </article>
    );
  }

  if (subtypeKey === "overall") {
    const overallComparison = LULULEMON_NYG_COMPARISON.find((row) => row.key === "overall");
    const overviewRows = LULULEMON_NYG_COMPARISON.filter((row) => row.key !== "overall")
      .map((row) => {
        const rowCoverage = LULULEMON_STYLE_COVERAGE.find((item) => item.key === row.key);
        const rowStyles = styles.filter((style) => style.subtype === row.key);
        const partnerMetrics = rowStyles.reduce((summary, style) => {
          const seasonMetrics = selectedSeasons.length === 0
            ? style.seasonMetrics
            : style.seasonMetrics.filter((metric) => selectedSeasons.includes(metric.season));
          summary.sales += seasonMetrics.reduce((sum, metric) => sum + metric.nygSales, 0);
          summary.units += seasonMetrics.reduce((sum, metric) => sum + metric.nygUnits, 0);
          summary.nykFabricYards += style.nykFabricYards || 0;
          if ((style.nykFabricYards || 0) > 0) {
            summary.nykMatchedStyles += 1;
            if (style.period === "future") {
              summary.nykFutureYards += style.nykFabricYards;
            } else {
              summary.nykRecordedYards += style.nykFabricYards;
            }
          }
          return summary;
        }, {
          sales: 0,
          units: 0,
          nykFabricYards: 0,
          nykMatchedStyles: 0,
          nykRecordedYards: 0,
          nykFutureYards: 0,
        });
        const topOpportunity = LULULEMON_REMAINING_OPPORTUNITIES[row.key]?.[0];
        return {
          ...row,
          opportunityCount: rowCoverage?.remaining || 0,
          securedStyles: rowStyles.length,
          topOpportunity,
          ...partnerMetrics,
        };
      });
    const overviewTotals = overviewRows.reduce((summary, row) => ({
      sales: summary.sales + row.sales,
      units: summary.units + row.units,
      nykFabricYards: summary.nykFabricYards + row.nykFabricYards,
      nykMatchedStyles: summary.nykMatchedStyles + row.nykMatchedStyles,
      nykRecordedYards: summary.nykRecordedYards + row.nykRecordedYards,
      nykFutureYards: summary.nykFutureYards + row.nykFutureYards,
    }), {
      sales: 0,
      units: 0,
      nykFabricYards: 0,
      nykMatchedStyles: 0,
      nykRecordedYards: 0,
      nykFutureYards: 0,
    });
    const overviewSummary = {
      key: "all-subtypes-summary",
      name: "All sub-types",
      season: selectedSeasons.length === 0
        ? `All ${availableSeasons.length} seasons`
        : selectedSeasons.join(", "),
      gender: "All genders",
      lululemonRevenue: overallComparison?.lululemonSales || 0,
      lululemonUnits: overallComparison?.lululemonUnits || 0,
      nygSales: overviewTotals.sales,
      nygUnits: overviewTotals.units,
      nykFabricYards: overviewTotals.nykFabricYards,
      nykMatchedStyles: overviewTotals.nykMatchedStyles,
      nykRecordedYards: overviewTotals.nykRecordedYards,
      nykFutureYards: overviewTotals.nykFutureYards,
      fobMultiplier: LULULEMON_FOB_MULTIPLIER,
    };

    return (
      <article className="lululemon-overview-card lululemon-style-card">
        <div className="lululemon-style-card-heading">
          <div>
            <h3>All sub-types style overview</h3>
            <p>Compare opportunity size and partner coverage, then select a sub-type for style-level detail.</p>
          </div>
          {subtypeControls}
        </div>
        {seasonFilter}
        {partnerView === "nyg" && (
          <LululemonNygStyleComparison style={overviewSummary} overview filters={summaryFilters} />
        )}
        {partnerView === "nyk" && (
          <LululemonNykComparison summary={overviewSummary} overview filters={summaryFilters} />
        )}
        <div className="lululemon-style-overview-grid">
          {overviewRows.map((row) => (
            <button
              className="lululemon-style-overview-item"
              type="button"
              key={row.key}
              onClick={() => onSelect(row.key)}
            >
              <span className="lululemon-style-overview-heading">
                <strong>{row.label}</strong>
                <small>View detail</small>
              </span>
              <span className="lululemon-style-overview-market">
                <small>Lululemon sales</small>
                <strong>{formatComparisonValue(row.lululemonSales, "sales")}</strong>
                <b>{formatNumber.format(row.opportunityCount)} opportunities</b>
              </span>
              <span className="lululemon-style-overview-partner">
                <small>{partnerView === "nyg" ? "NYG secured" : "NYK fabric coverage"}</small>
                {partnerView === "nyg" ? (
                  <>
                    <strong>{formatComparisonValue(row.sales, "sales")}</strong>
                    <b>{formatComparisonValue(row.units, "units")} · {row.securedStyles} styles</b>
                  </>
                ) : (
                  <>
                    <strong>{formatNumber.format(Math.round(row.nykFabricYards))} YDS</strong>
                    <b>{row.nykMatchedStyles} matched styles</b>
                  </>
                )}
              </span>
              <span className="lululemon-style-overview-opportunity">
                <small>Top opportunity</small>
                <strong>{row.topOpportunity?.name || "No opportunity data"}</strong>
                {row.topOpportunity?.sales > 0 && (
                  <b>{formatComparisonValue(row.topOpportunity.sales, "sales")}</b>
                )}
              </span>
            </button>
          ))}
        </div>
      </article>
    );
  }

  if (!coverage) {
    return (
      <article className="lululemon-overview-card lululemon-style-card">
        <div className="lululemon-style-card-heading">
          <div>
            <h3>Sales coverage by style</h3>
            <p>No style coverage is available for this sub-type.</p>
          </div>
          {subtypeControls}
        </div>
      </article>
    );
  }

  const opportunityStyles =
    LULULEMON_REMAINING_OPPORTUNITIES[subtypeKey] ||
    (subtypeKey === "pant" ? LULULEMON_PANT_STYLE_FAMILIES : coverage.topRemaining);
  const normalizedOpportunityStyles = opportunityStyles.map((style) => {
    const name = typeof style === "string" ? style : style.name;
    const product = findLululemonOpportunityProduct(name);
    return {
      name,
      variants: typeof style === "string" ? 1 : style.variants,
      sales: typeof style === "string" ? null : style.sales ?? null,
      units: typeof style === "string"
        ? null
        : LULULEMON_OPPORTUNITY_UNITS[subtypeKey]?.[name] ?? null,
      gender: style.gender || inferLululemonStyleGender(name, subtypeKey),
      ...product,
    };
  });
  const linkedOpportunityStyles = normalizedOpportunityStyles.map((style) => ({
    ...style,
    linkedSelection: false,
  }));
  const selectedLululemonMatch = selectedNygStyle
    ? LULULEMON_STYLE_COMPARISON_UNITS[selectedNygStyle.key]
    : null;

  if (
    partnerView === "nyg"
    && selectedNygStyle
    && selectedLululemonMatch?.matchedTitles > 0
  ) {
    const matchedProductName = selectedLululemonMatch.matchedProductName || selectedNygStyle.name;
    const exactMatchIndex = linkedOpportunityStyles.findIndex(
      (style) => normalizeLululemonProductName(style.name)
        === normalizeLululemonProductName(matchedProductName),
    );
    const linkedStyle = {
      ...findLululemonOpportunityProduct(matchedProductName),
      name: matchedProductName,
      variants: selectedLululemonMatch.matchedTitles,
      sales: selectedLululemonMatch.lululemonSales,
      units: selectedLululemonMatch.lululemonUnits,
      gender: selectedNygStyle.gender,
      linkedSelection: true,
    };

    if (exactMatchIndex >= 0) {
      linkedOpportunityStyles[exactMatchIndex] = {
        ...linkedOpportunityStyles[exactMatchIndex],
        ...linkedStyle,
      };
    } else {
      linkedOpportunityStyles.push(linkedStyle);
    }

    linkedOpportunityStyles.sort((left, right) => (right.sales ?? 0) - (left.sales ?? 0));
  }
  const opportunityGenderGroups = LULULEMON_GENDERS.map((gender) => ({
    gender,
    styles: linkedOpportunityStyles
      .filter((style) => style.gender === gender)
      .map((style, index) => ({ ...style, rank: index + 1 })),
  }));
  const toggleOpportunityGender = (gender) => {
    setExpandedOpportunityGenders((current) => ({
      ...current,
      [gender]: !current[gender],
    }));
  };
  const subtypeComparison = LULULEMON_NYG_COMPARISON.find((row) => row.key === subtypeKey);
  const subtypeNygTotals = allStyles.reduce((summary, style) => {
    const metrics = style.seasonMetrics || [];
    const selectedMetrics = selectedSeasons.length === 0
      ? metrics
      : metrics.filter((metric) => selectedSeasons.includes(metric.season));
    if (metrics.length > 0) {
      summary.sales += selectedMetrics.reduce((sum, metric) => sum + metric.nygSales, 0);
      summary.units += selectedMetrics.reduce((sum, metric) => sum + metric.nygUnits, 0);
    } else if (
      selectedSeasons.length === 0
      || style.season.split(",").map((season) => season.trim()).some((season) => selectedSeasons.includes(season))
    ) {
      summary.sales += style.nygSales || 0;
      summary.units += style.nygUnits || 0;
    }
    return summary;
  }, { sales: 0, units: 0 });
  const selectedSeasonLabel = selectedSeasons.length === 0
    ? `All ${availableSeasons.length} seasons`
    : selectedSeasons.join(", ");
  const subtypeNygSummary = {
    key: `${subtypeKey}-summary`,
    name: subtypeLabel,
    season: selectedSeasonLabel,
    gender: "All genders",
    lululemonRevenue: subtypeComparison?.lululemonSales || 0,
    lululemonUnits: subtypeComparison?.lululemonUnits || 0,
    nygSales: subtypeNygTotals.sales,
    nygUnits: subtypeNygTotals.units,
    fobMultiplier: LULULEMON_FOB_MULTIPLIER,
  };
  const subtypeNykStyles = allStyles.filter((style) => (style.nykFabricYards || 0) > 0);
  const subtypeNykSummary = {
    name: subtypeLabel,
    season: "All available seasons",
    lululemonRevenue: subtypeComparison?.lululemonSales || 0,
    lululemonUnits: subtypeComparison?.lululemonUnits || 0,
    nykFabricYards: subtypeNykStyles.reduce((sum, style) => sum + style.nykFabricYards, 0),
    nykMatchedStyles: subtypeNykStyles.length,
    nykRecordedYards: subtypeNykStyles
      .filter((style) => style.period !== "future")
      .reduce((sum, style) => sum + style.nykFabricYards, 0),
    nykFutureYards: subtypeNykStyles
      .filter((style) => style.period === "future")
      .reduce((sum, style) => sum + style.nykFabricYards, 0),
  };

  if (styles.length === 0) {
    return (
      <article className="lululemon-overview-card lululemon-style-card">
        <div className="lululemon-style-card-heading">
          <div>
            <h3>{subtypeLabel} sales opportunities by style</h3>
            <p>
              {partnerView === "nyg"
                ? "Top Lululemon programs and NYG secured style matches."
                : "Top Lululemon programs and available NYK fabric coverage."}
            </p>
          </div>
          {subtypeControls}
        </div>
        {seasonFilter}
        {partnerView === "nyg" && (
          <LululemonNygStyleComparison
            style={subtypeNygSummary}
            aggregate
            filters={summaryFilters}
          />
        )}
        {partnerView === "nyk" && (
          <LululemonNykComparison summary={subtypeNykSummary} filters={summaryFilters} />
        )}
        <div className="lululemon-style-coverage-grid opportunity-only">
          <LululemonOpportunityList
            coverage={coverage}
            groups={opportunityGenderGroups}
            total={normalizedOpportunityStyles.length}
            expandedGenders={expandedOpportunityGenders}
            onToggleGender={toggleOpportunityGender}
          />
          <div className="lululemon-style-secured-column">
            {partnerView === "nyg" ? (
              <div className="lululemon-style-portfolio-list secured empty">
                <div className="lululemon-style-portfolio-heading">
                  <span>NYG secured</span>
                  <strong>0 style entries</strong>
                </div>
                <div className="lululemon-no-secured-styles">
                  <strong>No secured styles yet</strong>
                  <span>The programs on the left are the current opportunities for NYG.</span>
                </div>
              </div>
            ) : (
              <LululemonNykFabricPanel subtypeKey={subtypeKey} />
            )}
          </div>
        </div>
        <p className="lululemon-style-taxonomy-note">
          Opportunity gender is grouped from scraped product audience data and Lululemon style naming taxonomy.
        </p>
      </article>
    );
  }

  const taxonomyDifference = coverage.secured - coverage.matchedWithinSubtype;
  const visibleSeasons = activeSelectedSeasons;
  const securedStyles = styles.map(aggregateStyleForSelectedSeasons);
  const securedSeasonGroups = [{
    key: visibleSeasons.join("|"),
    label: visibleSeasons.join(" / "),
    styles: securedStyles,
    genderGroups: LULULEMON_GENDERS.map((gender) => ({
      gender,
      styles: securedStyles.filter((style) => style.gender === gender),
    })),
  }].filter((season) => season.styles.length > 0);
  return (
    <article className="lululemon-overview-card lululemon-style-card">
      <div className="lululemon-style-card-heading">
        <div>
          <h3>
            {subtypeLabel} {partnerView === "nyg" ? "NYG style matches" : "NYK fabric coverage"}
          </h3>
          <p>
            {partnerView === "nyg"
              ? "Click an NYG secured style to view its overall Sales and Units comparison."
              : "Review recorded NYK fabric usage and future NYK fabric orders by matched style."}
          </p>
        </div>
        {subtypeControls}
      </div>
      {seasonFilter}
      {partnerView === "nyg" && (
        <LululemonNygStyleComparison
          style={selectedNygStyle || subtypeNygSummary}
          aggregate={!selectedNygStyle}
          filters={summaryFilters}
          onClear={selectedNygStyle
            ? () => {
              setSelectedNygStyleKey(null);
              setSelectedNygSeason(null);
            }
            : null}
        />
      )}
      {partnerView === "nyk" && (
        <LululemonNykComparison summary={subtypeNykSummary} filters={summaryFilters} />
      )}
      <div className="lululemon-style-coverage-grid">
        <div className="lululemon-style-secured-column">
          {partnerView === "nyg" ? (
            <div className="lululemon-style-portfolio-list secured">
            <div className="lululemon-style-portfolio-heading">
              <span>NYG secured</span>
              <strong>{formatNumber.format(styles.length)} style entries</strong>
            </div>
            <div className="lululemon-secured-periods">
              {securedSeasonGroups.map((season) => (
                <section className="lululemon-secured-period" key={season.key}>
                  <div className="lululemon-secured-period-heading">
                    <span>{season.label}</span>
                    <b>{season.styles.length} {season.styles.length === 1 ? "style" : "styles"}</b>
                  </div>
                  <div className="lululemon-style-secured-list">
                    {season.genderGroups.map((group) => (
                      <section className={`lululemon-style-gender-group ${group.gender.toLowerCase()}`} key={group.gender}>
                        <div className="lululemon-style-gender-heading">
                          <span>{group.gender}</span>
                          <b>{group.styles.length} {group.styles.length === 1 ? "style" : "styles"}</b>
                        </div>
                        <div className="lululemon-style-gender-items">
                          {group.styles.map((style) => (
                            <button
                              className={`lululemon-secured-style ${
                                selectedNygStyleKey === style.key && selectedNygSeason === style.season
                                  ? "selected"
                                  : ""
                              }`.trim()}
                              type="button"
                              key={style.key}
                              aria-pressed={selectedNygStyleKey === style.key && selectedNygSeason === style.season}
                              onClick={() => {
                                const isSelected = selectedNygStyleKey === style.key
                                  && selectedNygSeason === style.season;
                                setSelectedNygStyleKey(isSelected ? null : style.key);
                                setSelectedNygSeason(isSelected ? null : style.season);
                              }}
                            >
                              <span>
                                <strong>{style.name}</strong>
                                <small>{style.season}</small>
                                {style.lululemonTitles > 0 && (
                                  <span className="lululemon-secured-match">
                                    <span>Matched Lululemon product</span>
                                    <strong>{style.name}</strong>
                                    <small>
                                      {formatComparisonValue(style.lululemonRevenue, "sales")} Lululemon sales
                                    </small>
                                  </span>
                                )}
                                {style.nygFabricYards > 0 && (
                                  <span className="lululemon-secured-fabric">
                                    <span>
                                      NYG fabric total <b>{formatNumber.format(Math.round(style.nygFabricYards))} YDS</b>
                                    </span>
                                  </span>
                                )}
                              </span>
                              <span className="lululemon-secured-value">
                                <b>{formatComparisonValue(style.nygSales, "sales")}</b>
                                <small>{formatComparisonValue(style.nygUnits, "units")}</small>
                              </span>
                            </button>
                          ))}
                          {group.styles.length === 0 && (
                            <small className="lululemon-style-gender-empty">No secured styles</small>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            </div>
          ) : (
            <LululemonNykFabricPanel subtypeKey={subtypeKey} />
          )}
        </div>

        <LululemonOpportunityList
          coverage={coverage}
          groups={opportunityGenderGroups}
          total={linkedOpportunityStyles.length}
          expandedGenders={expandedOpportunityGenders}
          onToggleGender={toggleOpportunityGender}
          selectionKey={partnerView === "nyg" && selectedNygStyle
            ? `${selectedNygStyle.key}|${selectedNygStyle.season}`
            : ""}
        />
      </div>
      {taxonomyDifference > 0 && (
        <p className="lululemon-style-taxonomy-note">
          {formatNumber.format(taxonomyDifference)} NYG {taxonomyDifference === 1 ? "style is" : "styles are"} classified under a different Sub-Type in All Product and included as secured in this overview.
        </p>
      )}
      <p className="lululemon-style-taxonomy-note">
        Opportunity gender is grouped from scraped product audience data and Lululemon style naming taxonomy; NYG secured gender comes directly from the Lululemon sheet.
      </p>
    </article>
  );
}

function LululemonNygComparison({ metric, selectedKey }) {
  const selected =
    LULULEMON_NYG_COMPARISON.find((row) => row.key === selectedKey) ||
    LULULEMON_NYG_COMPARISON[0];
  const isSales = metric === "sales";
  const isUnits = metric === "units";
  const lululemonValue = isSales
    ? selected.lululemonSales
    : isUnits
      ? selected.lululemonUnits
      : selected.lululemonProducts;
  const nygValue = isSales
    ? selected.nygSales
    : isUnits
      ? selected.nygUnits
      : selected.nygProducts;
  const share = getNygShare(nygValue, lululemonValue, metric);

  return (
    <article className="lululemon-comparison-card lululemon-comparison-compact-summary">
      <div className="lululemon-comparison-heading">
        <div>
          <p className="eyebrow">INTERACTIVE COMPARISON</p>
          <h3>NYG share of Lululemon</h3>
          <p>
            Choose a sub-type. Every card and chart below updates together.
          </p>
        </div>
      </div>

      <div className="lululemon-comparison-stats">
        <div>
          <span>Lululemon {isSales ? "sales" : isUnits ? "units" : "products"}</span>
          <strong>{formatComparisonValue(lululemonValue, metric)}</strong>
          <small>
            {isSales
              ? `FOB Multiplier: ${LULULEMON_FOB_MULTIPLIER.toFixed(4)}x`
              : metric === "products"
              ? "All Product"
              : `${formatNumber.format(selected.lululemonProducts)} product titles`}
          </small>
        </div>
        <div>
          <span>NYG {isSales ? "sales" : isUnits ? "pieces" : "products"}</span>
          <strong>{formatComparisonValue(nygValue, metric)}</strong>
          <small>
            {metric === "products"
              ? "Lululemon sheet"
              : `${formatNumber.format(selected.nygProducts)} NYG products`}
          </small>
        </div>
        <div className="share">
          <span>NYG share</span>
          <strong>{formatComparisonShare(share)}</strong>
          {!isSales && (
            <small>{`of Lululemon ${selected.label.toLowerCase()}`}</small>
          )}
        </div>
      </div>

    </article>
  );
}

function donutGradient(rows) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (total <= 0) return "transparent";
  let start = 0;
  return `conic-gradient(${rows
    .map((row) => {
      const end = start + (row.value / total) * 100;
      const segment = `${row.color} ${start}% ${end}%`;
      start = end;
      return segment;
    })
    .join(", ")})`;
}

function LululemonRevenueHistory() {
  const maxRevenue = Math.max(...LULULEMON_REVENUE_HISTORY.map((row) => row.value));

  return (
    <article className="lululemon-overview-section lululemon-revenue-history">
      <div className="lululemon-overview-heading">
        <div>
          <p className="eyebrow">PUBLIC COMPANY PERFORMANCE · FY2021-FY2026E</p>
          <h2>Revenue Lululemon 2021-2026E</h2>
        </div>
        <LululemonOverviewLogo />
      </div>

      <div className="lululemon-revenue-dashboard">
        <section className="lululemon-history-card">
          <div className="lululemon-history-card-heading">
            <div>
              <h3>Net revenue</h3>
              <p>USD billions</p>
            </div>
            <div className="lululemon-revenue-kpis">
              <strong>+66.6%</strong>
              <span>growth since 2021</span>
              <em>▼ 6.0% YoY 2025→2026E</em>
            </div>
          </div>
          <div className="lululemon-revenue-bars" aria-label="Lululemon annual net revenue">
            {LULULEMON_REVENUE_HISTORY.map((row) => (
              <div
                className={`lululemon-revenue-column${row.estimate ? " estimate" : ""}`}
                key={row.year}
              >
                <strong>{row.display}</strong>
                <span className="lululemon-revenue-track">
                  <i style={{ height: `${(row.value / maxRevenue) * 100}%` }} />
                </span>
                <b>{row.year}</b>
              </div>
            ))}
          </div>
          <p className="lululemon-guidance-note">
            * FY2026 is company guidance of $10.35-$10.50B, not closed actuals.
          </p>
        </section>

        <section className="lululemon-history-card regional">
          <div className="lululemon-history-card-heading">
            <div>
              <h3>Regional revenue mix</h3>
              <p>Share of annual net revenue</p>
            </div>
          </div>
          <div className="lululemon-region-grid">
            {LULULEMON_REGIONAL_REVENUE.map((period) => (
              <article className="lululemon-region-card" key={period.year}>
                <h4>{period.year}</h4>
                <div
                  className="lululemon-region-donut"
                  style={{ background: donutGradient(period.rows) }}
                  aria-label={`${period.year} regional revenue mix`}
                >
                  <strong>{period.rows[0].value.toFixed(1)}%</strong>
                  <span>Americas</span>
                </div>
                <div className="lululemon-region-legend">
                  {period.rows.map((row) => (
                    <div key={row.label}>
                      <i style={{ background: row.color }} />
                      <span>{row.label}</span>
                      <strong>{row.value.toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="lululemon-history-insights">
        <section>
          <p className="eyebrow">BUSINESS HIGHLIGHTS</p>
          <h3>Growth reverses in 2026.</h3>
          <ul>
            <li><strong>Revenue reversal:</strong> FY2025 grew 4.9% to $11.10B, but FY2026 guidance points to $10.35-$10.50B, a decline of 5-7%.</li>
            <li><strong>Regional shift accelerating:</strong> Americas&apos; share fell to approximately 66% in H1 FY2026 from 70.7% in FY2025.</li>
            <li><strong>Milestone:</strong> FY2024 was the first year annual revenue surpassed $10B.</li>
          </ul>
        </section>
        <section>
          <p className="eyebrow">STRATEGIC CONTEXT</p>
          <h3>No region is fully offsetting Americas.</h3>
          <ul>
            <li><strong>Americas reset:</strong> Revenue fell 8% and comparable sales fell 12% in Q2 FY2026, worse than Q1&apos;s 3% revenue decline.</li>
            <li><strong>China deceleration:</strong> Growth slowed from 30% in Q1 to 4% in Q2 after a social-media sentiment incident and the timing of Tmall&apos;s 618 shopping festival.</li>
            <li><strong>Rest of World:</strong> The steadiest performer, but growth also slowed from 13% to 5% quarter over quarter.</li>
          </ul>
        </section>
      </div>

      <p className="lululemon-source-note">
        Source: Lululemon Athletica Inc. Form 10-K filings (FY2021-FY2025). *FY2026 net revenue is the midpoint of company guidance issued with Q2 FY2026 results (SEC Form 8-K, Sep 3, 2026); FY2026 regional mix is actual H1 FY2026 revenue (Q1+Q2). Values are rounded for display.
      </p>
    </article>
  );
}

function LululemonMixCard({ title, rows, subtitle, featured = false, embedded = false }) {
  const Card = embedded ? "div" : "article";
  return (
    <Card
      className={`lululemon-overview-card lululemon-mix-card ${featured ? "featured" : ""} ${embedded ? "embedded" : ""}`}
    >
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      <div className="lululemon-mix-content">
        <div
          className={`lululemon-mini-donut ${rows.some((row) => row.value > 0) ? "" : "empty"}`}
          style={{ background: donutGradient(rows) }}
          aria-label={`${title} donut chart`}
        />
        <div className="lululemon-mix-legend">
          {rows.map((row) => (
            <div key={row.label}>
              <i style={{ background: row.value > 0 ? row.color : "transparent" }} />
              <span>{row.label}</span>
              <strong className={row.value <= 0 ? "empty" : undefined}>
                {row.value.toFixed(1)}%
              </strong>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

const LULULEMON_TIMELINE_SEASONS = [
  "SS25",
  "SU25",
  "FA25",
  "WT25",
  "SS26",
  "SU26",
  "FA26",
  "WT26",
  "SS27",
  "SU27",
  "FA27",
  "WT27",
];

const LULULEMON_TIMELINE_ROWS = [
  { label: "Revenue", start: 0, end: 3, tone: "revenue" },
  { label: "Particl", start: 2, end: 5, tone: "particl" },
  { label: "NYG", start: 0, end: 9, tone: "nyg" },
  { label: "NYK", start: 0, end: 7, tone: "nyk" },
];

function LululemonTimeline() {
  return (
    <article className="lululemon-overview-section lululemon-timeline-section">
      <div className="lululemon-overview-heading">
        <div>
          <p className="eyebrow">DATA COVERAGE · SS25-WT27</p>
          <h2>Lululemon Timeline</h2>
        </div>
        <LululemonOverviewLogo />
      </div>

      <div className="lululemon-timeline-card">
        <div className="lululemon-timeline-intro">
          <div>
            <span>Season coverage</span>
            <strong>Revenue and sourcing data availability</strong>
          </div>
          <small>Scroll horizontally to view future seasons</small>
        </div>

        <div className="lululemon-timeline-scroll">
          <div className="lululemon-timeline-matrix">
            <div className="lululemon-timeline-season-row">
              <strong>Source</strong>
              <div className="lululemon-timeline-seasons">
                {LULULEMON_TIMELINE_SEASONS.map((season) => (
                  <span key={season}>{season}</span>
                ))}
              </div>
            </div>

            {LULULEMON_TIMELINE_ROWS.map((row) => {
              const firstSeason = LULULEMON_TIMELINE_SEASONS[row.start];
              const lastSeason = LULULEMON_TIMELINE_SEASONS[row.end];
              return (
                <div className="lululemon-timeline-data-row" key={row.label}>
                  <div className="lululemon-timeline-label">
                    <i className={row.tone} />
                    <strong>{row.label}</strong>
                    <small>{firstSeason}-{lastSeason}</small>
                  </div>
                  <div
                    className="lululemon-timeline-track"
                    role="img"
                    aria-label={`${row.label} data covers ${firstSeason} through ${lastSeason}`}
                  >
                    {LULULEMON_TIMELINE_SEASONS.map((season) => (
                      <i aria-hidden="true" key={season} />
                    ))}
                    <span
                      className={`lululemon-timeline-bar ${row.tone}`}
                      style={{ gridColumn: `${row.start + 1} / ${row.end + 2}` }}
                    >
                      {firstSeason} - {lastSeason}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

const LULULEMON_AI_SUGGESTIONS = {
  auto: [
    "จากข้อมูลทั้งหมด ควรนำเสนอผ้าอะไรเพิ่มอีกไหม",
    "What are the top five opportunities for Sales and BD?",
    "Sub-type ใดมีช่องว่างระหว่าง Lululemon กับ NYG มากที่สุด",
  ],
  th: [
    "จากข้อมูลทั้งหมด ควรนำเสนอผ้าอะไรเพิ่มอีกไหม",
    "สรุปโอกาสสำคัญ 5 อันดับสำหรับทีม Sales และ BD",
    "Sub-type ใดมีช่องว่างระหว่าง Lululemon กับ NYG มากที่สุด",
  ],
  en: [
    "Based on all available data, which fabrics should we propose next?",
    "Summarize the top five opportunities for Sales and BD.",
    "Which sub-type has the largest opportunity gap between Lululemon and NYG?",
  ],
};

const AI_LANGUAGE_COPY = {
  auto: {
    greeting:
      "สวัสดีครับ ผมตอบได้ทั้งภาษาไทยและ English โดยจะใช้ภาษาตามคำถามของคุณ / I can answer in Thai or English and will follow the language of your question.",
    loading: "กำลังวิเคราะห์ Dashboard และค้นข้อมูลที่เกี่ยวข้อง... / Analyzing dashboard and market data...",
    placeholder: "ถามเป็นภาษาไทยหรือ English เกี่ยวกับโอกาส ผ้า สินค้า หรือเทรนด์ตลาด...",
    unavailable: "AI กำลังรอการเปิดใช้งานจากผู้ดูแลระบบ / AI is waiting for administrator setup.",
    error: "ไม่สามารถเชื่อมต่อ AI ได้ กรุณาลองอีกครั้ง / Unable to reach AI. Please try again.",
  },
  th: {
    greeting: "สวัสดีครับ ผมช่วยวิเคราะห์ Dashboard และค้นข้อมูลตลาดสำหรับทีม Sales/BD ได้",
    loading: "กำลังวิเคราะห์ Dashboard และค้นข้อมูลที่เกี่ยวข้อง...",
    placeholder: "ถามเกี่ยวกับโอกาส ผ้า สินค้า หรือเทรนด์ตลาด...",
    unavailable: "AI กำลังรอการเปิดใช้งานจากผู้ดูแลระบบ",
    error: "ไม่สามารถเชื่อมต่อ AI ได้ กรุณาลองอีกครั้ง",
  },
  en: {
    greeting: "Hello. I can analyze the dashboard and research market information for Sales and BD.",
    loading: "Analyzing the dashboard and relevant market information...",
    placeholder: "Ask about opportunities, fabrics, products, or market trends...",
    unavailable: "AI is waiting for administrator setup.",
    error: "Unable to reach AI. Please try again.",
  },
};

function DashboardAiAssistant({ context }) {
  const [open, setOpen] = useState(false);
  const [allowWeb, setAllowWeb] = useState(true);
  const [language, setLanguage] = useState("auto");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: AI_LANGUAGE_COPY.auto.greeting,
      sources: [],
    },
  ]);
  const messageListRef = useRef(null);
  const languageCopy = AI_LANGUAGE_COPY[language];

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    if (messages.length === 1) {
      setMessages([
        {
          role: "assistant",
          content: AI_LANGUAGE_COPY[nextLanguage].greeting,
          sources: [],
        },
      ]);
    }
  }

  useEffect(() => {
    if (!open || !messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages, loading, open]);

  async function askAi(question) {
    const cleanQuestion = String(question || "").trim();
    if (!cleanQuestion || loading) return;

    const conversation = messages
      .slice(-8)
      .filter((message) => !message.error)
      .map(({ role, content }) => ({ role, content }));
    setMessages((current) => [
      ...current,
      { role: "user", content: cleanQuestion, sources: [] },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanQuestion,
          messages: conversation,
          context,
          allow_web: allowWeb,
          language,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const unavailable = response.status === 503;
        throw new Error(
          payload.detail || (unavailable ? languageCopy.unavailable : languageCopy.error),
        );
      }
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload.answer,
          sources: payload.sources || [],
          usedWeb: Boolean(payload.used_web),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.message || languageCopy.error,
          sources: [],
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    askAi(input);
  }

  return (
    <>
      <button
        className="dashboard-ai-launcher"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open NIC AI Assistant"
      >
        <span>AI</span>
        Ask AI
      </button>
      {open && (
        <div className="dashboard-ai-layer">
          <button
            className="dashboard-ai-backdrop"
            type="button"
            aria-label="Close AI Assistant"
            onClick={() => setOpen(false)}
          />
          <aside className="dashboard-ai-panel" aria-label="NIC AI Assistant">
            <header className="dashboard-ai-header">
              <div>
                <p>NIC AI ASSISTANT</p>
                <span>Dashboard context + live web</span>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                X
              </button>
            </header>

            <div className="dashboard-ai-toolbar">
              <label className="dashboard-ai-language">
                <span>Language</span>
                <select
                  value={language}
                  onChange={(event) => changeLanguage(event.target.value)}
                >
                  <option value="auto">Auto</option>
                  <option value="th">ไทย</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label className="dashboard-ai-web-toggle">
                <input
                  type="checkbox"
                  checked={allowWeb}
                  onChange={(event) => setAllowWeb(event.target.checked)}
                />
                Search web
              </label>
            </div>

            <div className="dashboard-ai-messages" ref={messageListRef}>
              {messages.map((message, index) => (
                <div
                  className={`dashboard-ai-message ${message.role}${message.error ? " error" : ""}`}
                  key={`${message.role}-${index}`}
                >
                  <span>{message.role === "user" ? "You" : "NIC AI"}</span>
                  <p>{message.content}</p>
                  {message.usedWeb && <small>Live web sources used</small>}
                  {message.sources?.length > 0 && (
                    <div className="dashboard-ai-sources">
                      <strong>Sources</strong>
                      {message.sources.map((source) => (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          key={source.url}
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="dashboard-ai-message assistant loading">
                  <span>NIC AI</span>
                  <p>{languageCopy.loading}</p>
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="dashboard-ai-suggestions">
                {LULULEMON_AI_SUGGESTIONS[language].map((suggestion) => (
                  <button type="button" onClick={() => askAi(suggestion)} key={suggestion}>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form className="dashboard-ai-compose" onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    askAi(input);
                  }
                }}
                placeholder={languageCopy.placeholder}
                rows="3"
                maxLength="4000"
              />
              <div>
                <small>AI may make mistakes. Verify commercial decisions.</small>
                <button type="submit" disabled={loading || !input.trim()}>
                  Send
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}

const NYG_MAP_LEVELS = [
  { key: "group", label: "Group" },
  { key: "businessSegment", label: "Business Segment" },
  { key: "productCategory", label: "Product Category" },
  { key: "productGroup", label: "Product Group" },
  { key: "productType", label: "Product Type" },
  { key: "styleNo", label: "Style" },
];

const NYG_MAP_PRODUCT_TYPES = {
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

function uniqueMapValues(rows, key) {
  return [...new Set(rows.map((row) => row[key]))];
}

function formatNygMapUnits(value) {
  return formatComparisonValue(value, "units").replace(" units", " pcs");
}

function formatNygMapFob(value) {
  return `FOB $${value.toFixed(2)}`;
}

function NygMyMap({ subtypeKey }) {
  const [selectedPath, setSelectedPath] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const mapCanvasRef = useRef(null);
  const selectedProductType = NYG_MAP_PRODUCT_TYPES[subtypeKey];
  const mapRows = useMemo(() => NYG_MY_MAP_ROWS
    .filter((row) => !selectedProductType || row.productType === selectedProductType)
    .map((row) => {
      const seasonMetrics = selectedSeasons.length === 0
        ? row.seasonMetrics
        : row.seasonMetrics.filter((metric) => selectedSeasons.includes(metric.season));
      const salesRevenue = seasonMetrics.reduce((sum, metric) => sum + metric.salesRevenue, 0);
      const units = seasonMetrics.reduce((sum, metric) => sum + metric.units, 0);
      return {
        ...row,
        salesRevenue,
        units,
        fobPrice: units > 0 ? salesRevenue / units : 0,
        seasonMetrics,
      };
    })
    .filter((row) => row.seasonMetrics.length > 0), [selectedProductType, selectedSeasons]);
  const visibleLevelCount = Math.min(selectedPath.length + 1, NYG_MAP_LEVELS.length);
  const uniqueStyleNumbers = new Set(mapRows.map((row) => row.styleNo)).size;
  const totalSales = mapRows.reduce((sum, row) => sum + row.salesRevenue, 0);
  const totalUnits = mapRows.reduce((sum, row) => sum + row.units, 0);
  const averageFob = totalUnits > 0 ? totalSales / totalUnits : 0;

  const rowsAtLevel = (levelIndex) => mapRows.filter((row) =>
    selectedPath.slice(0, levelIndex).every(
      (value, pathIndex) => row[NYG_MAP_LEVELS[pathIndex].key] === value,
    ),
  );

  const handleNodeClick = (levelIndex, value) => {
    setSelectedPath((current) => (
      current[levelIndex] === value
        ? current.slice(0, levelIndex)
        : [...current.slice(0, levelIndex), value]
    ));
  };

  const toggleSeason = (season) => {
    setSelectedSeasons((current) => (
      current.includes(season)
        ? current.filter((item) => item !== season)
        : NYG_MY_MAP_SEASONS.filter((item) => [...current, season].includes(item))
    ));
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      mapCanvasRef.current?.scrollTo({
        left: mapCanvasRef.current.scrollWidth,
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedPath]);

  useEffect(() => {
    setSelectedPath([]);
  }, [subtypeKey, selectedSeasons]);

  return (
    <section className="nyg-map-workspace embedded">
      <div className="nyg-map-summary">
        <div>
          <span>NYG product architecture</span>
          <strong>{selectedProductType || "All product types"}</strong>
          <p>
            Select a card to reveal the next level. The Sub-type control above filters
            this map and remains synchronized with the other partner views.
          </p>
        </div>
        <div className="nyg-map-summary-metrics">
          <div><strong>{uniqueStyleNumbers}</strong><span>Styles</span></div>
          <div><strong>{formatComparisonValue(totalSales, "sales")}</strong><span>Sales</span></div>
          <div><strong>{formatNygMapUnits(totalUnits)}</strong><span>Units</span></div>
          <div><strong>${averageFob.toFixed(2)}</strong><span>Average FOB</span></div>
        </div>
      </div>

      <div className="nyg-map-season-filter">
        <div>
          <span>Season filter</span>
          <strong>
            {selectedSeasons.length === 0
              ? `All ${NYG_MY_MAP_SEASONS.length} seasons`
              : `${selectedSeasons.length} selected`}
          </strong>
        </div>
        <div className="nyg-map-season-options" role="group" aria-label="Filter NYG map by season">
          <button
            className={selectedSeasons.length === 0 ? "active" : undefined}
            type="button"
            aria-pressed={selectedSeasons.length === 0}
            onClick={() => setSelectedSeasons([])}
          >
            All seasons
          </button>
          {NYG_MY_MAP_SEASONS.map((season) => (
            <button
              className={selectedSeasons.includes(season) ? "active" : undefined}
              type="button"
              key={season}
              aria-pressed={selectedSeasons.includes(season)}
              onClick={() => toggleSeason(season)}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

        <div className="nyg-map-toolbar">
          <div>
            <span>Navigation path</span>
            <div className="nyg-map-breadcrumbs">
              <button type="button" onClick={() => setSelectedPath([])}>All NYG</button>
              {selectedPath.map((value, index) => (
                <button
                  type="button"
                  key={`${NYG_MAP_LEVELS[index].key}-${value}`}
                  onClick={() => setSelectedPath((current) => current.slice(0, index + 1))}
                >
                  <small>{NYG_MAP_LEVELS[index].label}</small>
                  {value}
                </button>
              ))}
            </div>
          </div>
          <button
            className="nyg-map-reset"
            type="button"
            disabled={selectedPath.length === 0}
            onClick={() => setSelectedPath([])}
          >
            Collapse all
          </button>
        </div>

        <div className="nyg-map-progress" aria-label="Map hierarchy">
          {NYG_MAP_LEVELS.map((level, index) => (
            <span
              className={`${index < selectedPath.length ? "complete" : ""} ${index === selectedPath.length ? "current" : ""}`}
              key={level.key}
            >
              <b>{index + 1}</b>{level.label}
            </span>
          ))}
        </div>

        <p className="nyg-map-guidance">
          Click a card to open the next level. Click the selected card again to fold the map back.
        </p>

        <div className="nyg-map-canvas" ref={mapCanvasRef} tabIndex="0">
          <div className="nyg-map-columns">
            {NYG_MAP_LEVELS.slice(0, visibleLevelCount).map((level, levelIndex) => {
              const scopedRows = rowsAtLevel(levelIndex);
              const values = uniqueMapValues(scopedRows, level.key).sort((a, b) => {
                const salesFor = (value) => scopedRows
                  .filter((row) => row[level.key] === value)
                  .reduce((sum, row) => sum + row.salesRevenue, 0);
                return salesFor(b) - salesFor(a) || a.localeCompare(b);
              });
              const nextLevel = NYG_MAP_LEVELS[levelIndex + 1];
              return (
                <section className="nyg-map-column" key={level.key}>
                  <div className="nyg-map-column-heading">
                    <span>Level {levelIndex + 1}</span>
                    <strong>{level.label}</strong>
                    <small>{values.length} {values.length === 1 ? "option" : "options"}</small>
                  </div>
                  <div className="nyg-map-nodes">
                    {values.map((value) => {
                      const nodeRows = scopedRows.filter((row) => row[level.key] === value);
                      const styleCount = new Set(nodeRows.map((row) => row.styleNo)).size;
                      const nodeSales = nodeRows.reduce((sum, row) => sum + row.salesRevenue, 0);
                      const nodeUnits = nodeRows.reduce((sum, row) => sum + row.units, 0);
                      const nodeFob = nodeUnits > 0 ? nodeSales / nodeUnits : 0;
                      const childCount = nextLevel
                        ? new Set(nodeRows.map((row) => row[nextLevel.key])).size
                        : 0;
                      const isSelected = selectedPath[levelIndex] === value;
                      const isStyle = level.key === "styleNo";
                      return (
                        <button
                          className={`${isSelected ? "selected" : ""} ${isStyle ? "style-node" : ""}`.trim() || undefined}
                          type="button"
                          key={value}
                          aria-pressed={isSelected}
                          onClick={() => handleNodeClick(levelIndex, value)}
                        >
                          <span>{isStyle ? value : level.label}</span>
                          <strong>{isStyle ? nodeRows[0].styleName : value}</strong>
                          <small className="nyg-map-node-metrics">
                            {!isStyle && (
                              <b>{styleCount} {styleCount === 1 ? "style" : "styles"}</b>
                            )}
                            <b>{formatComparisonValue(nodeSales, "sales")}</b>
                            <b>{formatNygMapUnits(nodeUnits)}</b>
                            {isStyle && <b>{formatNygMapFob(nodeFob)}</b>}
                          </small>
                          {nextLevel && <i aria-hidden="true">{isSelected ? "−" : "+"}</i>}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {selectedPath.length === NYG_MAP_LEVELS.length && (
          <div className="nyg-map-selection">
            <span>Selected NYG style</span>
            <strong>{rowsAtLevel(NYG_MAP_LEVELS.length)[0]?.styleName}</strong>
            <small>{selectedPath[5]} · {selectedPath.slice(0, 5).join(" / ")}</small>
          </div>
        )}

        <p className="lululemon-source-note nyg-map-source">
          Source: Lululemon Wallet Size &amp; Share (3).xlsx, NYG sheet. This map uses only
          Group, Business Segment, Product Category, Product Group, Product Type,
          Style No., Style Name, sales revenue, units, and FOB. Duplicate style paths across
          seasons are consolidated and their sales and units are summed.
        </p>
    </section>
  );
}

function LululemonSeasonForecast() {
  const [season, setSeason] = useState("All");
  const [gender, setGender] = useState("All");
  const filteredPrograms = LULULEMON_FORECAST_PROGRAMS.filter(
    (program) =>
      (season === "All" || program.season === season) &&
      (gender === "All" || program.gender === gender),
  );
  const quickWins = LULULEMON_FORECAST_QUICK_WINS.filter(
    (program) =>
      (season === "All" || program.season === season) &&
      (gender === "All" || program.gender === gender),
  );
  const flagshipTargets = LULULEMON_FORECAST_FLAGSHIPS.filter(
    (program) => gender === "All" || program.gender === gender,
  );
  const relevantFabricNames = new Set(
    filteredPrograms.map((program) => program.fabric),
  );
  const fabricDirections = LULULEMON_FORECAST_FABRICS.filter(
    (fabric) =>
      (season === "All" && gender === "All") || relevantFabricNames.has(fabric.name),
  );
  const forecastAiContext = useMemo(
    () => ({
      dashboard: "Lululemon FW27 & SS28 Season Forecast",
      selectedSeason: season,
      selectedGender: gender,
      summary: LULULEMON_FORECAST_SUMMARY,
      visiblePrograms: filteredPrograms,
      quickWins,
      flagshipTargets,
      fabricDirections,
      nextSteps: LULULEMON_FORECAST_NEXT_STEPS,
      caveat:
        "This is a directional forecast. The actual FW27/SS28 Lululemon line-list is not available yet.",
    }),
    [season, gender, filteredPrograms, quickWins, flagshipTargets, fabricDirections],
  );

  return (
    <section className="lululemon-forecast-page">
      <article className="lululemon-forecast-hero">
        <div className="lululemon-forecast-hero-copy">
          <p className="eyebrow">NAN YANG TEXTILE GROUP x LULULEMON</p>
          <h2>{LULULEMON_FORECAST_SUMMARY.title}</h2>
          <p>{LULULEMON_FORECAST_SUMMARY.thesis}</p>
          <span>Directional forecast · September 2026 · Confidential</span>
        </div>
        <div className="lululemon-forecast-hero-metrics">
          <div>
            <strong>{LULULEMON_FORECAST_SUMMARY.suppliedPrograms}</strong>
            <span>Programs NYG supplies today</span>
          </div>
          <div>
            <strong>{LULULEMON_FORECAST_SUMMARY.securelyWonPrograms}</strong>
            <span>Programs securely won</span>
          </div>
          <div>
            <strong>{LULULEMON_FORECAST_PROGRAMS.length}</strong>
            <span>Seasonal win plays</span>
          </div>
          <div>
            <strong>{LULULEMON_FORECAST_FABRICS.length}</strong>
            <span>NYK fabric directions</span>
          </div>
        </div>
      </article>

      <article className="lululemon-forecast-method">
        <div>
          <span>FORECAST BASIS</span>
          <p>{LULULEMON_FORECAST_SUMMARY.methodology}</p>
        </div>
        <div className="lululemon-forecast-controls">
          <fieldset>
            <legend>Season</legend>
            {["All", "FW27", "SS28"].map((value) => (
              <button
                className={season === value ? "active" : undefined}
                type="button"
                onClick={() => setSeason(value)}
                key={value}
              >
                {value}
              </button>
            ))}
          </fieldset>
          <fieldset>
            <legend>Gender</legend>
            {["All", "Men", "Women"].map((value) => (
              <button
                className={gender === value ? "active" : undefined}
                type="button"
                onClick={() => setGender(value)}
                key={value}
              >
                {value}
              </button>
            ))}
          </fieldset>
        </div>
      </article>

      {quickWins.length > 0 && (
        <article className="lululemon-forecast-section quick-wins">
          <div className="lululemon-forecast-section-heading">
            <div>
              <p className="eyebrow">START HERE</p>
              <h3>The fastest realistic first wins</h3>
            </div>
            <span>Existing relationships create the easiest door to open.</span>
          </div>
          <div className="lululemon-forecast-quick-grid">
            {quickWins.map((program) => (
              <div className="lululemon-forecast-quick-card" key={program.id}>
                <div>
                  <span>{program.gender} · {program.season}</span>
                  <strong>{program.program}</strong>
                </div>
                <p>{program.reason}</p>
                <footer>
                  <span>NYK should bring</span>
                  <strong>{program.fabric}</strong>
                </footer>
              </div>
            ))}
          </div>
        </article>
      )}

      <article className="lululemon-forecast-section">
        <div className="lululemon-forecast-section-heading">
          <div>
            <p className="eyebrow">WIN PIPELINE</p>
            <h3>Programs to pursue by season</h3>
          </div>
          <span>{filteredPrograms.length} priority plays shown</span>
        </div>
        <div className="lululemon-forecast-programs">
          {filteredPrograms.map((program) => (
            <article className="lululemon-forecast-program" key={program.id}>
              <div className="lululemon-forecast-program-rank">
                <strong>{program.rank}</strong>
                <span>{program.season}</span>
              </div>
              <div className="lululemon-forecast-program-name">
                <span>{program.gender} · {program.subtype}</span>
                <h4>{program.program}</h4>
                <b className={program.tier === "Start here" ? "start" : undefined}>
                  {program.tier}
                </b>
              </div>
              <div className="lululemon-forecast-program-pitch">
                <span>NYG should present</span>
                <p>{program.pitch}</p>
              </div>
              <div className="lululemon-forecast-program-fabric">
                <span>NYK should bring</span>
                <strong>{program.fabric}</strong>
                <p>{program.fabricDetail}</p>
              </div>
            </article>
          ))}
        </div>
      </article>

      <div className="lululemon-forecast-split">
        <article className="lululemon-forecast-section flagship">
          <div className="lululemon-forecast-section-heading">
            <div>
              <p className="eyebrow">FLAGSHIP TARGETS</p>
              <h3>The two biggest whitespace bets</h3>
            </div>
          </div>
          <div className="lululemon-forecast-flagships">
            {flagshipTargets.map((target) => (
              <div key={target.program}>
                <span>{target.gender}</span>
                <h4>{target.program}</h4>
                <strong>{target.claim}</strong>
                <p>{target.rationale}</p>
                <b>{target.fabric}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="lululemon-forecast-section next-steps">
          <div className="lululemon-forecast-section-heading">
            <div>
              <p className="eyebrow">ACTION PLAN</p>
              <h3>What Sales and BD do next</h3>
            </div>
          </div>
          <ol>
            {LULULEMON_FORECAST_NEXT_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </div>

      <article className="lululemon-forecast-section fabric-glossary">
        <div className="lululemon-forecast-section-heading">
          <div>
            <p className="eyebrow">NYK FABRIC PLAYBOOK</p>
            <h3>Fabric directions matched to the selected opportunities</h3>
          </div>
          <span>{fabricDirections.length} directions</span>
        </div>
        <div className="lululemon-forecast-fabrics">
          {fabricDirections.map((fabric, index) => (
            <div key={fabric.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{fabric.name}</strong>
              <p>{fabric.description}</p>
            </div>
          ))}
        </div>
      </article>

      <p className="lululemon-forecast-source">
        Source: NYG_NYK_FW27_SS28_Forecast (1).pptx. Forecast targets are directional,
        based on NYG production records versus the Lululemon catalog. Fabric directions
        reflect general performance-fabric trend knowledge and are not a live WGSN or
        ISPO subscription pull. Refresh when the actual FW27 line-list is available.
      </p>
      <DashboardAiAssistant context={forecastAiContext} />
    </section>
  );
}

function LululemonBrandOverview() {
  const comparisonMetric = "sales";
  const [comparisonSubtype, setComparisonSubtype] = useState("overall");
  const [selectedProductType, setSelectedProductType] = useState("");
  const selectedProductMix = LULULEMON_SALES_MIX.find(
    (row) => row.label === selectedProductType,
  );
  const totalApparelSales = 9_650_000_000;
  const selectedSalesShare = selectedProductMix ? selectedProductMix.value / 100 : 1;
  const selectedTotalSales = totalApparelSales * selectedSalesShare;
  const selectedOnlineSales = 2_890_000_000 * selectedSalesShare;
  const selectedOfflineSales = 6_760_000_000 * selectedSalesShare;
  const selectedComparison =
    LULULEMON_NYG_COMPARISON.find(
      (row) => row.key === comparisonSubtype,
    ) || LULULEMON_NYG_COMPARISON[0];
  const selectedGenderSales =
    selectedComparison.menSales + selectedComparison.womenSales;
  const selectedGenderMix = [
    {
      label: "Men",
      value: selectedGenderSales
        ? (selectedComparison.menSales / selectedGenderSales) * 100
        : 0,
      color: "#cf1233",
    },
    {
      label: "Women",
      value: selectedGenderSales
        ? (selectedComparison.womenSales / selectedGenderSales) * 100
        : 0,
      color: "#f18498",
    },
  ];
  const aiContext = useMemo(() => {
    const currentStyles = LULULEMON_NYG_STYLES
      .filter(
        (style) => comparisonSubtype === "overall" || style.subtype === comparisonSubtype,
      )
      .sort((left, right) => right.nygSales - left.nygSales)
      .slice(0, 20)
      .map(({ name, subtype, gender, season, nygSales, nygUnits, nygFabricYards, nykFabricYards }) => ({
        name,
        subtype,
        gender,
        season,
        nygSales,
        nygUnits,
        nygFabricYards,
        nykFabricYards,
      }));
    const futureStyles = LULULEMON_NYG_FUTURE_STYLES_WITH_NYK(LULULEMON_NYG_FUTURE_STYLES)
      .filter(
        (style) => comparisonSubtype === "overall" || style.subtype === comparisonSubtype,
      )
      .sort((left, right) => right.nygSales - left.nygSales)
      .slice(0, 15)
      .map(({ name, subtype, gender, season, nygSales, nygUnits, nykFabricYards, nykFabricSeasons, nykFabrics }) => ({
        name,
        subtype,
        gender,
        season,
        nygSales,
        nygUnits,
        nykFabricYards,
        nykFabricSeasons,
        nykFabrics,
      }));
    const opportunities = comparisonSubtype === "overall"
      ? Object.fromEntries(
          Object.entries(LULULEMON_REMAINING_OPPORTUNITIES).map(([subtype, styles]) => [
            subtype,
            styles.slice(0, 3),
          ]),
        )
      : {
          [comparisonSubtype]: (
            LULULEMON_REMAINING_OPPORTUNITIES[comparisonSubtype] || []
          ).slice(0, 10),
        };

    return {
      dashboard: "Lululemon Business Overview",
      reportingPeriod: "1 SEP 25 - 31 AUG 26",
      selectedProductType: selectedProductMix?.label || "All product types",
      selectedSubtype: selectedComparison,
      businessMetrics: LULULEMON_BUSINESS_METRICS,
      salesMixByProductType: LULULEMON_SALES_MIX,
      fobMultiplier: LULULEMON_FOB_MULTIPLIER,
      subtypeComparison: LULULEMON_NYG_COMPARISON,
      topLululemonOpportunities: opportunities,
      nygSecuredStyles: currentStyles,
      nygFutureSecuredStyles: futureStyles,
      notes: [
        "Lululemon values are estimates from the workbook and dashboard methodology.",
        "NYG and NYK fabric fields are recorded usage in yards, not confirmed fiber compositions.",
        "External material recommendations must be identified as recommendations unless a source confirms the BOM.",
      ],
    };
  }, [comparisonSubtype, selectedComparison, selectedProductMix]);

  return (
    <section className="lululemon-brand-overview">
      <LululemonRevenueHistory />
      <article className="lululemon-overview-section">
        <div className="lululemon-overview-heading">
          <div>
            <p className="eyebrow">LULULEMON · APPAREL · 1 SEP 25 - 31 AUG 26</p>
            <h2>Business Overview</h2>
          </div>
          <LululemonOverviewLogo />
        </div>

        <LululemonMetricGrid metrics={LULULEMON_BUSINESS_METRICS} showIcons={false} />

        <div className="lululemon-business-grid">
          <article className="lululemon-overview-card lululemon-sales-card">
            <h3>Sales mix by product type</h3>
            <LululemonBarChart
              rows={LULULEMON_SALES_MIX}
              selectedKey={selectedProductType}
              onSelect={(productType) =>
                setSelectedProductType((current) =>
                  current === productType ? "" : productType,
                )
              }
            />
          </article>
          <article className="lululemon-overview-card lululemon-ring-card">
            <h3>Total Sales contribution</h3>
            <p className="lululemon-contribution-context">
              {selectedProductMix
                ? `${selectedProductMix.label} · ${selectedProductMix.value.toFixed(1)}% of total sales`
                : "All product types · click a row to filter"}
            </p>
            <div
              className="lululemon-ring lululemon-contribution-ring"
              style={{
                background: "conic-gradient(#d40039 0 30%, #e7dfe1 30% 100%)",
              }}
            >
              <strong>{formatComparisonValue(selectedTotalSales, "sales")}</strong>
              <span>{selectedProductMix ? selectedProductMix.label : "Total sales"}</span>
            </div>
            <div className="lululemon-contribution-legend">
              <div>
                <i className="online" />
                <span>Online</span>
                <strong>30.0%</strong>
                <b>{formatComparisonValue(selectedOnlineSales, "sales")}</b>
              </div>
              <div>
                <i className="offline" />
                <span>Offline</span>
                <strong>70.0%</strong>
                <b>{formatComparisonValue(selectedOfflineSales, "sales")}</b>
              </div>
            </div>
          </article>
        </div>

        <p className="lululemon-source-note">
          * Estimates, apparel only (Women&apos;s + Men&apos;s), 1 SEP 25 - 31 AUG 26. Sales
          use net revenue TTM and an 87.0% apparel share. Online is estimated at
          30% of sales; FOB spend uses a {LULULEMON_FOB_MULTIPLIER.toFixed(4)}x
          multiplier. Selected product-type totals apply the Particl sales-mix share
          to total apparel sales. Source: Lululemon_Wallet_Size__Share_7.xlsx, All product.
        </p>
      </article>

      <article className="lululemon-overview-section nytg-section">
        <div className="lululemon-overview-heading">
          <div>
            <p className="eyebrow">
              NYTG BUSINESS · FA25-SU26 · {selectedComparison.label.toUpperCase()} ·{" "}
              {selectedComparison.nygProducts}{" "}
              {selectedComparison.nygProducts === 1 ? "PRODUCT" : "PRODUCTS"}
            </p>
            <h2>NYTG x Lululemon</h2>
          </div>
          <LululemonOverviewLogo />
        </div>

        <LululemonNygComparison
          metric={comparisonMetric}
          selectedKey={comparisonSubtype}
        />

        <LululemonNygMetricGrid selectedKey={comparisonSubtype} />

        <div className="lululemon-nytg-grid">
          <article className="lululemon-overview-card lululemon-subtype-card">
            <div className="lululemon-subtype-card-heading">
              <div>
                <h3>NYG vs. Lululemon sub-type size</h3>
                <p>
                  {comparisonMetric === "sales"
                    ? "NYG sales compared with estimated Lululemon FOB cost - click a row to filter"
                    : "NYG compared with the full Lululemon sub-type - click a row to filter"}
                </p>
              </div>
              <div className="lululemon-comparison-controls lululemon-style-controls lululemon-chart-controls">
                <button
                  className="lululemon-comparison-reset"
                  type="button"
                  onClick={() => setComparisonSubtype("overall")}
                  disabled={comparisonSubtype === "overall"}
                >
                  Reset
                </button>
                <label>
                  <span>Sub-type</span>
                  <select
                    value={comparisonSubtype}
                    onChange={(event) => setComparisonSubtype(event.target.value)}
                  >
                    {LULULEMON_NYG_COMPARISON.map((row) => (
                      <option key={row.key} value={row.key}>
                        {row.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <LululemonSubtypeComparisonChart
              metric={comparisonMetric}
              selectedKey={comparisonSubtype}
              onSelect={setComparisonSubtype}
            />
            <LululemonMixCard
              title={`${selectedComparison.label} gender mix`}
              subtitle="Share of selected NYTG sales"
              rows={selectedGenderMix}
              embedded
            />
          </article>
          <LululemonStyleShare
            subtypeKey={comparisonSubtype}
            subtypeLabel={selectedComparison.label}
            onSelect={setComparisonSubtype}
          />
        </div>

        <p className="lululemon-source-note">
          Source: Lululemon_Wallet_Size__Share_7.xlsx. Lululemon totals use
          Total and Total Units (quantity, preserved) from All product (1 SEP 25 - 31 AUG 26). NYG values use
          NYG Sale and NYG Sale (PCS) from the Lululemon sheet for 59 products,
          FA25-SU26. Style wallet share uses Brand Wallet Size and each style&apos;s
          FOB Multiplier. The second NYG Secured table uses Commercial Name, sales,
          units, and seasons FA26, WT26, SU27, and SP27 from the Raw Data
          sheet. Fabric usage uses Total Fabric Value NYG Used (YDS) and
          Total NYK Fabric Value Used (YDS); 55 products contain recorded NYG
          fabric use and 4 contain a non-zero NYK value. Future NYK fabric is
          matched by Style, NYK supplier, and season from the NYK sheet in
          Lululemon Wallet Size &amp; Share (1).xlsx; ordered yards use PO_QTY for
          FA26, WT26, SU27, and SP27. Gender mix uses the Gender and NYG Sale columns.
        </p>
      </article>

      <LululemonTimeline />
      <DashboardAiAssistant context={aiContext} />
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

function numericPrice(value) {
  const price = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(price) && price > 0 ? price : null;
}

function productPrices(product) {
  const prices = [
    numericPrice(product.price_min),
    numericPrice(product.price_max),
    numericPrice(product.price),
    numericPrice(product.compare_at_price),
    ...(product.variants || []).flatMap((variant) => [
      numericPrice(variant.price),
      numericPrice(variant.compare_at_price),
    ]),
    ...(product.color_variants || []).flatMap((variant) => [
      numericPrice(variant.price),
      numericPrice(variant.compare_at_price),
    ]),
  ].filter((price) => price !== null);
  return [...new Set(prices)];
}

function formatPrice(product) {
  const prices = productPrices(product);
  if (!prices.length) return "Not captured";
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);
  const minimum = formatMoney.format(priceMin);
  const maximum = formatMoney.format(priceMax);
  return priceMin === priceMax
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

function colorNameToSwatch(colorName = "") {
  const color = colorName.toLowerCase();
  const pairs = [
    ["black", "#151515"],
    ["white", "#f8f8f4"],
    ["ivory", "#f1eadc"],
    ["bone", "#eee7d8"],
    ["cream", "#efe5cf"],
    ["navy", "#102947"],
    ["blue", "#4f81c7"],
    ["purple", "#8060b6"],
    ["violet", "#8060b6"],
    ["pink", "#ed8eb5"],
    ["berry", "#b71f5d"],
    ["red", "#d33b39"],
    ["orange", "#d97931"],
    ["yellow", "#d9ad38"],
    ["gold", "#c9982d"],
    ["green", "#4f7d55"],
    ["olive", "#667246"],
    ["khaki", "#b5a27b"],
    ["army", "#687157"],
    ["grey", "#8b9094"],
    ["gray", "#8b9094"],
    ["silver", "#b7bcc1"],
    ["brown", "#7b5742"],
    ["beige", "#c8b99e"],
    ["tan", "#b89570"],
  ];
  const match = pairs.find(([keyword]) => color.includes(keyword));
  return match ? match[1] : "#c9cdd2";
}

function getProductColorNames(product) {
  const colorSources = [
    ...(product.color_variants || []).map((variant) => variant.color),
    ...(product.available_colors || []),
    ...(product.unavailable_colors || []),
    ...(product.all_colors || []),
    product.color,
  ];
  return [
    ...new Set(
      colorSources
        .flatMap((value) => String(value || "").split("/"))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

function ColorSwatches({ product }) {
  const colors = getProductColorNames(product);
  if (!colors.length) return null;
  return (
    <div className="product-color-swatches" aria-label="Product colors">
      {colors.slice(0, 18).map((color) => (
        <span
          key={color}
          className="product-color-swatch"
          title={color}
          style={{ backgroundColor: colorNameToSwatch(color) }}
        />
      ))}
      {colors.length > 18 && (
        <span className="product-color-more" title={colors.slice(18).join(", ")}>
          +{colors.length - 18}
        </span>
      )}
    </div>
  );
}

function resolveProductUrl(url, brand) {
  const value = String(url || "").trim();
  if (!value) return "#";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;

  const baseUrl = BRAND_BASE_URLS[brand] || "https://shop.lululemon.com";
  try {
    return new URL(value.startsWith("/") ? value : `/${value}`, baseUrl).href;
  } catch {
    return value;
  }
}

function lululemonColorCodeFromImage(imageUrl = "") {
  const match = String(imageUrl).match(/_(\d{4,6})(?:_|\?|$)/);
  if (!match) return "";
  return String(Number(match[1]));
}

function resolveVariantProductUrl(productUrl, product, variant) {
  if (product?.brand !== "lululemon") return productUrl;

  const colorCode =
    variant?.color_code ||
    variant?.code ||
    lululemonColorCodeFromImage(variant?.image || product?.image);
  if (!colorCode || productUrl === "#") return productUrl;

  try {
    const url = new URL(productUrl);
    url.searchParams.set("color", colorCode);
    return url.href;
  } catch {
    const separator = productUrl.includes("?") ? "&" : "?";
    return `${productUrl}${separator}color=${encodeURIComponent(colorCode)}`;
  }
}

function ProductImageBlock({ product, productUrl, isLululemonView }) {
  if (product.color_variants?.length) {
    return (
      <>
        <div className="product-image-gallery">
          {product.color_variants.map((variant, variantIndex) => (
            <a
              key={`${variant.color}-${variant.url}`}
              className={variantIndex > 2 ? "is-extra-product-image" : undefined}
              href={resolveVariantProductUrl(productUrl, product, variant)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${product.title} on brand website`}
              title={`Open ${product.title}${variant.color ? ` - ${variant.color}` : ""}`}
            >
              <img
                src={variant.image || product.image}
                alt={`${product.title} - ${variant.color}`}
                loading="lazy"
                decoding="async"
              />
              <span className="product-image-caption">{variant.color}</span>
              <span className="product-image-popover" aria-hidden="true">
                <img
                  src={variant.image || product.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <strong>{variant.color}</strong>
              </span>
            </a>
          ))}
          {isLululemonView && product.color_variants.length > 3 && (
            <span
              className="product-image-count"
              title={`${product.color_variants.length - 3} more product images`}
            >
              +{product.color_variants.length - 3}
            </span>
          )}
        </div>
        {isLululemonView && <ColorSwatches product={product} />}
      </>
    );
  }

  if (product.image) {
    return (
      <>
        <a href={productUrl} target="_blank" rel="noreferrer">
          <img src={product.image} alt={product.title} />
          <span className="product-image-popover" aria-hidden="true">
            <img src={product.image} alt="" />
            <strong>{product.title}</strong>
          </span>
        </a>
        {isLululemonView && <ColorSwatches product={product} />}
      </>
    );
  }

  return (
    <>
      <span className="product-image-placeholder">No image</span>
      {isLululemonView && <ColorSwatches product={product} />}
    </>
  );
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

function InnovationChips({ values, fallback = "Not specified" }) {
  if (!values?.length) return <span className="muted-detail">{fallback}</span>;
  return (
    <div className="innovation-chip-list">
      {values.map((value) => (
        <span key={value} className="innovation-chip">
          {value}
        </span>
      ))}
    </div>
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

function FilterGroup({
  title,
  options,
  selected,
  onChange,
  singleSelect = false,
  showAll = false,
}) {
  return (
    <div className={`filter-group ${singleSelect ? "single-select" : ""}`}>
      <span className="filter-title">{title}</span>
      <div className="chip-list">
        {showAll && (
          <button
            className={!selected.length ? "filter-chip active" : "filter-chip"}
            type="button"
            onClick={() => onChange([])}
          >
            All
          </button>
        )}
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
                  singleSelect
                    ? active
                      ? []
                      : [value]
                    : active
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
  const [brandWorkspacePage, setBrandWorkspacePage] = useState(
    routeBrand === "lululemon" ? "overview" : "product",
  );
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
  const isLululemonWorkspace = routeBrand === "lululemon";
  const usesWorkspacePages = isProfileWorkspace || isLululemonWorkspace;
  const workspacePages = isLululemonWorkspace
    ? LULULEMON_WORKSPACE_PAGES
    : BRAND_WORKSPACE_PAGES;
  const brandWorkspacePageLabel =
    workspacePages.find(
      (page) => page.value === brandWorkspacePage,
    )?.label || "Product Dashboard";
  const productCategories = options.categories;
  const availableShopHighlights = options.shop_highlights || [];
  const activityOptions = options.activities || [];
  const materialKeywords = options.material_keywords || [];
  const seasonOptions = options.seasons || [];
  const isLululemonView =
    effectiveFilters.brands.length === 1 &&
    effectiveFilters.brands[0] === "lululemon";
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
    setBrandWorkspacePage(routeBrand === "lululemon" ? "overview" : "product");
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
    <main className={isLululemonWorkspace ? "brand-theme-lululemon" : undefined}>
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
          usesWorkspacePages
            ? "Brand workspace pages"
            : "Page navigation"
        }
      >
        {usesWorkspacePages ? (
          workspacePages.map((page) => (
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

      {isLululemonWorkspace && brandWorkspacePage === "overview" ? (
        <LululemonBrandOverview />
      ) : isLululemonWorkspace && brandWorkspacePage === "forecast" ? (
        <LululemonSeasonForecast />
      ) : isProfileWorkspace && brandWorkspacePage === "profile" ? (
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
                title={isLululemonView ? "Gender" : "Audience"}
                options={
                  isLululemonView
                    ? [
                        { value: "men", label: "Men" },
                        { value: "women", label: "Women" },
                      ]
                    : options.audiences
                }
                selected={filters.audiences}
                onChange={(audiences) => setFilters({ ...filters, audiences })}
                singleSelect={isLululemonView}
                showAll={isLululemonView}
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
            <div className={`table-wrap ${isLululemonView ? "particl-table-wrap" : ""}`}>
                <table className={isLululemonView ? "particl-product-table" : undefined}>
                  <thead>
                    <tr className="table-heading-row">
                      <th className="number-heading">No.</th>
                      {hasProductImageData && !isLululemonView && (
                        <th className="image-heading">Image</th>
                      )}
                      <th
                        className={
                          isLululemonView
                            ? "product-heading product-media-heading"
                            : "product-heading"
                        }
                      >
                        Product
                      </th>
                      {hasSeasonData && <th className="season-heading">Season</th>}
                      <th>Gender</th>
                      <th>Category</th>
                      {hasSubcategoryData && <th>Sub category</th>}
                      {hasCollectionData && <th>Collection</th>}
                      {!isLululemonView && <th>Color</th>}
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
                    {paginatedProducts.map((product, index) => {
                      const productUrl = resolveProductUrl(product.url, product.brand);
                      return (
                        <tr key={product.id}>
                          <td className="number-cell">
                            {(currentProductPage - 1) * productsPerPage + index + 1}
                          </td>
                          {hasProductImageData && !isLululemonView && (
                            <td className="product-image-cell">
                              <ProductImageBlock
                                product={product}
                                productUrl={productUrl}
                                isLululemonView={isLululemonView}
                              />
                            </td>
                          )}
                          <td
                            className={
                              isLululemonView
                                ? "product-title-cell product-media-cell"
                                : "product-title-cell"
                            }
                          >
                            {isLululemonView && hasProductImageData && (
                              <ProductImageBlock
                                product={product}
                                productUrl={productUrl}
                                isLululemonView={isLululemonView}
                              />
                            )}
                            <a
                              className="product-title-link"
                              href={productUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {product.title}
                            </a>
                          </td>
                        {hasSeasonData && (
                          <td className="season-cell">
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
                        {!isLululemonView && (
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
                        )}
                        {hasMaterialData && (
                          <td className="material-cell">
                            <DetailList values={getMaterialValues(product)} />
                          </td>
                        )}
                        {hasInnovationData && (
                          <td className="detail-cell innovation-cell">
                            {isLululemonView ? (
                              <InnovationChips values={product.innovations} />
                            ) : (
                              <DetailList values={product.innovations} />
                            )}
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
                      );
                    })}
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


