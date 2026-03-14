# Reflection — AI-Assisted Development of FuelEU Maritime Platform

## What I Learned Using AI Agents

Working with AI agents on a domain-heavy compliance platform revealed a clear division of labor. Agents excel at **structural generation** — scaffolding hexagonal architecture, writing port interfaces, and producing boilerplate CRUD — but require human oversight for **domain correctness**. The FuelEU CB formula (`(Target − Actual) × Energy`) looks simple but has subtle edge cases: the target intensity varies by year per Annex IV, energy density assumptions differ by fuel type, and the greedy pool allocation has invariant rules that must be enforced at domain boundaries, not just at API level.

The most valuable pattern I found was **architecture-first prompting**: describing the design intent and constraints before asking for code. Telling Claude "no framework dependencies in core domain" produced significantly cleaner code than asking it to "write the compliance service" without context.

---

## Efficiency Gains vs Manual Coding

| Task | Manual Estimate | With AI Agents | Savings |
|------|----------------|----------------|---------|
| Hexagonal folder structure + interfaces | 45 min | 5 min | ~89% |
| 4 PostgreSQL repository adapters | 3 hours | 45 min | ~75% |
| Docker + CI/CD pipeline | 2 hours | 20 min | ~83% |
| React components (4 tabs) | 4 hours | 1.5 hours | ~63% |
| Unit + integration test stubs | 2 hours | 40 min | ~67% |
| Documentation | 1.5 hours | 30 min | ~67% |
| **Total** | **~14 hours** | **~4 hours** | **~71%** |

The largest gains were in infrastructure code (repositories, routers, Docker). The smallest gains were in domain logic — the pool allocation algorithm required multiple iterations to satisfy all FuelEU Article 21 invariants correctly.

---

## Improvements I Would Make Next Time

**1. Start with a structured prompt template.** I would create a reusable prompt template that includes: tech stack, architecture pattern, existing interfaces, and constraints. This reduces correction cycles significantly.

**2. Generate tests before implementation.** In this project, tests were written after code. Using agents to generate tests from spec requirements first (TDD style) would catch domain logic errors earlier.

**3. Separate agent tools by concern more deliberately.** Use Claude for design and algorithms, Copilot for inline completion of repetitive code, and Cursor specifically for cross-file refactors. Mixing these ad-hoc led to some inconsistency in code style.

**4. Validate domain formulas against reference data before implementing persistence.** I ran the CB calculations manually only after the full stack was wired up. Running a quick spreadsheet validation of the five seed routes at the start would have saved one debugging cycle.

**5. Use a shared type package.** Frontend and backend currently duplicate domain types. In a real project, a shared `packages/types` workspace would eliminate this and prevent drift.
