# 2 Django

---

## Core Fundamentals

- What is Django (History · Philosophy · Batteries Included · MTV Architecture · Opinionated Framework)
- Django vs Flask vs FastAPI (Use Cases · Performance · Ecosystem · When to Choose Each)
- Project Structure (manage.py · settings.py · apps · urls.py · wsgi.py · asgi.py)
- Apps (App Lifecycle · Modular Architecture · AppConfig · Reusable Apps · app.py)
- MTV Pattern (Model · Template · View · vs MVC · Request Flow · Response Flow)
- Settings Configuration (Env Variables · DEBUG · INSTALLED_APPS · DATABASES · ALLOWED_HOSTS · Split Settings)
- WSGI & ASGI (Deployment Interfaces · Sync vs Async · Gunicorn · Uvicorn · Daphne)
- Django Versions (LTS Versions · Upgrade Path · Django 4.x · Django 5.x · Breaking Changes)
- manage.py Commands (runserver · shell · makemigrations · migrate · collectstatic · createsuperuser · Custom Commands)

---

## Models & ORM

- Models (Fields · Field Types · Meta Options · Relationships · Model Methods · `__str__`)
- Field Types (CharField · IntegerField · DateField · BooleanField · JSONField · UUIDField · SlugField · TextField · DecimalField · ImageField · FileField)
- Field Options (null · blank · default · unique · db_index · choices · verbose_name · help_text)
- Relationships (OneToOneField · ForeignKey · ManyToManyField · on_delete · related_name · through)
- ORM Basics (QuerySets · .filter() · .exclude() · .get() · .all() · .first() · .last() · .exists() · .count())
- ORM Advanced (Annotations · Expressions · Subqueries · F Expressions · Q Objects · Conditional Expressions · Case/When)
- Aggregation (Sum · Avg · Count · Max · Min · Group By · Values · Values_list)
- Migrations (makemigrations · migrate · Schema Evolution · squashmigrations · showmigrations · RunPython · RunSQL)
- Custom Managers & QuerySets (Manager Inheritance · Chainable QuerySets · Default Manager · Multi-table Inheritance)
- Indexes (db_index · Unique Constraints · UniqueConstraint · Index · GIN · GiST · Hash · Partial Indexes)
- Transactions (atomic() · SAVEPOINT · select_for_update · Isolation Levels · Deadlock Handling)
- Raw SQL Integration (raw() · execute() · cursor() · When to Use · Security Risks)
- Multi-Database Setup (DATABASE_ROUTERS · Cross-DB Queries · Read Replicas · Database Aliases)
- Model Inheritance (Abstract Base · Multi-table · Proxy Models · When to Use Each)
- Signals (pre_save · post_save · pre_delete · post_delete · m2m_changed · Connecting · Disconnecting · Pitfalls)

---

## Admin Panel

- Admin Basics (ModelAdmin · admin.site.register · site.unregister · Admin Site)
- Admin Customization (list_display · list_filter · search_fields · ordering · readonly_fields · fieldsets · list_per_page)
- Inline Models (TabularInline · StackedInline · InlineModelAdmin · max_num · extra)
- Custom Admin Actions (actions · short_description · Bulk Operations · Permissions)
- Admin Security (admin URL · Two-Factor · Restrict by IP · Custom Authentication Backend)
- Admin Performance Optimization (select_related · prefetch_related · show_full_result_count · Autocomplete Fields)
- Custom Admin Views (get_urls · ModelAdmin Views · Custom Templates · Admin Branding)
- Django Jazzmin & Third-party Admin (Jazzmin · Grappelli · Suit · Admin Dark Mode)

---

## Views & Request Handling

