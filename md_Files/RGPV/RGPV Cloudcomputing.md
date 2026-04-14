# ☁️ Cloud Computing — CS802 (B)

---

## Unit I — SOA, Web Services & Cloud Service Models

- Service Oriented Architecture — SOA (Loose Coupling · Services as Building Blocks · Discoverability · Interoperability · Reusability · Composability · Statelessness · Abstraction)
- Web Services (Platform-independent · XML-based · Internet-accessible · Self-describing · WSDL · SOAP · UDDI · HTTP transport)
- Basic Web Services Architecture (Service Provider · Service Requester · Service Broker · Publish · Find · Bind · SOAP messages · WSDL description)
- SOAP — Simple Object Access Protocol (XML envelope · Header · Body · Fault · RPC style · Document style · HTTP/SMTP transport · WSDL binding)
- WSDL — Web Services Description Language (Types · Message · PortType · Binding · Service · Port · Operations · Abstract vs Concrete definitions)
- UDDI — Universal Description Discovery & Integration (White Pages · Yellow Pages · Green Pages · tModel · BusinessEntity · BusinessService · BindingTemplate)
- RESTful Services — Definition (Representational State Transfer · Stateless · Client-Server · HTTP verbs · URI-addressed resources · Hypermedia)
- RESTful Characteristics (Statelessness · Cacheability · Uniform Interface · Layered System · Code on Demand · Client-Server Separation)
- RESTful Components (Resources · URIs · Representations · HTTP Methods: GET POST PUT DELETE PATCH · Status Codes · Headers · Media Types)
- REST Types (Level 0: HTTP transport · Level 1: Resources · Level 2: HTTP Verbs · Level 3: Hypermedia — Richardson Maturity Model)
- SaaS — Software as a Service (No installation · Browser-based · Multi-tenancy · Subscription pricing · Vendor manages all · Examples: Gmail · Salesforce · Office 365)
- PaaS — Platform as a Service (Runtime · Middleware · Databases · Dev tools · Auto-scaling · Examples: Heroku · Google App Engine · Azure App Service)
- Organizational Cloud Scenarios (Public Cloud · Private Cloud · Hybrid Cloud · Community Cloud · Multi-cloud · Cloud bursting)
- Administering Cloud Services (Provisioning · Configuration management · Identity & Access Management · Cost management · SLA monitoring)
- Monitoring Cloud Services (Metrics · Logs · Traces · Alerting · Dashboards · CloudWatch · Azure Monitor · Google Cloud Operations)
- Benefits of Cloud (CAPEX → OPEX · Pay-per-use · Scalability · Global reach · High availability · Disaster recovery · Innovation speed)
- Limitations of Cloud (Vendor lock-in · Latency · Data sovereignty · Internet dependency · Hidden costs · Compliance challenges)
- Hypervisor — Study (Type 1: Bare-metal — VMware ESXi, KVM, Hyper-V · Type 2: Hosted — VirtualBox, VMware Workstation · CPU virtualization · Memory ballooning · Device emulation)

---

## Unit II — Utility, Elasticity, Virtualization & Multi-tenancy

- Utility Computing (Pay-per-use · Metered services · Computing as electricity · Amazon EC2 origins · Grid computing roots · SLA-backed consumption)
- Elastic Computing (Auto-scaling · Scale-out vs Scale-up · Elasticity triggers · Cloud Watch Alarms · Min/Max capacity · Cooldown periods)
- AJAX — Asynchronous Rich Interfaces (XMLHttpRequest · JSON · Partial page updates · fetch API · Callback · Promises · Async/Await · SPA pattern)
- Mashups (API aggregation · User Interface mashups · Data mashups · Process mashups · Google Maps API mashups · Open APIs · iGoogle style)
- Mashup Types (Consumer mashups · Enterprise data mashups · Business process mashups · REST APIs as mashup source)
- Virtualization Technology (Hypervisor · Full virtualization · Para-virtualization · OS-level virtualization · Hardware-assisted VT-x/AMD-V)
- Virtualization in Enterprises (Server consolidation · Desktop virtualization — VDI · Network virtualization — NFV/SDN · Storage virtualization · Application virtualization)
- Pitfalls of Virtualization (VM sprawl · Noisy neighbor problem · Licensing complexity · Performance overhead · Security blast radius · Single point hypervisor failure)
- Multi-tenant Software (Shared infrastructure · Multiple customers on same instance · Resource isolation · Data isolation · Customization per tenant)
- Multi-entity Support (Tenant ID in every record · Row-level security · Tenant-aware APIs · Namespace isolation · Per-tenant quotas)
- Multi-schema Approach (Separate schema per tenant · Shared database · Logical isolation · Schema routing · Flyway/Liquibase per schema)
- Multi-tenancy Using Cloud Data Stores (DynamoDB partition keys · Azure Cosmos DB containers · Google Datastore namespaces · Tenant-prefixed S3 buckets)

