# 1 React

---

## Project Setup & Tooling

- JSX
- TSX
- Vite
- CRA (Create React App)
- Next.js
- Remix
- Monorepo
- index.html — The HTML Shell
- src/main.tsx — The Power Button
- src/App.tsx — The Root Component
- package.json — The Project's Identity Card
- vite.config.ts — The Build Brain
- HMR — Hot Module Replacement
- tsconfig.json — TypeScript's Rulebook
- .env Files — Environment Variables
- .gitignore — What Git Should Forget
- .eslintrc.cjs — The Code Police
- .prettierrc — The Auto Formatter
- src/components/ — Reusable UI Blocks
- src/pages/ — One File Per Screen
- src/hooks/ — Custom Reusable Logic
- src/services/ — API Communication Layer
- src/types/ — TypeScript Interfaces (TS Projects)
- src/store/ — State Management (Redux / Zustand)
- src/utils/ — Helper Functions
- src/constants/ — App-wide Constants
- src/assets/ — Images, Fonts, Icons
- node_modules/ — The Pantry (Never Touch)
- public/ — Static Assets (Untouched by Vite)
- dist/ — The Final Product

---

## React Philosophy & Mental Model

- History (Facebook Origins · Jordan Walke · 2013 Open Source Release · React 18 · React 19)
- Why React (Composability · Reusability · Ecosystem · Community · Job Market)
- SPA vs MPA (Single Page App · Multi Page App · Routing Tradeoffs · SEO Implications)
- Virtual DOM (Reconciliation · Diffing Algorithm · Batch Updates · Why It Exists)
- Concurrent Rendering (React 18 · Prioritised Rendering · Interruptible Work · Transitions)
- React vs Next.js vs Vue vs Angular vs Svelte (Architecture · Learning Curve · Performance · Use Cases)
- Component-Based Architecture (Page Component · Layout Component · Feature Component · UI Component · Provider Component · HOC · Custom Hook)
- Declarative UI (vs Imperative · JSX as Description · State Drives UI)
- Unidirectional Data Flow (Props Down · Events Up · Single Source of Truth)

---

## Core Internals

- JSX (Syntax · Expressions · Babel · Compilation Pipeline · React.createElement · Deep Internals)
- TSX (Syntax · Expressions · Babel · Compilation Pipeline · Type Safety · Deep Internals)
- Virtual DOM (Diffing Algorithm · Fiber Architecture · Keys · Performance Internals · Virtual DOM vs Real DOM)
- React Fiber (Fiber Architecture · Scheduling · Concurrent Rendering · Priority Lanes · Work Loop · Commit Phase)
- Reconciliation (Tree Diffing · Element Type Comparison · Key-based Identity · Bailout Strategies)
- React 18 (Automatic Batching · Transitions · Concurrent Features · createRoot · Suspense Improvements)
- React 19 (Actions · useOptimistic · useFormStatus · Server Components · Asset Loading)

---

## Components

- React Components (Functional vs Class · Anatomy · Composition · Pure Components · Best Practices)
- Component Types (Leaf/Presentational · Container/Smart · Layout · Provider · HOC · Page)
- Component Lifecycle (Mounting · Updating · Unmounting · Hooks Mapping · useEffect Deep Dive)
- Class Lifecycle Methods (constructor · getDerivedStateFromProps · render · componentDidMount · shouldComponentUpdate · getSnapshotBeforeUpdate · componentDidUpdate · componentWillUnmount · getDerivedStateFromError · componentDidCatch)
- Props (Passing Data · Prop Drilling · Default Props · TypeScript Props · Patterns · Readonly Semantics)
- Children Prop & Composition (React.Children · Composition Patterns · Render Slots · Component as Prop · Polymorphic Components)
- Conditional Rendering (All Patterns · Ternary · Short-Circuit · Guard Clauses · null Returns · Common Mistakes)
- Lists & Keys (Rendering Arrays · Key Best Practices · Reconciliation Importance · Anti-patterns · Stable Keys)
- React Fragments (Why Fragments · `<></>` Syntax · Key on Fragments · When to Use · DOM Cleanup)
- React Portals (createPortal · Modal Use Case · Event Bubbling · Z-index Escaping · Accessibility)
- Error Boundaries (componentDidCatch · getDerivedStateFromError · Fallback UI · Granular Boundaries)
- Suspense (Data Fetching · Code Splitting · Fallback UI · Nested Suspense · React 18 Streaming)

