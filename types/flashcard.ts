export interface Flashcard {
  id: string;
  english: string;
  french: string;
  phonetic?: string;
  type: "word" | "phrase" | "sentence";
  createdAt: number;
}
