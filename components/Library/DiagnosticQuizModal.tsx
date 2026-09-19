'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { quizQuestions, levelFromScore, type ExperienceLevel } from '@/lib/curriculum';

interface DiagnosticQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (level: Exclude<ExperienceLevel, 'All'>, score: number) => void;
}

export function DiagnosticQuizModal({ isOpen, onClose, onComplete }: DiagnosticQuizModalProps) {
  const [step, setStep] = useState(0); // index into quizQuestions
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ level: Exclude<ExperienceLevel, 'All'>; score: number } | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setStep(0);
    setScore(0);
    setSelected(null);
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return; // lock after first pick
    setSelected(idx);
    const isCorrect = idx === quizQuestions[step].correctIndex;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    window.setTimeout(() => {
      if (step < quizQuestions.length - 1) {
        setStep(step + 1);
        setSelected(null);
      } else {
        const level = levelFromScore(newScore);
        setResult({ level, score: newScore });
      }
    }, 450);
  };

  const handleFinish = () => {
    if (!result) return;
    onComplete(result.level, result.score);
    handleClose();
  };

  const q = quizQuestions[step];
  const progressPct = ((step + (selected !== null ? 1 : 0)) / quizQuestions.length) * 100;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-card border border-line bg-panel shadow-2xl">
        <button
          onClick={handleClose}
          aria-label="Close diagnostic quiz"
          className="absolute right-4 top-4 text-muted transition-colors hover:text-text"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {!result ? (
            <>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan">
                Check Your Level · {q.topic}
              </div>
              <h2 className="mb-6 text-xl font-extrabold text-text">Diagnostic Evaluation</h2>

              <div className="mb-6 h-2 w-full rounded-full bg-panel2">
                <div
                  className="h-2 rounded-full bg-cyan transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <p className="mb-6 text-lg leading-snug text-text">
                {step + 1}. {q.question}
              </p>

              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isAnswer = idx === q.correctIndex;
                  const showState = selected !== null;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={selected !== null}
                      className={`w-full rounded-lg border px-5 py-3.5 text-left text-sm transition-all
                        ${
                          showState && isAnswer
                            ? 'border-green bg-green/10 text-text'
                            : showState && isSelected && !isAnswer
                            ? 'border-red bg-red/10 text-text'
                            : 'border-line bg-panel2 text-muted hover:border-cyan/60 hover:text-text'
                        }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-center text-xs text-muted">
                Question {step + 1} of {quizQuestions.length}
              </p>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan">
                Diagnostic complete
              </div>
              <h2 className="mb-2 text-2xl font-extrabold text-text">
                You scored {result.score} / {quizQuestions.length}
              </h2>
              <p className="mb-8 text-muted">
                Based on your score, we recommend starting at the{' '}
                <span
                  className={`font-bold ${
                    result.level === 'Beginner'
                      ? 'text-green'
                      : result.level === 'Intermediate'
                      ? 'text-warn'
                      : 'text-cyan'
                  }`}
                >
                  {result.level}
                </span>{' '}
                tier.
              </p>
              <button onClick={handleFinish} className="btn w-full justify-center">
                Go to my {result.level} curriculum
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
