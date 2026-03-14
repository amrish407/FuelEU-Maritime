# AI Agent Workflow Log

## Agents Used

| Agent | Role | Primary Usage |
|-------|------|---------------|
| **Claude (claude.ai)** | Architect & primary code generator | Domain modeling, hexagonal architecture scaffolding, full-stack code generation |
| **GitHub Copilot** | Inline completions | Repetitive boilerplate (CRUD methods, test stubs, type definitions) |
| **Cursor Agent** | File-level refactoring | Extracting logic into use-cases, splitting large files, renaming across codebase |

---

## Prompts & Outputs

### Example 1 — Domain Modeling (Claude)

**Prompt:**
```
I'm building a FuelEU Maritime compliance platform following Hexagonal Architecture.
Design the core domain entities for: Route, Compliance Balance, Banking (Article 20),
and Pooling (Article 21). Include TypeScript interfaces, FuelEU constants, and pure
domain functions for CB calculation. No framework dependencies in domain layer.
```

**Generated output (key snippet):**
```typescript
export const FUEL_EU_CONSTANTS = {
  TARGET_INTENSITY_2025: 89.3368,
  TARGET_INTENSITY_2024: 91.16,
  ENERGY_DENSITY_MJ_PER_TONNE: 41000,
} as const;

export function computeComplianceBalance(
  targetIntensity: number,
  actualIntensity: number,
  energyInScope: number
): number {
  return (targetIntensity - actualIntensity) * energyInScope;
}
```

**Assessment:** Output was architecturally correct. Minor refinement: added `getTargetIntensity(year)` to handle the FuelEU step-down schedule per Annex IV.

---

### Example 2 — Greedy Pool Allocation (Claude)

**Prompt:**
```
Implement the FuelEU Article 21 pool allocation algorithm in TypeScript.
Rules:
- Sort members descending by CB
- Transfer surplus to deficit ships greedily
- Deficit ship cannot exit worse than cbBefore
- Surplus ship cannot exit negative
- Return cbBefore and cbAfter per member
Include validation that throws on rule violations.
```

**Generated output:** Full `allocatePool()` function with two-pointer greedy algorithm.

**Refinement:** Initial output mutated input array. Fixed by adding `const sorted = [...members].sort(...)` to avoid side effects. Also added conservation check (`sumBefore === sumAfter`) to verify CB is not created or destroyed.

---

### Example 3 — Copilot inline (boilerplate)

During PostgreSQL repository implementation, Copilot autocompleted the repetitive `mapRow()` helper by recognizing the pattern after the first field mapping:

```typescript
// Typed first field manually:
id: row.id as string,
// Copilot completed:
routeId: row.route_id as string,
vesselType: row.vessel_type as Route['vesselType'],
// ... (all remaining fields)
```

This saved ~5 minutes per repository class.

---

### Example 4 — Cursor Agent refactoring

Used Cursor Agent with this task:

```
In backend/src/adapters/inbound/http/routesRouter.ts, the route handlers have
inline error handling. Extract this into a higher-order `asyncHandler` wrapper
that catches errors and passes them to next(). Apply to all 3 route handlers.
```

Cursor correctly identified all handlers and applied the wrapper, reducing duplication from 3 try/catch blocks to zero inline ones.

---

## Validation / Corrections

### Domain logic
- Ran each formula against the spec dataset manually:
  - R002 LNG: `(91.16 - 88.0) × 4800 × 41000 = +672,960,000 gCO₂e` → Surplus ✅
  - R003 MGO: `(89.3368 - 93.5) × 5100 × 41000 = -870,862,800 gCO₂e` → Deficit ✅
- Verified greedy allocation preserves total CB (conservation test in unit tests)

### API routes
- Tested all endpoints via `curl` and Postman before writing integration tests
- Discovered `/routes/comparison` was shadowed by `/routes/:routeId` — fixed by placing the `/comparison` route **before** the parameterized route in Express

### Frontend
- Confirmed Chart.js ReferenceLine at 89.3368 renders correctly at correct Y-axis position
- Verified filter state update triggers correct API refetch

---

## Observations

### Where agents saved time
- **Architecture scaffolding**: Getting a complete hexagonal folder structure with correct dependencies took ~3 minutes with Claude vs estimated 30+ minutes manually
- **Boilerplate**: Port interfaces, repository stubs, and HTTP router templates were 80%+ generated
- **Test stubs**: Vitest/Jest describe blocks with correct imports generated instantly
- **Docker & CI/CD**: Complete multi-stage Dockerfile and GitHub Actions workflow generated in one shot

### Where agents failed or hallucinated
- **Prisma vs raw pg**: Claude initially suggested Prisma ORM for the outbound adapter. Had to explicitly instruct raw `pg` to keep framework code isolated to infrastructure layer
- **Express 5 async handling**: Copilot occasionally autocompleted Express 5 `asyncHandler` patterns that aren't compatible with Express 4 — manually fixed
- **Pool sum validation placement**: Claude placed the `sum >= 0` check in the domain layer AND the use-case layer (double validation). Removed the redundant check from use-cases since domain is the single source of truth
- **Port mismatch**: Generated frontend API client with hardcoded `:3000` instead of `:3001` — caught in manual testing

### How tools were combined effectively
1. **Claude** → Full architecture design, domain logic, algorithm implementation
2. **Copilot** → Filling in repetitive implementations (all 4 repo adapters followed the same pattern)
3. **Cursor Agent** → Cross-file refactoring (applying consistent error handling patterns, renaming ports)
4. **Manual review** → Every generated piece was read and validated before committing

---

## Best Practices Followed

- Used Claude for architecture-first thinking before any code generation
- Committed agent-generated code only after manual review and test validation
- Kept prompts context-rich (included spec requirements, existing interfaces)
- Never accepted generated test code without verifying it actually tests the right behavior
- Used `tasks.md`-style approach: broke large features into atomic sub-tasks before prompting
- All generated code passed TypeScript strict mode before merging
