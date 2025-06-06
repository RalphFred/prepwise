"use server";

import { createClient } from "@/lib/supabase/server";

export type Subject = {
  id: string;
  name: string;
  created_at: string;
};

export async function getSubjects() {
  const supabase = await createClient();
  
  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching subjects:", error);
    throw new Error("Failed to fetch subjects");
  }

  return subjects;
}