- Function Based Views — FBV (Simplicity · Explicit · Decorators · When to Use)
- Class Based Views — CBV (View · TemplateView · RedirectView · Mixins · Method Handlers)
- Generic Views (ListView · DetailView · CreateView · UpdateView · DeleteView · FormView)
- Request/Response Cycle (Request Object · Response Object · HttpRequest · HttpResponse · JsonResponse)
- Middleware (Custom Middleware · __call__ · process_request · process_response · process_exception · Order Matters)
- URL Routing (path() · re_path() · include() · Namespaces · App Namespaces · URL Reversing · reverse())
- HTTP Methods Handling (GET · POST · PUT · PATCH · DELETE · HEAD · OPTIONS · require_http_methods)
- Decorators (login_required · permission_required · csrf_exempt · cache_page · require_POST)
- Shortcuts (render · redirect · get_object_or_404 · get_list_or_404 · resolve)
- File Downloads (FileResponse · StreamingHttpResponse · Content-Disposition · Chunked Transfer)

---

## Templates

- Template Engine (Django Templates · Jinja2 · Template Loaders · Template Directories)
- Template Tags & Filters (if · for · block · include · url · static · Custom Tags · Custom Filters)
- Template Inheritance (base.html · {% block %} · {% extends %} · {% include %} · Template Hierarchy)
- Static Files (CSS · JS · Images · STATICFILES_DIRS · STATIC_ROOT · collectstatic · WhiteNoise)
- Media Files (User Uploads · MEDIA_ROOT · MEDIA_URL · Serving in Dev · Cloud Storage in Prod)
- Forms Rendering in Templates ({{ form }} · {{ form.as_p }} · {{ form.as_table }} · Manual Field Rendering · CSRF Token)
- Template Context Processors (request · auth · messages · Custom Context Processors)
- Template Security (Auto-escaping · mark_safe · escape · XSS Prevention)

---

## Forms & Validation

- Forms (Form Class · ModelForm · Form Fields · Widgets · Labels · Help Text)
- Validation (Field Validation · clean() · clean_<fieldname>() · non_field_errors · ValidationError)
- Custom Validators (validate_ functions · RegexValidator · EmailValidator · Reusable Validators)
- CSRF Protection (CsrfViewMiddleware · csrf_token · csrf_exempt · AJAX CSRF · Cookie vs Header)
- File Upload Forms (FileField · ImageField · request.FILES · ALLOWED_EXTENSIONS · File Size Limits)
- Form Handling Best Practices (GET vs POST · Redirect After POST · Form Re-display on Error · Honeypot)
- Formsets (formset_factory · modelformset_factory · management_form · Inline Formsets)

---

## Authentication & Authorization

- Authentication System (login() · logout() · authenticate() · Login View · Logout View · Login Required)
- User Model (Default User · AbstractUser · AbstractBaseUser · Custom User Fields · AUTH_USER_MODEL)
- Permissions System (has_perm · has_module_perms · Django Permissions · Object-Level Permissions)
- Groups & Roles (Group Model · Assigning Permissions · Role-based Access · Admin Group Management)
- Password Hashing & Security (PBKDF2 · Argon2 · bcrypt · make_password · check_password · Password Validators)
- Session Management (SessionMiddleware · Session Backends · Session Expiry · Cookie Security · SESSION_COOKIE_AGE)
- JWT Authentication — SimpleJWT (access_token · refresh_token · TokenObtainPairView · Token Rotation · Blacklisting)
- OAuth2 (django-allauth · social-auth-app-django · Google Login · GitHub · Callback URLs)
- RBAC & ABAC Patterns (Custom Permission Classes · Object Permissions · django-guardian · Row-level Security)
- Two-Factor Authentication — 2FA (django-otp · TOTP · Backup Codes · QR Codes)
- django-allauth (Social Auth · Email Verification · Multiple Accounts · Headless Mode)

---

## Django REST Framework

