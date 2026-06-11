import { WasteCategory } from './profile';

export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  category: WasteCategory;
};

export const QUESTIONS_PER_QUIZ = 5;
export const POINTS_PER_CORRECT = 3;
export const PERFECT_SCORE_BONUS = 5;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'How many years does a plastic bottle take to decompose in a landfill?',
    options: ['10–20 years', '50–100 years', '~450 years', 'It never decomposes'],
    correctIndex: 2,
    explanation: 'Plastic bottles can take up to 450 years to break down — and even then they leave microplastics behind.',
    category: 'plastic',
  },
  {
    id: 'q2',
    question: 'Where should you dispose of AA batteries?',
    options: ['Regular trash bin', 'Paper recycling bin', 'Battery recycling point', 'Compost bin'],
    correctIndex: 2,
    explanation: 'Batteries contain toxic chemicals like mercury and cadmium. Always take them to a dedicated battery recycling point.',
    category: 'batteries',
  },
  {
    id: 'q3',
    question: 'Can a greasy pizza box be recycled?',
    options: ['Yes, without any issues', 'Yes, if you remove the greasy parts', 'No, grease contaminates paper recycling', 'Only the lid can be recycled'],
    correctIndex: 2,
    explanation: 'Grease from food contaminates the paper fibers and ruins the recycling process. Greasy cardboard goes in general waste or compost.',
    category: 'cardboard',
  },
  {
    id: 'q4',
    question: 'What does the recycling number 1 (PET) on a plastic bottle mean?',
    options: ['It can only be recycled once', 'It is the most widely recyclable plastic', 'It is hazardous and should not be recycled', 'It is biodegradable'],
    correctIndex: 1,
    explanation: 'PET (polyethylene terephthalate) is one of the most commonly recycled plastics, accepted by most recycling programs worldwide.',
    category: 'plastic',
  },
  {
    id: 'q5',
    question: 'How many times can aluminium be recycled?',
    options: ['Once', 'Up to 5 times', 'Up to 10 times', 'Infinitely'],
    correctIndex: 3,
    explanation: 'Aluminium can be recycled infinitely without losing quality. Recycling it uses 95% less energy than producing new aluminium.',
    category: 'metal',
  },
  {
    id: 'q6',
    question: 'What should you do with old clothes that are still in good condition?',
    options: ['Throw in general waste', 'Donate or take to a textile recycling bin', 'Burn them', 'Put in plastic recycling'],
    correctIndex: 1,
    explanation: 'Wearable clothes should be donated. Damaged textiles go to dedicated textile bins to be repurposed as rags or insulation.',
    category: 'textile',
  },
  {
    id: 'q7',
    question: 'Can you put old electronics in the regular trash bin?',
    options: ['Yes, if they are broken', 'Only batteries need special disposal', 'No, take them to an e-waste center', 'Yes, as long as you remove the battery'],
    correctIndex: 2,
    explanation: 'Electronics contain toxic heavy metals like lead and mercury. They must go to certified e-waste recycling centers.',
    category: 'electronics',
  },
  {
    id: 'q8',
    question: 'What is a Tetra Pak carton made of?',
    options: ['Pure cardboard', 'Pure plastic', 'Layers of cardboard, plastic, and aluminium', 'Glass-coated paper'],
    correctIndex: 2,
    explanation: 'Tetra Pak cartons are composite materials — layers of cardboard, plastic, and aluminium — making them harder to recycle.',
    category: 'composite',
  },
  {
    id: 'q9',
    question: 'How should you dispose of motor oil?',
    options: ['Pour it down the drain', 'Put it in the plastic recycling bin', 'Take it to a hazardous waste facility', 'Bury it in your garden'],
    correctIndex: 2,
    explanation: 'Motor oil is highly toxic and can contaminate large amounts of groundwater. Always take it to a hazardous waste or oil recycling facility.',
    category: 'hazardous',
  },
  {
    id: 'q10',
    question: 'What percentage of glass can be recycled and reused?',
    options: ['Around 20%', 'Around 50%', '100%', 'Around 75%'],
    correctIndex: 2,
    explanation: 'Glass is 100% recyclable and can be recycled endlessly without losing purity or quality.',
    category: 'glass',
  },
  {
    id: 'q11',
    question: 'What should you do before recycling a plastic bottle?',
    options: ['Crush it flat', 'Rinse it and remove the cap if required locally', 'Leave food residue inside', 'Remove the label completely'],
    correctIndex: 1,
    explanation: 'Rinsing removes food contamination. Whether to keep or remove the cap depends on local guidelines — always check.',
    category: 'plastic',
  },
  {
    id: 'q12',
    question: 'Which of these should NOT go in the paper recycling bin?',
    options: ['Newspaper', 'Cardboard box', 'Wax-coated paper cup', 'Plain office paper'],
    correctIndex: 2,
    explanation: 'Wax or plastic-coated paper cups cannot be recycled with regular paper — the coating prevents fibers from separating.',
    category: 'composite',
  },
  {
    id: 'q13',
    question: 'What is the best way to dispose of old wooden furniture?',
    options: ['Put it in general waste', 'Burn it in your backyard', 'Donate, sell, or take to a recycling center', 'Put it in paper recycling'],
    correctIndex: 2,
    explanation: 'Furniture can often be reused or upcycled. Many recycling centers accept wood. Burning treated wood releases toxic fumes.',
    category: 'wood',
  },
  {
    id: 'q14',
    question: 'Can Lego bricks go in regular plastic recycling?',
    options: ['Yes, plastic is plastic', "No — donate them or use Lego's recycling program", 'Yes, but only primary colors', 'No, Lego is non-recyclable material'],
    correctIndex: 1,
    explanation: "Lego bricks are made of ABS plastic which most facilities can't process. Donate them or use Lego's official \"Replay\" program.",
    category: 'toys',
  },
  {
    id: 'q15',
    question: 'A broken ceramic plate — where does it go?',
    options: ['Glass recycling bin', 'Paper recycling bin', 'General waste — ceramics cannot be recycled', 'Metal recycling bin'],
    correctIndex: 2,
    explanation: 'Ceramics have a much higher melting point than glass and contaminate glass recycling. Broken ceramics go to general waste.',
    category: 'kitchenware',
  },
  {
    id: 'q16',
    question: 'What does composting help reduce?',
    options: ['Plastic waste', 'Electronic waste', 'Food and organic waste going to landfill', 'Glass waste'],
    correctIndex: 2,
    explanation: 'Composting turns organic waste into nutrient-rich soil, keeping it out of landfills where it would produce methane.',
    category: 'food',
  },
  {
    id: 'q17',
    question: 'Which plastic recycling number is hardest to recycle?',
    options: ['1 (PET)', '2 (HDPE)', '3 (PVC)', '5 (PP)'],
    correctIndex: 2,
    explanation: 'PVC (number 3) releases toxic chlorine gas during recycling and is rarely accepted by any recycling program.',
    category: 'plastic',
  },
];

export function getRandomQuestions(count = QUESTIONS_PER_QUIZ): QuizQuestion[] {
  return [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, count);
}
