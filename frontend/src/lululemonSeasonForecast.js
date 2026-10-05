export const LULULEMON_FORECAST_SUMMARY = {
  title: "SS28 & FW28 Season Forecast",
  suppliedPrograms: 72,
  securelyWonPrograms: 20,
  thesis:
    "Defend the programs NYG already supplies and win the flagship Lululemon franchises where NYG has no presence today.",
  methodology:
    "No SS28/FW28 line-list is available yet. Win targets compare NYG production records with the market-wide Lululemon catalog and pair each whitespace opportunity with a directional NYK fabric story.",
};

export const LULULEMON_FORECAST_MILESTONES = [
  { stage: "Concept", milestones: "BPL" },
  { stage: "Development", milestones: "1st Forecast, 2nd Forecast" },
  { stage: "Production", milestones: "Buy Plan, Final" },
];

export const LULULEMON_NYK_FORECAST_SUMMARY = {
  title: "NYK Fabric Forecast",
  thesis:
    "Fabric groups NYK should present to Lululemon for SS28 and FW28, grounded in NYG's fabric purchase orders and published 2026 industry direction.",
  nykShare: 2.4,
  totalYards: 45.6,
  outsideYards: 44.5,
  casualShare: 31,
};

export const LULULEMON_NYK_FORECAST_GROUPS = [
  {
    id: "ss28-lounge",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    rank: 1,
    group: "Lounge",
    category: "Knit · Tees & Tanks",
    tier: "Tier 1",
    reason:
      "Lounge is NYG's fastest-growing line: 13 styles in SU27 versus 2 in SU26. The core 140gsm BCI-cotton jersey is still bought outside NYK.",
    fabric: "Airy Cotton-Touch Jersey",
    fabricDetail: "Light, breathable jersey and fine rib with a dry, cool hand.",
  },
  {
    id: "ss28-polo-tennis",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    rank: 2,
    group: "Polo & Tennis",
    category: "Knit · Polo / Tennis",
    tier: "Tier 1",
    reason:
      "NYG's Polo used 1.12M yards from one outside mill, while Tennis grew from zero to six styles in SU27.",
    fabric: "Cool Piqué & Heather",
    fabricDetail: "Poly/lyocell textured knit with UPF protection and a cool hand.",
  },
  {
    id: "ss28-aim",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    rank: 3,
    group: "AIM",
    category: "Knit · Underwear",
    tier: "Tier 2",
    reason:
      "AIM is NYG's No. 2 fabric program at 9.0M yards, concentrated in one outside mill group and led by a 91% modal / 9% elastane specification.",
    fabric: "Modal Cooling Jersey",
    fabricDetail: "Smooth, cool-to-touch cellulosic jersey with soft drape.",
  },
  {
    id: "ss28-pace-breaker-rival",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    rank: 4,
    group: "Pace Breaker & Pace Rival",
    category: "Knit · Mesh / Shorts",
    tier: "Tier 2",
    reason:
      "The largest combined volume is 15.8M yards with no NYK supply. Core specifications are recycled-poly mesh at 90–146gsm.",
    fabric: "Tonal Recycled Mesh",
    fabricDetail: "Fine recycled mesh with a PFAS-free quick-dry finish.",
  },
  {
    id: "fw28-heatwave",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    rank: 1,
    group: "Heatwave",
    category: "Knit · Hoodie / Jogger",
    tier: "Tier 1",
    reason:
      "Heatwave is NYG's newest line, growing from 4 styles in FA27 to 9 in WT27. Very little fabric is booked, so the supplier position is still open.",
    fabric: "Warm Textured Jersey",
    fabricDetail: "Brushed-back cotton/rPET jersey with a light thermal hand.",
  },
  {
    id: "fw28-lounge",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    rank: 2,
    group: "Lounge (Waffle & Terry)",
    category: "Knit · Textured",
    tier: "Tier 1",
    reason:
      "NYK already supplied 31% of Casual waffle and rib. Transfer that proven capability into Lounge as Casual has had no styles since SP27.",
    fabric: "Waffle & Brushed Terry",
    fabricDetail: "Deep waffle relief and soft brushed modal terry.",
  },
  {
    id: "fw28-rulu",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    rank: 3,
    group: "Rulu",
    category: "Knit · Mid-Layer",
    tier: "Tier 2",
    reason:
      "Rulu is NYG's biggest line with 11 styles in WT27, but 69% of its 1.76M yards comes from one outside mill and none from NYK.",
    fabric: "Buttery Brushed Stretch",
    fabricDetail: "Fine-nap brushed knit with a matte, second-skin feel.",
  },
  {
    id: "fw28-define",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    rank: 4,
    group: "Define",
    category: "Knit · Jacket",
    tier: "Tier 2",
    reason:
      "Define represents 4.46M yards, 87% from one outside mill, while NYG's styles fell to one per season from SU27.",
    fabric: "Brushed Second-Skin Knit",
    fabricDetail: "Smooth face, brushed inside and stable stretch.",
  },
];

