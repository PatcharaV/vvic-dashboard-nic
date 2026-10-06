export const LULULEMON_FORECAST_SUMMARY = {
  title: "SS28 & FW28 NYG Forecast",
  suppliedPrograms: 134.8,
  securelyWonPrograms: 20,
  thesis:
    "Start with Lululemon's largest markets, extend the programs NYG already makes, then earn a route into the biggest whitespace franchises.",
  methodology:
    "No SS28/FW28 line-list is available yet. The forecast combines NYG sales from FA25-WT27 with estimated 2026 Lululemon market sales, then ranks programs with at least $0.3M in NYG sales by market size.",
};

export const LULULEMON_FORECAST_MILESTONES = [
  { stage: "Concept", milestones: "BPL" },
  { stage: "Development", milestones: "1st Forecast, 2nd Forecast" },
  { stage: "Production", milestones: "Buy Plan, Final" },
];

export const LULULEMON_FORECAST_MARKETS = [
  {
    gender: "Men",
    totalSales: 3_500_000_000,
    headline: "Pace Breaker $801M · ABC $528M",
    rows: [
      { label: "Short", sales: 918_000_000, units: 8_400_000 },
      { label: "Tee", sales: 624_000_000, units: 7_900_000 },
      { label: "Pant", sales: 583_000_000, units: 5_300_000 },
      { label: "Pullover", sales: 533_000_000, units: 3_700_000 },
      { label: "Jogger", sales: 276_000_000, units: 2_700_000 },
    ],
  },
  {
    gender: "Women",
    totalSales: 4_800_000_000,
    headline: "Define $978M · Align $921M",
    rows: [
      { label: "Pant", sales: 1_658_000_000, units: 19_100_000 },
      { label: "Jacket", sales: 934_000_000, units: 4_600_000 },
      { label: "Short", sales: 563_000_000, units: 10_400_000 },
      { label: "Tank", sales: 446_000_000, units: 8_000_000 },
      { label: "Bra / underwear", sales: 391_000_000, units: 8_900_000 },
    ],
  },
];

export const LULULEMON_FORECAST_KEEP_EXTEND = [
  {
    gender: "Men",
    programs: [
      { rank: 1, name: "Pace Breaker", sales: 17_800_000, units: 1_500_000, held: "5 short programs", next: "Jogger $73M · Jacket $56M · Pant $30M" },
      { rank: 2, name: "License to Train (incl. DrySense)", sales: 11_800_000, units: 895_000, held: "3 programs", next: "Textured Jogger $22M · Tank $13M" },
      { rank: 3, name: "Always In Motion", sales: 10_500_000, units: 2_300_000, held: "3 underwear programs", next: "Keep and defend · 5-inch boxer brief $2M" },
    ],
  },
  {
    gender: "Women",
    programs: [
      { rank: 1, name: "Define Jacket", sales: 28_500_000, units: 1_400_000, held: "Nulu", next: "Cropped Define $290M · Hooded $12M" },
      { rank: 2, name: "Sculpt", sales: 10_400_000, units: 1_100_000, held: "7 tank and top programs", next: "Keep and defend · sister styles are small" },
      { rank: 3, name: "Rulu", sales: 8_400_000, units: 493_000, held: "10 programs", next: "Drapey Yoga Jogger $13M" },
    ],
  },
];

