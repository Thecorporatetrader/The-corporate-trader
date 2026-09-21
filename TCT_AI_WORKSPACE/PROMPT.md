# THE CORPORATE TRADER — MASTER AI DEVELOPMENT PROMPT

IMPORTANT FOR EVERY AI:

Before changing any code:

1. Read PROMPT.md
2. Read PROJECT_STATE.md
3. Read PROGRESS.md
4. Read NEXT_TASKS.md
5. Read CHANGELOG.md
6. Inspect the current repository
7. Check existing implementation before assuming something is missing

Never restart the project from scratch.

Continue from the current project state.

## Source completeness

The owner's supplied attachment ends at `SERVER-SIDE AP`. Preserve that boundary; remaining Assistant architecture requirements have not been supplied. Do not invent them.

## Owner instructions (verbatim)

You are working on the existing production project:

THE CORPORATE TRADER
https://www.thecorporatetrader.com/

This project is already stored in this GitHub repository.

IMPORTANT:
Do NOT immediately start changing code.

Your FIRST task is to create a permanent AI project-management folder
inside the ROOT of this repository.

Create:

/TCT_AI_WORKSPACE/

Inside it create these files:

1. PROMPT.md
2. PROGRESS.md
3. PROJECT_STATE.md
4. NEXT_TASKS.md
5. CHANGELOG.md

The purpose of this folder is to allow another AI developer to continue
the work if this AI session runs out of tokens or is stopped.

============================================================
STEP 1 — CREATE THE AI WORKSPACE
============================================================

Create:

TCT_AI_WORKSPACE/
│
├── PROMPT.md
├── PROJECT_STATE.md
├── PROGRESS.md
├── NEXT_TASKS.md
└── CHANGELOG.md

DO NOT place application source code inside this folder.

This folder is only for AI instructions, project state, handoff information
and implementation history.

============================================================
STEP 2 — PROMPT.md
============================================================

Put ALL the instructions from this prompt into:

TCT_AI_WORKSPACE/PROMPT.md

PROMPT.md is the MASTER PRODUCT REQUIREMENTS document.

Every AI working on this repository in the future MUST read this file first.

At the top of PROMPT.md write:

# THE CORPORATE TRADER — MASTER AI DEVELOPMENT PROMPT

IMPORTANT FOR EVERY AI:

Before changing any code:

1. Read PROMPT.md
2. Read PROJECT_STATE.md
3. Read PROGRESS.md
4. Read NEXT_TASKS.md
5. Read CHANGELOG.md
6. Inspect the current repository
7. Check existing implementation before assuming something is missing

Never restart the project from scratch.

Continue from the current project state.

============================================================
STEP 3 — PROJECT_STATE.md
============================================================

PROJECT_STATE.md must describe the CURRENT technical state of the project.

Include:

# PROJECT STATE

Last Updated:
Updated By:

## Technology Stack

Example:

Frontend:
Backend:
Database:
Authentication:
Hosting:
Repository:
Styling:
State Management:
AI Provider:
Other services:

Do not guess.

Inspect the project and fill this accurately.

## Existing Routes

List all existing routes/pages.

Example:

/
 /journal
 /algo
 /login
 /account

Use the actual routes found in the project.

## Existing Components

List important reusable components.

## Existing Supabase Tables

List relevant tables discovered from code/migrations.

Do NOT expose passwords or API secrets.

## Authentication

Record:

Google Login: WORKING

IMPORTANT:

Google login has already been fixed by the owner.

Do NOT modify:

Google OAuth
Supabase callback URL
working authentication configuration
working Google login code

unless the owner specifically requests it.

## Current Products

TCT Trading Journal

TCT Execution Manager

TCT Custom Bot Studio

TCT Auto — Coming Soon

TCT Academy

TCT Assistant

## Current Known Working Features

Update this section whenever something becomes confirmed working.

## Known Problems

Record actual unresolved issues only.

============================================================
STEP 4 — PROGRESS.md
============================================================

This is extremely important.

After EVERY meaningful development task, update:

TCT_AI_WORKSPACE/PROGRESS.md

It should show exactly what has been completed.

Use this format:

# TCT DEVELOPMENT PROGRESS

Last Updated:
Current Phase:
Current AI Session:

## COMPLETED

### Task:
What was changed:

Files changed:

- file/path/example.tsx
- file/path/example.ts

Database changes:

None

or list migrations.

Testing completed:

- Build passed
- Desktop checked
- Mobile checked
- Login checked
- Console checked

Status:

COMPLETE

--------------------------------------------------

