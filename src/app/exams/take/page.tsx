"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { getQuestionsBySubjects } from "@/lib/actions/questions.actions";
import { getSubjects } from "@/lib/actions/subjects.actions";
import { useExamStore } from "@/store/exam-store";

export default function TakeExamPage() {
  const subjectIds = useExamStore((s) => s.selectedSubjects);
  const [questionsBySubject, setQuestionsBySubject] = useState<Record<string, any[]>>({});
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function fetchQuestionsAndSubjects() {
      setLoading(true);
      try {
        const [data, allSubjects] = await Promise.all([
          getQuestionsBySubjects(subjectIds),
          getSubjects()
        ]);
        // Group questions by subject_id
        const grouped: Record<string, any[]> = {};
        data.forEach((q: any) => {
          if (!grouped[q.subject_id]) grouped[q.subject_id] = [];
          grouped[q.subject_id].push(q);
        });
        setQuestionsBySubject(grouped);
        // Filter subjects to only those in subjectIds
        const filteredSubjects = allSubjects.filter((s: any) => subjectIds.includes(s.id));
        setSubjects(filteredSubjects);
        // Set default selected subject
        setSelectedSubject(filteredSubjects[0]?.id || subjectIds[0] || "");
        // Set current index per subject
        const idxs: Record<string, number> = {};
        Object.keys(grouped).forEach((sid) => (idxs[sid] = 0));
        setCurrentIndexes(idxs);
      } catch (e) {
        setQuestionsBySubject({});
        setSubjects([]);
      }
      setLoading(false);
    }
    fetchQuestionsAndSubjects();
  }, [subjectIds]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // Get current question for selected subject
  const currentIndex = currentIndexes[selectedSubject] || 0;
  const currentQuestions = questionsBySubject[selectedSubject] || [];
  const question = currentQuestions[currentIndex];

  // Get subject name for tab
  const getSubjectName = (id: string) => {
    const subj = subjects.find((s) => s.id === id);
    if (!subj) return id;
    if (subj.name.toLowerCase().includes("english")) return "English";
    return subj.name;
  };

  // Handle tab change
  const handleTabChange = (id: string) => {
    setSelectedSubject(id);
  };

  // Handle question navigation
  const goToQuestion = (idx: number) => {
    setCurrentIndexes((prev) => ({ ...prev, [selectedSubject]: idx }));
  };

  // Handle answer selection
  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Handle quiz submission
  const handleSubmit = () => {
    let correct = 0;
    Object.values(questionsBySubject).flat().forEach((q) => {
      if (answers[q.id] && answers[q.id] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-primary-100">
        <div className="flex items-center gap-3">
          <Image src="/images/logo.svg" alt="logo" width={40} height={40} className="size-10" />
          <span className="text-xl font-bold text-green-700">Prepwise Exam</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full font-medium text-primary-700">
            <span className="font-medium">⏰</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-row gap-6 px-4 md:px-8 py-8 w-full">
        {/* Left Sidebar: Subject Tabs, Navigator */}
        <aside className="w-full md:w-80 flex flex-col gap-6">
          {/* Subject Tabs */}
          <Tabs value={selectedSubject} onValueChange={handleTabChange} className="w-full mb-4">
            <TabsList className="w-full grid grid-cols-4 gap-2">
              {subjects.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className="truncate text-sm border">
                  {getSubjectName(s.id)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* Question Navigator */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold mb-4">Question Navigator</div>
            <div className="grid grid-cols-5 gap-2">
              {currentQuestions.map((_, i) => (
                <Button key={i} variant={i === currentIndex ? "default" : "outline"} size="sm" className="rounded-md px-0 py-2" onClick={() => goToQuestion(i)}>
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Question Card */}
        <section className="flex-1 flex items-center justify-center">
          <Card className="w-full p-8">
            <CardContent className="space-y-6">
              {loading ? (
                <div className="text-center py-12 text-lg font-semibold text-muted-foreground">Loading questions...</div>
              ) : submitted ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">Your Score: {score} / {Object.values(questionsBySubject).flat().length}</h2>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {Object.values(questionsBySubject).flat().map((q, idx) => {
                      const userAnswer = answers[q.id];
                      const isCorrect = userAnswer === q.answer;
                      return (
                        <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}> 
                          <div className="font-semibold mb-1">Q{idx + 1}: {q.question}</div>
                          <div className="mb-1">Your answer: <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>{userAnswer ? q.options[userAnswer] : <span className="italic">No answer</span>}</span></div>
                          <div>Correct answer: <span className="text-green-700">{q.options[q.answer]}</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : !question ? (
                <div className="text-center py-12 text-lg font-semibold text-red-500">No questions found.</div>
              ) : (
                <>
                  <div>
                    <span className="text-xl font-bold">Question {currentIndex + 1}</span>
                    <span className="text-muted-foreground font-medium"> of {currentQuestions.length}</span>
                  </div>
                  <div className="text-lg font-medium mb-2">{question.question}</div>
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(val) => handleAnswer(question.id, val)}
                    className="space-y-3"
                  >
                    {Object.entries(question.options || {}).map(([key, value]: any) => (
                      <div key={key} className="flex items-center gap-3 p-2 rounded-lg border">
                        <RadioGroupItem value={key} id={`option-${key}`} />
                        <label htmlFor={`option-${key}`} className="w-full">{value}</label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="flag" className="accent-green-600" />
                    <label htmlFor="flag" className="text-sm text-muted-foreground">Flag Question</label>
                  </div>
                  <div className="flex justify-between gap-4 mt-6">
                    <Button variant="outline" className="flex-1" disabled={currentIndex === 0} onClick={() => goToQuestion(currentIndex - 1)}>&larr; Previous</Button>
                    <Button className="flex-1" disabled={currentIndex === currentQuestions.length - 1} onClick={() => goToQuestion(currentIndex + 1)}>Next &rarr;</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Right Sidebar: Calculator */}
        <aside className="w-full md:w-80 flex flex-col gap-6">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex justify-between items-center">
                Calculator <span className="ml-2">▼</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border-t text-muted-foreground">
              Calculator coming soon...
            </CollapsibleContent>
          </Collapsible>
        </aside>
      </main>

      {/* Footer: Quit/Submit */}
      <footer className="w-full flex justify-center gap-4 py-6 bg-white border-t border-primary-100">
        <Button variant="outline" className="w-32">Quit</Button>
        <Button className="w-32" onClick={handleSubmit} disabled={submitted}>Submit</Button>
      </footer>
    </div>
  );
}