- DRF Fundamentals (APIView · ViewSet · ModelViewSet · ReadOnlyModelViewSet · Router)
- Serializers (Serializer · ModelSerializer · Field Validation · Nested Serializers · SerializerMethodField · to_representation)
- Routers (DefaultRouter · SimpleRouter · Custom Routes · Trailing Slash · Basename)
- Authentication in DRF (TokenAuthentication · JWTAuthentication · SessionAuthentication · BasicAuthentication)
- Permissions in DRF (IsAuthenticated · IsAdminUser · IsAuthenticatedOrReadOnly · Custom Permission Classes · Object Permissions)
- Pagination (PageNumberPagination · LimitOffsetPagination · CursorPagination · Global vs Per-view)
- Filtering (SearchFilter · OrderingFilter · DjangoFilterBackend · Custom Filters · Query Params)
- Throttling (AnonRateThrottle · UserRateThrottle · ScopedRateThrottle · Custom Throttle · Rate Strategies)
- Versioning APIs (URLPathVersioning · NamespaceVersioning · QueryParameterVersioning · AcceptHeaderVersioning)
- API Documentation (drf-spectacular · drf-yasg · Swagger UI · ReDoc · Schema Generation · @extend_schema)
- DRF Parsers & Renderers (JSONRenderer · BrowsableAPIRenderer · MultiPartParser · FileUploadParser)
- DRF Mixins (CreateModelMixin · ListModelMixin · UpdateModelMixin · DestroyModelMixin · Compose)
- Generic API Views (ListAPIView · RetrieveAPIView · CreateAPIView · UpdateAPIView · ListCreateAPIView)

---

## Async & Real-time Django

- Async Views (ASGI · async def · await · SyncToAsync · AsyncToSync · Database in Async Context)
- Django Channels (WebSockets · HTTP Long Polling · Channel Layers · ASGI App · Routing)
- Consumers (WebsocketConsumer · AsyncWebsocketConsumer · JsonWebsocketConsumer · Lifecycle)
- Redis Integration (Channel Layers · redis-py · aioredis · CHANNEL_LAYERS setting)
- Real-time Systems (Chat · Live Notifications · Presence Indicators · Broadcast · Groups)
- Background Tasks — Celery (celery workers · beat · tasks · delay() · apply_async() · Periodic Tasks · Canvas)
- Task Queues (Celery Workers · Redis Broker · RabbitMQ Broker · Flower · Task Monitoring · Retry Logic)
- Django RQ (rq · rq-scheduler · Simpler Alternative · When to Use)
- Celery Best Practices (Idempotency · Task Timeouts · Priority Queues · Result Backend · Error Handling)

---

## Files, Storage & Media

- File Upload Handling (request.FILES · InMemoryUploadedFile · TemporaryUploadedFile · Chunked Uploads)
- Image Processing (Pillow · Thumbnails · Resizing · Format Conversion · EXIF Stripping)
- Cloud Storage — AWS S3 (django-storages · boto3 · S3Boto3Storage · Pre-signed URLs · Private Files)
- Cloudinary Integration (CloudinaryField · Auto Transforms · Responsive Images · Upload Presets)
- Static vs Media Files (WhiteNoise for Static · Cloud for Media · Development vs Production Strategy)
- CDN Integration (CloudFront · Cloudflare · Custom Storage Backend · URL Rewriting)
- File Security (Access Control · Private Media · Token-based Downloads · Content-Type Validation)

---

## Caching & Performance

- Caching Basics (Per View · Template Fragment · Low-level Cache API · cache.get · cache.set)
- Cache Backends (Redis · Memcached · FileBasedCache · LocMemCache · Database Cache)
- Database Optimization (select_related · prefetch_related · only() · defer() · values() · Avoiding N+1)
- Query Optimization (EXPLAIN ANALYZE · django-debug-toolbar · Connection Pooling · Query Count)
- Lazy Evaluation (QuerySet Lazy · When Queries Execute · Chaining · Caching QuerySets)
- Pagination Optimization (Cursor Pagination · Count Optimization · Estimated Counts)
- Load Testing (Locust · k6 · wrk · Benchmarking Django · Workers Config)
- Connection Pooling (PgBouncer · django-db-geventpool · DATABASE CONN_MAX_AGE)
- django-debug-toolbar (SQL Queries · Cache Hits · Template Timing · Request Headers)

