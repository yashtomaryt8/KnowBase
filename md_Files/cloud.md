# 6 Cloud Engineering

---

## Cloud Fundamentals & Architecture

- Cloud Computing Fundamentals (IaaS · PaaS · SaaS · FaaS · Shared Responsibility Model · Virtualization · Cloud-native Principles · Elasticity · On-demand)
- Cloud Economics (CapEx vs OpEx · Pay-as-you-go · Reserved vs On-demand vs Spot · TCO · Cloud ROI)
- Cloud Architecture Principles (High Availability · Fault Tolerance · Scalability · Cost Optimization · Multi-tier · Event-driven · Resiliency · Well-Architected)
- Cloud Migration (6Rs: Rehost · Replatform · Repurchase · Refactor · Retire · Retain · Migration Factory)
- Cloud Native Principles (12-Factor Apps · Microservices · Immutable Infrastructure · Declarative APIs · Containerization)
- CAP Theorem in Cloud (Consistency · Availability · Partition Tolerance · CP vs AP · Real systems)
- Multi-cloud vs Hybrid Cloud (Vendor Neutrality · Portability · Vendor Lock-in · Failover · Cost Arbitrage)

---

## AWS — Core & Identity

- AWS Global Infrastructure (Regions · Availability Zones · Local Zones · Wavelength Zones · Edge Locations)
- AWS IAM (Users · Groups · Roles · Policies · Inline vs Managed · SCP · Permission Boundaries · ABAC)
- AWS Organizations (Accounts · OUs · SCPs · Consolidated Billing · Control Tower · Landing Zone)
- AWS SSO / IAM Identity Center (SAML · SCIM · Permission Sets · Multi-account Access · External IdP)
- AWS VPC (Subnets · Route Tables · Internet Gateway · NAT Gateway · Peering · Transit Gateway · Endpoints)
- VPC Advanced (Flow Logs · Security Groups · NACLs · Private Link · IPv6 · Egress-only IGW · DNS)

---

## AWS — Compute

- EC2 (Instance Types · AMIs · Placement Groups · Tenancy · User Data · Metadata · Nitro Hypervisor)
- EC2 Purchasing (On-demand · Reserved · Savings Plans · Spot · Dedicated · Capacity Reservations)
- Auto Scaling Groups (Launch Templates · Scaling Policies · Target Tracking · Step · Scheduled · Lifecycle Hooks)
- Elastic Load Balancing (ALB · NLB · Gateway LB · Target Groups · Health Checks · Sticky Sessions · HTTPS)
- AWS Lambda (Function Config · Layers · Extensions · Destinations · Concurrency · Cold Start · SnapStart)
- AWS Fargate (Serverless Containers · ECS + Fargate · EKS + Fargate · Task Definitions · CPU/Memory)
- AWS Batch (Managed Compute · Job Queues · Job Definitions · Arrays · Multi-node · Spot Integration)
- AWS Elastic Beanstalk (Platform as a Service · Environments · Deployment Policies · Extensions · .ebextensions)

---

## AWS — Storage

- Amazon S3 (Buckets · Objects · Versioning · Lifecycle Policies · Replication · Presigned URLs · MFA Delete)
- S3 Storage Classes (Standard · Intelligent-Tiering · Standard-IA · One Zone-IA · Glacier · Glacier Deep Archive)
- S3 Security (Bucket Policies · ACLs · Object Lock · SSE-S3 · SSE-KMS · SSE-C · Public Access Block)
- S3 Performance (Multipart Upload · Transfer Acceleration · S3 Select · Batch Operations · Event Notifications)
- Amazon EBS (Volume Types: gp3 · io2 · st1 · sc1 · Snapshots · Encryption · Multi-attach · Fast Snapshot Restore)
- Amazon EFS (Shared File System · Performance Modes · Throughput Modes · Access Points · Lifecycle · Cross-AZ)
- AWS Storage Gateway (File · Volume · Tape · Hybrid · DataSync · Snow Family)

