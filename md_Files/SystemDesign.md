# 8 System Design

---

## Fundamentals

- What is System Design (HLD vs LLD · Goals · Tradeoffs · Ambiguity Handling · Communication)
- Types of System Design (Monolith · Distributed · Microservices · Serverless · Event-driven)
- Functional Requirements — FR (Core Features · User Stories · API Contracts · Business Logic)
- Non-Functional Requirements — NFR (Scalability · Availability · Reliability · Maintainability · Durability · Security · Performance · Observability)
- Latency vs Throughput (Response Time · Requests/sec · Little's Law · Optimizing Both · Amdahl's Law)
- Availability (99.9% · 99.99% · Five 9s · SLA · Downtime Budget · HA Patterns)
- Reliability (MTBF · MTTR · Failure Rate · Redundancy · Graceful Degradation)
- Capacity Planning (Traffic Estimation · DAU/MAU · Peak Traffic · Storage Estimation · Growth)
- Back-of-the-envelope Calculations (Powers of 10 · Memory Numbers · Disk Numbers · Network Numbers · Latency Numbers)
- Bottleneck Identification (CPU · I/O · Network · Memory · Database · Hotspots · Profiling)

---

## Architecture Styles

- Monolithic Architecture (Single Deployable · Simple · Scaling Challenges · When to Use · Modular Monolith)
- Microservices Architecture (Service Decomposition · Bounded Context · Independent Deploy · Data Ownership)
- Service-Oriented Architecture — SOA (ESB · SOAP · Enterprise · vs Microservices)
- Event-driven Architecture (Producer · Consumer · Broker · Decoupling · Async · Event Types)
- Serverless Architecture (FaaS · BaaS · Stateless · Cold Start · Cost Model · Vendor Lock-in)
- Layered Architecture (Presentation · Business · Data · Separation of Concerns · N-tier)
- Hexagonal Architecture (Ports & Adapters · Domain Core · Inbound/Outbound Ports · Adapters · Testability)
- Clean Architecture (Entities · Use Cases · Interface Adapters · Frameworks · Dependency Rule)
- Domain Driven Design — DDD (Bounded Context · Aggregate · Entity · Value Object · Repository · Domain Event · Ubiquitous Language)
- CQRS (Command Query Responsibility Segregation · Command Model · Query Model · Read/Write Separation)
- Event Sourcing (Event Store · Append-only · Projections · Replay · Snapshots · Temporal Queries)

---

## Networking Fundamentals

- OSI Model (Physical · Data Link · Network · Transport · Session · Presentation · Application)
- TCP vs UDP (Connection · Reliability · Ordering · Use Cases · Three-way Handshake · Head-of-line)
- HTTP/HTTPS (Headers · Methods · Status Codes · Keep-alive · Pipelining · TLS Overhead)
- HTTP/2 (Multiplexing · Header Compression · Server Push · Binary Protocol · Stream Priority)
- HTTP/3 & QUIC (UDP-based · 0-RTT · Connection Migration · Head-of-line Elimination · Adoption)
- DNS (Resolution · Recursive · Authoritative · Caching · TTL · Geo DNS · DNS Load Balancing)
- TLS/SSL (Handshake · Certificates · CA · mTLS · HSTS · Certificate Pinning · TLS 1.3)
- WebSockets (Full-duplex · Upgrade · Heartbeat · Scale-out · Load Balancing WS · Use Cases)
- gRPC vs REST (HTTP/2 · Protobuf · Strong typing · Streaming · Browser support · Service-to-service)
- API Gateway (Routing · Auth · Rate Limit · Transform · Aggregate · Circuit Break · Observability)
- Reverse Proxy (Nginx · Envoy · HAProxy · SSL Termination · Load Balancing · Caching)
- Service Mesh (Istio · Linkerd · Sidecar · mTLS · Traffic Management · Observability · Discovery)
- CDN (Edge Locations · Cache-Control · Origin Shield · Cache Invalidation · Dynamic CDN)

---

## Load Balancing & Traffic Management

