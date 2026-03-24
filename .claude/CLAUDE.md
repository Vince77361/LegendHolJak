# Project Guidelines

## Stack

- Package Manager: npm (Node v22 LTS)
- Language: Typescript
- Framework: NextJS 15 (App router)
- DB: Supabase
- State Management: Tanstack Query, Zustand
- Auth: Clerk
- UI Library: TailwindCSS, Shadcn/UI
- Toast: react-hot-toast
- Testing Library: Jest, Playwright
- Performance Monitoring: Sentry
- Docs: Swagger for api

---

## Architecture Principles

- Keep it simple.
- Avoid over-engineering.
- Prefer built-in Next.js features over custom abstractions.
- Do not introduce unnecessary layers (no service layer unless truly needed).
- Use API Route Handlers for backend logic.

---

## Naming conventions

- hooks: camelCase
- files: kebab-case
- components file: kebab-case
- DB columns: snake_case

---

## Folder Structure Rules

- src/
  - app
    - api/
      - ai/ (all AI API logics should be in here)
      - other logics
    - (home)
  - components
    - ui/
    - other similar things
    - sections/ (if needed)
    - image-container (for easy sizing image)
  - lib
    - utils.ts
    - providers.tsx
    - other libraries (either single file or folders are allowed)
    - store.ts or store/
  - hooks (if needed)
  - types
  - \_\_tests\_\_
  - e2e

---

## Environment Variables Rules

- Secrets must NEVER be exposed to the client.
- Only variables prefixed with `NEXT_PUBLIC_` may be used in client components.
- OpenAI API keys must be used only in server side (never expose to client).
- Supabase key must remain server-side only.

---

## Code Style

- Prefer small, readable functions.
- Avoid deep folder nesting.
- Avoid premature optimization.
- Explicit naming over clever abstraction.
- If unsure, choose the simpler implementation.

---

## API Rules

- use OpenAI API for AI API, model should be GPT 4o-mini.
- If
- All AI calls must go through `/app/api/*` route handlers.
- Track user usage when calling AI endpoints.
- Return consistent JSON response format:

{
success: boolean,
data?: any,
error?: string
}

---

## Auth Rules

- use Clerk for better auth performance.
- Protected Routes MUST be through middlewares.
- userId should be gotten only through auth()

---

## Testing Rules

- Unit/Integration: Jest (src/\_\_tests\_\_)
- e2e: PlayWright (e2e/)
- Coverage goals: 80% upper

---

## Performance Philosophy

- Optimize is necessary.
- Add caching only when repeated calls become a problem.
- Avoid adding Redis/queues unless traffic requires it.

---

## UI Philosophy

- Use Shadcn/UI for better UI Performance.
- If you use shadcn, make sure you use Node v22 (LTS)
- Use framer-motion for simple animation: modal animation for component transition.
- Use GSAP for complex animation: scroll animation based.
- Maintain consistent spacing and layout.
- Make Responsive Web for Desktop, Tablet, and Mobile.
- Toast should be at top, and color should be white.

---

## Before Writing Complex Code

Always ask:

1. Can this be done simpler?
2. Is this abstraction actually needed?
3. Will this increase maintenance cost?

If yes → simplify.

---
