import { WasteCategory } from "./profile";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type UpcyclingIdea = {
  title: string;
  description: string;
};

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

export async function getUpcyclingIdeas(
  objectLabel: string,
  category: WasteCategory,
): Promise<UpcyclingIdea[]> {
  const fallbackIdeas = FALLBACK_IDEAS[category] ?? FALLBACK_IDEAS.unknown;

  if (!GEMINI_API_KEY) {
    return fallbackIdeas;
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
          temperature: 0.7,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      console.warn("Gemini API error:", response.status, response.statusText);
      return fallbackIdeas;
    }

    const data = await response.json();

    if (data.error) {
      console.warn("Gemini API error:", data.error.message);
      return fallbackIdeas;
    }

    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return fallbackIdeas;

    const ideas = parseIdeas(text);
    return ideas.length > 0 ? ideas : fallbackIdeas;
  } catch (error) {
    console.warn("Upcycling AI failed, using fallback:", error);
    return fallbackIdeas;
  }
}

function parseIdeas(text: string): UpcyclingIdea[] {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item.title === "string")
      .slice(0, 3)
      .map((item) => ({
        title: String(item.title).trim(),
        description: String(item.description ?? "").trim(),
      }))
      .filter((item) => item.title.length > 0);
  } catch {
    return [];
  }
}
