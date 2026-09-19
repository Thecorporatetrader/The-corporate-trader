import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Check, Settings2, ShieldCheck, Target, TrendingUp, Layers, Code2, Zap } from 'lucide-react';
import { contact } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Get Your Free TCT Algo — The Corporate Trader',
  description: 'Get the free 100%-automated TCT MT5 algo, explore full automation at ₹19,999, or share your strategy for a free custom algo build.',
};

const features = [
  { icon: Zap, title: 'Order placement', text: 'Place orders according to the configured execution rules.' },
  { icon: ShieldCheck, title: 'Stop loss', text: 'Apply the stop-loss settings defined for your strategy.' },
  { icon: Target, title: 'Take profit', text: 'Manage target-based exits using your configured take-profit rules.' },
  { icon: TrendingUp, title: 'Trailing stop loss', text: 'Adjust the stop as the trade develops, following your trailing rules.' },
  { icon: Check, title: 'Profit booking', text: 'Close positions when the configured exit conditions are met.' },
  { icon: Layers, title: 'Partial profit booking', text: 'Close part of a position at defined levels and manage the remainder.' },
];

function requestLink(message: string) {
  const url = new URL(contact.whatsapp);
  url.searchParams.set('text', message);
  return url.toString();
}

const freeLink = requestLink('Hi TCT, I would like the free 100%-automated TCT algo for MT5. Please explain the required inputs, configuration, and how to get access.');
const paidLink = requestLink('Hi TCT, I am interested in the 100%-automated TCT algo listed at ₹19,999. Please confirm the features, licence duration, total price including applicable taxes, and support terms.');
const waitlistLink = requestLink('Hi TCT, please share updates about the upcoming algo combining the first TCT algo with liquidity and supply-demand zones.');
const customLink = requestLink('Hi TCT, I would like a free custom algo built from my strategy.\n\nMarket / symbol:\nTimeframe:\nEntry rules:\nStop-loss and take-profit rules:\nTrailing-stop rules:\nPartial profit-booking rules:\nPosition sizing / risk limits:\nTrading sessions:\nExample setup:\n\nPlease review the feasibility and confirm the scope.');