export const LULULEMON_FORECAST_WHITESPACE = [
  {
    gender: "Men",
    programs: [
      { name: "ABC", sales: 528_000_000, units: 5_300_000, detail: "Warpstreme woven · Pant $392M · Short $108M · Jogger $28M" },
      { name: "Zeroed In", sales: 232_000_000, units: 3_100_000, detail: "NYG makes only the graphic long-sleeve · Pant, shirt, short, jogger and jacket remain open" },
      { name: "Metal Vent Tech Tee", sales: 105_000_000, units: 1_800_000, detail: "Knit tee close to DrySense · the nearest new door for NYG" },
    ],
    path: [
      { step: 1, name: "Metal Vent Tech Tee", sales: 98_000_000, action: "Offer a knit tee beside DrySense first." },
      { step: 2, name: "ABC Short and Jogger", sales: 136_000_000, action: "Ask whether a knit version exists." },
      { step: 3, name: "ABC Pant", sales: 392_000_000, action: "Pursue only after the first two steps are trusted." },
    ],
  },
  {
    gender: "Women",
    programs: [
      { name: "Align", sales: 921_000_000, units: 12_900_000, detail: "Lululemon signature knit · Pant $664M · Tank $124M · Short $113M" },
      { name: "Wunder Train", sales: 355_000_000, units: 5_300_000, detail: "Pant $258M · Bra / brief $60M" },
      { name: "Swiftly", sales: 302_000_000, units: 5_800_000, detail: "Knit tee and tank · Tee $249M · Tank $52M" },
    ],
    path: [
      { step: 1, name: "Align Tank", sales: 124_000_000, action: "Enter through a core NYG skill proven by Sculpt." },
      { step: 2, name: "Align Short", sales: 113_000_000, action: "Move to the next style on the same fabric platform." },
      { step: 3, name: "Align Pant", sales: 664_000_000, action: "Earn the largest prize last." },
    ],
  },
];

export const LULULEMON_FORECAST_ACTIONS = [
  {
    gender: "Men",
    rank: 1,
    program: "Expand Pace Breaker",
    owner: "BD + Garment",
    action: "BD requests the SS28 line list and buyer meeting; Garment presents 5-inch and 7-inch Shorts, then Pant and Jogger samples.",
    timing: "Now",
  },
  {
    gender: "Men",
    rank: 2,
    program: "Refresh DrySense and Evolution",
    owner: "Garment + BD",
    action: "Build a lightweight fabric and colour capsule with costing and lead time; BD pitches it for SS28 adoption.",
    timing: "SS28",
  },
  {
    gender: "Men",
    rank: 3,
    program: "Open Metal Vent, then ABC",
    owner: "BD + Garment/R&D",
    action: "Present a cooling-mesh tee beside DrySense first; use wear-test results to earn Metal Vent, then request a knit ABC trial.",
    timing: "Pilot",
  },
  {
    gender: "Women",
    rank: 1,
    program: "Defend and Extend Define",
    owner: "BD + Garment",
    action: "BD requests adjacent styles; Garment presents updated Define, Cropped and Hooded prototypes with a capacity plan.",
    timing: "Now",
  },
  {
    gender: "Women",
    rank: 2,
    program: "Build a Sculpt and Pace Rival Capsule",
    owner: "Garment + BD",
    action: "Develop coordinated Tank and Skirt samples; BD presents pricing, MOQ and lead time for an SS28 nomination.",
    timing: "SS28",
  },
  {
    gender: "Women",
    rank: 3,
    program: "Enter Align through Tank, then Short",
    owner: "BD + Garment/R&D",
    action: "Use a Nulu-type Tank sample to prove handfeel and fit beside the incumbent; after approval, pitch Align Short.",
    timing: "Pilot",
  },
];

