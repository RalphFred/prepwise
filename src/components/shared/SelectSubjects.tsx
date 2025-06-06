"use client";

import { Input } from "@/components/ui/input";
import { ArrowRightIcon, SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Subject } from "@/lib/actions/subjects.actions";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client"; // or your client path
import { useExamStore } from "@/store/exam-store";

async function fetchSubjects() {
  const supabase = createClient();
  const { data, error } = await supabase.from("subjects").select("*").order("name");
  if (error) throw error;
  return data;
}

export function SelectSubject() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const selectedSubjects = useExamStore((s) => s.selectedSubjects);
  const setSelectedSubjects = useExamStore((s) => s.setSelectedSubjects);

  const { data: subjects, isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
  });

  useEffect(() => {
    if (subjects && subjects.length > 0) {
      const english = subjects.find(
        (subject) => subject.name.toLowerCase().includes("english")
      );
      if (english && !selectedSubjects.includes(english.id)) {
        setSelectedSubjects([english.id]);
      }
    }
    // eslint-disable-next-line
  }, [subjects]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading subjects</div>;

  const filteredSubjects = (subjects ?? []).filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    const aIndex = selectedSubjects.indexOf(a.id);
    const bIndex = selectedSubjects.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const toggleSubject = (subjectId: string) => {
    if (subjectId === englishId) return;
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const handleContinue = () => {
    console.log("Selected subject IDs:", selectedSubjects);
    setSelectedSubjects(selectedSubjects);
    router.push("/exams/overview");
  };

  const english = subjects?.find(
    (subject) => subject.name.toLowerCase().includes("english")
  );
  const englishId = english?.id;

  return (
    <div className="px-6 py-4 space-y-8 min-h-screen flex flex-col w-full">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Select Your Subjects</h1>
      </div>

      <div className="relative xl:w-2xl mx-auto">
        <Input
          id="search"
          className="peer ps-9 pe-9 rounded-full py-6 w-full"
          placeholder="Search subjects..."
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
          {sortedSubjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => toggleSubject(subject.id)}
              disabled={subject.id === englishId}
              className={cn(
                "px-6 py-3 rounded-full text-sm font-medium transition-all duration-200",
                "border-2",
                selectedSubjects.includes(subject.id)
                  ? "bg-primary-500 text-white border-primary-500 hover:bg-primary-600"
                  : "bg-white hover:bg-primary-50",
                subject.id === englishId && "opacity-60 cursor-not-allowed"
              )}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center py-6">
        <button
          className="bg-primary-500 cursor-pointer text-white px-8 py-4 rounded-full font-medium transition-colors flex items-center gap-2 disabled:bg-primary-200 disabled:cursor-not-allowed"
          onClick={handleContinue}
          disabled={selectedSubjects.length !== 4}
        >
          {selectedSubjects.length !== 4
            ? "Select exactly 4 subjects to continue"
            : `Continue with 4 subjects`}
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </div>
  );
} 