## CURRENTLY WORKING ON

Task:

Files currently being modified:

Current status:

What remains:

Potential problems:

--------------------------------------------------

## NOT STARTED

List major remaining features.

--------------------------------------------------

## IMPORTANT HANDOFF INFORMATION

Write anything the next AI must know before continuing.

Examples:

- Google login is currently working. Do not modify it.
- Navigation redesign has been completed.
- TCT Auto page exists but mobile testing is pending.
- Supabase migration X was added.
- Assistant frontend exists but backend is not connected yet.

============================================================
STEP 5 — NEXT_TASKS.md
============================================================

Maintain a prioritized list.

Use:

# NEXT TASKS

## NEXT IMMEDIATE TASK

Describe exactly what should be done next.

Files likely involved:

Dependencies:

Testing required:

## AFTER THAT

1.
2.
3.

## FUTURE FEATURES

Keep long-term features here.

Whenever a task is completed:

Remove it from NEXT IMMEDIATE TASK.

Move the next task into that section.

Update PROGRESS.md.

============================================================
STEP 6 — CHANGELOG.md
============================================================

Record every major implementation change.

Use:

# TCT CHANGELOG

## YYYY-MM-DD

### Added
-

### Changed
-

### Fixed
-

### Removed
-

### Files Modified
-

Never delete previous changelog history.

Append new entries.

============================================================
CRITICAL HANDOFF RULE
============================================================

Another AI may continue this project later.

Therefore NEVER leave important information only inside the chat.

If you:

create something
change something
delete something
rename something
change a database field
create a migration
change navigation
create a new page
change product terminology
implement part of a feature
discover a bug
discover an architectural issue
make an important technical decision

YOU MUST RECORD IT in the appropriate files inside:

TCT_AI_WORKSPACE/

The GitHub repository must contain enough information for another AI
to continue without having access to the previous chat.

============================================================
WHEN YOU ARE RUNNING LOW ON CONTEXT/TOKENS
============================================================

If you believe the current session may end soon:

STOP starting new features.

First update:

PROJECT_STATE.md
PROGRESS.md
NEXT_TASKS.md
CHANGELOG.md

Make sure another AI can continue immediately.

Write specifically:

LAST COMPLETED ACTION:

CURRENT FILE:

CURRENT TASK:

WHAT IS WORKING:

WHAT IS NOT WORKING:

NEXT EXACT ACTION:

DO NOT TOUCH:

Then stop safely.

============================================================
NEW AI HANDOFF BEHAVIOUR
============================================================

If you are a new AI entering this repository:

DO NOT ask the owner to explain everything again.

First read:

TCT_AI_WORKSPACE/PROMPT.md
TCT_AI_WORKSPACE/PROJECT_STATE.md
TCT_AI_WORKSPACE/PROGRESS.md
TCT_AI_WORKSPACE/NEXT_TASKS.md
TCT_AI_WORKSPACE/CHANGELOG.md

Then inspect the actual repository.

Compare documentation against actual code.

Continue from:

NEXT IMMEDIATE TASK

Do not redo completed work unless testing proves it is broken.

============================================================
PROJECT PROTECTION RULES
============================================================

This is an existing production website.

DO NOT:

Rebuild it from scratch.

Replace the design system unnecessarily.

Remove existing features without permission.

Destroy production data.

Delete Supabase tables.

Change working authentication.

Expose API secrets.

Expose Supabase service-role keys.

Store OpenAI/AI provider secret keys in frontend code.

Create fake testimonials.

Create fake trading results.

Invent win rates.

Invent broker compatibility.

Invent pricing.

Invent licence terms.

Invent product capabilities.

Always inspect existing implementation first.

Reuse existing components whenever practical.

Make changes incrementally.

============================================================
BRAND
============================================================

Company:

THE CORPORATE TRADER

Short name:

TCT

Main tagline:

Trade. Track. Improve. Automate.

Brand statement:

Trading technology built around process — not promises.

Core philosophy:

“You make the trading decision.
TCT helps execute the plan, analyse the result
and automate repeatable processes.”

Do not make TCT look like:

a signal seller

a guaranteed-profit service

a get-rich-quick trading website

a “turn it on and print money” bot

============================================================
TCT PRODUCT ECOSYSTEM
============================================================

The main products are:

1. TCT Trading Journal

2. TCT Execution Manager

3. TCT Custom Bot Studio

4. TCT Auto — Coming Soon

5. TCT Academy

6. TCT Assistant

The ecosystem should feel connected.

