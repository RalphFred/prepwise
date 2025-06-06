import { create } from "zustand";

type ExamStore = {
  selectedSubjects: string[];
  setSelectedSubjects: (ids: string[]) => void;
  resetSubjects: () => void;
};

export const useExamStore = create<ExamStore>((set) => ({
  selectedSubjects: [],
  setSelectedSubjects: (ids) => set({ selectedSubjects: ids }),
  resetSubjects: () => set({ selectedSubjects: [] }),
}));