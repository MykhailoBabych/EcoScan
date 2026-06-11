import { WasteCategory } from "./profile";

export type GuideEntry = {
  category: WasteCategory;
  emoji: string;
  color: string;
  recyclable: boolean;
  overview: string;
  preparationSteps: string[];
  commonMistakes: string[];
  funFact: string;
  acceptedIn: string;
};

export const GUIDE: GuideEntry[] = [
  {
    category: "plastic",
    emoji: "🧴",
    color: "#0ea5e9",
    recyclable: true,
    overview:
      "Plastic is one of the most produced materials on Earth — and one of the trickiest to recycle correctly. Not all plastics are equal: check the recycling number (1–7) on the bottom. Numbers 1 (PET) and 2 (HDPE) are most widely accepted.",
    preparationSteps: [
      "Empty and rinse the container to remove food residue.",
      "Check the resin code on the bottom (the triangle number).",
      "Leave the label on — it is fine to recycle with it.",
      "Check local rules for caps: some require removal, others do not.",
      "Flatten bottles to save space if possible.",
    ],
    commonMistakes: [
      "Putting greasy plastic food containers in the recycling bin without rinsing.",
      "Recycling plastic bags — most kerbside programs do not accept them. Take them to supermarket drop-off points.",
      "Thinking all plastics are recyclable — numbers 3 (PVC) and 6 (PS) are rarely accepted.",
      "Recycling bottle caps separately — check if your local scheme accepts them attached.",
    ],
    funFact:
      "A single plastic bottle can take up to 450 years to decompose. Recycling just one bottle saves enough energy to power a lightbulb for 3 hours.",
    acceptedIn: "Yellow or mixed recycling bin (varies by region)",
  },
  {
    category: "glass",
    emoji: "🫙",
    color: "#8b5cf6",
    recyclable: true,
    overview:
      "Glass is one of the most valuable recyclable materials — it can be recycled endlessly without any loss of quality or purity. A recycled glass bottle is back on the shelf within 30 days.",
    preparationSteps: [
      "Rinse jars and bottles to remove food or drink residue.",
      "Remove lids (metal lids can often be recycled separately).",
      "Leave labels on — they burn off in the furnace.",
      "Separate by colour if your local scheme requires it (clear, green, brown).",
    ],
    commonMistakes: [
      "Putting broken ceramics or Pyrex in the glass bin — they have a different melting point and contaminate the batch.",
      "Including mirrors, windows, or light bulbs — these are not container glass and cannot be recycled the same way.",
      "Not rinsing — dirty glass is harder to process and can contaminate other materials.",
    ],
    funFact:
      "Glass is 100% recyclable and can be recycled indefinitely. The UK alone processes over 1.6 million tonnes of glass each year, saving the equivalent energy of 230,000 households.",
    acceptedIn: "Glass-only bin or bottle bank",
  },
  {
    category: "paper",
    emoji: "📄",
    color: "#f59e0b",
    recyclable: true,
    overview:
      "Paper is one of the most recycled materials in the world. It can be recycled 5–7 times before the fibres become too short to use again. Clean, dry paper is always valuable.",
    preparationSteps: [
      "Keep paper clean and dry — wet paper cannot be recycled.",
      "Remove plastic windows from envelopes if possible.",
      "Shred confidential documents, but note: loose shredded paper often escapes sorting machinery.",
      "Flatten cardboard and paper to save space.",
    ],
    commonMistakes: [
      "Recycling waxed or plastic-coated paper (like coffee cups, juice cartons, or frozen food boxes) — the coating prevents fibre separation.",
      "Including thermal receipt paper — it contains BPA and cannot be recycled.",
      "Adding paper contaminated with food grease — like greasy pizza boxes.",
      "Putting sticky notes in — the adhesive can gum up machinery.",
    ],
    funFact:
      "Recycling one tonne of paper saves 17 trees, 26,000 litres of water, and 4,000 kWh of electricity. One recycled newspaper saves enough energy to power a TV for 3 hours.",
    acceptedIn: "Paper/card recycling bin or bag",
  },
  {
    category: "cardboard",
    emoji: "📦",
    color: "#d97706",
    recyclable: true,
    overview:
      "Cardboard (corrugated and flat) is highly recyclable and in high demand. The rise of online shopping has made cardboard one of the most important materials in the recycling stream.",
    preparationSteps: [
      "Break down and flatten all boxes — this saves space and helps sorting.",
      "Remove any plastic tape, bubble wrap, or foam inserts.",
      "Keep cardboard dry — wet cardboard is much harder to process.",
      "Remove greasy or food-soaked sections before recycling the rest.",
    ],
    commonMistakes: [
      "Recycling the entire pizza box when the bottom is heavily greased — remove the soiled part.",
      "Leaving polystyrene (Styrofoam) inside boxes — it must be removed.",
      "Including wax-coated cardboard (used for produce) — it is not standard cardboard.",
      "Not flattening boxes — un-flattened boxes waste space and can jam conveyor belts.",
    ],
    funFact:
      "About 70% of all cardboard is recovered and recycled. A recycled cardboard box can be back in circulation within 14 days of collection.",
    acceptedIn: "Paper/card bin — flattened",
  },
  {
    category: "metal",
    emoji: "🥫",
    color: "#6b7280",
    recyclable: true,
    overview:
      "Metal — particularly aluminium and steel — is one of the most valuable recyclable materials. Aluminium is especially prized because recycling it uses 95% less energy than producing new metal from ore.",
    preparationSteps: [
      "Rinse cans to remove food residue.",
      "You do not need to remove paper labels — they burn off.",
      "Crush cans slightly to save space, but check if your local scheme requires them uncrushed for sorting.",
      "Small metal items like bottle caps can be collected in a larger steel can and crimped shut.",
    ],
    commonMistakes: [
      "Including aerosol cans that are not fully empty — they can be dangerous in the recycling process.",
      "Putting sharp metal (like broken kitchen knives) loose in the bin — wrap them safely.",
      "Mixing non-recyclable metals like pots and pans with standard cans — they require different processing.",
    ],
    funFact:
      "Aluminium cans are the most recycled item on the planet. One recycled can saves enough energy to run a TV for 3 hours. The same aluminium can be recycled and back on a shelf in just 60 days.",
    acceptedIn: "Metal/cans bin, or mixed recycling",
  },
  {
    category: "food",
    emoji: "🍌",
    color: "#22c55e",
    recyclable: false,
    overview:
      "Food waste cannot be recycled in the traditional sense, but composting turns it into nutrient-rich material. Food in landfill is a major source of methane — a greenhouse gas 80x more potent than CO2. Proper disposal matters enormously.",
    preparationSteps: [
      "Use a home compost bin for vegetable peels, fruit, coffee grounds, and eggshells.",
      "Check if your area has a food waste kerbside collection (brown or green caddy).",
      "Avoid putting cooked food, meat, or dairy in a home compost bin — it attracts pests.",
      "Bokashi fermentation systems can handle cooked food and meat at home.",
    ],
    commonMistakes: [
      "Putting food in the general waste bin when a food/compost option is available.",
      "Including compostable packaging in home compost — most only break down in industrial composters.",
      "Wasting food in the first place — the greenest food is the food you do not waste.",
    ],
    funFact:
      "Food waste is responsible for around 8% of global greenhouse gas emissions. If food waste were a country, it would be the third-largest emitter in the world after the US and China.",
    acceptedIn: "Food waste caddy or home compost",
  },
  {
    category: "electronics",
    emoji: "📱",
    color: "#ef4444",
    recyclable: false,
    overview:
      "Electronic waste (e-waste) is the fastest-growing waste stream in the world. It contains toxic materials like lead, mercury, and cadmium — but also valuable metals like gold, silver, and copper. Never put electronics in the bin.",
    preparationSteps: [
      "Wipe personal data from devices before dropping them off.",
      "Remove batteries if possible — batteries require separate handling.",
      "Find your nearest WEEE (Waste Electrical and Electronic Equipment) drop-off point.",
      "Many retailers like Currys, Apple, and Samsung offer take-back programs.",
      "Check if the item can be repaired or refurbished before recycling.",
    ],
    commonMistakes: [
      "Putting electronics in the general waste — this is illegal in many countries.",
      "Leaving batteries inside devices at e-waste centres — remove them separately.",
      "Ignoring retailer take-back schemes — they often offer discounts for trading in.",
      "Discarding items that could be donated or refurbished.",
    ],
    funFact:
      "The world generates 57 million tonnes of e-waste per year — equivalent to 740 Eiffel Towers. Only 17% is formally recycled. A tonne of iPhones contains 300x more gold than a tonne of gold ore.",
    acceptedIn: "WEEE recycling centre or retailer take-back",
  },
  {
    category: "textile",
    emoji: "👕",
    color: "#ec4899",
    recyclable: true,
    overview:
      "Textile waste is one of the most overlooked environmental problems. The fashion industry produces 10% of global carbon emissions. Even damaged clothing has value — it can be shredded into insulation, rags, or filling material.",
    preparationSteps: [
      "Donate wearable clothes to charity shops, clothing banks, or platforms like Vinted.",
      "Take damaged or worn-out textiles to clothing bank drop-offs (many supermarkets have them).",
      "Bag textiles separately — do not mix them with other recyclables.",
      "Clean clothes before donating — charities spend significant resources cleaning.",
    ],
    commonMistakes: [
      "Putting textiles in the general recycling bin — they jam sorting machinery.",
      "Throwing away clothes that charities would accept.",
      "Ignoring fast-fashion take-back programs (H&M, Zara, Patagonia all have them).",
      "Discarding shoes unpaired — always keep pairs together.",
    ],
    funFact:
      "The average person buys 60% more clothing than 15 years ago and keeps each item half as long. Less than 1% of clothing is currently recycled into new clothing.",
    acceptedIn: "Textile bank, charity shop, or clothing drop-off",
  },
  {
    category: "batteries",
    emoji: "🔋",
    color: "#eab308",
    recyclable: true,
    overview:
      "Batteries contain toxic chemicals — mercury, lead, cadmium, and lithium — that can leach into soil and water. They must never go in the general waste or kerbside recycling. All UK and EU retailers selling batteries must accept them for free.",
    preparationSteps: [
      "Tape the terminals of lithium batteries with clear tape to prevent short circuits.",
      "Collect household batteries in a small container until you have enough to drop off.",
      "Take to any supermarket, DIY store, or electronics retailer — they all have drop-off boxes.",
      "For car batteries, return to any garage or automotive retailer.",
    ],
    commonMistakes: [
      "Putting batteries in general waste — illegal in many countries and a fire hazard.",
      "Putting batteries in kerbside recycling — they can cause fires at sorting facilities.",
      "Puncturing or crushing batteries — can cause chemical leaks or fires.",
      "Not taping loose lithium battery terminals before storage or transport.",
    ],
    funFact:
      "A single AA battery can pollute 400 litres of water if it ends up in landfill. In the EU, only about 45% of portable batteries are collected and recycled.",
    acceptedIn: "Battery drop-off point at retailers or recycling centres",
  },
  {
    category: "composite",
    emoji: "🧃",
    color: "#f97316",
    recyclable: true,
    overview:
      "Composite materials like Tetra Pak cartons and coffee cups are made of multiple bonded layers — usually cardboard, plastic, and aluminium. This makes them harder to recycle, but specialist facilities exist to separate and recover the materials.",
    preparationSteps: [
      "Rinse cartons and cups thoroughly.",
      "Flatten cartons to save space.",
      "Replace the cap on Tetra Pak cartons — the cap is recyclable too.",
      "Check if your local scheme accepts composite cartons — not all kerbside collections do.",
      "Find specialist drop-offs through the TetraPak or cartoncouncil websites.",
    ],
    commonMistakes: [
      "Assuming coffee cups go in paper recycling — the plastic lining prevents standard paper processing.",
      "Not checking if your local scheme accepts composite materials.",
      "Not rinsing — residue makes composites harder to process.",
      "Including hot drink lids — they are usually a different plastic that needs separate sorting.",
    ],
    funFact:
      "A Tetra Pak carton is made of 75% cardboard, 20% polyethylene plastic, and 5% aluminium. Specialist mills can separate and recycle all three layers, with the aluminium being particularly valuable.",
    acceptedIn: "Specialist composite recycling — check locally",
  },
  {
    category: "wood",
    emoji: "🪵",
    color: "#92400e",
    recyclable: true,
    overview:
      "Wood waste is bulky and often ends up in landfill unnecessarily. Solid, untreated wood can be chipped into biomass fuel or composted. Furniture can often be donated, repaired, or upcycled.",
    preparationSteps: [
      "Check if the item can be donated (charity shops, Facebook Marketplace, Freecycle).",
      "Remove screws, nails, and hardware before taking to a recycling centre.",
      "Separate treated or painted wood from untreated — they go to different streams.",
      "Take large items to a household waste recycling centre.",
    ],
    commonMistakes: [
      "Burning treated wood — it releases toxic fumes from paints, varnishes, and preservatives.",
      "Putting wood in kerbside recycling — it belongs at a recycling centre.",
      "Discarding furniture that could be repaired or resold.",
      "Mixing chipboard and MDF with solid wood — they are processed differently.",
    ],
    funFact:
      "The UK sends about 5 million tonnes of wood waste to landfill each year. Recycled wood can be turned into chipboard, animal bedding, biomass fuel, or composting material.",
    acceptedIn: "Household waste recycling centre (HWRC)",
  },
  {
    category: "toys",
    emoji: "🧸",
    color: "#8b5cf6",
    recyclable: false,
    overview:
      "Toys are notoriously difficult to recycle because they are made from multiple mixed plastics, metals, and electronics. The best environmental option is always to donate, repair, or pass on working toys before considering disposal.",
    preparationSteps: [
      "Donate working toys to charities, schools, toy libraries, or through apps like Vinted.",
      "Remove batteries before disposal — batteries must be recycled separately.",
      "Check for manufacturer take-back programs: Lego has a Replay program for used bricks.",
      "For electronic toys, take to a WEEE recycling point.",
    ],
    commonMistakes: [
      "Putting Lego in plastic recycling — ABS plastic is not accepted by most kerbside schemes.",
      "Assuming a toy is beyond repair — repair cafes can often fix broken items.",
      "Throwing away toys with batteries still inside.",
      "Buying new when second-hand options are plentiful and often cheaper.",
    ],
    funFact:
      "Lego is the world's largest tyre manufacturer by number of tyres (for their toy cars). In 2023, Lego launched a global Replay programme to donate used bricks to children in need.",
    acceptedIn: "Charity shop, toy library, or WEEE centre for electronic toys",
  },
  {
    category: "kitchenware",
    emoji: "🍳",
    color: "#14b8a6",
    recyclable: false,
    overview:
      "Kitchenware covers a wide range of materials — ceramic plates, glass bakeware, stainless steel pots, non-stick pans, and plastic utensils. Each material needs a different disposal route. Intact items are always better donated.",
    preparationSteps: [
      "Donate working items to charity shops, homeless shelters, or community groups.",
      "Wrap broken ceramics or glass in newspaper before putting in general waste (not glass recycling).",
      "Take metal pots and pans to a scrap metal merchant or recycling centre.",
      "Check non-stick pans — some PTFE coatings require specialist disposal.",
    ],
    commonMistakes: [
      "Putting broken ceramics in glass recycling — ceramic has a different melting point and ruins glass batches.",
      "Putting Pyrex or tempered glass in glass recycling for the same reason.",
      "Throwing away pots and pans that could go to a scrap metal yard for recovery.",
      "Discarding functional kitchenware instead of donating.",
    ],
    funFact:
      "Ceramic is one of the hardest materials to recycle. However, crushed ceramics (called grog) are used in construction as aggregate, or mixed into new ceramics to reduce cracking.",
    acceptedIn: "General waste (broken ceramics), scrap metal yard (pots/pans), or donation",
  },
  {
    category: "hazardous",
    emoji: "☢️",
    color: "#ef4444",
    recyclable: false,
    overview:
      "Hazardous household waste includes paints, solvents, pesticides, motor oil, and cleaning chemicals. These require specialist handling — they cannot go in any regular bin. Even small amounts can contaminate groundwater for years.",
    preparationSteps: [
      "Keep hazardous materials in their original labelled containers — never decant into unmarked bottles.",
      "Take to a Household Waste Recycling Centre (HWRC) on a chemical waste day.",
      "Many local councils offer free chemical waste collection events — check your council website.",
      "For large quantities, contact a licensed hazardous waste contractor.",
    ],
    commonMistakes: [
      "Pouring paint, oil, or chemicals down the drain — it pollutes waterways and is illegal.",
      "Putting aerosol cans that still contain product in general waste.",
      "Mixing different chemicals — always keep them in their original containers.",
      "Ignoring HWRC chemical collection events — they are usually free.",
    ],
    funFact:
      "Just one litre of motor oil can contaminate up to one million litres of drinking water. Oil recycling centres can re-refine used oil — it takes 42 gallons of crude oil to produce 2.5 quarts of new lubricating oil, but only 1 gallon of used oil.",
    acceptedIn: "Hazardous waste facility or HWRC chemical days",
  },
  {
    category: "unknown",
    emoji: "❓",
    color: "#8e8e93",
    recyclable: false,
    overview:
      "When you are unsure how to classify an item, it is always better to check than to guess. Contaminating recycling bins with wrong materials can cause entire batches to go to landfill.",
    preparationSteps: [
      "Check the item for a recycling symbol or material code.",
      "Search the item type on your local council website.",
      "When in doubt, put it in general waste — a contaminated recycling batch is worse than general waste.",
      "Many supermarkets have specialist drop-off points for hard-to-recycle items.",
    ],
    commonMistakes: [
      "Wishful recycling — putting items in the recycling bin and hoping for the best.",
      "Ignoring the material code on packaging — it tells you exactly what it is made of.",
      "Not checking with your local council — recycling schemes vary significantly by region.",
    ],
    funFact:
      "Wishful recycling (also called wish-cycling) is one of the biggest problems in the recycling industry. In some areas, up to 25% of materials put in recycling bins cannot actually be recycled.",
    acceptedIn: "Check local council guidance before recycling",
  },
];

export function getGuideEntry(category: WasteCategory): GuideEntry | undefined {
  return GUIDE.find((g) => g.category === category);
}
