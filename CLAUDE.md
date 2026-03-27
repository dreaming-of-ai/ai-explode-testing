# ai-explode-tests

BDD test suite for AI Explode. Two specialized agents handle the full pipeline.

## App target
http://localhost:5173/

## Agent routing
- Writing or updating Gherkin scenarios → @gherkin-writer
- Running tests or validating the app  → @playwright-runner

## Specs (read-only)
Game rules lives in `game-overview.md`. Always read this first.
Specs for indiovidual feature implementations live in `specs/`.

## Pipeline
specs/ → [gherkin-writer] → features/*.feature → [playwright-runner] → tests/*.spec.ts

## Commands
- `npm run test`        — run full Playwright suite
- `npm run test:headed` — run with visible browser
- `npm run report`      — open last HTML report