---

## Unit III — Cloud Data, Distributed File Systems & MapReduce

- Data in the Cloud (Relational · NoSQL · NewSQL · Object storage · File storage · Block storage · Data lakes · Time-series)
- Relational Databases in Cloud (Amazon RDS · Azure SQL Database · Google Cloud SQL · Managed PostgreSQL/MySQL · Read replicas · Multi-AZ · Automated backups)
- Cloud File Systems — GFS (Google File System) (Master-ChunkServer architecture · 64 MB chunks · Chunk replication ×3 · Append-optimized · Fault tolerant · Large files)
- GFS Architecture (Single master · Multiple chunk servers · Client caches metadata · Chunk handles · Heartbeat · Re-replication · Garbage collection)
- HDFS — Hadoop Distributed File System (GFS-inspired · NameNode · DataNodes · Block size 128MB · Rack-aware replication · Federation · HDFS HA)
- HDFS Architecture (NameNode — metadata · Secondary NameNode — checkpoint · DataNodes — blocks · Rack topology · Replication pipeline · Heartbeat 3 sec)
- GFS vs HDFS Comparison (Google internal vs open-source · Append only vs general purpose · Master vs NameNode · Chunkserver vs DataNode · File size · Fault recovery)
- BigTable (Google's wide-column store · Row key · Column family · Timestamp · Tablet servers · SSTable · Bloom filters · Compaction · Bigtable → HBase)
- HBase (Open-source BigTable · Built on HDFS · HMaster · RegionServer · Row key design · Compression · Bloom filters · Phoenix SQL layer · Real-time random access)
- Dynamo (Amazon's key-value store · Eventual consistency · Vector clocks · Consistent hashing · Gossip protocol · Sloppy quorum · Read repair · CAP: AP system)
- MapReduce Model (Map phase: key-value pairs · Shuffle & Sort · Reduce phase: aggregation · Combiner · Partitioner · JobTracker · TaskTracker)
- Parallel Efficiency of MapReduce (Data locality · Speculative execution · Heartbeat · Task scheduling · Stragglers · Map vs Reduce slots)
- Relational Operations in MapReduce (Selection · Projection · Join — reduce-side join, map-side join · Group By · Aggregation · Union)
- Enterprise Batch Processing (ETL pipelines · Log processing · Billing aggregation · Recommendation engine training · Index building)
- MapReduce Applications (Word count · PageRank · Inverted index · Log analysis · Machine learning feature extraction · Graph processing)

---

## Unit IV — Cloud Security

- Cloud Security Fundamentals (Shared responsibility model · CIA triad · Identity · Encryption · Network security · Compliance)
- Shared Responsibility Model (IaaS: user manages OS/app · PaaS: user manages app only · SaaS: vendor manages all · Security OF cloud vs IN cloud)
- Vulnerability Assessment for Cloud (CVE scanning · Pen testing · Cloud Security Posture Management — CSPM · Prowler · Scout Suite · Nessus · Cloud Custodian)
- Privacy in Cloud (Data residency · GDPR · CCPA · Data minimization · Pseudonymization · Encryption at rest and in transit · Right to erasure)
- Cloud Security Architecture (Defense in depth · Perimeter security · IAM · Encryption layers · SIEM · Zero Trust model · Micro-segmentation)
- General Security Issues (Data breaches · Account hijacking · Insider threats · Shared technology vulnerabilities · Data loss · Insecure APIs)
- Trusted Cloud Computing (TPM — Trusted Platform Module · Measured boot · Attestation · Intel TXT · AWS Nitro · Azure Confidential Computing)
- Virtualization Security — Virtual Threats (VM escape · Hyperjacking · VM-to-VM attacks · Rogue hypervisor · Side-channel attacks — Spectre/Meltdown)
- VM Security Recommendations (Patch management · VM image hardening · Least privilege · Network ACLs · Encrypted volumes · Immutable infrastructure)
- VM-Specific Security Techniques (VLAN isolation · VM introspection · Hypervisor-based IDS · Memory encryption — AMD SEV, Intel TME · Secure boot)
- Secure Execution Environments (Intel SGX enclaves · AMD SEV · AWS Nitro Enclaves · Azure Confidential VMs · Homomorphic encryption · Secure multi-party computation)
- Secure Communications in Cloud (TLS 1.3 · VPN tunnels · AWS PrivateLink · Azure Private Endpoints · mTLS · Service mesh — Istio · Certificate management)

---

## Unit V — Cloud Issues, Mobile Cloud, Load Balancing & Platforms

- Issues in Cloud Computing (Vendor lock-in · Data portability · SLA violations · Compliance · Governance · Cost unpredictability · Latency · Connectivity dependency)
- Real-Time Applications in Cloud (WebSockets · Long polling · Server-Sent Events · Apache Kafka · AWS Kinesis · Socket.io · Sub-10ms latency requirements)
- QoS in Cloud (Latency · Throughput · Availability · Reliability · Jitter · SLA metrics · MTTR · MTBF · Error rates · Percentile latencies p99/p999)
- Dependability in Cloud (Fault tolerance · Redundancy · Replication · Failover · Disaster recovery · RPO · RTO · Chaos engineering — Netflix Chaos Monkey)
- Data Migration in Cloud (Lift-and-shift · Re-platform · Refactor · AWS DMS · Azure Migrate · Google Transfer Service · Snowball · Network bandwidth planning)
- Streaming in Cloud (Apache Kafka · AWS Kinesis · Google Pub/Sub · Apache Flink · Spark Streaming · Windowing · Micro-batching · Event-time vs processing-time)
- Cloud Middleware (Message queues: SQS · RabbitMQ · Service bus · ESB · API Gateway · Service mesh · Event-driven architecture · CQRS · Saga pattern)
- Mobile Cloud Computing (Offloading computation · MCC architecture · Cloudlet · Thin client · Context-aware · Battery optimization · 4G/5G dependency)
- Inter-Cloud Issues (Federation · Portability · Interoperability · Standards: TOSCA · OCCI · CDMI · Broker models · Cloud exchange · Cost arbitrage)
- Grid of Clouds (Federation of clouds · Distributed resource management · OGSA · HTCondor · Globus Toolkit · Scientific computing · Academic clouds)
- Sky Computing (Inter-cloud layer · Unified API · Cloud abstraction · Broker-mediated · Nimbus · Reservoir project · Eurocloud)
- Load Balancing (Round robin · Least connections · IP hash · Weighted · DNS-based · L4 vs L7 LB · AWS ELB/ALB/NLB · HAProxy · Nginx · Consistent hashing)
- Resource Optimization (Right-sizing · Reserved instances · Spot/Preemptible instances · Savings plans · Idle resource cleanup · Auto-scaling policies · FinOps)
- Resource Dynamic Reconfiguration (Live migration · Hot add CPU/RAM · Elastic volumes · Auto-scaling groups · NUMA balancing · CGroups · Resource quotas)
- Monitoring in Cloud (Metrics: CloudWatch · Azure Monitor · Prometheus · Grafana · Logs: CloudTrail · Traces: Jaeger · X-Ray · APM: Datadog · New Relic)
- Cloud Platform Installation & Evaluation (OpenStack · CloudStack · Eucalyptus · OpenNebula · Benchmarking: SPEC Cloud · CloudSuite · PerfKit · Latency testing)
- Cloud Platform Features (Multi-region · IAM · Marketplace · Auto-scaling · Managed databases · CDN · DNS · Object storage · Serverless · Container orchestration)

---