import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Read and parse topics CSV
const topicsCsv = fs.readFileSync(path.join(__dirname, "topics_rows.csv"), "utf-8");
const topics = parse(topicsCsv, {
  columns: true,
  skip_empty_lines: true,
});

// Create case-insensitive topic title to ID map
const topicMap: Record<string, string> = {};
topics.forEach((topic: any) => {
  topicMap[topic.title.toLowerCase()] = topic.id;
});

// Topic mapping for mismatches
const topicMapping: Record<string, string> = {
  // Physics mappings
  "rectilinear acceleration": "Motion",
  "scalars and vectors": "Motion",
  "simple harmonic motion": "Motion",
  "newton's laws of motion": "Motion",
  "work, energy and power": "Work, Energy and Power",
  "gravitational field": "Motion",
  "equilibrium of forces": "Motion",
  "sound waves": "Waves",
  "light waves": "Waves",
  "heat energy": "Heat Energy",
  "properties of matter": "Properties of Matter",
  "current electricity": "Electricity",
  "electromagnetism": "Magnetism and Electromagnetism",
  "modern physics": "Modern Physics",
  "electrostatics": "Electricity",
  "electromagnetic induction": "Magnetism and Electromagnetism",
  "simple ac circuits": "Electricity",
  "practical skills": "Introduction",

  // Chemistry mappings
  "structure of the atom": "Atomic structure",
  "separation techniques for mixtures": "Introduction to chemistry",
  "periodic chemistry": "Periodic table",
  "chemical bonds": "Chemical bonding",
  "stoichiometry and chemical reactions": "Stoichiometry",
  "energy and energy changes": "Energetics",
  "solubility of substances": "States of matter",
  "chemical kinetics and equilibrium system": "Chemical kinetics",
  "redox reactions": "Energetics",
  "chemistry of carbon compounds": "Organic chemistry",
  "chemistry, industry and the environment": "Industrial chemistry",
  "basic biochemistry and synthetic polymers": "Organic chemistry",
  "separation of mixtures and purification of chemical substances": "Introduction to chemistry",
  "chemical combination": "Chemical bonding",
  "kinetic theory of matter and gas laws": "Gas laws",
  "atomic structure and bonding": "Atomic structure",
  "air": "Environmental chemistry",
  "water": "Environmental chemistry",
  "solubility": "States of matter",
  "environmental pollution": "Environmental chemistry",
  "oxidation and reduction": "Energetics",
  "energy changes": "Energetics",
  "rates of chemical reaction": "Chemical kinetics",
  "chemical equilibra": "Equilibrium",
  "non-metals and their compounds": "Periodic table",
  "metals and their compounds": "Periodic table",
  "organic compounds": "Organic chemistry",
  "chemistry and industry": "Industrial chemistry",

  // Biology mappings
  "variation and its applications": "Heredity and variation",
  "adaptation for survival": "Evolution",
  "regulation and coordination": "Coordination",
  "public health and disease prevention": "Microorganisms",
  "ecology and environment": "Ecology",
  "human physiology": "Circulatory System",
  "cell structure and function": "Cells",
  "growth and development": "Growth",
  "support and movement": "Support and Movement",
  "practical biology": "Introduction",

  // English mappings
  "essay writing": "Essay Writing",
  "lexis and structure": "Lexis and Structure",
  "sentence interpretation": "Comprehension",
  "antonyms": "Lexis and Structure",
  "synonyms": "Lexis and Structure",
  "basic grammar": "Lexis and Structure",
  "oral forms": "Lexis and Structure",
  "vowels": "Lexis and Structure",
  "consonants": "Lexis and Structure",
  "rhymes": "Lexis and Structure",
  "word stress": "Lexis and Structure",
  "emphatic stress": "Lexis and Structure",

  // Math mappings
  "number and numeration": "Number and Numeration",
  "algebraic processes": "Algebra",
  "geometry and trigonometry": "Geometry",
  "sets": "Sets and Logic",
  "calculus": "Introductory Calculus",
  "vectors": "Geometry",
  "matrices and determinants": "Algebra",
  "modular arithmetic": "Number and Numeration",
  "coordinate geometry": "Geometry",
  "measures of dispersion": "Statistics",
  "permutations and combinations": "Probability"
};

// Question files to process
const questionFiles = [
  "cleaned_physics_questions_by_topic.json",
  "cleaned_english_questions_by_topic.json",
  "cleaned_chem_questions_by_topic.json",
  "cleaned_math_questions_by_topic.json",
  "biology_questions_by_topic_cleaned.json",
];

async function importQuestions() {
  for (const file of questionFiles) {
    console.log(`\nProcessing ${file}...`);
    
    // Read and parse question file
    const questionsByTopic = JSON.parse(
      fs.readFileSync(path.join(__dirname, file), "utf-8")
    );

    // Process each topic in the file
    for (const [topicTitle, questions] of Object.entries(questionsByTopic)) {
      // Try to find the mapped topic first
      const mappedTopic = topicMapping[topicTitle.toLowerCase()];
      const topic_id = topicMap[(mappedTopic || topicTitle).toLowerCase()];
      
      if (!topic_id) {
        console.warn(`⚠️ Skipping unknown topic: ${topicTitle}`);
        continue;
      }

      // Prepare questions for insertion
      const payload = (questions as any[]).map((q) => ({
        topic_id,
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation || null,
      }));

      // Insert questions in batches of 100 to avoid hitting limits
      const batchSize = 100;
      for (let i = 0; i < payload.length; i += batchSize) {
        const batch = payload.slice(i, i + batchSize);
        const { error } = await supabase.from("questions").insert(batch);

        if (error) {
          console.error(
            `❌ Failed to insert batch for topic "${topicTitle}":`,
            error
          );
        } else {
          console.log(
            `✅ Inserted batch ${i / batchSize + 1} of ${
              Math.ceil(payload.length / batchSize)
            } for "${topicTitle}"`
          );
        }
      }
    }
  }
}

// Run the import
importQuestions().catch((error) => {
  console.error("❌ Import failed:", error);
  process.exit(1);
});