export default function AlgoPage() {
  return (
    <main className="tct-algo">
      <style>{styles}</style>
      <div className="ta-wrap">
        <header className="ta-hero">
          <div>
            <p className="ta-eyebrow">TCT ALGO / MT5 AUTOMATION</p>
            <span className="ta-tag">YOUR FIRST ALGO. FREE.</span>
            <h1>Your trading rules.<br /><span>Put into action.</span></h1>
            <p className="ta-lead">Get the free TCT algo to automate order placement and trade management. Already have a strategy? Send us your rules—we can build your own algo for free.</p>
            <div className="ta-actions">
              <a className="ta-button ta-primary" href={freeLink} target="_blank" rel="noopener noreferrer">Get Free TCT Algo <ArrowRight size={18} aria-hidden="true" /></a>
              <a className="ta-button ta-secondary" href="#custom">Build My Algo Free <Code2 size={18} aria-hidden="true" /></a>
            </div>
            <p className="ta-small">Request access through our team · MT5 Expert Advisor · Start on a demo account</p>
          </div>
          <aside className="ta-console" aria-label="Current free TCT algo capabilities">
            <div className="ta-console-top"><span><span className="ta-dot" /> CURRENT TCT ALGO</span><span>MT5</span></div>
            <div className="ta-console-title"><div><p className="ta-eyebrow">AUTOMATION LEVEL</p><strong>100<span>%</span></strong></div><div className="ta-price-label">FREE<small>For everyone</small></div></div>
            <p className="ta-console-caption">Rule-based execution. Structured trade management.</p>
            <div className="ta-meter" aria-hidden="true"><span /></div>
            <div className="ta-console-list">{['Order placement', 'SL + TP management', 'Trailing stop loss', 'Full + partial profit booking'].map(label => <div key={label}><Check size={16} aria-hidden="true" /><span>{label}</span><span className="ta-mini-tag">RULE-BASED</span></div>)}</div>
            <p className="ta-small">100% automated execution and trade management based on your inputs. You are responsible for the inputs, configuration, risk settings and ongoing monitoring. This is not a win rate.</p>
          </aside>
        </header>

        <nav className="ta-jump" aria-label="Algo offers">
          <a href="#free">01 / Free TCT Algo</a><a href="#automatic">02 / Full Automation</a><a href="#upcoming">03 / In Development</a><a href="#custom">04 / Your Custom Algo</a>
        </nav>

        <section className="ta-section" id="free">
          <div className="ta-heading"><div><p className="ta-eyebrow">01 / YOUR CURRENT TCT ALGO</p><h2>Less manual execution.<br />More structured trading.</h2></div><span className="ta-tag">100% AUTOMATED · ₹0</span></div>
          <p className="ta-intro">Our current algo is free for everyone. Once configured, it automates order placement, stop loss, take profit, trailing stops and full or partial profit booking according to your inputs. Choosing and checking those inputs, setting risk limits and monitoring the system remain your responsibility.</p>
          <div className="ta-feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="ta-feature" key={title}><span className="ta-icon"><Icon size={21} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
          <div className="ta-process">
            <div className="ta-process-heading"><Settings2 size={22} aria-hidden="true" /><h3>How your free algo works</h3></div>
            <ol className="ta-steps">
              <li><span>01</span><h4>Request your algo</h4><p>Contact TCT for access and confirm compatibility with your MT5 setup.</p></li>
              <li><span>02</span><h4>Configure your rules</h4><p>Review the entry conditions, position sizing, SL, TP, trailing and partial-exit settings with the team.</p></li>
              <li><span>03</span><h4>Test on demo</h4><p>Check the behaviour against your rules before considering a live account.</p></li>
              <li><span>04</span><h4>Run and monitor</h4><p>The algo manages configured tasks while you monitor execution, connectivity and risk.</p></li>
            </ol>
            <div className="ta-actions"><a className="ta-button ta-primary" href={freeLink} target="_blank" rel="noopener noreferrer">Get My Free TCT Algo <ArrowRight size={18} aria-hidden="true" /></a><span className="ta-small">Opens WhatsApp with your request. Nothing is sent automatically.</span></div>
          </div>
        </section>

        <section className="ta-section" id="automatic">
          <div className="ta-offer ta-paid">
            <div><p className="ta-eyebrow">02 / FULLY AUTOMATED TCT ALGO</p><h2>From strategy rules<br />to automated execution.</h2><p className="ta-intro">For traders who want the strategy’s entry, exit and trade-management workflow automated after configuration.</p>
              <ul className="ta-checklist"><li><Check size={17} aria-hidden="true" /> Rule-based entries and exits</li><li><Check size={17} aria-hidden="true" /> Stop-loss, take-profit and trailing management</li><li><Check size={17} aria-hidden="true" /> Profit booking according to the configured strategy</li></ul>
              <p className="ta-small">100% automation describes the configured workflow—not guaranteed performance or freedom from monitoring. Confirm the exact feature set and compatibility with TCT.</p>
            </div>
            <div className="ta-purchase"><span className="ta-tag">100% AUTOMATED</span><div className="ta-big-price">₹19,999</div><p>Get the details before you decide.</p><a className="ta-button ta-primary" href={paidLink} target="_blank" rel="noopener noreferrer">Enquire About This Algo <ArrowRight size={18} aria-hidden="true" /></a><p className="ta-small">Contact TCT to confirm licence duration, applicable taxes, support and purchase terms. This button starts an enquiry, not a payment.</p></div>
          </div>
        </section>

        <section className="ta-section" id="upcoming">
          <div className="ta-offer ta-upcoming">
            <div><p className="ta-eyebrow">03 / THE NEXT CHAPTER</p><h2>TCT Algo.<br /><span className="ta-accent">A new layer of market context.</span></h2><p className="ta-intro">Our team is working on an algo that combines the first TCT algo with liquidity concepts and supply-demand zones.</p><div className="ta-chips"><span>Existing TCT foundation</span><span>Liquidity</span><span>Supply & demand zones</span></div></div>
            <div className="ta-roadmap"><span className="ta-tag ta-amber">IN DEVELOPMENT</span><h3>Being built by the TCT team.</h3><p>Features, release date and pricing will be shared when confirmed. This algo is not available yet.</p><a className="ta-button ta-secondary" href={waitlistLink} target="_blank" rel="noopener noreferrer">Request Launch Updates <ArrowRight size={18} aria-hidden="true" /></a></div>
          </div>
        </section>

        <section className="ta-section" id="custom">
          <div className="ta-heading"><div><p className="ta-eyebrow">04 / BUILT AROUND YOUR STRATEGY</p><h2>You bring the rules.<br /><span className="ta-accent">We build your algo. Free.</span></h2></div><span className="ta-tag">FREE CUSTOM BUILD</span></div>
          <p className="ta-intro">Have a strategy you already follow? Send your requirements and we’ll review them for a free custom MT5 algo build. We confirm technical feasibility, scope and delivery timing with you before development.</p>
          <div className="ta-custom-grid">
            <div className="ta-panel"><h3>Tell us exactly how you trade.</h3><p>Clear rules help us build what you actually need.</p><ul className="ta-requirements"><li>Market, symbols and timeframe</li><li>Buy / sell entry conditions and filters</li><li>Stop loss, take profit and trailing rules</li><li>Full and partial profit-booking conditions</li><li>Position sizing and risk limits</li><li>Trading sessions and example setups</li></ul><p className="ta-small">Do not send broker passwords, API secrets or account login credentials.</p></div>
            <div className="ta-panel ta-custom-cta"><span className="ta-icon"><Code2 size={26} aria-hidden="true" /></span><h3>Your strategy.<br />Your own algo.</h3><p>Start with your requirements—not a payment. The request opens a ready-to-fill WhatsApp message with the details our team needs.</p><a className="ta-button ta-primary" href={customLink} target="_blank" rel="noopener noreferrer">Send My Strategy — Build It Free <ArrowRight size={18} aria-hidden="true" /></a><Link className="ta-text-link" href="/contact">Prefer email or the contact form? →</Link></div>
          </div>
        </section>

        <section className="ta-section ta-faq">
          <p className="ta-eyebrow">BEFORE YOU START</p><h2>A few important answers.</h2>
          <details><summary>What is free, and what costs ₹19,999?</summary><p>The current 100%-automated TCT algo is free for everyone. We also offer a free custom build after reviewing your strategy and agreeing the scope. The separate 100%-automated TCT algo is listed at ₹19,999; contact the team for its full purchase terms.</p></details>
          <details><summary>Does 100% automation mean a win rate or no user responsibility?</summary><p>No. 100% refers to automated execution and trade management after configuration—not a success rate. You supply and verify the inputs, choose risk settings and monitor the system. No win rate or return is promised.</p></details>
          <details><summary>Can I download the algo immediately?</summary><p>These buttons start a request with TCT. The team handles access and setup; this page does not provide an instant download or take payment.</p></details>
          <details><summary>Does free mean there are no other trading costs?</summary><p>The free offer refers to the algo or agreed custom development. Broker spreads, commissions, swaps, connectivity and any VPS costs are separate.</p></details>
          <details><summary>Will automation guarantee profits or stop every loss?</summary><p>No. Automated systems can lose money. Slippage, gaps, rejected orders, connection failures and incorrect settings can affect execution. Stop-loss orders do not guarantee an exact exit price. Test on demo first and monitor any live use.</p></details>
        </section>
        <aside className="ta-risk"><ShieldCheck size={22} aria-hidden="true" /><p><strong>Automate the process—not the promise.</strong> Trading involves the risk of losing capital. The feature descriptions on this page describe intended functionality, not independently verified performance. Confirm the supported configuration with TCT before use.</p></aside>
      </div>
    </main>
  );
}