- Load Balancers L4 vs L7 (TCP/UDP · HTTP · SSL Termination · Content-based Routing · Features)
- Algorithms (Round Robin · Weighted RR · Least Connections · IP Hash · Random · Consistent Hash)
- Consistent Hashing (Ring · Virtual Nodes · Hot Spot · Node Add/Remove · Cassandra · DynamoDB)
- Global Load Balancing (Geo-routing · Latency-based · Failover · Anycast · AWS Global Accelerator)
- Traffic Shaping (Throttling · Burst · Priority Queues · QoS · Traffic Policing)
- Rate Limiting (Token Bucket · Leaky Bucket · Fixed Window · Sliding Window · Distributed · Redis)
- Circuit Breaker (Closed · Open · Half-open · Hystrix · Polly · Timeout · Fallback · Retry)
- Bulkhead Pattern (Isolation · Thread Pools · Connection Pools · Service Partitioning · Resource Limits)
- Backpressure (Flow Control · Consumer Signals · Queue Full · Slow Producer · Reactive Streams)

---

## Database Design (Ultra Deep)

- Relational Databases (PostgreSQL · MySQL · ACID Properties · Tables · Rows · Columns · Constraints)
- ACID (Atomicity · Consistency · Isolation · Durability · Isolation Levels · Trade-offs)
- NoSQL Databases (Key-value · Document · Wide-column · Graph · Time-series · Multi-model)
- Key-value Stores (Redis · DynamoDB · Riak · Simple · Fast · Cache · Session · Use Cases)
- Document Databases (MongoDB · CouchDB · Firestore · Flexible Schema · JSON · Nested Data)
- Wide-column Databases (Cassandra · HBase · Bigtable · Column Families · Row Key · Partitioning)
- Graph Databases (Neo4j · Neptune · JanusGraph · Nodes · Edges · Properties · Traversal · Cypher)
- Time-series Databases (InfluxDB · TimescaleDB · Prometheus · IoT · Metrics · Downsampling · Retention)
- Database Indexing (B-Tree · Hash · Bitmap · GIN · GiST · Composite · Covering · Partial · Expression)
- Query Optimization (EXPLAIN · Index Selection · Join Order · Materialized Views · Statistics · Hints)
- Transactions (BEGIN · COMMIT · ROLLBACK · Savepoints · Isolation Levels: Read Uncommitted · Read Committed · Repeatable Read · Serializable)
- Database Scaling (Vertical · Horizontal · Connection Pooling · Caching · Denormalization)
- Replication (Master-Slave · Master-Master · Async · Semi-sync · Replica Lag · Failover Promotion)
- Sharding (Horizontal Partitioning · Shard Key · Range · Hash · Directory-based · Cross-shard Queries)
- CAP Theorem (Consistency · Availability · Partition Tolerance · CP systems · AP systems · Trade-offs)
- PACELC Theorem (Latency vs Consistency tradeoff in absence of partition · Extending CAP)
- Consistency Models (Strong · Linearizable · Sequential · Causal · Eventual · Read-your-writes · Monotonic Read)
- Distributed Databases (Spanner · CockroachDB · YugabyteDB · PlanetScale · Vitess · TiDB)
- Data Modeling (Normalization 1NF-3NF-BCNF · Denormalization · Star Schema · Snowflake · EAV · JSONB)
- Data Warehousing (OLAP · Columnar Storage · ETL · ELT · Redshift · BigQuery · Snowflake)
- OLTP vs OLAP (Transactional · Analytical · Hybrid HTAP · Different Optimizations · Use Cases)

---

## Caching Systems

