# 7 API Engineering & Testing

---

## API Fundamentals

- What is an API (Definition · Types: REST · GraphQL · gRPC · SOAP · WebSocket · SSE · Webhook)
- Client-Server Architecture (Separation of Concerns · Statelessness · Interface Contract · Versioning)
- HTTP Fundamentals (Methods: GET · POST · PUT · PATCH · DELETE · HEAD · OPTIONS · TRACE)
- HTTP Status Codes (1xx Informational · 2xx Success · 3xx Redirection · 4xx Client Error · 5xx Server Error)
- HTTP Headers (Request Headers · Response Headers · Custom Headers · Content-Type · Accept · Authorization)
- Request/Response Lifecycle (DNS · TCP · TLS · HTTP · Parse · Process · Response · Connection Reuse)
- Idempotency & Safety (Safe Methods · Idempotent Methods · PUT vs PATCH · DELETE Idempotency)
- Statelessness (Session-less · JWT · Token-based State · Advantages · Tradeoffs vs Sessions)
- Content Negotiation (Accept · Content-Type · charset · language · Vendor MIME Types)
- Cookies vs Tokens (HttpOnly · SameSite · Secure Flag · JWT · Session ID · Storage Strategy)

---

## REST API Design

- REST Principles (Resource-based Design · Uniform Interface · Statelessness · Layered System · HATEOAS · Code-on-demand)
- CRUD Mapping (GET → Read · POST → Create · PUT → Replace · PATCH → Update · DELETE → Remove)
- Endpoint Naming Conventions (Nouns not Verbs · Plural Resources · Hierarchical · Consistent Casing · Kebab-case)
- Nested Resources (Parent-Child · /users/:id/orders · Depth Limits · Flat vs Nested · When to Nest)
- API Versioning (URL: /v1/ · Header: API-Version · Query Param: ?version=1 · Accept Header · Deprecation)
- Pagination (Offset-based · Cursor-based · Keyset · Page-number · Link Header · X-Total-Count · Metadata)
- Filtering & Sorting (Query Params · filter[field] · ?sort=name · Multi-sort · Allowed Fields · Injection Prevention)
- Searching (Full-text · ?q= · Field-specific · Elasticsearch integration · Fuzzy · Highlighting)
- Sparse Fieldsets (fields[type] · ?fields= · Reducing Payload · JSON:API spec · GraphQL alternative)
- HATEOAS (Hypermedia Links · _links · HAL · JSON:API · Self-describing APIs · Richardson Maturity Model)
- OpenAPI Specification (Swagger · 3.x · Paths · Components · Parameters · Request Body · Responses · Security Schemes)
- API Documentation Best Practices (Examples · Interactive Docs · SDK Generation · Changelog · Postman Collections)
- API Design Reviews (Consistency · Backward Compatibility · Naming · Error Format · Status Code Accuracy)
- Batch APIs (Bulk Create · Bulk Update · Multi-get · JSON Batch · Cost Reduction · Atomicity)

---

## GraphQL

- GraphQL Fundamentals (Schema · Type System · Queries · Mutations · Subscriptions · Introspection)
- Schema Definition Language — SDL (Types · Scalars · Enums · Interfaces · Unions · Input Types · Directives)
- Resolvers (Resolver Chain · Context · Info · Parent · Arguments · Default Resolvers · Resolver Map)
- Queries (Fields · Arguments · Aliases · Fragments · Variables · Inline Fragments · Directives: @skip · @include)
- Mutations (Input Types · Return Types · Error Handling · Side Effects · Optimistic Responses)
- Subscriptions (Real-time · WebSocket · SSE · PubSub · Filter · withFilter · Topic-per-user)
- N+1 Problem & DataLoader (Batch Loading · Caching · Per-request DataLoader · Promise.all · Batching)
- Schema Design (Relay Spec · Connections · Edges · Nodes · Cursor Pagination · Global ID · Node Interface)
- GraphQL vs REST (Flexibility · Over-fetching · Under-fetching · Tooling · Caching · Complexity · Use Cases)
- GraphQL Security (Depth Limiting · Complexity Analysis · Introspection in Prod · Field-level Auth · Persisted Queries)
- Federation (Apollo Federation · Supergraph · Subgraphs · @key · @external · @requires · @provides)
- GraphQL Clients (Apollo Client · urql · Relay · React Query + GraphQL · Code Generation · graphql-request)
- Caching in GraphQL (Apollo In-memory Cache · Normalized Cache · @cacheControl · CDN Persisted Queries)
- Code Generation (graphql-codegen · TypeScript Types · Typed Hooks · Fragment Types)