PLAN
↓
EXECUTE
↓
TRACK
↓
ANALYSE
↓
UNDERSTAND
↓
IMPROVE
↓
AUTOMATE

============================================================
TCT EXECUTION MANAGER
============================================================

This is the CURRENT automation product.

The trader currently chooses the trading level.

The system does NOT independently choose the trade.

Product name:

TCT EXECUTION MANAGER

Subtitle:

MT5 Trade Management Automation

Main headline:

“You choose the trade.
TCT manages the execution.”

Typical configuration can include:

Entry level

Stop-loss distance

Number of orders

Risk settings

Take-profit structure

Breakeven

Trailing step

Other execution settings

Example:

Entry = 5000

SL distance = 8

Orders = 4

Then configured targets may be:

Order 1 = 1R = 8 points

Order 2 = 2R = 16 points

Order 3 = 3R = 24 points

Order 4 = 4R = 32 points

After TP1:

TP1 is booked.

Remaining configured positions can move to breakeven.

Configured stop-management begins.

Trailing can operate according to the user's configured increment.

For example:

If trailing increment is $2,
the SL can move according to the configured $2 step.

Do not guarantee execution prices or profitability.

Important message:

“TCT Execution Manager does not independently predict
market direction or select your trading level.”

============================================================
TCT AUTO — COMING SOON
============================================================

TCT Auto is DIFFERENT from TCT Execution Manager.

TCT Execution Manager:

USER analyses market
↓
USER selects level
↓
TCT executes and manages

TCT Auto:

SYSTEM analyses configured market conditions
↓
SYSTEM identifies candidate levels
↓
SYSTEM validates conditions
↓
SYSTEM executes according to configured rules
↓
SYSTEM manages position
↓
TRADE flows into journal

TCT Auto is currently:

COMING SOON / UNDER DEVELOPMENT

It is being developed around concepts including:

Liquidity

Liquidity pools

Liquidity sweeps

Supply zones

Demand zones

Market structure

Price reaction

Confirmation rules

Risk-management rules

Do NOT publish proprietary detailed strategy rules.

Do NOT say:

perfect entry

guaranteed winning trade

100% accurate

guaranteed profit

Use wording:

candidate trading level

potential setup

configured conditions

structured market analysis

============================================================
TCT AUTO PAGE
============================================================

Create/improve:

/tct-auto

Hero:

TCT AUTO

“From market analysis to structured execution.”

Badge:

COMING SOON

Description:

“TCT Auto is our next-generation trading automation system
being developed to identify candidate trading levels automatically
using structured market analysis, including liquidity behaviour
and supply-and-demand zones.”

Add:

“Unlike TCT Execution Manager, where the trader provides the
trading level, TCT Auto is being designed to identify potential
levels automatically and manage trades according to predefined
risk and execution rules.”

Workflow:

MARKET DATA
↓
LIQUIDITY ANALYSIS
↓
SUPPLY / DEMAND ANALYSIS
↓
MARKET STRUCTURE
↓
CANDIDATE LEVEL
↓
ENTRY CONDITIONS
↓
RISK VALIDATION
↓
EXECUTION
↓
POSITION MANAGEMENT
↓
JOURNAL ANALYSIS

Add:

CURRENT STATUS

Under Development

Optional:

Join TCT Auto Updates

Do not allow purchase if the product is not commercially available.

============================================================
TCT TRADING JOURNAL
============================================================

Product name:

TCT TRADING JOURNAL

Headline:

“Your trading history should tell you what to improve.”

Description:

“TCT Trading Journal turns trade history into structured
performance intelligence so traders can understand what works,
what doesn't and how their behaviour changes over time.”

Key statement:

“At 20 trades, a spreadsheet works.
At 1,000 trades, understanding the spreadsheet becomes the problem.”

Supporting line:

“TCT helps turn those 1,000 trades into understandable insights.”

Use:

Track.
Analyse.
Understand.
Improve.

============================================================
JOURNAL TERMINOLOGY
============================================================

Use:

WIN RATE

Do NOT use:

WIN PROBABILITY

Use:

TRADING INTELLIGENCE MATRIX

instead of:

INSTITUTIONAL EXECUTION MATRIX

Use:

TRADING INTELLIGENCE RATING

instead of unnecessary:

INSTITUTIONAL PERFORMANCE RATING

Do not overuse the word:

Institutional

============================================================
JOURNAL METRICS
============================================================

Support/display as appropriate:

Net Result

Win Rate

Average Profit

Average Loss

Maximum Profit

Maximum Loss

Profit Factor

Expectancy Per Trade

Maximum Drawdown

Total Executions