- Caching Fundamentals (Why Cache · Cache Hit/Miss · Cache Ratio · Latency Reduction · Throughput)
- Cache Patterns (Cache-Aside · Write-through · Write-back · Write-around · Read-through)
- Cache Eviction Policies (LRU · LFU · FIFO · MRU · Random · ARC · 2Q · TinyLFU)
- TTL & Expiry (Absolute · Sliding · Stale-while-revalidate · Stale-if-error · Per-key TTL)
- Distributed Caching (Redis · Memcached · Hazelcast · Ehcache · Apache Ignite · NCache)
- Redis Deep Dive (Data Structures · Persistence: RDB/AOF · Clustering · Sentinel · Pub/Sub · Streams · Lua)
- CDN Caching (Edge Cache · Origin Fallback · Cache-Control · Vary Header · Purge · Surrogate Keys)
- Cache Invalidation Strategies (TTL Expiry · Event-based · Write-through · Cache Tags · Versioned Keys)
- Cache Stampede / Thundering Herd (Lock · Probabilistic Early Expiry · Background Refresh · Mutex)
- Hot Key Problem (Key Splitting · Local Cache · Replica Reads · Client-side Caching)

---

## Message Queues & Streaming

- Message Queues (RabbitMQ · SQS · ActiveMQ · Point-to-point · Fan-out · Message Properties)
- Kafka Deep Dive (Topics · Partitions · Offsets · Consumer Groups · Replication · ISR · Leader Election)
- Kafka Architecture (Broker · ZooKeeper vs KRaft · Producer API · Consumer API · Streams · Connect)
- Event Streaming (Ordering · Exactly-once · At-least-once · At-most-once · Delivery Semantics)
- Pub/Sub Architecture (Topic · Subscriber · Push · Pull · Fan-out · Message Filtering · Deadletter)
- Event-driven Design (Domain Events · Integration Events · Event Schema · Schema Registry · Avro/Protobuf)
- Exactly-once Processing (Idempotent Producer · Transactional Consumer · Two-phase Commit · Kafka Exactly-once)
- Stream Processing (Kafka Streams · Flink · Spark Streaming · Aggregations · Windows · Joins)
- Event Replay (Kafka Retention · Replay Consumer Group · Sourcing New Projections · Audit Trail)
- Message Schema (Avro · Protobuf · JSON Schema · Schema Registry · Compatibility · Evolution)
- Dead Letter Queue (Poison Messages · Retry Policy · Manual Inspection · Alerting · Reprocessing)
- Backpressure in Queues (Queue Depth Monitoring · Consumer Lag · Scale Consumers · Circuit Break)

---

## Distributed Systems Core

- Distributed Systems Basics (Fallacies of Distributed Computing · Network Unreliability · Partial Failure)
- Consensus Algorithms (Paxos · Raft · PBFT · Viewstamped Replication · Leader Election · etcd)
- Leader Election (Raft Leader · ZooKeeper · Bully Algorithm · Ring Algorithm · Single Leader)
- Distributed Locks (Redis SETNX · Redlock · ZooKeeper Ephemeral · Pessimistic · Fencing Token)
- Two-Phase Commit — 2PC (Prepare · Commit · Coordinator Failure · Blocking Protocol · XA)
- Three-Phase Commit — 3PC (Non-blocking · CanCommit · PreCommit · DoCommit · Network Partitions)
- Saga Pattern (Choreography · Orchestration · Compensating Transactions · Long-running Transactions)
- Vector Clocks (Causality · Event Ordering · Conflict Detection · Dynamo Paper · vs Lamport Timestamps)
- Lamport Timestamps (Logical Clock · Happened-before · Ordering · Distributed Timestamps)
- CRDTs (Conflict-free Replicated Data Types · G-Counter · LWW-Register · Set · Merge · Collaboration)
- Gossip Protocol (Epidemic · Node Discovery · Health · State Dissemination · Cassandra · Consul)
- Two Generals Problem (Impossibility · TCP and the approximation · Practical implications)
- Byzantine Fault Tolerance (Malicious Nodes · BFT · PBFT · Blockchain · 3f+1 Rule)
- Quorum Systems (Read/Write Quorum · R+W>N · Strong Consistency · Eventual · Tunable)
- Consistent Hashing in Practice (Cassandra · DynamoDB · Caches · Node Weight · Virtual Nodes)

---

## Storage Systems