---

## gRPC & Advanced Protocols

- gRPC Fundamentals (Protocol Buffers · .proto Files · Service Definitions · Message Types · Field Numbers)
- Protobuf (Scalar Types · Nested Messages · Enums · OneOf · Maps · Repeated · Reserved · Well-known Types)
- Unary RPC (Request-Response · Simple Call · Error Handling · Deadlines · Metadata)
- Server Streaming RPC (Response Stream · Log Tailing · Chunked Data · Error Handling)
- Client Streaming RPC (Upload Files · Aggregation · Final Response · Backpressure)
- Bidirectional Streaming (Chat · Real-time · Full Duplex · Flow Control · Cancellation)
- gRPC Status Codes (OK · CANCELLED · INVALID_ARGUMENT · NOT_FOUND · ALREADY_EXISTS · PERMISSION_DENIED · DEADLINE_EXCEEDED)
- gRPC Metadata (Headers · Trailers · Auth Token · Correlation ID · Compression)
- gRPC Interceptors (Unary · Stream · Client · Server · Middleware Equivalent · Auth · Logging · Tracing)
- gRPC vs REST (Binary vs Text · HTTP/2 vs HTTP/1.1 · Code Generation · Browser Support · Ecosystem)
- gRPC-Web (Browser gRPC · Envoy Proxy · gRPC-Web Transcoding · Connect Protocol)
- gRPC Gateway (REST to gRPC Transcoding · OpenAPI Generation · Reverse Proxy · Annotation)
- SOAP APIs (WSDL · XML · Envelope · Header · Body · Legacy Integration · SOA · WS-Security)
- WebSockets Protocol (Upgrade · Full-duplex · Frames · Ping/Pong · Reconnection · Socket.io)
- Server-Sent Events — SSE (EventSource · Event Types · retry · Last-Event-ID · vs WebSocket)
- Webhooks (Outbound HTTP · Payload · Secret Verification · HMAC · Retry · Idempotency · Delivery)

---

## Authentication & Authorization

- Authentication Methods (Basic Auth · API Keys · Bearer Token · Digest Auth · Certificate-based · HMAC Signature)
- JWT — JSON Web Tokens (Header · Payload · Signature · Access Token · Refresh Token · Claims · Verification)
- JWT Deep Dive (Algorithm: RS256 · HS256 · ES256 · Key Rotation · Token Revocation · Blacklisting · Short Expiry)
- OAuth 2.0 (Authorization Code · PKCE · Client Credentials · Implicit · Resource Owner Password · Flows)
- OAuth 2.0 Scopes (Granular Permissions · Scope Validation · Consent Screen · Token Introspection)
- OpenID Connect (ID Token · UserInfo · .well-known · Claims · nonce · State · Code Flow)
- API Keys (Header vs Query · Hashing Keys · Rotation · Scopes · Per-key Rate Limiting · Audit)
- SAML (SSO · SP-initiated · IdP-initiated · Assertions · Metadata · Enterprise Auth)
- Session-based Authentication (Cookie · Session Store · HttpOnly · SameSite · CSRF · Sliding Expiry)
- RBAC (Role-based Access Control · Roles · Permissions · Assignment · Hierarchical Roles · Admin Role)
- ABAC (Attribute-based · Policy Language · OPA · Cedar · Contextual Access · Dynamic Permissions)
- mTLS (Mutual TLS · Client Certificates · Certificate Authority · Service-to-service Auth)

---

## API Security

- Input Validation (Schema Validation · Sanitization · Allowlist · Reject on Fail · Type Coercion)
- Rate Limiting (Token Bucket · Leaky Bucket · Fixed Window · Sliding Window · Distributed Rate Limit)
- Throttling (Global · Per-user · Per-IP · Per-endpoint · Backoff Strategy · 429 Response)
- CORS (Cross-Origin Resource Sharing · Access-Control-Allow-Origin · Preflight · Credentials · Wildcard)
- CSRF Protection (SameSite Cookie · CSRF Token · Double-submit Cookie · Origin Check · CORS)
- Injection Prevention (SQL Injection · NoSQL Injection · Command Injection · LDAP Injection · GraphQL Injection)
- XSS Prevention (Content-Type · CSP Header · HTML Encoding · DOM XSS · Stored vs Reflected)
- HTTPS & TLS (Certificate Pinning · HSTS · TLS 1.3 · ALPN · SNI · Cipher Suites · Perfect Forward Secrecy)
- OWASP API Top 10 (BOLA · Broken Auth · Excessive Data · Resource Consumption · BFLA · Unrestricted Inventory · SSRF · Security Misconfiguration · Improper Assets · Unsafe Consumption)
- API Gateway Security (Authentication Offload · WAF · IP Allowlist · DDoS · Bot Detection · Logging)
- Secrets Management (Never in Code · Env Vars · Vault · Secrets Manager · Rotation · Audit)
- Replay Attack Prevention (Nonce · Timestamp · HMAC Signature · Idempotency Keys)