---

## State Management

- State in React (useState · State Updates · Batching · Functional Updates · Lazy Initialisation · Immutability)
- State Lifecycle (Local vs Global State · When to Lift · Co-location · Server State · UI State · Best Practices)
- Derived State (Compute From State · Anti-patterns · useMemo for Derivations · getDerivedStateFromProps)
- Lifting State Up (Sharing State Between Siblings · When to Lift · Inverse Data Flow · Colocation Tradeoff)
- Controlled vs Uncontrolled Components (Form Inputs · useRef · React Hook Form · When to Use Each)
- Immutability Patterns (Spread Operator · Immer · Object.assign · Structural Sharing)

---

## Hooks (Deep Dive)

- useState (Functional Updates · Lazy Init · Batching · Immutability Patterns · Object State Pitfalls)
- useEffect (Side Effects · Cleanup · Dependency Array · Race Conditions · Common Mistakes · AbortController)
- useContext (Context API · Provider Pattern · Performance Pitfalls · When to Use · Selector Pattern)
- useRef (DOM Access · Mutable Values · forwardRef · Instance Variables · Previous Value Pattern)
- useMemo (Memoization · When It Helps · When It Hurts · Profiling First · Referential Equality)
- useCallback (Function Memoization · React.memo Pairing · Stable References · Pitfalls)
- useReducer (Complex State · Reducer Pattern · vs useState · Redux Comparison · Action Types)
- useLayoutEffect (Sync Layout Reading · When to Use · vs useEffect · SSR Pitfalls)
- useImperativeHandle (Exposing Child API · forwardRef · Custom Ref Interface · Use Cases)
- useId (Unique IDs · Accessibility · SSR Hydration Safety · Multiple IDs from One Hook)
- useTransition (Deferring State Updates · isPending · Non-urgent UI Updates · Loading States)
- useDeferredValue (Deferred Rendering · vs useTransition · Background Computation)
- useSyncExternalStore (External State · Subscribing to Stores · SSR Snapshot)
- useInsertionEffect (CSS-in-JS · Before DOM Mutations · Rare Use Cases)
- useOptimistic (React 19 · Optimistic UI · Rollback on Error)
- Custom Hooks (Reusability · Abstraction · Composition · Real-World Patterns · Rules of Hooks)

---

## Context & Global State

- Context API (Provider · Consumer · useContext · Multiple Contexts · Best Practices)
- Global State via Context (Auth · Theme · i18n · Locale · When Context is Enough)
- Context Performance Issues (Re-render Cascades · Splitting Contexts · Selector Pattern · Alternatives)
- Context vs Redux vs Zustand (Deep Comparison · Migration Guide · When to Use Each · Bundle Size)

---

## Advanced Patterns

- Higher Order Components — HOC (Pattern · withAuth · Compose · vs Hooks · Caveats)
- Render Props Pattern (Function as Children · Data Sharing · vs Hooks · Use Cases)
- Compound Components Pattern (Context-Based · Implicit State Sharing · Flexible APIs · Headless UI)
- Provider Pattern (Dependency Injection · Multiple Providers · Testing with Providers)
- State Reducer Pattern (Override Internal State Logic · User-Controlled Reducers · Inversion of Control)
- Hooks Pattern (Organising by Concern · Separation of Concerns · Custom Hooks as Architecture)
- Container/Presenter Pattern (Data vs Display · Testability · Modern Alternatives)
- Polymorphic Components (as Prop · TypeScript Generics · Flexible Rendering)

---

## Performance Optimization