- Object Storage (S3 · GCS · Azure Blob · Eventual Consistency · Multipart · Presigned · Versioning)
- Block Storage (EBS · Persistent Disks · IOPS · Throughput · Snapshots · Multi-attach)
- File Storage (NFS · EFS · Filestore · POSIX · Shared Mounts · NFS Performance)
- Distributed File Systems (HDFS · Ceph · GlusterFS · Luster · Namenode · Datanode · Replication)
- Data Lakes (Raw Storage · Schema-on-read · Delta Lake · Iceberg · Hudi · Parquet · ORC)
- BLOB Storage Patterns (Chunking · Resumable Uploads · Content Addressing · CDN Integration)
- Geo-replication of Storage (Cross-region · Active-Active · CRR · Conflict Resolution · Latency)

---

## Reliability & Fault Tolerance

- High Availability (HA) Patterns (Active-Passive · Active-Active · N+1 · Geographic Distribution)
- Fault Tolerance (Redundancy · Replication · Checksums · Error Correction · Fail-safe Defaults)
- Retry Mechanisms (Exponential Backoff · Jitter · Max Retries · Timeout · Idempotency Requirement)
- Graceful Degradation (Feature Flags · Fallback · Partial Results · Cache Serve · Skeleton UI)
- Health Checks (Liveness · Readiness · Startup · Deep Health · Dependency Checks · Circuit Trigger)
- Chaos Engineering (Fault Injection · Chaos Monkey · GameDay · Hypothesis · Blast Radius · Steady State)
- Self-healing Systems (Auto-restart · Auto-scaling · Circuit Breaker · Adaptive Timeouts · Auto-remediation)
- Disaster Recovery (Backup · RTO · RPO · Failover · DR Drills · Active-Passive · Active-Active · Multi-region)
- Thundering Herd Problem (Cache Expiry · Retry Storms · Mutex Lock · Probabilistic Expiry · Rate Limit)
- Hot Partition Problem (Shard Key Selection · Adaptive Sharding · Write Spreading · Virtual Partitions)
- Cold Start Problem (Serverless · Connection Pools · Pre-warming · Provisioned Concurrency · Keep-alive)

---

## Security in System Design

- Authentication (JWT · OAuth 2.0 · SSO · OpenID Connect · API Keys · Certificate-based · Passwordless)
- Authorization (RBAC · ABAC · ReBAC · OPA · Casbin · Row-level Security · Attribute Policies)
- Encryption (TLS in transit · AES-256 at rest · End-to-end · Key Management · KMS · HSM)
- Secrets Management (Vault · AWS Secrets Manager · Rotation · Injection · Never in Code)
- API Security (Rate Limiting · WAF · Input Validation · OWASP Top 10 · API Gateway Policies)
- Zero Trust Architecture (Never Trust Always Verify · Identity · Device · mTLS · Microsegmentation)
- Defence in Depth (Layered Security · Network · Application · Data · Identity · Monitoring)
- DDoS Protection (Scrubbing · Anycast · Rate Limiting · Shield · WAF · Throttling · Captcha)

---

## Observability

- Logging Architecture (Centralized · Structured · Correlation ID · Log Levels · Retention · ELK · Loki)
- Metrics Architecture (Time-series · Prometheus · Push vs Pull · Counters · Gauges · Histograms)
- Distributed Tracing (Trace · Span · Context Propagation · Sampling · Jaeger · Zipkin · OTEL)
- Alerting Design (SLO-based · Burn Rate · Alert Fatigue · Actionable · Escalation · Runbook Links)
- APM (Application Performance Monitoring) (Latency · Error Rate · Throughput · Saturation · Apdex · Profiling)
- SLO/SLI/SLA Design (Define Reliability Target · Error Budget · Burn Rate · Toil · Rolling Window)

---

## Design Patterns