---

## AWS — Databases

- Amazon RDS (Engines: PostgreSQL · MySQL · MariaDB · Oracle · SQL Server · Multi-AZ · Read Replicas · Proxy)
- Amazon Aurora (Serverless v2 · Global Database · Parallel Query · Backtrack · Cluster Cache · PostgreSQL/MySQL)
- Amazon DynamoDB (Tables · Partition Key · Sort Key · GSI · LSI · Streams · DAX · TTL · Transactions · Capacity Modes)
- Amazon ElastiCache (Redis · Memcached · Cluster Mode · Replication · Eviction Policies · VPC · Encryption)
- Amazon Redshift (Columnar · Distribution Styles · Sort Keys · AQUA · Serverless · RA3 Nodes · Spectrum)
- Amazon DocumentDB (MongoDB-compatible · Clusters · Collections · Encryption · Backups)
- Amazon Neptune (Graph DB · Gremlin · SPARQL · Property Graph · RDF · Bulk Loader)
- Amazon Keyspaces (Managed Cassandra · CQL · Tables · Capacity · Encryption · Point-in-time Recovery)
- Amazon Timestream (Time-series · Ingestion · Query · Storage Tiers · Magnetic Store · Retention)

---

## AWS — Networking

- Route 53 (DNS Types · Routing Policies: Simple · Weighted · Latency · Failover · Geolocation · Multi-value · Health Checks)
- CloudFront (CDN · Distributions · Origins · Behaviours · Cache Policies · WAF Integration · Lambda@Edge · Functions)
- AWS Direct Connect (Dedicated Connections · Virtual Interfaces · Link Aggregation · Gateway · Resilience)
- AWS Transit Gateway (Hub-and-spoke · Route Tables · Peering · Multicast · Network Manager)
- AWS Global Accelerator (Anycast · Static IPs · Traffic Dial · Health Checks · TCP/UDP)
- VPC Endpoints (Gateway Endpoints · Interface Endpoints · Endpoint Services · Private DNS)

---

## AWS — Serverless

- AWS Lambda Deep Dive (Execution Environment · Init Phase · SnapStart · Provisioned Concurrency · Extensions)
- API Gateway (REST · HTTP · WebSocket · Stages · Throttling · Caching · Lambda Proxy · Custom Authorizer)
- AWS Step Functions (State Machines · Standard vs Express · Activities · Wait · Map · Parallel · Error Handling)
- AWS AppSync (GraphQL · Resolvers · Data Sources · Real-time Subscriptions · Pipeline Resolvers)
- EventBridge (Event Bus · Rules · Targets · Schema Registry · Pipes · Archive · Replay · SaaS Integrations)
- AWS SAM (Serverless Application Model · Template · Local Testing · Layers · Nested Apps · Deploying)

---

## AWS — Messaging

- Amazon SQS (Standard · FIFO · Visibility Timeout · Dead Letter Queue · Long Polling · Extended Client)
- Amazon SNS (Topics · Subscriptions · Fan-out · FIFO · Message Filtering · Cross-account · DLQ)
- Amazon Kinesis (Data Streams · Firehose · Data Analytics · Video Streams · Enhanced Fan-out · Shard)
- Amazon MSK (Managed Kafka · Brokers · Configurations · IAM Auth · Private Connectivity · Tiered Storage)
- Amazon MQ (ActiveMQ · RabbitMQ · Managed Broker · Network of Brokers · Failover)

---

## AWS — Security