- Re-render Optimization (Profiling · React.memo · Keys · Avoiding Object Creation · Stable References)
- React.memo (Shallow Comparison · Custom Comparator · When It Helps · When It Fails)
- Code Splitting — React.lazy & Suspense (Lazy Loading · Dynamic Imports · Route-Based Splitting · Bundle Analysis)
- Windowing & Virtualisation (react-window · react-virtualized · TanStack Virtual · Only Render What's Visible)
- React Profiler (DevTools Profiler · Flamegraph · Ranked Chart · Commit Details)
- Bundle Optimization (Tree Shaking · Dead Code Elimination · Import Cost · Rollup Analysis)
- Web Vitals in React (LCP · FID · CLS · INP · Lighthouse · Core Web Vitals Measurement)

---

## Routing

- React Router v6 (BrowserRouter · Routes · Route · Nested Routes · Protected Routes · Outlet)
- React Router v6 Advanced (useNavigate · useParams · useSearchParams · useLocation · Loaders · Actions)
- TanStack Router (Type-safe Routing · File-based Routes · Loader Integration · Devtools)
- Next.js App Router (File-based Routing · Layouts · Loading · Error · Parallel Routes · Intercepting Routes)

---

## Forms

- React Hook Form (register · handleSubmit · validation · Zod · File Uploads · Performance · FormProvider)
- Formik (Field · Form · FieldArray · Yup Integration · When to Use vs RHF)
- Zod Integration (Schema Validation · TypeScript Inference · Error Mapping · Refine)
- Controlled Forms (Input State · onChange · onBlur · Submission)
- File Uploads (input[type=file] · FormData · Preview · Progress · Drag and Drop)

---

## Data Fetching & Server State

- React Query / TanStack Query (useQuery · useMutation · Caching · Invalidation · Optimistic Updates · Prefetching)
- SWR (stale-while-revalidate · useSWR · Mutations · Global Config · vs React Query)
- Fetching APIs — fetch & axios (Interceptors · Error Handling · TypeScript · Retry · Abort · Timeout)
- Loading & Error States (Skeleton UI · Suspense · Error Boundaries · Toast Patterns · Retry UI)
- Optimistic Updates (Immediate UI Feedback · Rollback · Cache Manipulation · useOptimistic)

---

## State Libraries

- Redux Toolkit (createSlice · configureStore · createAsyncThunk · RTK Query · Immer · DevTools)
- Zustand (Lightweight State · Store Creation · Selectors · Middleware · Devtools · Persistence)
- Recoil (Atoms · Selectors · AtomFamily · SelectorFamily · Async Selectors)
- Jotai (Atomic State · Derived Atoms · Async Atoms · Integration with React Query)
- MobX (Observable State · Computed · Reactions · Actions · MobX-React · vs Redux)
- XState (State Machines · Statecharts · Guards · Services · Visualizer)

---

## Styling

- CSS Modules (Scoped Styles · Composition · TypeScript · vs Tailwind vs Styled Components)
- Tailwind CSS in React (Utility-First · clsx/cn · Custom Themes · Dark Mode · Best Practices · Variants)
- Styled Components & Emotion (CSS-in-JS · Dynamic Styles · Theming · Performance Considerations · Runtime vs Zero-runtime)
- SCSS / SASS in React (Variables · Nesting · Mixins · vs CSS Modules · vs Tailwind · Partials)
- CSS Variables & Design Tokens (Custom Properties · Theming · Dynamic Values · System Preference)
- Theming Systems — Dark Mode (ThemeProvider · CSS Variables · System Preference · localStorage · Token Architecture)

---

## Design Systems & Component Libraries

- MUI — Material UI (Components · Theming · sx Prop · Slots API · Custom Components)
- Ant Design (Components · Form · Table · Theme Config · vs MUI)
- Chakra UI (Accessibility First · Theme · Variants · Responsive Styles)
- Shadcn/UI (Copy-paste Components · Radix UI · Tailwind · Customisation · CLI)
- Radix UI (Headless Components · Accessibility · Unstyled Primitives · Compound API)
- Building Your Own Design System (Tokens · Component API Design · Documentation · Storybook)

---

## Testing

- Testing React (Jest · React Testing Library · Component Testing · Mocking · Best Practices)
- React Testing Library (render · screen · fireEvent · userEvent · queries · waitFor)
- Snapshot Testing (toMatchSnapshot · When Useful · When Harmful · Updating Snapshots)
- Mocking in React Tests (jest.mock · MSW · Module Mocks · API Mocks)
- E2E Testing (Cypress · Playwright · User Flow Testing · CI Integration)
- Accessibility Testing (jest-axe · aria roles · Testing Library Queries)
- Storybook (Component Isolation · Stories · Controls · Addons · Interaction Testing)

---

## Server-Side Rendering & Beyond

- Server Side Rendering (How it Works · Hydration · Next.js · Streaming · When to Use · Tradeoffs)
- Static Site Generation — SSG (getStaticProps · ISR · vs SSR · CDN Distribution)
- Incremental Static Regeneration — ISR (revalidate · On-demand ISR · Stale-while-revalidate)
- React Server Components (Zero Bundle · Server-only Data · Serialization · Client Boundary · RSC Payload)
- Streaming Rendering & Hydration (React 18 Streaming · Selective Hydration · Suspense on Server · TTFB · Out-of-order Streaming)
- Next.js — App Router & Pages Router (Server Components · API Routes · Data Fetching · Middleware · ISR · Route Groups)

---

## Build Tools & Ecosystem

- Vite — Build Tool (Dev Server · HMR · Production Build · Plugins · Path Aliases · Rollup Under the Hood)
- Webpack in React (Entry · Loaders · Plugins · Code Splitting · vs Vite · Configuration)
- Babel in React (Presets · Plugins · JSX Transform · TypeScript · SWC Replacement · Runtime)
- SWC (Rust-based Transpiler · Speed · Vite Integration · Next.js Default)
- ESLint & Prettier (Linting · Formatting · Rules · React Hooks Plugin · CI Integration · Flat Config)
- Package Managers — npm vs yarn vs pnpm (Lockfiles · Workspaces · Performance · Phantom Dependencies · Hoisting)

---

## Security

- Security in React (XSS · dangerouslySetInnerHTML · CSRF · Token Storage · Auth Patterns)
- Auth Patterns (JWT Storage · HttpOnly Cookies · Refresh Tokens · Silent Refresh · Logout Strategy)
- Input Sanitization (DOMPurify · Safe Rendering · Escape Hatch Dangers)
- Dependency Security (npm audit · Snyk · Dependabot · SBOM)

---

## Architecture & Scalability

- Frontend Architecture — Scalable React Apps (Feature Architecture · Barrel Exports · Boundaries · Monorepo)
- Feature-based Architecture (Co-location · Domain Slices · Public API per Feature · Index Files)
- Micro Frontends in React (Module Federation · Independent Deployments · Team Ownership · Tradeoffs)
- Monorepo with Nx & Turborepo (Workspaces · Shared Packages · Incremental Builds · Task Pipelines)

---

## Real-time & Advanced UI

- WebSockets & Real-time UI in React (Socket.io · Native WebSocket · SSE · Live Updates · Chat)
- PWA — Progressive Web App with React (Service Workers · Offline Support · Web App Manifest · Install Prompt · Caching Strategies)
- Animation in React (Framer Motion · CSS Transitions · GSAP · Spring Physics · Performance · Layout Animations)
- Accessibility in React (ARIA · Semantic HTML · Keyboard Navigation · Focus Management · Testing · Screen Readers)

---

## Deployment & Monitoring

- Deployment & Performance Monitoring (Vercel · Netlify · CDN · Lighthouse · Web Vitals · Error Tracking)
- CI/CD for React (GitHub Actions · Preview Deployments · Automated Testing · Bundle Size Checks)

---

## AI + React Integration

- AI + React — Modern Integration (OpenAI · Streaming · Chat UI · AI Agents · RAG · Vercel AI SDK)
- AI Agents UI in React (Tool Calls · Thought Stream · Multi-step Visualisation · Streaming · Progress)
- RAG UI — Retrieval Augmented Generation Interfaces (Source Cards · Confidence Scores · Document Upload · Citation Rendering)
- Streaming Responses in UI (SSE · ReadableStream · Incremental Text · Abort Controller · Loading States)
- Schema Validation — Yup & Zod (Type-safe Validation · React Hook Form Integration · Runtime Safety · Discriminated Unions)