- API Gateway Pattern (Entry Point · Auth · Aggregation · Rate Limiting · Circuit Breaker · Logging)
- Sidecar Pattern (Container alongside · Service Mesh · Logging · Auth · Configuration · Envoy)
- Ambassador Pattern (Proxy · Remote Service · Connection Pooling · SSL · Monitoring · Client-side)
- Adapter Pattern (Interface Translation · Legacy Integration · Protocol Conversion · Compatibility)
- CQRS (Separate Command and Query · Different Models · Event-driven Updates · Eventual Consistency)
- Event Sourcing (Immutable Log · State Reconstruction · Temporal Queries · Audit Log · Snapshots)
- Outbox Pattern (Reliable Events · Transactional Outbox · CDC · Atomicity · At-least-once Delivery)
- Saga Orchestration (Coordinator · Step-by-step · Compensate · Rollback · Idempotent Steps)
- Saga Choreography (Events · Local Transactions · Decentralized · Harder to Debug · Flexibility)
- Strangler Fig Pattern (Incremental Migration · Proxy · Legacy → New · Risk Reduction · Side-by-side)
- Backends for Frontends — BFF (Per-client API · Mobile · Web · Aggregate · Tailor · Reduce Over-fetch)
- Anti-corruption Layer (Domain Protection · Legacy Integration · Translation · Façade · Adapter)

---

## Scaling Strategies

- Vertical Scaling (Bigger Machine · CPU · RAM · SSD · Limits · Simple · vs Horizontal)
- Horizontal Scaling (More Machines · Stateless · Load Balancer · Auto-scaling · Elasticity)
- Auto Scaling (CPU-based · Queue-based · Custom Metrics · KEDA · Predictive · Scheduled)
- Database Scaling (Read Replicas · Connection Pooling · Caching · Sharding · Partitioning · CQRS)
- Caching Layers (L1: Local · L2: Distributed · L3: CDN · Cache Hierarchy · Read Amplification)
- Async Processing (Queue offload · Decouple · Rate control · Retry · Fan-out · Priority)
- Microservices Scaling (Independent Scale · Resource Optimisation · Kubernetes HPA · Per-service)
- Global Scaling (Multi-region · Data Sovereignty · Replication Lag · Conflict Resolution · Latency)

---

## Real-world System Designs (Classics)

- URL Shortener (Hash · Redirect · Analytics · Custom Aliases · TTL · Scale Reads · 302 vs 301)
- Paste Bin (Text Storage · Unique ID · Expiry · Access Control · Syntax Highlighting · CDN)
- Rate Limiter (Token Bucket · Redis · Distributed · Per-user · API Gateway · Sliding Window)
- Web Crawler (BFS · Robots.txt · Frontier · Dedup · DNS Cache · Politeness · Distributed · Bloom Filter)
- Search Engine (Crawl · Index · Inverted Index · TF-IDF · BM25 · PageRank · Query Processing · Ranking)
- Instagram / Photo Sharing (Upload · CDN · Feed Gen · Celebrity Problem · Fanout · Stories · Sharding)
- Twitter / Feed System (Fan-out on Write · Fan-out on Read · Hybrid · Timeline · Tweet Storage · Trends)
- WhatsApp / Chat System (WebSocket · Message Storage · Delivery Receipt · Encryption · Groups · Status)
- Notification System (Push · Email · SMS · Template · Priority · Rate Limit · Dedup · Preference)
- News Feed (Publish-subscribe · Pull vs Push · Celebrity Problem · Ranking · Personalisation)
- Google Drive / Dropbox (Chunked Upload · Delta Sync · Conflict · Version History · Sharing · CDN)
- YouTube / Netflix (Video Upload · Transcoding · CDN · Adaptive Bitrate · Recommendation · DRM)
- Uber / Ride Sharing (Location · Matching · Surge · Trip · Driver Supply · ETA · Payments · Maps)
- Food Delivery (Restaurant · Menu · Order · Assignment · Tracking · ETA · Notification · Payments)
- Payment System (Ledger · Double-entry · Idempotency · Fraud · Settlement · Reconciliation · PCI)
- Ad Serving System (Targeting · Auction · Real-time Bidding · Click Tracking · Budget · Fraud · DSP)
- Recommendation System (Collaborative Filtering · Content-based · Matrix Factorisation · DL · A/B)
- Distributed ID Generator (Snowflake · UUID · ULID · Twitter Snowflake · Counter · Time-based)
- Typeahead / Autocomplete (Trie · Prefix Tree · Top-k · Caching · Distributed Trie · Fuzzy)
- Distributed Message Queue (Kafka Design · At-least-once · Partitioning · Replication · Consumer Groups)
- Google Maps / Location (Geohash · QuadTree · Road Network · Dijkstra · A* · ETA · Live Traffic)
- Stock Exchange (Matching Engine · Order Book · L2 Market Data · Ultra-low Latency · FIFO)
- Hotel/Flight Booking (Availability · Inventory Lock · Overbooking · Payment · Idempotency · Search)