---

## Security

- Security Middleware (SecurityMiddleware · HSTS · X-Content-Type-Options · X-Frame-Options · Referrer-Policy)
- XSS Protection (Auto-escaping · mark_safe Dangers · Content Security Policy · DOMPurify)
- CSRF Protection (Middleware · csrf_token · AJAX · Cookie vs Header · SameSite Cookies)
- Clickjacking Protection (X-Frame-Options · DENY · SAMEORIGIN · CSP frame-ancestors)
- SQL Injection Prevention (ORM Parameterization · raw() Risks · Whitelisting · Avoid String Formatting)
- HTTPS & Secure Cookies (SECURE_SSL_REDIRECT · SESSION_COOKIE_SECURE · CSRF_COOKIE_SECURE · HSTS)
- Rate Limiting (django-ratelimit · DRF Throttling · Nginx Rate Limit · Redis-based Limiting)
- OWASP Best Practices (Top 10 · A01-A10 · Security Checklist · Django Security Deployment Checklist)
- Secrets Management (django-environ · python-decouple · Vault · AWS Secrets Manager · Never Hardcode)

---

## Testing

- Unit Testing (TestCase · SimpleTestCase · TransactionTestCase · setUpTestData · setUp · tearDown)
- API Testing (DRF APITestCase · APIClient · force_authenticate · assertStatus · Response JSON)
- Fixtures (loaddata · dumpdata · JSON Fixtures · Factory Boy · Faker · pytest-django)
- Mocking (unittest.mock · patch · MagicMock · Mock Side Effects · External Services)
- Integration Testing (Database · Signals · Email · Celery Tasks · Storage Backends)
- Coverage Tools (coverage.py · pytest-cov · Minimum Coverage · CI Enforcement)
- Factory Boy (ModelFactory · LazyAttribute · SubFactory · Sequences · Traits)
- pytest-django (pytest fixtures · db fixture · rf · client · settings · --create-db)

---

## Logging & Monitoring

- Logging Configuration (LOGGING dict · Handlers · Formatters · Loggers · Levels · Propagation)
- Error Tracking — Sentry (sentry-sdk · Django Integration · Performance Monitoring · Alerts · Releases)
- Monitoring — Prometheus (django-prometheus · Metrics Endpoint · Grafana · Custom Metrics)
- Performance Monitoring (Scout APM · New Relic · Datadog · P95 Latency · Slow Query Alerts)
- Audit Logs (django-auditlog · django-simple-history · FieldHistory · Compliance Requirements)
- Health Checks (django-health-check · /health/ endpoint · Database · Cache · Queue · Storage)

---

## Deployment & DevOps

- WSGI Servers (Gunicorn · uWSGI · Workers · Threads · Worker Class · Timeout · Preload App)
- ASGI Servers (Daphne · Uvicorn · Hypercorn · Workers · Lifespan)
- Nginx Configuration (Proxy Pass · Static Files · SSL Termination · Rate Limiting · Gzip)
- Dockerizing Django Apps (Dockerfile · Multi-stage · docker-compose · Entrypoint · Healthcheck)
- Environment Variables (django-environ · python-decouple · .env Files · SECRET_KEY · DEBUG)
- CI/CD Integration (GitHub Actions · Tests · Linting · Migrations Check · Deployment · Preview Envs)
- Kubernetes Deployment (Deployment · Service · ConfigMap · Secret · HPA · Ingress · Migrations Job)
- Django on Heroku / Railway / Render (Procfile · collectstatic · DATABASE_URL · Release Phase)

---

## Database Integration

- PostgreSQL Integration (psycopg2 · psycopg3 · JSON Fields · Array Fields · Full-text Search · Extensions)
- MySQL Integration (mysqlclient · Charset · Collation · Strict Mode · Alternatives)
- SQLite (Development Use · Testing · In-memory DB · Limitations · Not for Production)
- Connection Pooling (PgBouncer · CONN_MAX_AGE · pgpool-II · Serverless DB Connection Management)
- Database Scaling (Read Replicas · DATABASE_ROUTERS · Sharding · Partitioning · TimescaleDB)
- Full-text Search in Django (SearchVector · SearchQuery · SearchRank · Trigram · PostgreSQL GIN)