---

## API Performance & Scaling

- Caching (HTTP Cache-Control · ETag · Last-Modified · Redis · CDN Caching · Stale-while-revalidate)
- HTTP Caching Headers (Cache-Control: max-age · no-cache · no-store · private · public · Vary · Age)
- ETags & Conditional Requests (If-None-Match · If-Modified-Since · 304 Not Modified · Validation)
- Load Balancing (Round Robin · Least Connections · IP Hash · Weighted · Health Checks · Session Affinity)
- Connection Pooling (TCP Reuse · Keep-alive · HTTP/2 Multiplexing · PgBouncer · Database Pools)
- Compression (Gzip · Brotli · zstd · Content-Encoding · Accept-Encoding · Negotiation)
- Horizontal Scaling (Stateless Design · Session Externalization · Load Balancer · Auto-scaling)
- Async APIs (Background Jobs · Webhooks · Polling · 202 Accepted · Job Status Endpoint)
- Queue-based Processing (Decouple · SQS · RabbitMQ · Celery · Rate Control · Priority Queues)
- Batching Requests (Batch Endpoint · JSON Batch · Reduce Round-trips · Partial Success · Error Handling)

---

## API Design Patterns

- API Gateway Pattern (Single Entry Point · Auth · Rate Limit · Transform · Aggregate · Kong · Nginx)
- Backend for Frontend — BFF (Per-client API · Mobile BFF · Web BFF · Reduce Over-fetching · Tailored)
- Aggregator Pattern (Compose Multiple Services · Single Response · Error Handling · Partial Response)
- Circuit Breaker Pattern (Closed · Open · Half-open · Hystrix · Resilience4j · Timeout · Fallback)
- Retry Pattern (Exponential Backoff · Jitter · Max Retries · Idempotency · Circuit Breaker Interaction)
- Idempotency Keys (Idempotency-Key Header · Store Keys · Replay Response · Deduplication · Stripe Model)
- Event-driven APIs (Webhook · AsyncAPI · Event Catalogue · Schema Registry · CloudEvents Spec)
- Strangler Fig Pattern (Incremental Migration · Proxy · Legacy Replacement · Risk Reduction)
- Saga Pattern (Distributed Transactions · Choreography · Orchestration · Compensating Transactions)
- Inbox/Outbox Pattern (Reliable Messaging · Atomicity · At-least-once · Change Data Capture)

---

## Real-time APIs