---

## AI System Design (Modern & Critical)

- LLM System Design (Inference Pipeline · Context Management · Scaling · KV Cache · Load Balancing)
- RAG System Design (Ingestion Pipeline · Vector Store · Retrieval · Reranking · Context Injection · Eval)
- AI Chatbot System (Multi-turn · Session Memory · Streaming · SSE · Rate Limiting · Safety · Cost)
- AI Agent System (Planning Loop · Tool Registry · Memory · Orchestration · Multi-agent · Monitoring)
- Vector Search System (ANN · HNSW · IVF · Quantization · Filtering · Freshness · Scale · Recall)
- Embedding Pipeline (Document → Chunk → Embed → Upsert · Incremental Update · Deduplication)
- Multimodal AI System (Vision + Text + Audio · Cross-modal Retrieval · Unified Embedding · Routing)
- AI Data Pipeline (ETL · Quality · Deduplication · Versioning · Feature Store · Training vs Serving)
- AI Model Serving (Online · Batch · Shadow · Multi-model · A/B · Canary · Traffic Splitting)
- AI Cost Optimization (Caching · Semantic Cache · Model Routing · Batch API · Prompt Compression)
- AI Observability System (Prompt Logging · Token Tracking · Latency · Hallucination Monitor · Drift)
- AI Safety System (Guardrails · Input Classification · Output Filtering · PII Redaction · Red Teaming)
- AI Workflow Orchestration (DAG · LangGraph · Retry · Parallelism · Human-in-the-loop · Streaming)
- Semantic Cache (Query Embedding · Similarity Threshold · Redis · Approximate Match · TTL)

---

## Cloud-native System Design

- Cloud Native Architecture (12-Factor · Containerized · Microservices · Declarative · Elastic · Resilient)
- Multi-region Deployment (Active-Active · Active-Passive · Traffic Manager · Geo-routing · Data Residency)
- Global Systems (Spanner · CockroachDB · Multi-master · Conflict · Eventual Consistency · Latency)
- Edge Computing (Edge Functions · CDN Compute · IoT · Low Latency · Offline-first · 5G Edge)
- Serverless System Design (FaaS · Cold Start · State · Async · Orchestration · Vendor Lock-in)
- Kubernetes-based Architecture (Helm Charts · Operators · GitOps · Service Mesh · Autoscaling)
- Hybrid & Multi-cloud (Vendor Neutral · Kubernetes · Terraform · Federated Identity · Data Replication)

---

## Advanced Topics — Elite Level

- Latency Optimization (P99 Focus · Tail Latency · Co-efficient of Variation · Hedged Requests · Timeout)
- Throughput Optimization (Batching · Pipelining · Parallelism · Non-blocking I/O · Connection Pooling)
- Data Consistency Tradeoffs (Tunable Consistency · Quorum · Read-repair · Hinted Handoff · Anti-entropy)
- Cost Optimization in Design (Efficient Data Structures · Caching · Storage Tiering · Spot Instances)
- Hot Partition Problem (Write Spreading · Salting · Adaptive Sharding · Read Replicas · Monitoring)
- Thundering Herd (Cache Stampede · Mutex · PER Algorithm · Background Refresh · Rate Limit)
- Cold Start Problem (Pre-warming · Provisioned Capacity · Lazy Init · Connection Pool Pre-warm)
- Backpressure Handling (Reactive Streams · Bounded Queues · Drop Policy · Consumer Signal · TCP)
- Geographic Data Distribution (Data Sovereignty · Replication Lag · Read Local · Write Primary · CRDT)
- Interview Framework (Requirements · Scale Estimation · API Design · Data Model · HLD · Deep Dive · Bottlenecks)