- AWS KMS (CMKs · Key Policies · Key Rotation · Data Keys · Envelope Encryption · Multi-region Keys)
- AWS Secrets Manager (Rotation · Lambda Rotation · Cross-account · SDK Integration · vs Parameter Store)
- AWS WAF (Web ACLs · Rule Groups · Managed Rules · IP Sets · Bot Control · Rate Limiting · Fraud Control)
- AWS Shield (Standard · Advanced · DDoS Protection · Route 53 · CloudFront · Proactive Engagement)
- AWS GuardDuty (Threat Detection · Findings · S3 Protection · EKS Audit · RDS Protection · Malware)
- AWS Inspector (EC2 Scanning · ECR Scanning · Lambda Scanning · SBOM · Risk Score · Suppression)
- AWS Security Hub (Findings Aggregation · CSPM · CIS Benchmarks · Cross-account · Automations)
- AWS Config (Resource Inventory · Config Rules · Remediation · Conformance Packs · Timeline)
- AWS CloudTrail (API Logging · Data Events · Insights · Organisation Trail · Log File Validation)

---

## AWS — DevOps & Monitoring

- Amazon CloudWatch (Metrics · Logs · Dashboards · Alarms · Anomaly Detection · Contributor Insights · EMF)
- AWS X-Ray (Distributed Tracing · Service Map · Annotations · Metadata · Sampling · Groups · Insights)
- AWS CodePipeline (Stages · Actions · Artifacts · Cross-region · Cross-account · Event Sources)
- AWS CodeBuild (Build Specs · Caching · VPC Access · Privileged Mode · Reports · Local Build)
- AWS CodeDeploy (EC2/ECS/Lambda · Deployment Configurations · Hooks · Rollback · Blue-green)
- AWS CloudFormation (Stacks · Nested Stacks · Change Sets · Drift Detection · Stacksets · CDK)
- AWS CDK (L1/L2/L3 Constructs · App · Stack · Aspects · Context · Pipelines Construct · Testing)

---

## AWS — AI/ML Services

- Amazon SageMaker (Studio · Training Jobs · Endpoints · Pipelines · Feature Store · Ground Truth · Clarify)
- Amazon Bedrock (Foundation Models · Claude · Titan · Llama · Knowledge Bases · Agents · Guardrails)
- Amazon Rekognition (Image Analysis · Video Analysis · Labels · Faces · Celebrities · Content Moderation)
- Amazon Comprehend (NLP · Entities · Sentiment · Key Phrases · PII · Custom Classification)
- Amazon Textract (OCR · Tables · Forms · Queries · AnalyzeID · AnalyzeExpense · Async)
- Amazon Transcribe (Speech-to-Text · Custom Vocabulary · Speaker Diarization · Medical · Streaming)
- Amazon Polly (Text-to-Speech · Neural TTS · SSML · Lexicons · Streaming · Custom Pronunciations)
- Amazon OpenSearch Service (Elasticsearch-compatible · k-NN · Dashboards · Ingestion · Serverless)

---

## AWS — Containers

- Amazon ECS (Clusters · Task Definitions · Services · Fargate · EC2 Launch Type · Service Connect)
- Amazon EKS (Managed Control Plane · Node Groups · Fargate Profiles · Add-ons · IRSA · Blueprint)
- AWS App Mesh (Envoy · Virtual Nodes · Services · Routers · Routes · Gateways)

---

## GCP — Google Cloud Platform

