// Matched from Lululemon Wallet Size & Share (1).xlsx, NYK sheet.
// Totals use PO_QTY for NYK-supplied fabric lines measured in YDS.
export const LULULEMON_FUTURE_NYK_FABRICS = {
  "future-style-4": {
    nykFabricYards: 282251,
    nykFabricSeasons: [
      { season: "FA26", yards: 92811 },
      { season: "WT26", yards: 154371 },
      { season: "SP27", yards: 35069 },
    ],
    nykFabrics: [
      {
        itemCode: "4547",
        construction: "D11695 / FDMG31/03 Rib 1x1 Plaited Stretch",
        composition: "56% recycled polyester, 41% organic cotton, 3% elastane",
        yards: 35897,
      },
      {
        itemCode: "4702",
        construction: "FDPE54/11 Waffle Stretch",
        composition: "58% organic cotton, 37% recycled polyester, 5% elastane",
        yards: 246354,
      },
    ],
  },
  "future-style-7": {
    nykFabricYards: 105716,
    nykFabricSeasons: [
      { season: "FA26", yards: 23799 },
      { season: "WT26", yards: 62382 },
      { season: "SP27", yards: 19535 },
    ],
    nykFabrics: [
      {
        itemCode: "4547",
        construction: "D11695 / FDMG31/03 Rib 1x1 Plaited Stretch",
        composition: "56% recycled polyester, 41% organic cotton, 3% elastane",
        yards: 10317,
      },
      {
        itemCode: "4702",
        construction: "FDPE54/11 Waffle Stretch",
        composition: "58% organic cotton, 37% recycled polyester, 5% elastane",
        yards: 95399,
      },
    ],
  },
  "future-style-18": {
    nykFabricYards: 39373,
    nykFabricSeasons: [
      { season: "WT26", yards: 30486 },
      { season: "SP27", yards: 8887 },
    ],
    nykFabrics: [
      {
        itemCode: "4547",
        construction: "D11695 / FDMG31/03 Rib 1x1 Plaited Stretch",
        composition: "56% recycled polyester, 41% organic cotton, 3% elastane",
        yards: 5142,
      },
      {
        itemCode: "4702",
        construction: "FDPE54/11 Waffle Stretch",
        composition: "58% organic cotton, 37% recycled polyester, 5% elastane",
        yards: 34231,
      },
    ],
  },
};

export const enrichFutureStyleWithNykFabric = (style) => ({
  ...style,
  ...(LULULEMON_FUTURE_NYK_FABRICS[style.key] || {}),
});

export const LULULEMON_NYG_FUTURE_STYLES_WITH_NYK = (styles) =>
  styles.map(enrichFutureStyleWithNykFabric);