const styles = `
.tct-algo{background:radial-gradient(ellipse at 85% 5%,#07313970,transparent 30%),#070e16;color:#edf7ff;padding:0 0 60px}.tct-algo *{box-sizing:border-box}.ta-wrap{width:min(1200px,92%);margin:auto}.tct-algo p{line-height:1.75}.ta-hero{display:grid;grid-template-columns:1.2fr 1fr;gap:56px;align-items:center;padding:64px 0 42px}.tct-algo .ta-eyebrow{font-size:11px;letter-spacing:.16em;font-weight:800;color:#41dae7;margin:0 0 18px}.ta-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.1em;color:#68f0c1;background:#092b28;border:1px solid #206253;border-radius:6px;padding:8px 11px;white-space:nowrap}.tct-algo h1{font-size:clamp(38px,4.7vw,64px);line-height:1.08;letter-spacing:-.04em;font-weight:700;margin:23px 0}.tct-algo h1 span,.ta-accent{color:#00d4e6}.ta-lead{font-size:17px;color:#aec4d4;max-width:650px}.ta-actions{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin:24px 0 14px}.ta-button{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px 19px;border-radius:10px;font-size:14px;font-weight:750;line-height:1.5;text-align:center;transition:transform .2s,border-color .2s,background .2s}.ta-primary{background:#00d6e9;color:#03131d;border:1px solid #00d6e9}.ta-primary:hover{background:#62eff2;transform:translateY(-2px)}.ta-secondary{background:#0b1925;border:1px solid #35505f;color:#e3f3fa}.ta-secondary:hover{border-color:#55d7d9;transform:translateY(-2px)}.tct-algo a:focus-visible,.tct-algo summary:focus-visible{outline:2px solid #80ffe6;outline-offset:5px}.tct-algo .ta-small{font-size:12px;line-height:1.7;color:#9bb4c5;margin:12px 0 0}.ta-console{border:1px solid #2b5260;border-radius:22px;background:linear-gradient(145deg,#102a35,#09131e);padding:25px;box-shadow:0 20px 70px #0004}.ta-console-top{display:flex;justify-content:space-between;font-size:10px;font-weight:700;letter-spacing:.1em;color:#b2d4dd;border-bottom:1px solid #27414c;padding-bottom:19px}.ta-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#1fe1a5;margin-right:7px}.ta-console-title{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:25px}.ta-console-title .ta-eyebrow{font-size:10px;margin-bottom:5px}.ta-console-title strong{font-size:76px;line-height:1;font-weight:600;letter-spacing:-.06em}.ta-console-title strong span{font-size:30px;color:#57d6dc;letter-spacing:0}.ta-price-label{font-size:26px;font-weight:750;color:#64f2c7;text-align:right}.ta-price-label small{display:block;font-size:11px;font-weight:400;color:#aac7d4;margin-top:5px}.ta-console-caption{font-size:13px;color:#b3cbd8;margin:20px 0 15px}.ta-meter{height:5px;background:#1d3645;border-radius:8px}.ta-meter span{display:block;width:100%;height:100%;background:linear-gradient(90deg,#00cde9,#00eca2);border-radius:8px}.ta-console-list{margin-top:19px}.ta-console-list>div{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #23404a;font-size:13px}.ta-console-list svg{color:#54e1bc;flex-shrink:0}.ta-mini-tag{margin-left:auto;font-size:8px;letter-spacing:.05em;color:#9fc1ca}.ta-jump{display:flex;gap:10px;overflow-x:auto;border-top:1px solid #253c47;border-bottom:1px solid #253c47;padding:16px 0}.ta-jump a{white-space:nowrap;font-size:12px;color:#c2d7e4;border:1px solid #283f4a;padding:10px 14px;border-radius:8px}.ta-jump a:hover{border-color:#24c9d1;color:#69e5e0}.tct-algo .ta-section{padding:52px 0 0;scroll-margin-top:175px}.ta-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:18px}.tct-algo h2{font-size:clamp(27px,3vw,39px);letter-spacing:-.025em;line-height:1.18;font-weight:650;margin:0}.tct-algo h3{font-size:19px;line-height:1.35;font-weight:650;margin:0 0 12px}.ta-intro{font-size:15px;color:#afc4d4;max-width:850px;margin:18px 0 25px}.ta-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.ta-feature{border:1px solid #233d4b;background:#0c1a26;border-radius:14px;padding:23px}.ta-icon{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;background:#10343d;border:1px solid #205663;border-radius:12px;color:#40e1e3;margin-bottom:18px}.ta-feature p,.ta-panel p,.ta-roadmap p,.ta-purchase p{font-size:13px;color:#abc2d3;margin:0}.ta-process{border:1px solid #2a4752;background:linear-gradient(140deg,#0e2430,#0b161f);border-radius:16px;padding:27px;margin-top:22px}.ta-process-heading{display:flex;align-items:center;gap:12px;color:#63e2dc}.ta-process-heading h3{margin:0;color:#e3f4fa}.ta-steps{list-style:none;padding:0;margin:25px 0 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:25px}.ta-steps li>span{font-size:11px;color:#55dcca;letter-spacing:.1em}.ta-steps h4{font-size:14px;font-weight:700;margin:10px 0}.ta-steps p{font-size:12px;color:#a5bdcc;margin:0}.ta-offer{display:grid;grid-template-columns:1.4fr 1fr;gap:40px;border:1px solid #315465;border-radius:20px;padding:34px;background:linear-gradient(125deg,#102e3b,#0a1520)}.ta-checklist{list-style:none;padding:0;margin:22px 0;display:grid;gap:12px;font-size:13px;color:#cbe2eb}.ta-checklist li{display:flex;gap:10px;align-items:center}.ta-checklist svg{color:#4de5c1;flex-shrink:0}.ta-purchase{align-self:center;padding:26px;border:1px solid #315261;background:#071822;border-radius:15px}.ta-big-price{font-size:clamp(38px,4.5vw,53px);font-weight:650;letter-spacing:-.03em;margin:20px 0 8px}.ta-purchase .ta-button{width:100%;margin-top:20px}.ta-upcoming{background:linear-gradient(135deg,#142132,#0c151f);border-color:#354556}.ta-roadmap{align-self:center;padding:25px;border:1px dashed #536170;border-radius:15px}.ta-amber{background:#292215;color:#ffd595;border-color:#65502b;margin-bottom:20px}.ta-roadmap .ta-button{margin-top:22px}.ta-chips{display:flex;flex-wrap:wrap;gap:10px}.ta-chips span{font-size:11px;color:#c0d6e6;border:1px solid #354858;border-radius:20px;padding:8px 12px}.ta-custom-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.ta-panel{border:1px solid #2b4956;background:#0c1d29;border-radius:16px;padding:28px}.ta-requirements{padding-left:20px;margin:20px 0;color:#c8dce8;font-size:14px;display:grid;gap:12px;list-style:disc}.ta-requirements li::marker{color:#39daca}.ta-custom-cta{background:radial-gradient(ellipse at top right,#07655e42,transparent 70%),#0b1b25;display:flex;align-items:flex-start;flex-direction:column;justify-content:center}.ta-custom-cta h3{font-size:29px}.ta-custom-cta .ta-button{margin-top:24px}.ta-text-link{font-size:12px;color:#63e4df;margin-top:18px;text-decoration:underline;text-underline-offset:4px}.ta-faq h2{margin-bottom:22px}.ta-faq details{border-bottom:1px solid #2a414d;padding:18px 0}.ta-faq summary{font-size:15px;font-weight:600;cursor:pointer;color:#daedf5;padding:6px 0;line-height:1.5}.ta-faq details p{font-size:14px;color:#aac2d1;max-width:900px;margin:14px 0 0}.ta-risk{display:flex;align-items:flex-start;gap:14px;border:1px solid #314651;border-radius:12px;background:#0b1720;padding:20px;margin-top:35px}.ta-risk svg{flex-shrink:0;color:#7ab9cd;margin-top:3px}.ta-risk p{font-size:12px;color:#a1bacb;margin:0}.ta-risk strong{color:#d5e8f1}
@media(max-width:950px){.ta-hero{grid-template-columns:1fr;gap:28px;padding-top:38px}.ta-console{max-width:620px;width:100%}.ta-steps{grid-template-columns:repeat(2,minmax(0,1fr))}.ta-offer{grid-template-columns:1fr;gap:25px}.ta-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ta-heading{align-items:flex-start;flex-direction:column}}
@media(max-width:600px){.ta-wrap{width:92%}.ta-feature-grid,.ta-custom-grid{grid-template-columns:1fr}.ta-console,.ta-process,.ta-panel,.ta-offer{padding:21px}.ta-console-title strong{font-size:64px}.ta-steps{grid-template-columns:1fr;gap:20px}.ta-steps li{border-left:1px solid #325361;padding-left:16px}.ta-hero .ta-button{width:100%}.tct-algo .ta-section{padding-top:36px}.ta-purchase{padding:20px}.ta-lead{font-size:16px}.ta-mini-tag{font-size:7px}}
@media(prefers-reduced-motion:reduce){.ta-button{transition:none}.ta-button:hover{transform:none}}
`;