export const LULULEMON_NYK_FORECAST_SUMMARY = {
  title: "NYK Fabric Forecast: SS28 and FW28",
  thesis:
    "Which fabrics to develop and pitch, with spec, look and trend, so Development can start. Men's and Women's are separate on every page.",
  nygBoughtYards: 7_610_000,
  nygBoughtSales: 41_700_000,
  nykSuppliedYards: 558_000,
  nykSuppliedSales: 3_300_000,
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
    image: "/forecast-swatches/airy-cotton-touch-v2.webp",
    surface: "Matte, light and dry-cool; fine rib with a slightly sheer option.",
    construction: "Cotton-rich BCI or organic blend with rPET or modal, 3–5% elastane, 130–150gsm. Reference: Lounge 140gsm BCI jersey.",
  },
  {
    season: "SS28",
    fabric: "Cool Piqué & Heather",
    image: "/forecast-swatches/cool-pique-heather-v2.webp",
    surface: "Fine piqué texture, tonal heather, cool hand and UPF.",
    construction: "Recycled poly / lyocell / elastane near 85/10/5, 150–170gsm with wicking. Reference: Evolution 154gsm.",
  },
  {
    season: "SS28",
    fabric: "Modal Cooling Jersey",
    image: "/forecast-swatches/modal-cooling-jersey-v2.webp",
    surface: "Silky, smooth and cool to the touch with soft drape.",
    construction: "About 91% modal with 9% elastane, or a bio-based blend, 170–190gsm. Reference: AIM 185gsm.",
  },
  {
    season: "SS28",
    fabric: "Tonal Recycled Mesh",
    image: "/forecast-swatches/tonal-recycled-mesh-v2.webp",
    surface: "Fine tonal micro-mesh with sheer-to-opaque zones.",
    construction: "rPET/elastane 86–90/10–14, 90–146gsm, 4-way stretch and PFAS-free quick-dry finish. Reference: Pace Breaker mesh.",
  },
  {
    season: "FW28",
    fabric: "Warm Textured Jersey",
    image: "/forecast-swatches/warm-textured-jersey-v2.webp",
    surface: "Soft brushed back, subtle heather and low bulk.",
    construction: "Cotton / rPET / elastane near 65/31/4, 260–290gsm with brushed back. Reference: Heatwave jersey 285gsm.",
  },
  {
    season: "FW28",
    fabric: "Waffle & Brushed Terry",
    image: "/forecast-swatches/waffle-brushed-terry-v2.webp",
    surface: "Deep waffle or rib relief, soft loopback and intentional melange.",
    construction: "Organic cotton / rPET / elastane 58/37/5 waffle near 375gsm, or modal 95/5 brushed terry near 256gsm.",
  },
  {
    season: "FW28",
    fabric: "Buttery Brushed Stretch",
    image: "/forecast-swatches/buttery-brushed-stretch-v2.webp",
    surface: "Matte, fine-nap brushed surface with second-skin comfort.",
    construction: "High-filament poly or nylon blend with elastane, brushed, 146–200gsm. Reference: Rulu 146gsm.",
  },
  {
    season: "FW28",
    fabric: "Brushed Second-Skin Knit",
    image: "/forecast-swatches/brushed-second-skin-v2.webp",
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

export const LULULEMON_NYK_PURCHASES = [
  {
    gender: "Men",
    boughtYards: 4_970_000,
    boughtSales: 24_500_000,
    ssYards: 1_830_000,
    fwYards: 3_140_000,
    suppliedYards: 558_000,
    suppliedSales: 3_300_000,
    note: "NYK currently supplies waffle knit only.",
  },
  {
    gender: "Women",
    boughtYards: 2_630_000,
    boughtSales: 17_300_000,
    ssYards: 930_000,
    fwYards: 1_700_000,
    suppliedYards: 0,
    suppliedSales: 0,
    note: "The whole women's side is open for NYK.",
  },
];

export const LULULEMON_NYK_KEEP_EXTEND = [
  {
    gender: "Men",
    programs: [
      { rank: 1, name: "Pace Breaker", sales: 17_800_000, yards: 1_660_000, nykYards: 0, fabric: "86% rPET / 14% elastane, 124gsm", next: "Jogger and Jacket" },
      { rank: 2, name: "License to Train / DrySense", sales: 11_800_000, yards: 754_000, nykYards: 0, fabric: "60% rPET / 32% nylon / 4% lycra, 160gsm", next: "Textured Jogger" },
      { rank: 3, name: "Always In Motion", sales: 10_500_000, yards: 614_000, nykYards: 0, fabric: "91% modal / 9% elastane, 185gsm", next: "Keep and defend" },
    ],
  },
  {
    gender: "Women",
    programs: [
      { rank: 1, name: "Define Jacket", sales: 28_500_000, yards: 1_670_000, nykYards: 0, fabric: "Nulu-type 81% nylon / 19% lycra, 214gsm", next: "Cropped Define" },
      { rank: 2, name: "Sculpt", sales: 10_400_000, yards: 56_000, nykYards: 0, fabric: "76% polyamide / 24% spandex, 125gsm", next: "Keep and defend" },
      { rank: 3, name: "Rulu", sales: 8_400_000, yards: 293_000, nykYards: 0, fabric: "92% recycled nylon / 8% lycra, 219gsm", next: "Yoga Jogger" },
    ],
  },
];

export const LULULEMON_NYK_FORECAST_PROGRAMS = [
  { id: "ss28-men-1", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 1, program: "Pace Breaker Linerless Short 7-inch", nygSales: 4_900_000, nygYards: 397_000, nykYards: 0, current: "86% rPET / 14% elastane, 124gsm, 52-inch", pitch: "Light cooling stretch and ultra-light mesh (Joyrise)." },
  { id: "ss28-men-2", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 2, program: "Pace Breaker Linerless Short 5-inch", nygSales: 1_400_000, nygYards: 131_000, nykYards: 0, current: "86% rPET / 14% elastane", pitch: "Light crinkle stretch with easy care (Chaosync)." },
  { id: "ss28-men-3", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 3, program: "License to Train Short-Sleeve Shirt", nygSales: 8_200_000, nygYards: 478_000, nykYards: 0, current: "60% rPET / 32% nylon / 4% lycra, 160gsm, 61-inch", pitch: "Slub-look cooling jersey (Newstalgia)." },
  { id: "ss28-men-4", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 4, program: "Evolution Short Sleeve Polo Shirt", nygSales: 1_900_000, nygYards: 175_000, nykYards: 0, current: "85% rPET / 10% lyocell / 5% elastane, 160gsm", pitch: "Washed Tencel heather pique (Newstalgia)." },
  { id: "ss28-men-5", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 5, program: "Pace Breaker Lined Short 7-inch", nygSales: 6_600_000, nygYards: 651_000, nykYards: 0, current: "86% rPET / 14% elastane, 124gsm", pitch: "Cooling stretch with subtle sheen (Joyrise)." },
  { id: "ss28-women-1", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 1, program: "Sculpt Tank Top", nygSales: 3_700_000, nygYards: 23_000, nykYards: 0, current: "76% polyamide / 24% spandex, UPF multifilament", pitch: "Fine-rib compression knit (Sensoreset)." },
  { id: "ss28-women-2", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 2, program: "BeCalm V-Neck Tank Top", nygSales: 400_000, nygYards: 28_000, nykYards: 0, current: "95% modal / 5% elastane terry, 256-265gsm, 60-inch", pitch: "Light modal jersey for summer (Chaosync)." },
  { id: "ss28-women-3", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 3, program: "Sculpt Short-Sleeve Shirt", nygSales: 1_400_000, nygYards: 10_000, nykYards: 0, current: "76% polyamide / 24% spandex, 125gsm, 57-inch", pitch: "Cooling mesh-zoned jersey (Joyrise)." },
  { id: "ss28-women-4", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 4, program: "Sculpt Cropped Tank Top", nygSales: 4_200_000, nygYards: 16_000, nykYards: 0, current: "76% nylon / 24% elastane, 125gsm, 57-inch", pitch: "Pointelle or fine-rib light knit (Newstalgia)." },
  { id: "ss28-women-5", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 5, program: "License to Train Classic-Fit Tank", nygSales: 400_000, nygYards: 18_000, nykYards: 0, current: "60% rPET / 33% nylon / 5% lycra, 160gsm, 60-inch", pitch: "Cooling single jersey with subtle sheen (Joyrise)." },
  { id: "fw28-men-1", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 1, program: "License to Train Hoodie", nygSales: 3_200_000, nygYards: 254_000, nykYards: 0, current: "60% rPET / 32% nylon / 4% lycra, 160gsm, 61-inch", pitch: "Light brushed-back fleece." },
  { id: "fw28-men-2", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 2, program: "Textured Double-Knit Cotton Hoodie", nygSales: 2_500_000, nygYards: 223_000, nykYards: 0, current: "63% cotton / 32% polyester / 5% elastane, 285gsm, 60-inch", pitch: "Brushed-back cotton double-knit with marl." },
  { id: "fw28-men-3", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 3, program: "Ease The Day Hoodie", nygSales: 7_000_000, nygYards: 369_000, nykYards: 0, current: "63% cotton / 32% rPET / 5% elastane, 285gsm, 60-inch", pitch: "The same double-knit with a softer felted hand." },
  { id: "fw28-men-4", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 4, program: "Rulu Fleece Half-Zip", nygSales: 3_700_000, nygYards: 206_000, nykYards: 0, current: "88% polyester / 12% lycra, 256gsm, 62-inch, brushed back", pitch: "Milled brushed fleece with a marl option." },
  { id: "fw28-men-5", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 5, program: "Waffle Knit Hoodie", nygSales: 1_800_000, nygYards: 163_000, nykYards: 163_000, current: "58% organic cotton / 37% rPET / 5% elastane, 355gsm", pitch: "Keep the base; add 3D and velour-face waffle." },
  { id: "fw28-women-1", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 1, program: "Define Jacket *Nulu", nygSales: 28_500_000, nygYards: 1_670_000, nykYards: 0, current: "81% nylon / 19% lycra, 214gsm, 46-inch Nulu 28gg", pitch: "Ultra-matte suede-brushed Nulu-type knit." },
  { id: "fw28-women-2", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 2, program: "It's Rulu Cropped Half Zip", nygSales: 3_700_000, nygYards: 131_000, nykYards: 0, current: "92% recycled nylon / 8% lycra, 219gsm, 58-inch", pitch: "Moss jersey with a light brushed finish." },
  { id: "fw28-women-3", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 3, program: "Love Long-Sleeve Shirt *BeCalm", nygSales: 700_000, nygYards: 55_000, nykYards: 0, current: "95% modal / 5% elastane, 256gsm, 60-inch", pitch: "Plush brushed modal terry." },
  { id: "fw28-women-4", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 4, program: "BeCalm Wrap-Front Long-Sleeve", nygSales: 500_000, nygYards: 34_000, nykYards: 0, current: "95% modal / 5% elastane, 265gsm, 60-inch", pitch: "The same terry with a felted plush hand." },
  { id: "fw28-women-5", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 5, program: "Love Modal Fleece Long-Sleeve", nygSales: 600_000, nygYards: 50_000, nykYards: 0, current: "93% micro modal / 7% elastane, 250gsm, 58-inch", pitch: "Micro-modal fleece with a powdery brushed hand." },
];

export const LULULEMON_NYK_WHITESPACE = [
  {
    gender: "Men",
    programs: [
      { name: "ABC", sales: 528_000_000, fabric: "Warpstreme stretch woven", detail: "NYG makes knit only; check woven first." },
      { name: "Zeroed In (men's)", sales: 232_000_000, fabric: "Pant, shirt, short, jogger and jacket", detail: "NYG makes only the graphic LS (waffle)." },
      { name: "Metal Vent Tech Tee", sales: 105_000_000, fabric: "Light mesh knit tee", detail: "Closest door: cooling mesh (Joyrise)." },
    ],
    path: [
      { step: 1, name: "Cooling mesh swatch", sales: 98_000_000, action: "Show beside DrySense for Metal Vent Tee." },
      { step: 2, name: "Knit version of ABC", sales: 136_000_000, action: "ABC Short, Jogger. Ask if a knit spec exists." },
      { step: 3, name: "ABC Pant", sales: 392_000_000, action: "Only with woven capability and trust." },
    ],
  },
  {
    gender: "Women",
    programs: [
      { name: "Align", sales: 921_000_000, fabric: "Nulu-type brushed nylon / lycra", detail: "Use the same fabric family as Define: 81/19, 214gsm." },
      { name: "Wunder Train", sales: 355_000_000, fabric: "Pant $258M · bra and brief $60M", detail: "Luxtreme-type 87/13, 201gsm (seen in POs)." },
      { name: "Swiftly", sales: 302_000_000, fabric: "Tee $249M · tank $52M", detail: "Light recycled jersey, cooling." },
    ],
    path: [
      { step: 1, name: "Nulu-type tank fabric", sales: 124_000_000, action: "Align Tank. Start from the Define fabric." },
      { step: 2, name: "Align Short fabric", sales: 113_000_000, action: "Same Nulu-type, next style." },
      { step: 3, name: "Align Pant fabric", sales: 664_000_000, action: "Largest prize. Earn it last." },
    ],
  },
];

export const LULULEMON_NYK_TREND_DIRECTIONS = [
  {
    season: "SS28",
    rows: [
      { direction: "Sensoreset", fabric: "Brushed, waffle, 3D texture and fine rib", men: "Waffle Hoodie", women: "Sculpt Tank / Cropped Tank" },
      { direction: "Newstalgia", fabric: "Slub jersey, washed finish and pointelle", men: "DrySense / Evolution", women: "Sculpt Cropped Tank" },
      { direction: "Joyrise", fabric: "Light cooling mesh with subtle sheen", men: "Pace Breaker", women: "Sculpt / License to Train" },
      { direction: "Chaosync", fabric: "Tencel, modal, crinkle and wool blend", men: "Pace Breaker 5-inch", women: "BeCalm V-Neck Tank" },
    ],
  },
  {
    season: "FW28",
    rows: [
      { direction: "Enveloping comfort", fabric: "Brushed, napped and felted", men: "License to Train Hoodie", women: "Define / Love Modal Fleece" },
      { direction: "Quiet smooth touch", fabric: "Fine gauge and ultra matte", men: "Double-Knit Hoodie / Rulu", women: "Define Jacket" },
      { direction: "Texture and relief", fabric: "Waffle, jacquard and velour", men: "Waffle Hoodie", women: "Rulu Cropped Half Zip" },
      { direction: "Nature texture", fabric: "Flecked marl and powdery brushing", men: "Ease The Day Hoodie", women: "Rulu Cropped Half Zip" },
    ],
  },
];

export const LULULEMON_NYK_ACTIONS = [
  { gender: "Men", rank: 1, program: "Pace Breaker", action: "Light cooling stretch swatch; ask jogger and jacket spec.", timing: "Now" },
  { gender: "Men", rank: 2, program: "DrySense, Evolution", action: "Slub-look and Tencel pique swatches.", timing: "SS28" },
  { gender: "Men", rank: 3, program: "Hoodies and Rulu", action: "Brushed double-knit and fleece swatches.", timing: "FW28" },
  { gender: "Women", rank: 1, program: "Define Jacket", action: "Nulu-type trial lot; confirm machine and yarn.", timing: "Now" },
  { gender: "Women", rank: 2, program: "Sculpt, BeCalm, Love", action: "Rib, pointelle and modal terry swatches.", timing: "SS28" },
  { gender: "Women", rank: 3, program: "Align tank, then short", action: "Nulu-type swatch beside Define.", timing: "Long game" },
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

export const LULULEMON_FORECAST_NYG_PROGRAMS = [
  { id: "ss28-men-1", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 1, program: "Pace Breaker Linerless Short 7-inch", nygSales: 4_900_000, nygUnits: 444_000, marketSales: 289_000_000, reason: "Ran in 6 of 10 seasons and sits in the largest men's category." },
  { id: "ss28-men-2", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 2, program: "Pace Breaker Linerless Short 5-inch", nygSales: 1_400_000, nygUnits: 128_000, marketSales: 276_000_000, reason: "Ran in 4 of 10 seasons; a large market with room to add." },
  { id: "ss28-men-3", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 3, program: "License to Train Short-Sleeve Shirt", nygSales: 8_200_000, nygUnits: 685_000, marketSales: 164_000_000, reason: "Ran in 7 of 10 seasons. DrySense shirt; NYG sales may include Women's." },
  { id: "ss28-men-4", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 4, program: "Evolution Short Sleeve Polo Shirt", nygSales: 1_900_000, nygUnits: 191_000, marketSales: 65_000_000, reason: "Ran in 5 of 10 seasons; clean and repeatable polo." },
  { id: "ss28-men-5", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Men", rank: 5, program: "Pace Breaker Lined Short 7-inch", nygSales: 6_600_000, nygUnits: 541_000, marketSales: 54_000_000, reason: "Ran in 9 of 10 seasons and is a top Pace Breaker seller." },
  { id: "ss28-women-1", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 1, program: "Sculpt Tank Top", nygSales: 3_700_000, nygUnits: 481_000, marketSales: 59_000_000, reason: "Ran in 6 of 10 seasons; core tank with very high volume." },
  { id: "ss28-women-2", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 2, program: "BeCalm V-Neck Tank Top", nygSales: 400_000, nygUnits: 56_000, marketSales: 25_000_000, reason: "Ran in 3 of 10 seasons; soft modal tank." },
  { id: "ss28-women-3", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 3, program: "Sculpt Short-Sleeve Shirt", nygSales: 1_400_000, nygUnits: 169_000, marketSales: 10_000_000, reason: "Ran in 9 of 10 seasons on the same Sculpt fabric platform." },
  { id: "ss28-women-4", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 4, program: "Sculpt Cropped Tank Top", nygSales: 4_200_000, nygUnits: 349_000, marketSales: 9_000_000, reason: "Ran in 5 of 10 seasons; a growing NYG tank." },
  { id: "ss28-women-5", season: "SS28", seasonName: "Spring/Summer 2028", gender: "Women", rank: 5, program: "License to Train Classic-Fit Tank Top", nygSales: 400_000, nygUnits: 48_000, marketSales: 5_000_000, reason: "Ran in 3 of 10 seasons and opens the larger tank market." },
  { id: "fw28-men-1", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 1, program: "License to Train Hoodie", nygSales: 3_200_000, nygUnits: 178_000, marketSales: 121_000_000, reason: "Ran in 5 of 10 seasons and addresses the largest men's hoodie market." },
  { id: "fw28-men-2", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 2, program: "Textured Double-Knit Cotton Hoodie", nygSales: 2_500_000, nygUnits: 131_000, marketSales: 77_000_000, reason: "Ran in 2 of 10 seasons and aligns with the texture trend." },
  { id: "fw28-men-3", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 3, program: "Ease The Day Hoodie", nygSales: 7_000_000, nygUnits: 415_000, marketSales: 34_000_000, reason: "Ran in 6 of 10 seasons; strong soft-touch hoodie since SU26." },
  { id: "fw28-men-4", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 4, program: "Rulu Fleece Half-Zip Long-Sleeve Shirt", nygSales: 3_700_000, nygUnits: 201_000, marketSales: 21_000_000, reason: "Ran in 9 of 10 seasons and fits the brushed-fleece direction." },
  { id: "fw28-men-5", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Men", rank: 5, program: "Cotton-Blend Waffle Knit Hoodie", nygSales: 1_800_000, nygUnits: 108_000, marketSales: 13_000_000, reason: "Ran in 5 of 10 seasons and serves a sizeable pullover market." },
  { id: "fw28-women-1", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 1, program: "Define Jacket *Nulu", nygSales: 28_500_000, nygUnits: 1_425_000, marketSales: 688_000_000, reason: "Ran in all 10 seasons; NYG's largest sale and market." },
  { id: "fw28-women-2", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 2, program: "It's Rulu Cropped Half Zip *Updated", nygSales: 3_700_000, nygUnits: 233_000, marketSales: 24_000_000, reason: "Ran in 9 of 10 seasons; established brushed Rulu half zip." },
  { id: "fw28-women-3", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 3, program: "Love Long-Sleeve Shirt *BeCalm", nygSales: 700_000, nygUnits: 64_000, marketSales: 13_000_000, reason: "Ran in 3 of 10 seasons; soft modal top." },
  { id: "fw28-women-4", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 4, program: "BeCalm Wrap-Front Long-Sleeve Shirt", nygSales: 500_000, nygUnits: 37_000, marketSales: 11_000_000, reason: "Ran in 2 of 10 seasons and provides access to the large tee market." },
  { id: "fw28-women-5", season: "FW28", seasonName: "Fall/Winter 2028", gender: "Women", rank: 5, program: "Love Modal Fleece Long-Sleeve Shirt", nygSales: 600_000, nygUnits: 59_000, marketSales: 8_000_000, reason: "Ran in 3 of 10 seasons and provides another route into tees." },
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