- GCP Core (Projects · IAM · Billing · Resource Hierarchy · Organization · Folders · Labels · Quotas)
- GCP Compute Engine (Machine Types · Custom Machine · Preemptible · Spot · Sole-tenant · OS Login)
- GCP GKE (Standard · Autopilot · Node Pools · Workload Identity · Config Connector · Anthos)
- GCP Cloud Run (Serverless Containers · Concurrency · Min Instances · HTTP · gRPC · Jobs)
- GCP App Engine (Standard · Flexible · Traffic Splitting · Dispatch Rules · Cron · Versions)
- GCP Cloud Functions (gen 1 · gen 2 · Triggers · HTTP · Pub/Sub · Eventarc · Concurrency)
- GCP Cloud Storage (Buckets · Storage Classes · Lifecycle · Signed URLs · Pub/Sub Notifications · CMEK)
- GCP Cloud SQL (PostgreSQL · MySQL · SQL Server · HA · Read Replicas · Proxy · IAM Auth)
- GCP Firestore (NoSQL · Native Mode · Datastore Mode · Real-time · Offline · Security Rules)
- GCP Bigtable (Wide-column · High-throughput · HBase API · Time-series · App Profiles · Autoscaling)
- GCP Spanner (NewSQL · Global · TrueTime · ACID · Interleaved Tables · Change Streams)
- GCP Pub/Sub (Topics · Subscriptions · Ordering · Exactly-once · Dead Letter · Push · Pull · BigQuery Sink)
- GCP Networking (VPC · Shared VPC · VPC Peering · Cloud NAT · Cloud Armor · Cloud CDN)
- GCP Vertex AI (Unified ML Platform · Training · Serving · Feature Store · Pipelines · Model Registry)
- GCP BigQuery (Serverless DW · Slots · Partitioned Tables · Clustered Tables · BQML · Omni · Analytics Hub)
- GCP Logging & Monitoring (Cloud Logging · Cloud Monitoring · Error Reporting · Profiler · Trace · Dashboards)
- GCP DevOps (Cloud Build · Cloud Deploy · Artifact Registry · Source Repositories · Binary Authorization)

---

## Azure — Microsoft Azure

- Azure Core (Subscriptions · Resource Groups · Management Groups · Azure Policy · Blueprints · Cost Mgmt)
- Azure IAM (Entra ID (AAD) · RBAC · Managed Identity · Service Principal · PIM · Conditional Access)
- Azure VMs (VM Sizes · Scale Sets · Availability Sets · Availability Zones · Spot VMs · Proximity Groups)
- Azure AKS (Managed Kubernetes · Node Pools · Virtual Nodes · KEDA · Workload Identity · Monitoring)
- Azure App Service (PaaS · Deployment Slots · Auto-scale · VNet Integration · Custom Domains · TLS)
- Azure Functions (Consumption · Premium · Dedicated · Durable Functions · Bindings · Triggers)
- Azure Container Apps (Serverless Containers · KEDA · Dapr Integration · Ingress · Scaling)
- Azure Blob Storage (Tiers: Hot · Cool · Cold · Archive · Lifecycle · Versioning · Soft Delete · WORM)
- Azure SQL Database (Serverless · Hyperscale · Elastic Pools · Ledger · Always Encrypted · Business Critical)
- Azure Cosmos DB (Multi-model · Multi-region · Consistency Levels · Synapse Link · Serverless · RU/s)
- Azure Service Bus (Queues · Topics · Subscriptions · Sessions · Dead Letter · Premium Tier · JMS)
- Azure Event Hubs (Kafka-compatible · Partitions · Consumer Groups · Capture · Schema Registry)
- Azure Event Grid (Event Routing · Topics · Subscriptions · CloudEvents · System Topics · Domains)
- Azure API Management (APIM · Policies · Products · Subscriptions · Developer Portal · Backends)
- Azure Key Vault (Secrets · Keys · Certificates · HSM · Firewall · Managed HSM · Private Endpoint)
- Azure Monitor (Metrics · Logs · Alerts · Workbooks · Insights · Application Insights · Log Analytics)
- Azure DevOps (Pipelines · Boards · Repos · Artifacts · Test Plans · Environments · Approvals)
- Azure Machine Learning (Studio · Compute Clusters · Experiments · Pipelines · Model Registry · MLflow)
- Azure OpenAI Service (GPT-4 · Embeddings · DALL-E · Fine-tuning · Responsible AI · Private Endpoint)

---

## General Cloud Patterns

- Load Balancing (L4 vs L7 · Round Robin · Least Connections · IP Hash · Weighted · Global LB · Health Checks)
- Auto Scaling (Horizontal · Vertical · Predictive · Scheduled · Reactive · Cool-down · Warm pools)
- CDN (Edge Locations · Caching · Cache-Control · Purging · Geo-restriction · Signed URLs · Origin Shield)
- Serverless Architecture (FaaS · BaaS · Event-driven · Stateless Design · Cold Starts · Warm-up · Pricing)
- Edge Computing (Edge Functions · Cloudflare Workers · Lambda@Edge · Vercel Edge · Low Latency · IoT)
- Caching Layers (Client-side · CDN · API Gateway · App · Database · Distributed · Cache Hierarchy)
- API Gateway Pattern (Routing · Authentication · Rate Limiting · Transformation · Aggregation · Analytics)