- WebSockets (ws:// · Upgrade Handshake · Full-duplex · Socket.io · Binary · Heartbeat · Reconnection)
- Server-Sent Events (EventSource · one-way · text/event-stream · Retry · Last-Event-ID · Polyfill)
- Long Polling (Request-hold · Server Response · Immediate Re-poll · Fallback · vs WebSocket)
- HTTP Streaming (Chunked Transfer · Transfer-Encoding · ndjson · Streaming JSON · ReadableStream)
- Event Streaming (Kafka · Kinesis · Pub/Sub · Consumer Groups · Partitions · Offset · Schema)
- AsyncAPI (Async API Specification · Channels · Messages · Operations · Bindings · Code Gen)

---

## API Tooling

- Postman (Collections · Environments · Pre-request Scripts · Tests · Mock Servers · Newman · Monitors)
- Insomnia (GraphQL · REST · gRPC · Environments · Plugins · Git Sync)
- Bruno (Open Source · bru files · Git-friendly · Offline · no cloud sync · Scripting)
- cURL (CLI · Flags: -X -H -d -b -c · verbose · --resolve · Time measurements)
- HTTPie (Human-friendly CLI · JSON Auto · Sessions · Auth · Streaming · Plugins)
- Swagger UI / ReDoc (Interactive Docs · Try It Out · OpenAPI Rendering · Auth · Custom Branding)
- hoppscotch (Web-based · WebSocket · SSE · GraphQL · REST · Open Source Alternative)
- SDK Generation (OpenAPI Generator · Speakeasy · Stainless · Client SDKs · Type Safety)

---

## API Monitoring & Observability

- Logging (Request ID · Method · Path · Status · Latency · User · Structured JSON · Correlation ID)
- Metrics (Request Rate · Error Rate · Latency P50/P95/P99 · Availability · Throughput · Apdex)
- Distributed Tracing (Trace ID · Span · Parent Span · Context Propagation · B3 · W3C TraceContext)
- API Monitoring Tools (Datadog · New Relic · Elastic APM · Prometheus + Grafana · Uptime Robot)
- Synthetic Monitoring (Scheduled Tests · Multi-region · Alert on Degradation · Baseline SLOs)
- Error Tracking (Sentry · Rollbar · Bugsnag · Structured Errors · Grouping · Alerting · Release Tracking)
- Alerting (Threshold · Anomaly · Composite · PagerDuty · OpsGenie · Runbooks · Escalation)
- API Analytics (Usage Patterns · Top Consumers · Popular Endpoints · Error Hotspots · Growth)
- APM in Production (Latency Breakdown · Database Time · External Calls · Memory · CPU · GC)

---

## API Deployment & DevOps

- Dockerizing APIs (Dockerfile · Multi-stage · Non-root · Healthcheck · ENV · Minimal Base Image)
- CI/CD for APIs (Lint · Test · Build · Integration Test · Deploy · Smoke Test · Rollback)
- API Gateway Deployment (Kong · AWS API Gateway · Azure APIM · GCP API Gateway · Nginx Plus)
- Blue-Green for APIs (Zero Downtime · Canary Weight · Header-based Routing · Rollback Trigger)
- Database Migrations in CI/CD (Backward Compatible · Expand-contract · Online DDL · Schema Validation)
- Environment Management (Dev · Staging · Prod · Feature Envs · Config Management · Secret Injection)

---

## API for AI Systems

- LLM APIs (OpenAI · Anthropic · Gemini · Cohere · Bedrock · Azure OpenAI · API Keys · Org/Project)
- Streaming Responses (SSE · ReadableStream · text/event-stream · Delta · stop reason · Buffer Flushing)
- Function Calling APIs (Tool Definitions · Tool Results · Parallel Calls · Required · Auto · None)
- Structured Output APIs (JSON Mode · json_schema · Instructor · Outlines · Schema Enforcement)
- AI Agent APIs (Multi-turn · System Prompt · Context Management · Tool Loop · Max Iterations)
- RAG APIs (Query Endpoint · Retrieval Pipeline · Source Attribution · Confidence Score · Streaming)
- Multimodal APIs (Vision · Image URL · Base64 · Audio · File Upload · MIME Types)
- Rate Limits & Cost for AI APIs (TPM · RPM · Context Window · Token Counting · Caching · Batching)
- Embedding APIs (text-embedding · Dimensions · Batch Embed · Similarity · Upsert to Vector DB)
- AI API Error Handling (429 · Context Length · Content Policy · Timeout · Retry · Fallback Model)

---

## Testing Fundamentals

- What is Testing (Quality Assurance · Defect Prevention vs Detection · Testing Pyramid · Testing Trophy)
- Manual vs Automated Testing (Exploratory · Regression · Speed · Cost · Flakiness · Maintenance)
- Testing Strategies (Shift Left · Shift Right · Risk-based · Coverage-based · Behaviour-based)
- Testing Pyramid (Unit base · Integration middle · E2E top · Ice cream cone Anti-pattern · Trophy)
- Test Coverage (Line · Branch · Function · Statement · Mutation · Coverage as a Proxy Metric)
- Test Lifecycle (Plan · Design · Implement · Execute · Report · Maintain · Retire)

---

## Unit Testing

- Unit Testing Concepts (Isolated · Fast · Deterministic · Repeatable · Self-validating · Timely)
- Test Cases & Assertions (assertEquals · assertTrue · assertNull · assertThrows · toMatchSnapshot)
- Mocking & Stubbing (Mock vs Stub vs Spy vs Fake · jest.mock · unittest.mock · Sinon · Test Doubles)
- Dependency Injection for Testing (Constructor Injection · Interface Injection · Test Containers · DI Frameworks)
- Jest (describe · it/test · beforeEach · afterEach · beforeAll · afterAll · expect · matchers · coverage)
- Pytest (fixtures · conftest.py · parametrize · markers · monkeypatch · tmp_path · capsys · scope)
- Vitest (Fast · Vite-native · jest-compatible · in-source testing · snapshot · coverage)
- Test Isolation (No shared state · Reset mocks · Independent order · Flakiness prevention)
- Property-based Testing (Hypothesis · fast-check · Random inputs · Shrinking · Invariant testing)
- Mutation Testing (Stryker · mutmut · Code Mutation · Checking Test Effectiveness · Mutation Score)

---

## Integration Testing

- Integration Testing Concepts (Multiple Components · Real Dependencies · Slower · More Confidence)
- API Integration Testing (Supertest · httpx · requests · API TestCase · DRF APITestCase · Auth)
- Database Testing (Real DB · Transactions · Test Fixtures · Rollback · Factory Boy · Faker · Seeding)
- Testcontainers (Docker-based · Ephemeral · Postgres · Redis · Kafka · Language SDKs · Auto-cleanup)
- Service Integration (External HTTP · Mock Server · WireMock · msw · VCR Cassettes · Pact)
- Contract Testing (Pact · Consumer-driven · Provider Verification · Pact Broker · Bi-directional)
- Message Queue Testing (In-memory · LocalStack · Real Broker · Consumer Test · Producer Test)

---

## E2E Testing

- E2E Testing Concepts (Full Stack · Real Browser · User Flows · Slow · High Confidence · CI Cost)
- Cypress (cy.visit · cy.get · cy.type · cy.click · Intercept · Fixtures · Custom Commands · Component Testing)
- Playwright (Chromium · Firefox · WebKit · Auto-wait · Trace Viewer · codegen · API Testing · Mobile)
- Selenium (WebDriver · Grid · Cross-browser · Page Object Model · Implicit/Explicit Waits · Legacy)
- User Flow Testing (Happy Path · Unhappy Path · Multi-step · Form Submit · Auth Flow · Payment)
- Cross-browser Testing (Playwright Multi-browser · BrowserStack · Sauce Labs · LambdaTest)
- Visual Regression Testing (Percy · Chromatic · BackstopJS · Playwright Screenshots · Snapshot Diffs)

---

## Frontend Testing

- React Testing Library (render · screen · userEvent · fireEvent · waitFor · within · findBy · queryBy)
- Component Testing (Isolated Render · Props · Events · State Changes · Async · Mocked Hooks)
- Snapshot Testing (toMatchSnapshot · Update Snapshots · Stale Snapshots · Inline Snapshots)
- Mocking in React Tests (jest.mock · MSW · vi.mock · Module Mocks · API Mocks · Context Mocks)
- Storybook Testing (Stories · Play Function · Interaction Testing · addon-interactions · Chromatic)
- Accessibility Testing (jest-axe · axe-playwright · ARIA role queries · Tab navigation · Contrast)
- Performance Testing in Frontend (Lighthouse CI · Web Vitals · Bundle Size Checks · Rendering Benchmarks)

---

## API Testing

- API Testing Fundamentals (Functional · Negative · Security · Performance · Contract · Exploratory)
- REST API Testing (Status Codes · Response Body · Headers · Schema · Timing · Auth Flow Testing)
- GraphQL API Testing (Query Testing · Mutation Testing · Subscription Testing · Schema Validation)
- Postman Testing (pm.test · pm.response · pm.environment · Pre-request Scripts · Newman · Monitors)
- Supertest (HTTP Assertions · Express · Django · Auth · Status · Body · Headers · Content-type)
- Contract Testing — Pact (Consumer · Provider · Pact Broker · Bi-directional · OpenAPI Pact)
- Schema Validation Testing (Zod · AJV · OpenAPI Validation · Request/Response Schema · Strict Mode)
- Negative Testing (Invalid Input · Missing Fields · Wrong Types · Auth Failure · Boundary Values)
- API Mock Servers (WireMock · msw · Mockoon · Postman Mock · json-server · API Contract Mock)

---

## Performance Testing

- Load Testing (Simulate Expected Traffic · VUs · Ramp-up · Steady State · Ramp-down)
- Stress Testing (Beyond Limits · Breaking Point · Recovery · Memory Leaks · Saturation)
- Spike Testing (Sudden Traffic · Flash Sales · News Events · Auto-scaling Response)
- Soak / Endurance Testing (Long Duration · Memory Leak · Connection Leak · Drift)
- k6 (JS Scripting · Scenarios · Thresholds · Cloud · Extensions · Grafana Integration · Checks)
- Locust (Python · Users · Spawn Rate · Tasks · Web UI · Distributed · Custom Shapes)
- JMeter (GUI · Test Plan · Thread Group · Samplers · Listeners · Assertions · Plugins · Distributed)
- Gatling (Scala/Java/Kotlin · DSL · Reports · Feeders · Protocols · CI Integration)
- Benchmarking (Baseline · P50/P95/P99 · Latency Distribution · Throughput · Error Rate · SLO Alignment)
- Capacity Planning (Traffic Modelling · Resource Projections · Headroom · Bottleneck Identification)

---

## Security Testing

- Security Testing Fundamentals (OWASP Top 10 · Threat Modelling · Attack Surface · Risk Assessment)
- Penetration Testing (Recon · Scanning · Exploitation · Post-exploitation · Reporting · Tools: Burp · ZAP)
- DAST (OWASP ZAP · Nuclei · nikto · sqlmap · API Fuzzing · Automated Scanning · CI Integration)
- Auth Testing (JWT Manipulation · Expired Tokens · Privilege Escalation · IDOR · Missing Auth · BOLA)
- Vulnerability Scanning (Trivy · Snyk · OWASP Dependency-Check · Semgrep · CodeQL · Bandit)
- Fuzzing (API Fuzzing · Corpus · Coverage-guided · LibFuzzer · AFL · restler · schemathesis)

---

## Test Automation & CI

- Test Automation Frameworks (Page Object Model · Screenplay Pattern · Robot Framework · BDD Frameworks)
- CI/CD Integration (Run on PR · Fail fast · Parallel · Coverage Gate · Report Upload · Notifications)
- Parallel Testing (jest --maxWorkers · Playwright sharding · pytest-xdist · Distributed Execution)
- Test Flakiness (Retry · Quarantine · Root Cause · Async Timing · Order Dependence · External State)
- Test Data Management (Fixtures · Factories · Seeding · Teardown · Shared Data · Isolation)
- Reporting (JUnit XML · HTML Reports · Allure · Pytest-html · GitHub Annotations · Trend Analysis)

---

## Mocking & Test Doubles

- Mocks (Verify Calls · Expectations · Return Values · Throw · jest.fn() · MagicMock)
- Stubs (Hardcoded Returns · No Verification · Simple Substitution · State-based Testing)
- Fakes (Working Implementation · In-memory DB · Fake Queue · Fake File System · Fast)
- Spies (Wrap Real Implementation · Record Calls · jest.spyOn · Sinon.spy · Partial Mock)
- Dummies (Placeholder · Never Used · Fill Parameters · Interface Satisfaction)
- Service Virtualization (WireMock · Hoverfly · Mountebank · Record & Replay · VCR · Cassettes)
- MSW — Mock Service Worker (Intercept at Network Level · Browser + Node · REST + GraphQL · msw)

---

## AI System Testing

- LLM Testing (Prompt Testing · Output Validation · Format Checking · Regression Prompts · Golden Datasets)
- RAG Evaluation (RAGAS · Context Relevance · Faithfulness · Answer Relevance · Groundedness · ARES)
- Hallucination Detection (Factuality Check · FactScore · SelfCheckGPT · NLI-based · Grounding Score)
- AI Safety Testing (Jailbreak Testing · Prompt Injection · Red Teaming · Adversarial Prompts · Refusal Rate)
- Bias Testing (Demographic Parity · Counterfactual · Winogender · BBQ · Model Cards · Audit)
- LLM Evaluation Frameworks (DeepEval · LangSmith · Promptfoo · Trulens · Evals · PromptBench)
- Human Evaluation for AI (Preference Studies · A/B · Annotation Guidelines · IRR · Elo Rating)
- Regression Testing for AI (Prompt Suites · Expected Output · Semantic Similarity · LLM-as-Judge)

---

## TDD, BDD & Best Practices

- TDD — Test Driven Development (Red · Green · Refactor · Cycle · Benefits · When it Shines · Pitfalls)
- BDD — Behaviour Driven Development (Gherkin · Given/When/Then · Cucumber · Behave · Living Docs)
- AAA Pattern (Arrange · Act · Assert · Single Assert per Test · Clear Structure · Readability)
- FIRST Principles (Fast · Isolated · Repeatable · Self-validating · Timely · Clean Tests)
- Clean Test Code (Descriptive Names · No Logic · Single Responsibility · Readable · DRY vs DAMP)
- Test Pyramid Strategy (Ratio · Anti-patterns: Ice-cream cone · Guidance · ROI per Layer)
- Maintainable Test Suites (Refactor Tests · Remove Obsolete · Naming Conventions · CI Health)