Average Holding Time

Current Streak

Longest Win Streak

Longest Loss Streak

Do not overload the main screen.

Primary metrics remain visible.

Secondary metrics can appear in details.

============================================================
TRADING SESSION
============================================================

Add Trading Session to trade input.

Options:

Asia

London

New York

London / New York Overlap

Other

Not Assigned

Existing trades must continue working.

Do not break old records.

Create:

SESSION PERFORMANCE

Analyse:

Number of Trades

Win Rate

Net P/L

Profit Factor where possible

Add sample-size safeguards.

============================================================
OTHER JOURNAL ANALYTICS
============================================================

Support:

Entry Style Performance

Long vs Short

Performance by Day

Instrument Performance

Trade Duration

Trade Rating

Tags

Suggested optional tags:

Breakout

Order Block

Supply / Demand

Liquidity

Trend

Reversal

Scalp

News

FOMO

Revenge Trade

Custom tags should also be possible.

============================================================
TRADING INTELLIGENCE RATING
============================================================

Make rating categories clickable.

Possible categories:

Risk-to-Reward

Risk Exposure

Execution Discipline

Consistency

Trade Management

When clicked explain:

Why the score was given

What is working

What may need review

Which journal data produced the result

Do not generate random generic reasons.

Use actual journal data.

Add:

WHY THIS SCORE?

for overall rating explanation.

============================================================
TRADING INSIGHTS
============================================================

Create:

TRADING INSIGHTS

Show only approximately 3–5 useful insights.

Insights must come from actual user data.

Examples:

“London-session trades generated the highest net result
during the selected period.”

“News/Event trades currently have a lower win rate than
your overall journal.”

“XAUUSD currently represents the largest share of losses.”

Never invent numbers.

============================================================
WHERE AM I LOSING?
============================================================

Add:

WHERE AM I LOSING?

Analyse historical loss concentrations using:

Session

Instrument

Direction

Day

Entry Style

Tags

Holding Time

Trade Rating

Summarize the most meaningful historical patterns.

Do NOT predict guaranteed future losses.

============================================================
WHAT IS WORKING?
============================================================

Add:

WHAT IS WORKING?

Show statistically stronger areas of historical performance.

Use sample-size checks.

============================================================
JOURNAL FILTERS
============================================================

Support:

Today

This Week

This Month

Last 30 Days

Last 3 Months

This Year

All Time

Custom Date

Instrument

Session

Entry Style

Direction

Winning Trades

Losing Trades

Trade Rating

Tags

Do not clutter the main UI.

Use a filter sheet/modal.

============================================================
DATA CONFIDENCE
============================================================

For small datasets show:

Limited Data

or:

“More trades are required for a reliable comparison.”

Do not make strong conclusions from a tiny number of trades.

============================================================
JOURNAL IMPORT
============================================================

Prepare architecture for:

Manual Entry

CSV Import

MT5 History Import

Do not show unavailable functionality as live.

============================================================
TCT CUSTOM BOT STUDIO
============================================================

Product:

TCT CUSTOM BOT STUDIO

Headline:

“Your trading rules. Built into MT5.”

Description:

“Have a repeatable trading process?
Describe the entry, exit, risk and trade-management rules.
TCT reviews the requirements and determines whether the logic
can be converted into automation.”

Possible requirement fields:

Market

Symbols

Platform

Timeframe

Buy Entry Rules

Sell Entry Rules

Entry Filters

Stop Loss

Take Profit

Position Sizing

Maximum Risk

Breakeven Rules

Trailing Rules

Partial Exit Rules

Trading Session

Re-entry Rules

Maximum Daily Trades

Maximum Daily Loss

News Behaviour

Example Setup

Additional Notes

Workflow:

REQUIREMENTS
↓
TECHNICAL REVIEW
↓
SCOPE
↓
PROTOTYPE
↓
BACKTEST
↓
DEMO TESTING
↓
DELIVERY
↓
SUPPORT

Do not claim every discretionary strategy can be automated.

============================================================
TCT ASSISTANT
============================================================

Add an AI assistant to the website.

Name:

TCT ASSISTANT

Do not call it simply:

Chatbot

Desktop:

Floating button in bottom-right.

Mobile:

Place carefully without blocking important controls.

Opening:

TCT ASSISTANT

“Hi, I'm the TCT Assistant.
What can I help you with?”

Quick actions:

Trading Journal

Execution Manager

Custom Bot

TCT Auto

Academy

Account & Access

Support

Input:

Ask TCT anything...

============================================================
TCT ASSISTANT PURPOSE
============================================================