---

## Deployment Strategies

- Blue-Green Deployment (Two Environments · DNS Switch · Quick Rollback · Cost · DB Migrations)
- Canary Releases (Traffic Splitting · Metrics Gate · Gradual Rollout · Automated Promotion · Argo Rollouts)
- Rolling Updates (Gradual Pod Replace · maxSurge · maxUnavailable · Health Checks · K8s Rolling)
- Shadow / Dark Launch (Parallel Traffic · No User Impact · Comparison · Request Mirroring · Istio)
- Feature Flags (Gradual Rollout · A/B Testing · Kill Switch · LaunchDarkly · Unleash · OpenFeature)
- Zero Downtime Deployments (Load Balancer Draining · DB Migration Strategies · Backward Compatibility)
- Multi-region Deployment (Active-Active · Active-Passive · Traffic Manager · Global Accelerator · Latency Routing)
- GitOps Deployments (ArgoCD · Flux · Git as Source of Truth · Reconciliation Loop · Pull-based)
- Disaster Recovery (Backup & Restore · Pilot Light · Warm Standby · Multi-site Active-Active · RTO · RPO)

---

## Networking & Security

- DNS (Domain Resolution · Record Types: A · AAAA · CNAME · MX · TXT · SRV · NS · Geo DNS · Failover)
- SSL/TLS (HTTPS · Certificate Types · ACM · Let's Encrypt · Mutual TLS · Certificate Rotation · HSTS)
- Firewall & WAF (Security Groups · NACLs · Application Firewall · DDoS Protection · Rate Limiting · Bot Mgmt)
- Zero Trust Architecture (Identity-aware Proxy · Never Trust Always Verify · Micro-segmentation · BeyondCorp)
- Cloud IAM Best Practices (Least Privilege · Roles Over Users · OIDC Federation · Regular Audits · MFA)
- Cloud Networking (CIDR · Subnetting · BGP · OSPF · Private Connectivity · Transitive Routing)

---

## Cost Optimisation

- Cost Optimisation Principles (Rightsizing · Waste Elimination · Architecture Optimisation · FinOps Culture)
- Compute Savings (Reserved Instances · Savings Plans · Spot/Preemptible · Compute Optimizer · Scheduling)
- Storage Cost (Lifecycle Policies · Tiering · Deduplication · Compression · Infrequent Access)
- Network Cost (Data Transfer · VPC Endpoints · CDN · Same-region Traffic · PrivateLink vs Internet)
- FinOps Tools (AWS Cost Explorer · GCP Cost Management · Azure Cost Management · Infracost · Kubecost)
- Cloud Cost Governance (Budgets · Alerts · Tagging Strategy · Showback · Chargeback · Cost Allocation)

---

## Advanced Cloud Topics

- Multi-cloud Strategy (Vendor Neutrality · Failover · Data Sovereignty · Abstraction Layer · Crossplane)
- Hybrid Cloud (On-prem + Cloud · Azure Arc · Anthos · AWS Outposts · Consistent Management)
- Distributed Systems in Cloud (Consensus · Eventual Consistency · CAP Trade-offs · Global Databases · Spanner)
- Cloud Native Security (CSPM · CWPP · CNAPP · Shift Left · Runtime Protection · Supply Chain)
- Platform Engineering (Internal Developer Platform · IDP · Backstage · Golden Paths · Self-service)
- FinOps (Cloud Financial Management · Unit Economics · COGS · Commitment Management · Forecasting)
- Cloud Governance (Policy-as-Code · Guardrails · Landing Zone · Organizational Units · Compliance Automation)
