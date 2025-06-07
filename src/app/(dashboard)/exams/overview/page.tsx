"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/store/exam-store";

export default function ExamOverview() {
  const router = useRouter();
  const subjectIds = useExamStore((s) => s.selectedSubjects);

  const { data: subjects, isLoading, error } = useQuery({
    queryKey: ["subjects", subjectIds],
    queryFn: async () => {
      if (subjectIds.length === 0) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .in("id", subjectIds);
      if (error) throw error;
      return data;
    },
    enabled: subjectIds.length > 0,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading subjects</div>;

  return (
    <div className="mx-auto px-6 py-4 space-y-6">
      <h1 className="text-2xl font-bold">Exam Overview</h1>
      <div className="space-y-2">
        <p>
          <span className="font-semibold">Duration:</span> 2 hours total — time starts once you begin.
        </p>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Subjects Selected:</h2>
        <ul className="space-y-2">
          {[...(subjects ?? [])]
            .sort((a, b) => {
              const aIsEnglish = a.name.toLowerCase().includes("english");
              const bIsEnglish = b.name.toLowerCase().includes("english");
              if (aIsEnglish && !bIsEnglish) return -1;
              if (!aIsEnglish && bIsEnglish) return 1;
              return a.name.localeCompare(b.name);
            })
            .map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground">
                  {s.name.toLowerCase().includes("english")
                    ? "– 60 questions"
                    : "– 40 questions"}
                </span>
              </li>
            ))}
        </ul>
      </div>
      <div className="flex justify-center items-center gap-4 py-6">
        <button
          className="border-2 border-primary-500 bg-white px-6 py-2 rounded-full font-medium hover:bg-primary-50 transition-colors flex items-center cursor-pointer"
          onClick={() => router.back()}
          type="button"
        >
        <ChevronLeft size={18}/> <span className="inline-block">Back</span>
        </button>
        <button
          className="bg-primary-500 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-600  cursor-pointer transition-colors flex items-center gap-2"
          onClick={() => router.push("/exams/take")}
          type="button"
        >
          Start Exam
        </button>
      </div>
    </div>
  );
} 