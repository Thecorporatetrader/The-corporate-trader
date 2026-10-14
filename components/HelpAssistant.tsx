'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, ArrowLeft, Building2, Bot, ChartNoAxesCombined, BookOpen, Brain, Sparkles, LifeBuoy } from 'lucide-react';
import topics from '@/lib/helpFaq.json';

const icons = [Building2, Bot, ChartNoAxesCombined, BookOpen, Brain, Sparkles, LifeBuoy];
const welcome = "Welcome to The Corporate Trader! I'm your TCT Help Assistant. Select a topic below, and I'll help you find the information you're looking for.";

export default function HelpAssistant() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<number | null>(null);
  const [question, setQuestion] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { if (open) { title.current?.focus(); scrollArea.current?.scrollTo(0, 0); } }, [open, topic, question]);
  const selectedTopic = topic === null ? null : topics[topic];
  const selectedQuestion = question === null ? null : selectedTopic?.questions[question];
  function close() { setOpen(false); trigger.current?.focus(); }
  return <div className="tct-help">
    <div ref={panel} id="tct-help-panel" className="tct-help-panel" role="dialog" aria-label="TCT Help Assistant" hidden={!open}
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); close(); }
        if (event.key === 'Tab') {
          const controls = panel.current?.querySelectorAll<HTMLElement>('button, a[href]');
          if (!controls?.length) return;
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === title.current)) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }}>
      <header className="tct-help-header"><div><strong>TCT Help Assistant</strong><small>Quick answers from our FAQ</small></div><button onClick={close} aria-label="Close TCT Help Assistant"><X size={20} /></button></header>
      <div className="tct-help-content" ref={scrollArea}>
        {topic !== null && <button className="tct-help-back" onClick={() => { if (question !== null) setQuestion(null); else setTopic(null); }}><ArrowLeft size={16} />{question !== null ? 'Back to questions' : 'Back to topics'}</button>}
        <h2 ref={title} tabIndex={-1}>{selectedQuestion ? selectedQuestion.question : selectedTopic ? selectedTopic.title : 'How can we help?'}</h2>
        {topic === null ? <><p>{welcome}</p><div className="tct-help-list">{topics.map((t, i) => { const Icon = icons[i]; return <button key={t.title} onClick={() => { setTopic(i); setQuestion(null); }}><Icon size={19} aria-hidden="true" /><span>{t.title}</span></button>; })}</div></> : selectedQuestion ? <><div className="tct-help-answer"><p>{selectedQuestion.answer}</p>{selectedQuestion.href && <Link className="tct-help-link" href={selectedQuestion.href} onClick={close}>{selectedQuestion.linkLabel}</Link>}</div><button className="tct-help-back" onClick={() => { setTopic(null); setQuestion(null); }}>Explore all topics</button></> : <div className="tct-help-list">{selectedTopic?.questions.map((q, i) => <button key={q.question} onClick={() => setQuestion(i)}>{q.question}</button>)}</div>}
      </div>
      <footer className="tct-help-footer"><p>Didn&apos;t find your answer? Our team is here to help.</p><Link className="btn primary" href="/contact" onClick={close}>Contact Our Team</Link></footer>
    </div>
    <button ref={trigger} className="tct-help-trigger" aria-label={open ? 'Close TCT Help Assistant' : 'Open TCT Help Assistant'} aria-expanded={open} aria-controls="tct-help-panel" onClick={() => open ? close() : setOpen(true)}>{open ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}<span>Help</span></button>
  </div>;
}