---

## Advanced Django Patterns

- Signals (pre_save · post_save · pre_delete · m2m_changed · Avoiding Infinite Loops · Testing Signals)
- Custom Middleware (Authentication · Logging · Request ID · Timing · Correlation IDs)
- Custom Template Tags (simple_tag · inclusion_tag · assignment_tag · Library Registration)
- Service Layer Pattern (Business Logic in Services · Thin Views · Fat Models vs Services · Reusability)
- Repository Pattern (Abstracting DB Access · Testability · Swappable Backends)
- Clean Architecture in Django (Domain · Application · Infrastructure · Presentation · Dependency Rule)
- DDD — Domain Driven Design (Aggregates · Entities · Value Objects · Repositories · Domain Events)
- CQRS in Django (Command QuerySets · Separate Read/Write Models · Performance Benefits)
- Event Sourcing in Django (Event Store · Projections · Replaying Events · django-eventsourcing)

---

## Django + AI Integration

- OpenAI API Integration (openai SDK · ChatCompletion · Streaming · Error Handling · Cost Control)
- AI Chatbot Backend (Session Memory · Context Window · User History · Streaming SSE Response)
- RAG Systems Backend (Chunking · Embedding Pipeline · Vector Storage · Retrieval · Context Injection)
- Vector DB Integration (Pinecone · Chroma · pgvector · Weaviate · Similarity Search · Upsert · Query)
- AI Agent Backend (Tool Definitions · Function Calling · Multi-step Execution · State Machine)
- AI File Processing (PDF Parsing · Image Description · Audio Transcription · Multimodal)
- AI Streaming Responses (StreamingHttpResponse · SSE · EventSource · Token-by-token · Flush)
- AI Cost Tracking (Token Counting · Budget Limits · Per-user Quotas · Usage Logging · tiktoken)
- LangChain with Django (Chain Integration · Memory · Tools · Agent Backends · API Keys)
- Celery + AI (Async AI Tasks · Long-running Jobs · Result Polling · Webhook Callbacks)

---

## Microservices & Scaling

- Monolith vs Microservices (When to Split · Conway's Law · Strangler Fig · Tradeoffs)
- Service Decomposition (Bounded Contexts · Anti-corruption Layer · API Gateway · Data Ownership)
- API Gateway Integration (Kong · AWS API Gateway · Authentication · Rate Limiting · Routing)
- Event-driven Architecture (Django Signals as Events · Kafka · RabbitMQ · Outbox Pattern)
- Message Queues (Kafka Integration · RabbitMQ · Celery as Worker · Message Schema · Dead Letter Queue)
- Distributed Systems Patterns (Idempotency · Retry · Circuit Breaker · Saga · Compensating Transactions)

---

## Real-world Systems with Django

- E-commerce Backend (Products · Cart · Orders · Inventory · Checkout Flow · Discount Engine)
- Booking System (Availability · Calendar · Conflict Detection · Notifications · Cancellations)
- Social Media Backend (Follow · Feed · Like · Comment · Notification · Activity Stream)
- Chat System Backend (Channels · Messages · Presence · Read Receipts · Typing Indicators)
- Payment Integration (Stripe · Razorpay · Webhooks · Idempotency · Refunds · Subscription Billing)
- Notification System (Email · SMS · Push · In-app · django-notifications · Celery + Firebase)
- Search System (Elasticsearch · django-elasticsearch-dsl · Haystack · Typesense · Full-text · Facets)
- Analytics Dashboard Backend (Event Tracking · Aggregations · Time-series · Clickhouse · Reporting API)
- Multi-tenant Architecture (Schema-per-tenant · Row-level · django-tenants · Subdomain Routing)
