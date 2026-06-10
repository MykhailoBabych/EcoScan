// ─── Educational content for the Explore tab ────────────────────────────────────
// Static, curated content — no API needed. Edit freely to add more.

export type EcoFact = {
  id: string;
  emoji: string;
  text: string;
};

export type RecyclingGuide = {
  id: string;
  emoji: string;
  title: string;
  color: string;
  rules: string[];
};

export type UpcyclingTip = {
  id: string;
  emoji: string;
  item: string;
  idea: string;
};

// ── Eco facts (shown in a horizontal carousel) ──────────────────────────────────

export const ECO_FACTS: EcoFact[] = [
  {
    id: "f1",
    emoji: "♻️",
    text: "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
  },
  {
    id: "f2",
    emoji: "🌊",
    text: "Around 8 million tons of plastic enter the oceans every year.",
  },
  {
    id: "f3",
    emoji: "🪟",
    text: "Glass is 100% recyclable and can be recycled endlessly without quality loss.",
  },
  {
    id: "f4",
    emoji: "📄",
    text: "Recycling one ton of paper saves about 17 trees and 26,000 liters of water.",
  },
  {
    id: "f5",
    emoji: "🔋",
    text: "A single phone battery can pollute 600,000 liters of water if not recycled.",
  },
  {
    id: "f6",
    emoji: "🍌",
    text: "Composting food waste cuts methane emissions from landfills significantly.",
  },
];

// ── Recycling guides (per material) ─────────────────────────────────────────────

export const RECYCLING_GUIDES: RecyclingGuide[] = [
  {
    id: "g-plastic",
    emoji: "🧴",
    title: "Plastic",
    color: "#0ea5e9",
    rules: [
      "Rinse containers before recycling.",
      "Check the resin code (1–7) for local acceptance.",
      "Remove caps and lids if your facility requires it.",
      "Avoid recycling plastic bags in curbside bins.",
    ],
  },
  {
    id: "g-glass",
    emoji: "🫙",
    title: "Glass",
    color: "#8b5cf6",
    rules: [
      "Rinse jars and bottles.",
      "Remove metal or plastic lids.",
      "Do not mix with window glass or mirrors.",
      "Separate by color if your area requires it.",
    ],
  },
  {
    id: "g-paper",
    emoji: "📄",
    title: "Paper",
    color: "#f59e0b",
    rules: [
      "Keep paper clean and dry.",
      "Remove plastic windows from envelopes.",
      "Flatten to save space.",
      "Greasy paper (like pizza boxes) goes to compost, not recycling.",
    ],
  },
  {
    id: "g-metal",
    emoji: "🥫",
    title: "Metal",
    color: "#6b7280",
    rules: [
      "Rinse food cans.",
      "Aluminum and steel are both widely recyclable.",
      "Crush cans to save space if allowed.",
      "Small foil pieces often get lost — ball them up together.",
    ],
  },
  {
    id: "g-ewaste",
    emoji: "📱",
    title: "E-Waste",
    color: "#ef4444",
    rules: [
      "Never put batteries in regular bins.",
      "Take devices to certified e-waste centers.",
      "Wipe personal data before disposal.",
      "Many stores offer free electronics take-back.",
    ],
  },
];

// ── Upcycling inspiration (browsable without scanning) ──────────────────────────

export const UPCYCLING_TIPS: UpcyclingTip[] = [
  {
    id: "u1",
    emoji: "🫙",
    item: "Glass jar",
    idea: "Turn it into a herb planter or spice container.",
  },
  {
    id: "u2",
    emoji: "🧴",
    item: "Plastic bottle",
    idea: "Make a self-watering planter or bird feeder.",
  },
  {
    id: "u3",
    emoji: "📦",
    item: "Cardboard box",
    idea: "Build drawer dividers or a cat playhouse.",
  },
  {
    id: "u4",
    emoji: "🥫",
    item: "Tin can",
    idea: "Create a rustic pen holder or lantern.",
  },
  {
    id: "u5",
    emoji: "👕",
    item: "Old t-shirt",
    idea: "Cut into reusable cleaning rags or a tote bag.",
  },
  {
    id: "u6",
    emoji: "🍷",
    item: "Wine bottle",
    idea: "Use as a vase or a DIY oil dispenser.",
  },
];
