'use client';

import { useMemo, useState } from 'react';
import { Sparkles, Flame } from 'lucide-react';
import { academyModules, macroHub, type ExperienceLevel, type Lesson } from '@/lib/curriculum';
import { DiagnosticQuizModal } from './DiagnosticQuizModal';
import { ModuleCard } from './ModuleCard';
import { LessonViewModal } from './LessonViewModal';

const LEVELS: ExperienceLevel[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function TradingAcademy() {
  const [activeLevel, setActiveLevel] = useState<ExperienceLevel>('All');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [lastQuizResult, setLastQuizResult] = useState<{ level: ExperienceLevel; score: number } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const filteredModules = useMemo(() => {
    const modules = activeLevel === 'All' ? academyModules : academyModules.filter((m) => m.level === activeLevel);
    return [...modules].sort((a, b) => a.order - b.order);
  }, [activeLevel]);

  const totalLessons = academyModules.reduce((n, m) => n + m.lessons.length, 0) + macroHub.lessons.length;
  const overallPct = totalLessons ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  const handleLessonComplete = (id: string) => {
    setCompletedLessons((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const toggleLessonComplete = (id: string) => {
    setCompletedLessons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="bg-bg text-text">
      <div className="container">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 border-b border-line pb-8 pt-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan">Trading Academy</div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              From Pure Price Action to Quantitative Execution
            </h1>
            <p className="mt-2 max-w-xl text-muted">
              A step-by-step curriculum that guides you from chart fundamentals through institutional order flow
              to systematic, algorithmic MQL5 execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={activeLevel}
              onChange={(e) => setActiveLevel(e.target.value as ExperienceLevel)}
              aria-label="Filter curriculum by experience level"
              className="rounded-lg border border-line bg-panel2 px-4 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-cyan"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'All' ? 'All Levels' : lvl}
                </option>
              ))}
            </select>

            <button onClick={() => setIsQuizOpen(true)} className="btn flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Check Your Level
            </button>
          </div>
        </div>

        {lastQuizResult && (
          <div className="mb-8 rounded-card border border-cyan/30 bg-cyan/5 px-5 py-4 text-sm text-text">
            Diagnostic result: <span className="font-bold text-cyan">{lastQuizResult.score} / 10</span> — curriculum
            filtered to <span className="font-bold text-cyan">{lastQuizResult.level}</span>.
          </div>
        )}

        <div className="mb-10 flex items-center gap-4">
          <div className="h-2 flex-1 rounded-full bg-panel2">
            <div className="h-2 rounded-full bg-green transition-all duration-500" style={{ width: `${overallPct}%` }} />
          </div>
          <span className="whitespace-nowrap text-xs font-bold text-muted">{overallPct}% complete</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Universal Macroeconomics Hub — pinned for every level */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-card border border-line bg-panel p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-lg bg-red/10 p-2 text-red">
                  <Flame className="h-5 w-5" />
                </span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-muted">
                    Pinned · All levels
                  </span>
                  <h3 className="text-lg font-extrabold text-text">{macroHub.title}</h3>
                </div>
              </div>
              <p className="mb-6 text-sm text-muted">{macroHub.focus}</p>
              <ul className="space-y-4">
                {macroHub.lessons.map((lesson) => {
                  const isDone = completedLessons.includes(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => setActiveLesson(lesson)}
                        className="group block w-full text-left"
                      >
                        <h4 className={`text-sm font-semibold transition-colors ${isDone ? 'text-muted line-through' : 'text-text group-hover:text-cyan'}`}>
                          {lesson.title}
                        </h4>
                        <span className="text-[11px] uppercase tracking-wide text-muted">
                          {lesson.type} · {lesson.duration}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Sequential curriculum */}
          <main className="space-y-8 lg:col-span-3">
            {filteredModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                completedLessonIds={completedLessons}
                onLessonSelect={(lesson) => setActiveLesson(lesson)}
                onToggleComplete={toggleLessonComplete}
              />
            ))}
          </main>
        </div>
      </div>

      <DiagnosticQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={(level, score) => {
          setActiveLevel(level);
          setLastQuizResult({ level, score });
        }}
      />

      <LessonViewModal
        lesson={activeLesson}
        isOpen={!!activeLesson}
        isCompleted={activeLesson ? completedLessons.includes(activeLesson.id) : false}
        onClose={() => setActiveLesson(null)}
        onComplete={handleLessonComplete}
      />
    </div>
  );
}
