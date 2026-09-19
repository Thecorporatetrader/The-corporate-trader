'use client';

import { X, ChevronRight, BarChart2, FileText, Calculator, Info, Image as ImageIcon, Table2 } from 'lucide-react';
import type { Lesson, ContentBlock } from '@/lib/curriculum';

interface LessonViewModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={index} className="mb-6 text-lg leading-relaxed text-muted">
          {block.text}
        </p>
      );

    case 'example':
      return (
        <div key={index} className="my-8 rounded-r-lg border-l-4 border-cyan bg-cyan/5 p-6">
          <h4 className="mb-2 flex items-center gap-2 font-bold text-cyan">
            <Info className="h-5 w-5" /> {block.title}
          </h4>
          <p className="text-muted">{block.text}</p>
        </div>
      );

    case 'math':
      return (
        <div key={index} className="my-8 rounded-card border border-line bg-panel2 p-6">
          <div className="mb-4 flex items-center gap-3 text-warn">
            <Calculator className="h-6 w-6" />
            <h4 className="font-bold">Quantitative Formula</h4>
          </div>
          <div className="mb-4 rounded-lg border border-line bg-bg p-4 text-center font-mono text-lg text-text">
            {block.formula}
          </div>
          <p className="text-sm text-muted">{block.explanation}</p>
        </div>
      );

    case 'code':
      return (
        <div key={index} className="my-8">
          <div className="flex items-center justify-between rounded-t-lg border-l border-r border-t border-line bg-panel2 px-4 py-2">
            <span className="text-sm font-bold text-text">{block.language} Snippet</span>
            <span className="text-xs text-muted">{block.description}</span>
          </div>
          <pre className="overflow-x-auto rounded-b-lg border-b border-l border-r border-line bg-bg p-4 font-mono text-sm text-green">
            <code>{block.code}</code>
          </pre>
        </div>
      );

    case 'concept-box':
      return (
        <div key={index} className="my-8 rounded-card border border-line bg-panel2 p-6">
          <h4 className="mb-4 text-lg font-bold text-text">{block.title}</h4>
          <ul className="space-y-3">
            {block.points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-muted">
                <span className="mt-1 text-cyan">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'cheat-sheet':
      return (
        <div key={index} className="my-8 overflow-hidden rounded-card border border-line">
          <div className="flex items-center gap-2 bg-panel2 px-5 py-3 text-sm font-bold text-text">
            <Table2 className="h-4 w-4 text-cyan" /> {block.title}
          </div>
          <div className="divide-y divide-line">
            {block.rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[220px_1fr] sm:gap-4">
                <div className="text-sm font-bold text-cyan">{row.label}</div>
                <div className="text-sm text-muted">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'chart-placeholder':
      return (
        <div
          key={index}
          className="my-8 flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line bg-panel2 py-14 text-center"
        >
          <ImageIcon className="h-8 w-8 text-muted" />
          <p className="max-w-md text-sm text-muted">{block.caption}</p>
        </div>
      );

    default:
      return null;
  }
}

export function LessonViewModal({ lesson, isOpen, isCompleted, onClose, onComplete }: LessonViewModalProps) {
  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 z-[65] overflow-y-auto bg-bg">
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/90 p-4 backdrop-blur-md">
          <button onClick={onClose} className="flex items-center text-muted transition-colors hover:text-text">
            <X className="mr-2 h-6 w-6" />
            <span className="font-medium">Back to Academy</span>
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-muted">{lesson.type}</div>
        </div>

        <div className="flex-1 p-8 md:p-12">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-3xl font-extrabold leading-tight text-text md:text-4xl">{lesson.title}</h1>
            <div className="mb-10 flex flex-wrap items-center gap-6 border-b border-line pb-8 text-sm text-muted">
              <span className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" /> {lesson.description}
              </span>
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> {lesson.duration} read
              </span>
            </div>

            <div>{lesson.content.map((block, i) => renderBlock(block, i))}</div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-line bg-panel/95 p-6 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-end">
            <button
              onClick={() => {
                onComplete(lesson.id);
                onClose();
              }}
              disabled={isCompleted}
              className="btn flex items-center disabled:cursor-default disabled:opacity-60"
            >
              {isCompleted ? 'Completed' : 'Mark as Completed'}
              {!isCompleted && <ChevronRight className="ml-2 h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
