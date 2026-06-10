import { WasteCategory } from "./profile";

// ─── Config ───────────────────────────────────────────────────────────────────
// Get a free key at https://aistudio.google.com/apikey
// For a hackathon, hardcoding is OK. For production, move this to an
// environment variable / backend proxy so the key isn't shipped in the app.

const GEMINI_API_KEY = "AIzaSyDiN44XC6aEa3BmprLblr10T0k2aN0Dkkw";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ─── Types ──────────────────────────────────────────────────────────────────

export type UpcyclingIdea = {
  title: string; // e.g. "Flower Vase"
  description: string; // 1 short sentence
};

// ─── Local fallback ───────────────────────────────────────────────────────────
// Used if the API key is missing, the network fails, or the response is invalid.
// The app should NEVER show an error to the user just because AI is unavailable.

const FALLBACK_IDEAS: Record<WasteCategory, UpcyclingIdea[]> = {
  plastic: [
    {
      title: "Plant Pot",
      description: "Cut the top off and use it as a small planter.",
    },
    {
      title: "Desk Organizer",
      description: "Store pens, cables, or small tools inside.",
    },
    {
      title: "Bird Feeder",
      description: "Cut openings and hang it outside with seeds.",
    },
  ],
  glass: [
    {
      title: "Flower Vase",
      description: "Clean it out and use it to display flowers.",
    },
    {
      title: "Spice Container",
      description: "Store herbs and spices in the airtight jar.",
    },
    {
      title: "Candle Holder",
      description: "Place a tea light inside for cozy lighting.",
    },
  ],
  paper: [
    {
      title: "Gift Wrap",
      description: "Reuse as decorative wrapping or padding.",
    },
    {
      title: "Notepad",
      description: "Cut and bind clean sides into a scratch pad.",
    },
    {
      title: "Compost",
      description: "Shred and add to a compost bin as brown matter.",
    },
  ],
  cardboard: [
    {
      title: "Storage Box",
      description: "Decorate and use for organizing items.",
    },
    {
      title: "Drawer Dividers",
      description: "Cut strips to separate items in drawers.",
    },
    { title: "Cat Toy", description: "Build a small play structure for pets." },
  ],
  metal: [
    {
      title: "Pen Holder",
      description: "Clean the can and use it on your desk.",
    },
    { title: "Planter", description: "Add drainage holes and grow herbs." },
    { title: "Lantern", description: "Punch holes and place a candle inside." },
  ],
  food: [
    {
      title: "Compost",
      description: "Turn organic scraps into nutrient-rich soil.",
    },
    {
      title: "Veggie Broth",
      description: "Simmer scraps into a homemade stock.",
    },
    { title: "Natural Dye", description: "Some peels make great fabric dyes." },
  ],
  electronics: [
    {
      title: "Salvage Parts",
      description: "Reuse screws, wires, or working components.",
    },
    {
      title: "Art Project",
      description: "Use circuit boards for decorative crafts.",
    },
    {
      title: "Donate",
      description: "Working devices can be refurbished and reused.",
    },
  ],
  unknown: [
    {
      title: "Reuse Creatively",
      description: "Think how this could serve a new purpose.",
    },
    {
      title: "Repair",
      description: "Fix it instead of replacing it if possible.",
    },
    {
      title: "Donate or Share",
      description: "Someone else may have a use for it.",
    },
  ],
};

// ─── Main API ─────────────────────────────────────────────────────────────────

export async function getUpcyclingIdeas(
  objectLabel: string,
  category: WasteCategory,
): Promise<UpcyclingIdea[]> {
  // No key configured → use fallback silently
  if (
    !GEMINI_API_KEY ||
    GEMINI_API_KEY === "AIzaSyDiN44XC6aEa3BmprLblr10T0k2aN0Dkkw"
  ) {
    return FALLBACK_IDEAS[category];
  }

  try {
    const prompt =
      `You are an upcycling expert. A user scanned a "${objectLabel}" ` +
      `(category: ${category}). Suggest exactly 3 creative, practical upcycling ` +
      `ideas to reuse this item at home instead of throwing it away.\n` +
      `Respond ONLY with a JSON array, no markdown, no extra text. Format:\n` +
      `[{"title":"Short Name","description":"One short sentence."}]`;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.warn("Gemini API error:", data.error.message);
      return FALLBACK_IDEAS[category];
    }

    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return FALLBACK_IDEAS[category];

    const ideas = parseIdeas(text);
    return ideas.length > 0 ? ideas : FALLBACK_IDEAS[category];
  } catch (e) {
    console.warn("Upcycling AI failed, using fallback:", e);
    return FALLBACK_IDEAS[category];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIdeas(text: string): UpcyclingIdea[] {
  try {
    // Strip markdown code fences if the model added them anyway
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((it) => it && typeof it.title === "string")
      .slice(0, 3)
      .map((it) => ({
        title: String(it.title),
        description: String(it.description ?? ""),
      }));
  } catch {
    return [];
  }
}
