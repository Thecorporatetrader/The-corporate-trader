'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { assessmentQuestions, calculateAssessment } from '@/lib/traderAssessment';

export default function TraderAssessment() {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  useEffect(() => { if (interacted.current) heading.current?.focus(); }, [step, complete]);
  const question = assessmentQuestions[step];
  const answered = answers.filter(a => a !== null).length;
  function retake() { setAnswers(Array(10).fill(null)); setStep(0); setComplete(false); }

  if (complete) {
    const result = calculateAssessment(answers);
    const nextSteps = result.improvements.length ? result.improvements.slice(0, 3) : result.categories.slice(0, 3);
    return <div className="assessment-results">
      <div className="card assessment-summary">
        <div><div className="eyebrow">YOUR REFLECTION</div><h2 ref={heading} tabIndex={-1}>{result.classification}</h2><p>This describes your selected habits today, not a fixed identity. Every habit can improve with practice.</p></div>
        <div className="assessment-score"><strong>{result.score}</strong><span>/ 100</span><small>Trading discipline score</small></div>
      </div>
      <p className="assessment-note">This is an educational self-reflection, not a validated psychological test, diagnosis, or prediction of trading performance. Each category reflects just one answer; treat the scores as prompts for review, not precise measurements.</p>
      <div className="assessment-grid">
        <div className="card"><h3>Strongest trading habits</h3>{result.strengths.length ? <ul>{result.strengths.map(q => <li key={q.category}>{q.habit}</li>)}</ul> : <p>Your answers suggest room to build a more consistent routine. Start with one practical change below.</p>}</div>
        <div className="card"><h3>Areas needing improvement</h3>{result.improvements.length ? <ul>{result.improvements.map(q => <li key={q.category}>{q.category}</li>)}</ul> : <p>Your answers align with disciplined habits across all ten scenarios. Compare them with your actual journal entries to check consistency.</p>}</div>
      </div>
      <div className="card"><h3>Your habit snapshot</h3><div className="assessment-grid">{result.categories.map(q => <div key={q.category}><div className="assessment-bar-label"><span>{q.category}</span><span>{q.score}/10</span></div><progress aria-label={q.category} value={q.score} max={10} /></div>)}</div></div>
      <div className="card"><h3>Personalized recommendations</h3>{(result.improvements.length ? result.improvements : result.categories).map(q => <div className="assessment-recommendation" key={q.category}><h4>{q.category}</h4><p>{q.recommendation}</p></div>)}</div>
      <div className="card"><h3>Your next practice session</h3><ol>{nextSteps.map(q => <li key={q.category}>{q.recommendation}</li>)}<li>After the session, record one example of following your plan and one decision to review.</li></ol></div>
      <div className="actions"><button className="btn primary" onClick={retake}>Retake Assessment</button><Link className="btn ghost" href="/journal">Explore Trading Journal</Link><Link className="btn ghost" href="/library">Explore Learning Library</Link></div>
    </div>;
  }

  return <div className="card assessment-question">
    <div className="assessment-bar-label"><span>Question {step + 1} of 10</span><span>{answered} of 10 answered</span></div>
    <progress aria-label="Assessment completion" value={answered} max={10} />
    <h2 ref={heading} tabIndex={-1} className="assessment-question-title">{question.question}</h2>
    <p className="assessment-note" id="assessment-instruction">Choose the response closest to what you usually do. Be honest about your current habits.</p>
    <fieldset aria-describedby="assessment-instruction"><legend className="sr-only">{question.question}</legend>
      {question.options.map((option, index) => <label key={`${step}-${index}`} className={`assessment-option ${answers[step] === index ? 'selected' : ''}`}>
        <input type="radio" name={`question-${step}`} checked={answers[step] === index} onChange={() => setAnswers(previous => previous.map((a, i) => i === step ? index : a))} />
        <span>{option}</span>
      </label>)}
    </fieldset>
    <div className="assessment-navigation"><button className="btn ghost" disabled={step === 0} onClick={() => { interacted.current = true; setStep(step - 1); }}>Previous</button>
      <button className="btn primary" disabled={answers[step] === null || (step === 9 && answered !== 10)} onClick={() => { interacted.current = true; if (step < 9) setStep(step + 1); else if (answered === 10) setComplete(true); }}>{step === 9 ? 'View My Results' : 'Next'}</button></div>
    <p className="assessment-note">Free · No login required · Your answers stay in this page and reset when you refresh.</p>
  </div>;
}