export const LULULEMON_NYK_FABRIC_BRIEFS = [
  {
    season: "SS28",
    fabric: "Airy Cotton-Touch Jersey",
    image: "/forecast-swatches/airy-cotton-touch.png",
    surface: "Matte, light and dry-cool; fine rib with a slightly sheer option.",
    construction: "Cotton-rich BCI or organic blend with rPET or modal, 3–5% elastane, 130–150gsm. Reference: Lounge 140gsm BCI jersey.",
  },
  {
    season: "SS28",
    fabric: "Cool Piqué & Heather",
    image: "/forecast-swatches/cool-pique-heather.png",
    surface: "Fine piqué texture, tonal heather, cool hand and UPF.",
    construction: "Recycled poly / lyocell / elastane near 85/10/5, 150–170gsm with wicking. Reference: Evolution 154gsm.",
  },
  {
    season: "SS28",
    fabric: "Modal Cooling Jersey",
    image: "/forecast-swatches/modal-cooling-jersey.png",
    surface: "Silky, smooth and cool to the touch with soft drape.",
    construction: "About 91% modal with 9% elastane, or a bio-based blend, 170–190gsm. Reference: AIM 185gsm.",
  },
  {
    season: "SS28",
    fabric: "Tonal Recycled Mesh",
    image: "/forecast-swatches/tonal-recycled-mesh.png",
    surface: "Fine tonal micro-mesh with sheer-to-opaque zones.",
    construction: "rPET/elastane 86–90/10–14, 90–146gsm, 4-way stretch and PFAS-free quick-dry finish. Reference: Pace Breaker mesh.",
  },
  {
    season: "FW28",
    fabric: "Warm Textured Jersey",
    image: "/forecast-swatches/warm-textured-jersey.png",
    surface: "Soft brushed back, subtle heather and low bulk.",
    construction: "Cotton / rPET / elastane near 65/31/4, 260–290gsm with brushed back. Reference: Heatwave jersey 285gsm.",
  },
  {
    season: "FW28",
    fabric: "Waffle & Brushed Terry",
    image: "/forecast-swatches/waffle-brushed-terry.png",
    surface: "Deep waffle or rib relief, soft loopback and intentional melange.",
    construction: "Organic cotton / rPET / elastane 58/37/5 waffle near 375gsm, or modal 95/5 brushed terry near 256gsm.",
  },
  {
    season: "FW28",
    fabric: "Buttery Brushed Stretch",
    image: "/forecast-swatches/buttery-brushed-stretch.png",
    surface: "Matte, fine-nap brushed surface with second-skin comfort.",
    construction: "High-filament poly or nylon blend with elastane, brushed, 146–200gsm. Reference: Rulu 146gsm.",
  },
  {
    season: "FW28",
    fabric: "Brushed Second-Skin Knit",
    image: "/forecast-swatches/brushed-second-skin.png",
    surface: "Smooth matte face, brushed inside and stable stretch.",
    construction: "Nylon / elastane near 81/19 with recycled or bio-based option, near 214gsm. Reference: Define 214gsm.",
  },
];

export const LULULEMON_NYK_TRENDS = [
  "Lightweight, breezy knits",
  "Climate flex",
  "Barely-there compression",
  "Buttery brushed stretch",
  "Recycled + bio-based fibres",
  "Natural-feel hybrids",
  "PFAS-free finishes",
  "Tactile, discreet tech",
];

export const LULULEMON_NYK_NEXT_STEPS = [
  "Start with cotton/rPET textured knits for Lounge and Heatwave, where NYK already has relevant capability.",
  "Bring physical swatches for all eight fabric briefs to the SS28 and FW28 meetings.",
  "Confirm machinery, yarn access and lead times for modal, nylon and mesh before pitching.",
  "Line up PFAS-free finish options now as major markets phase out PFAS treatments.",
];

export const LULULEMON_FORECAST_QUICK_WINS = [
  {
    id: "pace-breaker-jogger",
    gender: "Men",
    season: "FW28",
    program: "Pace Breaker Jogger",
    reason:
      "NYG already makes the Pace Breaker Short, so the jogger is a line extension to an existing franchise and buying relationship.",
    fabric: "Brushed Thermal Comfort",
  },
  {
    id: "scuba-half-zip",
    gender: "Women",
    season: "FW28",
    program: "Scuba Oversized Half-Zip Hoodie",
    reason:
      "NYG already supplies It's Rulu Half-Zip *Updated in the same mid-layer category, creating a warm route into a second construction.",
    fabric: "Scuba & Bonded Structures",
  },
];