TCT Assistant should answer questions about:

TCT company

Trading Journal

Trading Intelligence Matrix

Execution Manager

Progressive targets

Stop loss

Breakeven

Trailing stop

Risk-to-reward

Custom Bot Studio

TCT Auto

TCT Academy

MT5 educational concepts

Installation

Account setup

Subscription/access

Pricing

Technical support

Website navigation

FAQ

Company policies

Product limitations

Approved educational content

============================================================
TCT ASSISTANT ARCHITECTURE
============================================================

Do NOT build an unrestricted AI that invents answers.

Use:

USER
↓
TCT ASSISTANT UI
↓
SERVER-SIDE API
↓
TCT KNOWLEDGE SEARCH
↓
APPROVED TCT INFORMATION
↓
AI MODEL
↓
ANSWER
↓
SOURCE / LEARN MORE

Use retrieval-augmented generation where practical.

Knowledge should come from approved TCT sources:

- TCT website
- Product documentation
- Trading Journal documentation
- Execution Manager documentation
- TCT Auto documentation
- Custom Bot documentation
- TCT Academy
- FAQ
- Installation guides
- Pricing/access information
- Support documentation
- Terms and policies
- Release notes

============================================================
TCT ASSISTANT KNOWLEDGE DATABASE
============================================================

Inspect the existing Supabase schema before creating anything.

If appropriate, create:

tct_knowledge_documents

Possible fields:

id
title
category
content
source_url
source_type
is_active
created_at
updated_at

Possible categories:

journal
execution_manager
tct_auto
custom_bot
academy
account
pricing
support
mt5
legal
general

If embeddings/vector search are required:

- Check whether pgvector is available
- Use a migration
- Explain the migration before applying it
- Do not modify unrelated production tables
- Do not damage existing data

============================================================
TCT ASSISTANT SECURITY
============================================================

Never expose AI provider API keys in frontend JavaScript.

AI provider keys must stay server-side.

Never expose:

- Supabase service-role key
- Database credentials
- API secrets
- Private environment variables
- Other users' data

Use authentication and Supabase Row Level Security where appropriate.

Do not give the AI unrestricted database access.

============================================================
ANTI-HALLUCINATION RULES
============================================================

TCT Assistant must NEVER invent:

- Prices
- Licence durations
- Product availability
- Broker compatibility
- Performance statistics
- Win rates
- Launch dates
- Subscription status
- User access status
- TCT Auto capabilities
- Legal terms
- Refund policies
- Features that have not been implemented

If reliable information cannot be found, respond:

“I couldn't find a confirmed answer in the current TCT documentation.
Please contact TCT Support.”

Then offer:

Contact TCT Support

============================================================
TCT ASSISTANT — TRADING QUESTIONS
============================================================

The assistant may explain educational concepts such as:

- Liquidity
- Liquidity sweep
- Supply zone
- Demand zone
- Market structure
- Risk-to-reward
- Breakeven
- Stop loss
- Take profit
- Trailing stop
- Drawdown
- Profit factor
- Win rate
- Trading sessions
- MT5 concepts

Do not describe uncertain future outcomes as guaranteed.

Do not claim guaranteed profitable trades or guaranteed market predictions.

If asked for a guaranteed outcome, explain the relevant concept without
promising a future result.

============================================================
LOGGED-IN USER SUPPORT
============================================================

Prepare TCT Assistant so authenticated users can eventually ask:

“Is my Execution Manager active?”

“What products do I have?”

“What version can I download?”

“What is the status of my custom bot?”

“Am I on the TCT Auto waitlist?”

Only retrieve information belonging to the authenticated user.

Use existing authentication and RLS.

Never allow one customer to access another customer's information.

============================================================
FUTURE TCT TRADING INTELLIGENCE ASSISTANT
============================================================

Prepare the architecture for a future Journal-specific assistant.

This is different from the general website support assistant.

Future questions may include:

“Analyse my last 100 trades.”

“Analyse my last 1,000 trades.”

“Where am I losing?”

“What is working?”

“Which session performs best for me?”

“Which instrument produces the most losses?”

“Compare my latest 50 trades with my previous 50.”

“Why is my Risk-to-Reward score 2.7?”

“What changed in my trading this month?”

“What are my strongest entry styles?”

“What are my weakest trading behaviours?”

The assistant must analyse only the logged-in user's own journal data.

Do not fully implement this feature until the journal data architecture
supports it safely.

============================================================
TCT ASSISTANT HUMAN SUPPORT FALLBACK
============================================================

At the bottom of Assistant show:

Still need help?

Contact TCT Support

If WhatsApp support exists:

Chat on WhatsApp

If the assistant is uncertain, offer human support instead of inventing
an answer.

============================================================
TCT ASSISTANT UX
============================================================

Include:

- New Conversation
- Clear Chat
- Copy Answer
- Helpful 👍
- Not Helpful 👎

Optionally:

Report Incorrect Answer

Desktop:

Use a professional floating panel or compact side panel.

Do not cover the entire desktop screen unnecessarily.

Mobile:

The assistant may use most of the screen if required.

Make sure it does not overlap bottom navigation, important CTA buttons,
cookie controls or other critical UI.

============================================================
HOME PAGE
============================================================

Improve the existing homepage without drastically redesigning it.

Hero:

THE CORPORATE TRADER

Trade with a process.
Execute with precision.
Improve with your own data.

Supporting text:

“Trading technology for traders who want structure instead of
shortcuts. Execute planned trades, analyse performance, automate
repeatable rules and understand your own trading behaviour.”

Primary CTA:

Explore Trading Journal

Secondary CTA:

Explore Execution Manager

Text CTA:

Build My Custom Bot →

Additional link:

TCT Auto — Coming Soon →

Trust statement:

No signals · No guaranteed returns · Process-driven technology

Keep the main tagline:

Trade. Track. Improve. Automate.

Secondary brand statement:

Trading technology built around process — not promises.

============================================================
ONE TRADING ECOSYSTEM
============================================================

Add a section:

ONE TRADING ECOSYSTEM

PLAN
↓
EXECUTE
↓
TRACK
↓
UNDERSTAND
↓
IMPROVE
↓
AUTOMATE

Supporting text:

“Your trading process should not be spread across spreadsheets,
manual calculations and disconnected tools.

TCT is being built to connect trade execution, performance analysis,
education and automation in one ecosystem.”

============================================================
HOME PAGE PRODUCT CARDS
============================================================

CARD 1

TCT TRADING JOURNAL

Headline:

“Understand what your trading history is telling you.”

Description:

“Track your trades and analyse performance across sessions,
instruments, entry styles, direction, risk and trading behaviour.”

CTA:

Explore Journal →

------------------------------------------------------------

CARD 2

TCT EXECUTION MANAGER

Headline:

“You choose the level. TCT manages the execution.”

Description:

“Automate configured order placement, stop loss, progressive
risk-to-reward targets, breakeven management and trailing-stop
execution.”

CTA:

See How It Works →

------------------------------------------------------------

CARD 3

TCT CUSTOM BOT STUDIO

Headline:

“Your rules. Your automation.”

Description:

“Give us your repeatable entry, exit, risk and trade-management
rules. TCT reviews the logic and converts technically feasible
strategies into custom MT5 automation.”

CTA:

Build My Bot →

------------------------------------------------------------

CARD 4

TCT AUTO

Badge:

COMING SOON

Headline:

“Automation that identifies the level.”

Description:

“TCT Auto is being developed to identify candidate trading levels
using liquidity, supply-and-demand and structured market-analysis
logic before applying automated execution and risk management.”

CTA:

Discover TCT Auto →

============================================================
TCT EXECUTION MANAGER PAGE
============================================================

Use product name:

TCT EXECUTION MANAGER

Subtitle:

MT5 Trade Management Automation

Hero:

“You choose the trade.
TCT manages the execution.”

Explain clearly:

The trader analyses the market.

The trader selects/configures the trading level.

TCT manages configured execution and position management.

Example:

Entry = 5000
SL distance = 8
Orders = 4

Configured target structure:

Order 1 → 1R → 8 points
Order 2 → 2R → 16 points
Order 3 → 3R → 24 points
Order 4 → 4R → 32 points

After TP1:

- TP1 closes
- Remaining configured positions may move to breakeven
- Stop-management logic begins
- Trailing may continue according to configured settings

If trailing step is $2:

Explain that SL movement can operate according to the configured $2
increment.

Do not guarantee execution price or profitability.

Clearly display:

“TCT Execution Manager does not independently predict market direction
or select the trading level.”

Also display:

Not a signal service.

Not an entry predictor.

No guaranteed returns.

============================================================
TCT AUTO PAGE
============================================================

Create/improve:

/tct-auto

Hero:

TCT AUTO

“From market analysis to structured execution.”

Badge:

COMING SOON

Description:

“TCT Auto is our next-generation trading automation system being
developed to identify candidate trading levels automatically using
structured market analysis, including liquidity behaviour and
supply-and-demand zones.”

