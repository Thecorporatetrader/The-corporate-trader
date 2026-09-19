'use client';

import { CheckCircle2, PlayCircle, BookOpen, Terminal } from 'lucide-react';
import type { Module, Lesson } from '@/lib/curriculum';

const LEVEL_STYLES: Record<Module['level'], string> = {
  Beginner: 'bg-green/10 text-green',
  Intermediate: 'bg-warn/10 text-warn',
  Advanced: 'bg-cyan/10 text-cyan',
};

function LessonIcon({ type }: { type: Lesson['type'] }) {
  if (type === 'video') return <PlayCircle className="h-5 w-5" />;
  if (type === 'interactive') return <Terminal className="h-5 w-5" />;
  return <BookOpen className="h-5 w-5" />;
}

interface ModuleCardProps {
  module: Module;
  completedLessonIds: string[];
  onLessonSelect: (lesson: Lesson) => void;
  onToggleComplete: (lessonId: string) => void;
}

export function ModuleCard({ module, completedLessonIds, onLessonSelect, onToggleComplete }: ModuleCardProps) {
  const total = module.lessons.length;
  const completed = module.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className={`mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${LEVEL_STYLES[module.level]}`}>
            {module.level}
          </span>
          <h3 className="text-xl font-extrabold text-text">{module.title}</h3>
          <p className="mt-2 text-sm text-muted">{module.focus}</p>
        </div>

        <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-line"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={pct === 100 ? 'text-green' : 'text-cyan'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${pct}, 100`}
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-[11px] font-bold text-muted">{pct}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {module.lessons.map((lesson, idx) => {
          const isDone = completedLessonIds.includes(lesson.id);
          return (
            <div
              key={lesson.id}
              className="group flex items-start gap-3 rounded-lg border border-transparent bg-panel2 p-4 transition-all hover:border-cyan/40 hover:bg-panel2/70"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(lesson.id);
                }}
                aria-label={isDone ? 'Mark lesson incomplete' : 'Mark lesson complete'}
                aria-pressed={isDone}
                className={`mt-0.5 flex-shrink-0 transition-colors ${isDone ? 'text-green' : 'text-muted hover:text-cyan'}`}
              >
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <LessonIcon type={lesson.type} />}
              </button>
              <button onClick={() => onLessonSelect(lesson)} className="min-w-0 flex-1 text-left">
                <h4 className={`text-sm font-semibold leading-snug ${isDone ? 'text-muted' : 'text-text group-hover:text-cyan'}`}>
                  {idx + 1}. {lesson.title}
                </h4>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
                  {lesson.type} · {lesson.duration}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