export const LULULEMON_FORECAST_PROGRAMS = [
  {
    id: "fw28-men-pace-breaker-jogger",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    gender: "Men",
    rank: 1,
    program: "Pace Breaker Jogger",
    subtype: "Jogger",
    tier: "Start here",
    pitch:
      "Bring it into the Pace Breaker Short meeting as the natural next SKU, using the fit block and buying-team relationship already in place.",
    fabric: "Brushed Thermal Comfort",
    fabricDetail: "Fleece-back jogger knit with light insulation and low bulk.",
  },
  {
    id: "fw28-men-abc-trouser",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    gender: "Men",
    rank: 2,
    program: "ABC Trouser Franchise",
    subtype: "Pant",
    tier: "Tier 1",
    pitch:
      "Lead with a finished sample that proves tailoring precision and stretch recovery against the incumbent supplier.",
    fabric: "Technical Circularity",
    fabricDetail: "Recycled 4-way-stretch woven with a matte, tailored hand.",
  },
  {
    id: "fw28-men-pace-breaker-jacket",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    gender: "Men",
    rank: 3,
    program: "Pace Breaker Jacket",
    subtype: "Jacket",
    tier: "Tier 2",
    pitch:
      "Pitch the jacket and jogger as one franchise set in one meeting instead of opening a separate conversation.",
    fabric: "Technical Utility Wovens",
    fabricDetail: "Lightweight wind-resistant woven shell with DWR finish.",
  },
  {
    id: "fw28-men-smooth-spacer",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    gender: "Men",
    rank: 4,
    program: "Smooth Spacer Jogger & Hoodie",
    subtype: "Jogger / Pullover",
    tier: "Tier 2",
    pitch:
      "Offer early co-development while speed and flexibility matter more than an established supplier history.",
    fabric: "Textural Knit Comfort",
    fabricDetail: "French-terry loop-back knit with visible spacer texture.",
  },
  {
    id: "fw28-women-scuba-half-zip",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    gender: "Women",
    rank: 1,
    program: "Scuba Oversized Half-Zip Hoodie",
    subtype: "Pullover",
    tier: "Start here",
    pitch:
      "Approach the same team as It's Rulu Half-Zip and offer Scuba as a second construction in the mid-layer category.",
    fabric: "Scuba & Bonded Structures",
    fabricDetail: "Bonded double-face fleece with a clean scuba hand.",
  },
  {
    id: "fw28-women-align",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    gender: "Women",
    rank: 2,
    program: "Align High-Rise Pant Family",
    subtype: "Pant",
    tier: "Tier 1",
    pitch:
      "Present certifications, compression-knit capability and a sampling commitment that proves repeatable fit consistency.",
    fabric: "Second-Skin Compression",
    fabricDetail: "Buttery-soft compressive knit in the Nulu/Everlux direction.",
  },
  {
    id: "fw28-women-wunder-train",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    gender: "Women",
    rank: 3,
    program: "Wunder Train High-Rise Tight",
    subtype: "Tight",
    tier: "Tier 1",
    pitch:
      "Present alongside Align as the performance-tier companion once the senior buying conversation is open.",
    fabric: "Zoned Performance Engineering",
    fabricDetail: "Sweat-wicking compression knit with body-mapped mesh zones.",
  },
  {
    id: "fw28-women-fast-free",
    season: "FW28",
    seasonName: "Fall/Winter 2028",
    gender: "Women",
    rank: 4,
    program: "Fast and Free High-Rise Tight",
    subtype: "Tight",
    tier: "Tier 2",
    pitch:
      "Hold until Align or Wunder Train gains traction, then take the same capability story to the running team.",
    fabric: "Zoned Performance Engineering",
    fabricDetail: "Lightweight compression knit with a reflective-ready surface.",
  },
  {
    id: "ss28-men-abc-trouser",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    gender: "Men",
    rank: 1,
    program: "ABC Trouser Franchise",
    subtype: "Pant",
    tier: "Tier 1",
    pitch:
      "Lead with the summer-weight sample so the same capability story carries directly into FW28.",
    fabric: "Technical Circularity",
    fabricDetail: "Recycled 4-way-stretch woven with a lighter summer hand.",
  },
  {
    id: "ss28-men-metal-vent",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    gender: "Men",
    rank: 2,
    program: "Metal Vent Tech Short-Sleeve Shirt",
    subtype: "Tee",
    tier: "Tier 1",
    pitch:
      "Lead with a finished sample that proves mesh-zone placement; this is a construction-first pitch.",
    fabric: "Active Base-Layer Engineering",
    fabricDetail: "Ventilated mesh-zone, moisture-wicking performance knit.",
  },
  {
    id: "ss28-men-abc-short",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    gender: "Men",
    rank: 3,
    program: "ABC Classic-Fit Short",
    subtype: "Short",
    tier: "Tier 2",
    pitch:
      "Bundle it into the ABC Trouser meeting as the matching bottoms range instead of pitching it alone.",
    fabric: "Technical Circularity",
    fabricDetail: "The same recycled woven platform as the trouser, tuned for shorts.",
  },
  {
    id: "ss28-men-swiftly",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    gender: "Men",
    rank: 4,
    program: "Swiftly Tech Shirt",
    subtype: "Tee",
    tier: "Tier 2",
    pitch:
      "Bring a finished garment to the first meeting because the seamless-knit build is the capability proof.",
    fabric: "Active Base-Layer Engineering",
    fabricDetail: "Seamless knit with moisture and odor-management finishes.",
  },
  {
    id: "ss28-women-align",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    gender: "Women",
    rank: 1,
    program: "Align High-Rise Pant Family",
    subtype: "Pant",
    tier: "Tier 1",
    pitch:
      "Lead with the lighter summer-weight capability presentation, then carry the same story into FW28.",
    fabric: "Second-Skin Compression",
    fabricDetail: "Nulu/Everlux-direction knit in a lighter summer weight.",
  },
  {
    id: "ss28-women-hotty-hot",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    gender: "Women",
    rank: 2,
    program: "Hotty Hot High-Rise Lined Short",
    subtype: "Short",
    tier: "Tier 1",
    pitch:
      "Bring a finished prototype combining the woven shell and knit liner; the two-layer construction is the proof.",
    fabric: "Second-Skin Compression",
    fabricDetail: "Lined 4-way-stretch woven-and-knit hybrid.",
  },
  {
    id: "ss28-women-swiftly",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    gender: "Women",
    rank: 3,
    program: "Swiftly Tech Sleeve Shirt 2.0",
    subtype: "Tee",
    tier: "Tier 2",
    pitch:
      "Reuse the men's seamless-knit sample and capability story across genders.",
    fabric: "Active Base-Layer Engineering",
    fabricDetail: "Seamless knit with moisture and odor-management finishes.",
  },
  {
    id: "ss28-women-wunder-train",
    season: "SS28",
    seasonName: "Spring/Summer 2028",
    gender: "Women",
    rank: 4,
    program: "Wunder Train High-Rise Tight",
    subtype: "Tight",
    tier: "Tier 2",
    pitch:
      "Introduce the summer-weight version now to open the relationship before the FW28 pitch.",
    fabric: "Zoned Performance Engineering",
    fabricDetail: "Sweat-wicking compression knit in a lighter summer weight.",
  },
];

