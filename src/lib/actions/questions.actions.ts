"use server";

import { createClient } from "@/utils/supabase/server";

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function getQuestionsBySubjects(subjectIds: string[]) {
  if (!subjectIds || subjectIds.length === 0) return [];
  const supabase = await createClient();

  // Fetch subject details to identify English
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, name")
    .in("id", subjectIds);
  if (subjectsError) throw subjectsError;

  let allQuestions: any[] = [];

  for (const subject of subjects ?? []) {
    // Only fetch 10 for English, 5 for others (for demo/testing)
    const isEnglish = subject.name.toLowerCase().includes("english");
    const questionCount = isEnglish ? 10 : 5;
    const { data: questions, error } = await supabase
      .from("questions")
      .select("*")
      .eq("subject_id", subject.id);
    if (error) throw error;
    const shuffled = shuffle(questions ?? []);
    allQuestions = allQuestions.concat(shuffled.slice(0, questionCount));
  }

  return allQuestions;
}
