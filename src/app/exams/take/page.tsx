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
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Helper function to render text with math expressions
const renderMathText = (text: string) => {
  // Split text by math expressions (text between \( and \))
  const parts = text.split(/(\\\(.*?\\\))/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('\\(') && part.endsWith('\\)')) {
      // Extract the math expression and render it
      const math = part.slice(2, -2);
      return <InlineMath key={index} math={math} />;
    }
    return part;
  });
};

export default function TakeExamPage() {
  const subjectIds = useExamStore((s) => s.selectedSubjects);
  const [questionsBySubject, setQuestionsBySubject] = useState<Record<string, any[]>>({});
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [questionId: string]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answerStatus, setAnswerStatus] = useState<{ [questionId: string]: boolean }>({});
  const [subjectPerformance, setSubjectPerformance] = useState<{
    [subjectId: string]: {
      total: number;
      correct: number;
      percentage: number;
    }
  }>({});

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

  // Handle flag question
  const handleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Handle quiz submission
  const handleSubmit = () => {
    let correct = 0;
    const status: { [questionId: string]: boolean } = {};
    const performance: { [subjectId: string]: { total: number; correct: number; percentage: number } } = {};
    
    // Initialize performance tracking for each subject
    subjects.forEach(subject => {
      performance[subject.id] = { total: 0, correct: 0, percentage: 0 };
    });
    
    Object.values(questionsBySubject).flat().forEach((q) => {
      const isCorrect = Boolean(answers[q.id] && answers[q.id] === q.answer);
      status[q.id] = isCorrect;
      if (isCorrect) correct++;
      
      // Update subject performance
      performance[q.subject_id].total++;
      if (isCorrect) performance[q.subject_id].correct++;
    });

    // Calculate percentages
    Object.keys(performance).forEach(subjectId => {
      performance[subjectId].percentage = 
        (performance[subjectId].correct / performance[subjectId].total) * 100;
    });
    
    setAnswerStatus(status);
    setSubjectPerformance(performance);
    setScore(correct);
    setSubmitted(true);
  };

  // Function to scroll to question
  const scrollToQuestion = (questionId: string) => {
    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      <main className="flex-1 flex flex-row gap-6 px-4 md:px-8 py-4 w-full">
        {/* Left Sidebar: Subject Tabs, Navigator */}
        <div className="w-full md:w-80">
          <div className="sticky top-4 space-y-4">
            {/* Subject Tabs */}
            <Tabs value={selectedSubject} onValueChange={handleTabChange} className="w-full">
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
                {currentQuestions.map((q, i) => {
                  const isAnswered = answers[q.id];
                  const isFlagged = flaggedQuestions[q.id];
                  const isCurrent = i === currentIndex;
                  const isCorrect = submitted ? answerStatus[q.id] : undefined;
                  
                  return (
                    <Button 
                      key={i} 
                      variant={isCurrent ? "default" : "outline"} 
                      size="sm" 
                      className={`rounded-md px-0 py-2 ${
                        submitted 
                          ? isCorrect 
                            ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200'
                          : isFlagged 
                            ? 'border-red-500 text-red-500 hover:bg-red-50' 
                            : isAnswered 
                              ? 'bg-neutral-400 hover:bg-green-50' 
                              : ''
                      }`}
                      onClick={() => {
                        goToQuestion(i);
                        if (submitted) {
                          scrollToQuestion(q.id);
                        }
                      }}
                    >
                      {i + 1}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Question Card */}
        <section className={`flex-1 flex items-center justify-center ${submitted ? 'md:col-span-2' : ''}`}>
          <Card className="w-full p-8">
            <CardContent className="space-y-6">
              {loading ? (
                <div className="text-center py-12 text-lg font-semibold text-muted-foreground">Loading questions...</div>
              ) : submitted ? (
                <div className="flex flex-col h-full">
                  <h2 className="text-2xl font-bold mb-4">Your Score: {score} / {Object.values(questionsBySubject).flat().length}</h2>
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-8">
                      {subjects.map((subject) => {
                        const subjectQuestions = questionsBySubject[subject.id] || [];
                        if (subjectQuestions.length === 0) return null;
                        
                        return (
                          <div key={subject.id} className="text-left">
                            <h3 className="text-xl font-bold text-primary-700 mb-4">{subject.name}</h3>
                            <div className="space-y-4">
                              {subjectQuestions.map((q, idx) => {
                                const userAnswer = answers[q.id];
                                const isCorrect = userAnswer === q.answer;
                                return (
                                  <div 
                                    key={q.id} 
                                    id={`question-${q.id}`}
                                    className={`p-4 rounded-lg border ${isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}
                                  > 
                                    <div className="font-semibold mb-1">Q{idx + 1}: {renderMathText(q.question)}</div>
                                    <div className="mb-1">Your answer: <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>{userAnswer ? renderMathText(q.options[userAnswer]) : <span className="italic">No answer</span>}</span></div>
                                    <div className="mb-2">Correct answer: <span className="text-green-700">{renderMathText(q.options[q.answer])}</span></div>
                                    {q.explanation && (
                                      <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="font-medium text-gray-700 mb-1">Explanation:</div>
                                        <div className="text-gray-600">{renderMathText(q.explanation)}</div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Performance Analysis */}
                    <div className="mt-8 space-y-6">
                      <h3 className="text-xl font-bold text-primary-700">Performance Analysis</h3>
                      
                      {/* Overall Summary */}
                      <div className="bg-white rounded-xl shadow p-6">
                        <h4 className="font-semibold mb-4">Overall Performance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-primary-50 rounded-lg">
                            <div className="text-sm text-primary-600 mb-1">Total Score</div>
                            <div className="text-2xl font-bold text-primary-700">{score} / {Object.values(questionsBySubject).flat().length}</div>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-sm text-green-600 mb-1">Best Subject</div>
                            <div className="text-2xl font-bold text-green-700">
                              {Object.entries(subjectPerformance)
                                .sort((a, b) => b[1].percentage - a[1].percentage)[0]?.[0] 
                                ? subjects.find(s => s.id === Object.entries(subjectPerformance)
                                  .sort((a, b) => b[1].percentage - a[1].percentage)[0][0])?.name 
                                : 'N/A'}
                            </div>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <div className="text-sm text-red-600 mb-1">Needs Improvement</div>
                            <div className="text-2xl font-bold text-red-700">
                              {Object.entries(subjectPerformance)
                                .sort((a, b) => a[1].percentage - b[1].percentage)[0]?.[0]
                                ? subjects.find(s => s.id === Object.entries(subjectPerformance)
                                  .sort((a, b) => a[1].percentage - b[1].percentage)[0][0])?.name
                                : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Subject-wise Performance */}
                      <div className="bg-white rounded-xl shadow p-6">
                        <h4 className="font-semibold mb-4">Subject-wise Performance</h4>
                        <div className="space-y-4">
                          {subjects.map(subject => {
                            const performance = subjectPerformance[subject.id];
                            if (!performance) return null;
                            
                            return (
                              <div key={subject.id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{subject.name}</span>
                                  <span className="text-sm text-gray-600">
                                    {performance.correct} / {performance.total} correct
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      performance.percentage >= 70 ? 'bg-green-500' :
                                      performance.percentage >= 50 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${performance.percentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {performance.percentage.toFixed(1)}% correct
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !question ? (
                <div className="text-center py-12 text-lg font-semibold text-red-500">No questions found.</div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-primary-700 mb-2">
                      {subjects.find(s => s.id === selectedSubject)?.name}
                    </h3>
                    <div>
                      <span className="text-xl font-bold">Question {currentIndex + 1}</span>
                      <span className="text-muted-foreground font-medium"> of {currentQuestions.length}</span>
                    </div>
                  </div>
                  <div id={`question-${question.id}`} className="text-lg font-medium mb-2">
                    {renderMathText(question.question)}
                  </div>
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(val) => handleAnswer(question.id, val)}
                    className="space-y-3"
                  >
                    {Object.entries(question.options || {}).map(([key, value]: any) => (
                      <div key={key} className="flex items-center gap-3 p-2 rounded-lg border">
                        <RadioGroupItem value={key} id={`option-${key}`} />
                        <label htmlFor={`option-${key}`} className="w-full">
                          {renderMathText(value)}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="flag" 
                      className="accent-green-600" 
                      checked={flaggedQuestions[question.id] || false}
                      onChange={() => handleFlagQuestion(question.id)}
                    />
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
        {!submitted && (
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
        )}
      </main>

      {/* Footer: Quit/Submit */}
      <footer className="w-full flex justify-center gap-4 py-4 bg-white border-t border-primary-100">
        <Button variant="outline" className="w-32">Quit</Button>
        <Button className="w-32" onClick={handleSubmit} disabled={submitted}>Submit</Button>
      </footer>
    </div>
  );
}