export const LULULEMON_FORECAST_FLAGSHIPS = [
  {
    gender: "Women",
    program: "Align High-Rise Pant",
    claim: "Biggest target on the board",
    rationale:
      "Lululemon's iconic year-round legging franchise and the largest true whitespace where NYG has zero share today.",
    fabric: "Second-Skin Compression",
  },
  {
    gender: "Men",
    program: "ABC Trouser",
    claim: "No. 1 men's pant franchise",
    rationale:
      "A year-round office-to-travel core franchise across both SS28 and FW28 where NYG has zero presence today.",
    fabric: "Technical Circularity",
  },
];

export const LULULEMON_FORECAST_FABRICS = [
  ["Technical Circularity", "Recycled technical wovens with matte finishes and visible eco-credentials."],
  ["Second-Skin Compression", "Compressive knits and bonded support that feel like a second layer without bulk."],
  ["Zoned Performance Engineering", "Body-mapped mesh and panel placement for targeted ventilation and compression."],
  ["Brushed Thermal Comfort", "Brushed-back fleece and double knits delivering warmth with a soft, low-bulk hand."],
  ["Technical Utility Wovens", "Lightweight technical wovens with DWR and wind-resistant finishes."],
  ["Textural Knit Comfort", "Rib, waffle and loop structures that add tactile interest to lifestyle-athletic pieces."],
  ["Scuba & Bonded Structures", "Bonded double-face knits with a scuba hand and clean silhouettes."],
  ["Active Base-Layer Engineering", "Moisture-wicking, quick-dry knits engineered for high-output activity."],
].map(([name, description]) => ({ name, description }));

export const LULULEMON_FORECAST_NEXT_STEPS = [
  "Protect the programs NYG already holds securely before chasing new whitespace.",
  "Lead with Align Pant for Women and ABC Trouser for Men.",
  "Pair each program pitch with its matching NYK fabric-direction card, not a generic swatch book.",
  "Refresh the forecast when Lululemon's actual SS28/FW28 line-list becomes available.",
];