Add:

“Unlike TCT Execution Manager, where the trader provides the trading
level, TCT Auto is being designed to identify potential levels
automatically and manage trades according to predefined risk and
execution rules.”

Show comparison:

TCT EXECUTION MANAGER

You analyse the market.
You choose the level.
TCT manages execution.

TCT AUTO

System analyses configured market conditions.
System identifies candidate levels.
System validates conditions.
System executes according to configured rules.
System manages the position.

Workflow:

MARKET DATA
↓
LIQUIDITY ANALYSIS
↓
SUPPLY / DEMAND ANALYSIS
↓
MARKET STRUCTURE
↓
CANDIDATE LEVEL
↓
ENTRY CONDITIONS
↓
RISK VALIDATION
↓
EXECUTION
↓
POSITION MANAGEMENT
↓
JOURNAL ANALYSIS

Current status:

UNDER DEVELOPMENT

Optional:

Join TCT Auto Updates

Do not allow users to buy it until it is genuinely available.

============================================================
TCT TRADING JOURNAL MARKETING PAGE
============================================================

Hero:

TCT TRADING JOURNAL

“Your trading history should tell you what to improve.”

Description:

“TCT Trading Journal turns trade history into structured performance
intelligence so you can understand what works, what doesn't and how
your behaviour changes over time.”

Use:

Track.
Analyse.
Understand.
Improve.

Keep:

“At 20 trades, a spreadsheet works.
At 1,000 trades, understanding the spreadsheet becomes the problem.”

Then:

“TCT helps turn those 1,000 trades into understandable insights.”

Show real screenshots where available.

Explain analytics categories:

PERFORMANCE OVERVIEW

- Win Rate
- Net Result
- Average Win
- Average Loss
- Profit Factor
- Expectancy
- Maximum Drawdown

BEHAVIOUR ANALYSIS

- Entry Style
- Trading Session
- Instrument
- Long vs Short
- Day of Week
- Trade Duration
- Trade Rating

TRADING INTELLIGENCE

“Instead of reading 1,000 spreadsheet rows, understand the patterns
behind those 1,000 trades in seconds.”

============================================================
JOURNAL IMPORT
============================================================

Prepare architecture for:

Manual Entry

CSV Import

MT5 History Import

Do not claim unavailable functionality is already live.

============================================================
CUSTOM BOT STUDIO PAGE
============================================================

Create/improve:

/custom-bot

Hero:

TCT CUSTOM BOT STUDIO

“Your trading rules. Built into MT5.”

Description:

“Already have a repeatable process? Tell us exactly how you enter,
manage and exit trades. TCT will review the requirements and
determine whether they can be converted into automated logic.”

Structured form may include:

Market
Symbol(s)
Platform
Timeframe

Buy Entry Conditions
Sell Entry Conditions
Entry Filters

Stop Loss
Take Profit
Position Sizing
Maximum Risk

Trading Session
Breakeven Rules
Trailing Rules
Partial Exit Rules
Re-entry Rules

Maximum Daily Trades
Maximum Daily Loss

News Behaviour

Example Setup

Additional Notes

Workflow:

REQUIREMENTS
↓
TECHNICAL REVIEW
↓
SCOPE
↓
PROTOTYPE
↓
BACKTEST
↓
DEMO TESTING
↓
DELIVERY
↓
SUPPORT

Do not claim every discretionary idea can be automated.

============================================================
NAVIGATION
============================================================

Simplify the primary navigation to:

Home

Products ▼

Academy

Market Watch

Articles

Support

Account / Sign In

PRODUCTS:

Trading Journal

Execution Manager

Custom Bot Studio

TCT Auto — Coming Soon

ACADEMY:

Beginner

Intermediate

Advanced

Quant & Automation

Macroeconomics

Historical Trading Frameworks

SUPPORT:

Help Centre

FAQ

Contact

Do not keep too many top-level navigation items.

============================================================
FAMOUS STRATEGIES
============================================================

Rename:

Famous Strategies

to:

Historical Trading Frameworks

Description:

“Explore trading approaches and frameworks associated with
well-known market participants and study how different market ideas
have been structured historically.”

Do not imply historical strategies guarantee future performance.

============================================================
TCT ACADEMY
============================================================

Use:

TCT ACADEMY

Organize existing educational content into:

Beginner

Intermediate

Advanced

Quant & Automation

Macroeconomics

Trading Frameworks

Resource Library

Do not remove existing useful educational content.

============================================================
MARKET WATCH
============================================================

Keep the existing Market Watch.

Add:

“Economic context, not a trading signal.”

Where technically possible show:

Data Source

Observation Period

Last Updated

Official Source

Do not fabricate missing or live values.

============================================================
REVIEWS / SOCIAL PROOF
============================================================

Do not prominently display:

“No reviews yet”

or:

“Be the first to leave a review”

Do not create fake testimonials.

Until genuine reviews exist replace that area with:

BUILT AROUND TRANSPARENCY

No signals.

No guaranteed profits.

No hidden performance claims.

Demo testing before live deployment.

Clear separation between trader decisions and software execution.

============================================================
ABOUT PAGE
============================================================

Create/improve:

/about

Hero:

“Trading technology built around process — not promises.”

Supporting text:

“Most trading products focus only on entries.
The Corporate Trader is being built around the complete trading
process — execution, risk management, performance analysis,
education and automation.”

WHAT WE BUILD

Trading Intelligence

Execution Automation

Custom Automation

Market Tools

Trading Education

WHAT WE DO NOT PROMISE

Guaranteed returns

Guaranteed win rates

Risk-free trading

Perfect market predictions

Secret guaranteed-winning systems

============================================================
PRICING / ACCESS
============================================================

Create/improve:

/pricing

Do NOT invent prices.

Separate:

TCT Trading Journal

TCT Execution Manager

TCT Custom Bot Studio

TCT Academy

TCT Auto — Coming Soon

Where real information exists, clearly explain:

Price

Licence duration

Account/device limits

Updates

Support

Installation

Renewal

Refund/cancellation rules

If commercial information has not been finalized, do not fabricate it.

============================================================
BROKER / IB RELATIONSHIP
============================================================

If a product is free or discounted because a user joins through a
TCT broker/referral/IB relationship, disclose this transparently.

Do not imply opening an account through a partner improves profitability.

Where applicable explain that TCT may receive compensation from the
broker relationship.

Keep broker relationships separate from trading performance.

Final disclosure/legal wording should be reviewed professionally.

============================================================
CONTACT PAGE
============================================================

Use:

Name *

Email or Mobile *

WhatsApp — Optional

I need help with *

Options:

Trading Journal

Execution Manager

TCT Auto

Custom Bot

Account / Login

Billing

Technical Support

Partnership

Other

Message *

CTA:

Send Request

Secondary CTA:

Chat on WhatsApp

Do not unnecessarily require both email and phone.

============================================================
FAQ
============================================================

Organize FAQ into:

TRADING JOURNAL

EXECUTION MANAGER

TCT AUTO

CUSTOM BOT

ACADEMY

ACCOUNT

PRICING

LICENSING

SUPPORT

BROKER RELATIONSHIP

FAQ answers must match current actual functionality.

============================================================
MEMBER AREA
============================================================

Google login is already working.

DO NOT BREAK IT.

Improve the logged-in area around:

MY PRODUCTS

Trading Journal

Execution Manager

Custom Bot

TCT Auto Waitlist

MY ACCESS

Status

Licence

Version

DOWNLOADS

EA files

Installation Guide

Release Notes

CUSTOM BOT PROJECTS

Requested

Review

Development

Testing

Delivered

SUPPORT

New Request

Existing Requests

ACCOUNT

Name

Email

Mobile

Access information

Never expose administrative fields to ordinary users.

============================================================
LEGAL / TRUST
============================================================

Footer should include appropriate links for:

Terms of Use

Privacy Policy

Risk Disclosure

Software / EA Terms

Refund & Cancellation Policy

Broker / Affiliate Disclosure

Data & Privacy

Contact

Do not fabricate legal guarantees.

Flag wording that requires professional legal review.

============================================================
SEO
============================================================

Audit:

Page titles

Meta descriptions

Canonical URLs

OpenGraph metadata

Social preview images

robots.txt

sitemap.xml

Structured data

Heading hierarchy

Image alt text

Mobile viewport

404 page

Performance

Use unique titles/descriptions for major pages.

Do not keyword-stuff.

============================================================
MOBILE / RESPONSIVE DESIGN
============================================================

Keep the site mobile-first.

Verify:

Navigation

Buttons

Product cards

Tables

Forms

Journal screenshots

TCT Assistant

Pricing

Member dashboard

Market Watch

Academy

Footer

Dialogs

Charts

No horizontal overflow.

Use appropriate touch targets.

Do not drastically change the existing TCT visual identity.

============================================================
BRAND TERMINOLOGY
============================================================

Use these names consistently:

THE CORPORATE TRADER

TCT Trading Journal

TCT Trading Intelligence Matrix


