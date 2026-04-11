# 5 DevOps Engineering

---

## CI/CD Fundamentals

- What is DevOps (Culture · CALMS · DORA Metrics · Flow · Feedback · Continuous Improvement)
- CI/CD Fundamentals (Continuous Integration · Continuous Delivery · Continuous Deployment · Pipeline Orchestration · Feedback Loops)
- CI/CD Pipelines (Build · Test · Lint · SAST · Package · Deploy · Rollback · Smoke Test)
- Deployment Strategies (Blue-Green · Canary · Rolling Updates · Shadow Deployment · Recreate · A/B Deployment)
- Feature Flags (LaunchDarkly · Unleash · Flipt · Kill Switch · Progressive Rollout · Targeting)
- Release Management (Release Trains · Freeze Windows · Change Advisory Board · GitOps Releases)
- Shift Left Testing (Early Quality · Dev-time Testing · Pre-commit · Pre-merge · Pipeline Tests)
- DORA Metrics (Deployment Frequency · Lead Time · MTTR · Change Failure Rate · Elite vs Low)

---

## GitHub Actions (Deep)

- Workflows (workflow YAML · on triggers · push · pull_request · schedule · workflow_dispatch · inputs)
- Jobs (runs-on · needs · if conditions · outputs · Environment · Concurrency · Timeout)
- Steps (run · uses · name · with · env · continue-on-error · working-directory · id)
- Actions (Marketplace · uses: · action.yml · Composite Actions · Docker Actions · JS Actions)
- Runners (GitHub-hosted · Self-hosted · Labels · Groups · Ephemeral · ARM · GPU Runners)
- Secrets & Variables (GITHUB_TOKEN · secrets.* · vars.* · Environment Secrets · OIDC · Least Privilege)
- Matrix Builds (strategy.matrix · include · exclude · max-parallel · fail-fast · OS Matrix)
- Reusable Workflows (workflow_call · inputs · secrets: inherit · Calling vs Called · Centralisation)
- Caching (actions/cache · cache-hit · Key Strategy · Restore Keys · npm · pip · gradle)
- Artifacts (upload-artifact · download-artifact · Retention · Between Jobs · Between Workflows)
- Environments (Environment Protection Rules · Required Reviewers · Wait Timer · Deployment Targets)
- OIDC Authentication (aws-actions/configure-aws-credentials · Keyless Auth · Token Audience · Thumbprint)
- GitHub Actions Security (Pinning Actions · Dependency Review · CodeQL · Secrets Scanning)

---

## Jenkins

- Jenkins Fundamentals (Architecture · Controller · Agents · Executor · Workspace · Plugin Ecosystem)
- Declarative Pipelines (Jenkinsfile · pipeline · agent · stages · stage · steps · post · options)
- Scripted Pipelines (Groovy · node · stage · withEnv · Advanced Flexibility · vs Declarative)
- Plugins (Blue Ocean · Kubernetes · Docker · Credentials · Git · Pipeline · Shared Groovy)
- Shared Libraries (vars/ · src/ · resources/ · @Library · Encapsulating Logic · Testing Libraries)
- Jenkins Agents (Permanent · Cloud · Kubernetes · Docker · SSH · JNLP · Scaling Agents)
- Credentials Management (Jenkins Credentials Store · withCredentials · Secrets Injection · Vault Integration)
- Jenkins + Kubernetes (kubernetes plugin · Pod Templates · Dynamic Agents · Service Account)
- Jenkins Best Practices (Small Stages · Fail Fast · Parallel · Clean Workspace · Groovy Linting)

---

## Other CI/CD Tools

- GitLab CI/CD (.gitlab-ci.yml · stages · jobs · services · artifacts · environments · Auto DevOps · Review Apps)
- CircleCI (config.yml · orbs · workflows · executors · parallelism · contexts · SSH debugging)
- Azure DevOps Pipelines (azure-pipelines.yml · stages · pools · templates · deployment jobs · Environments · Approvals)
- Bitbucket Pipelines (bitbucket-pipelines.yml · steps · caches · deployments · custom pipelines · pipes)
- Argo Workflows (Workflow CRD · DAG · Steps · Artifacts · Parameters · Templates · Argo Events)
- Tekton (PipelineRun · Pipeline · Task · TaskRun · Results · Workspaces · Triggers)

---

## Artifact & Registry Management

- Docker Hub (Public · Private · Rate Limits · Official Images · Automated Builds · Webhooks)
- AWS ECR (Private Registry · Image Scanning · Cross-account · Lifecycle Policies · OIDC Push)
- GCP Artifact Registry (Multi-format · Docker · npm · Maven · Python · IAM · Vulnerability Scanning)
- Nexus Repository (Maven · npm · Docker · PyPI · On-prem · Proxying Public Registries)
- JFrog Artifactory (Universal · Binary Management · Replication · Xray Security · Build Info)
- Helm Chart Repositories (OCI · ChartMuseum · GitHub Pages · Nexus · Artifact Hub)

---

## Containerisation

- Container Concepts (Containers vs VMs · Namespaces · cgroups · Union Filesystems · OCI Standards · Container Runtime)
- Docker Basics (Images · Containers · Layers · Dockerfile · Registries · Tagging · docker run)
- Dockerfile (FROM · RUN · COPY · ADD · CMD · ENTRYPOINT · WORKDIR · ENV · ARG · EXPOSE · HEALTHCHECK)
- Multi-stage Builds (Build Stage · Runtime Stage · Image Size · Compile vs Run · Builder Pattern)
- Build Optimization (Layer Caching · .dockerignore · Order Layers · BuildKit · Cache Mounts)
- Docker Networking (Bridge · Host · None · Overlay · Macvlan · Service Discovery · DNS · --network)
- Docker Volumes (Named Volumes · Bind Mounts · tmpfs · Volume Drivers · Data Persistence · Backup)
- Docker Compose (services · networks · volumes · depends_on · healthcheck · profiles · --scale · Override Files)
- Container Security (Image Scanning · Trivy · Snyk · Distroless · Non-root User · Read-only FS · Seccomp · AppArmor · Capabilities)
- Docker BuildKit (Inline Cache · Registry Cache · Secrets · SSH · Build Args · Parallel Builds)
- containerd & CRI-O (Container Runtimes · CRI · nerdctl · crictl · vs Docker · K8s Integration)

---

## Kubernetes Fundamentals

- Cluster Architecture (Control Plane · Worker Nodes · etcd · kube-apiserver · kube-scheduler · kube-controller-manager · kubelet · kube-proxy)
- Pods (Pod Spec · Multi-container · Init Containers · Ephemeral Containers · Pod Lifecycle · restartPolicy)
- ReplicaSets (Desired State · Label Selector · Scale · vs Deployment · Self-healing)
- Deployments (Rolling Update · Recreate Strategy · Revision History · Rollback · maxSurge · maxUnavailable)
- StatefulSets (Ordered Deployment · Stable Network Identity · PVC Templates · Headless Service · Scaling)
- DaemonSets (One Per Node · Node Monitoring · Log Collection · nodeSelector · Tolerations)
- Jobs & CronJobs (Batch Tasks · completions · parallelism · backoffLimit · schedule · concurrencyPolicy)

---

## Kubernetes Networking

- Services (ClusterIP · NodePort · LoadBalancer · ExternalName · Headless · Endpoints · EndpointSlices)
- Ingress (Path-based Routing · Host-based Routing · TLS Termination · Annotations · IngressClass)
- Ingress Controllers (NGINX · Traefik · Istio Gateway · HAProxy · Contour · AWS ALB · GCE)
- DNS in Kubernetes (CoreDNS · Service DNS · Pod DNS · FQDN · ndots · search domains)
- CNI Plugins (Calico · Flannel · Cilium · Weave · Multus · Pod CIDR · Node CIDR)
- Network Policies (PodSelector · NamespaceSelector · ipBlock · Ingress Rules · Egress Rules · Default Deny)
- Service Mesh (Istio · Linkerd · Envoy · Consul Connect · Sidecar Injection · mTLS · Traffic Management)

---

## Kubernetes Storage

- Persistent Volumes — PV (Access Modes · Reclaim Policies · Capacity · StorageClass · Volume Mode)
- Persistent Volume Claims — PVC (Binding · Dynamic Provisioning · Resize · ReadWriteMany · ReadWriteOnce)
- Storage Classes (Provisioner · reclaimPolicy · volumeBindingMode · allowVolumeExpansion · Parameters)
- CSI Drivers (Container Storage Interface · AWS EBS · GCE PD · NFS · Ceph · Rook)
- ConfigMaps (Non-sensitive Config · env · volume · --from-file · --from-literal · Immutable)
- Secrets (Opaque · TLS · Docker Registry · SSH · Encryption at Rest · External Secrets · Sealed Secrets)

---

## Kubernetes Configuration & Extensions

- ConfigMaps & Secrets (Usage Patterns · env · envFrom · volumes · Update Propagation)
- Custom Resource Definitions — CRDs (apiextensions.k8s.io · Validation · Versions · Status · Printer Columns)
- Operators (Controller Pattern · Reconciliation Loop · kubebuilder · Operator SDK · Helm Operator)
- Admission Controllers (Mutating · Validating · OPA Gatekeeper · Kyverno · Webhook · Policy as Code)
- RBAC (Role · ClusterRole · RoleBinding · ClusterRoleBinding · ServiceAccount · Aggregation Rules)
- Pod Security Standards (Privileged · Baseline · Restricted · Admission Labels · Migration from PSP)

---

## Kubernetes Scaling & Scheduling

- Horizontal Pod Autoscaler — HPA (CPU · Memory · Custom Metrics · KEDA · Behaviour · Cooldown)
- Vertical Pod Autoscaler — VPA (Requests/Limits · Recommendation · Off · Auto · Initial Mode)
- Cluster Autoscaler (Node Groups · Scale-up · Scale-down · PodDisruptionBudget · AWS/GCP/Azure)
- KEDA (Event-driven Autoscaling · ScaledObject · Triggers: Kafka · SQS · Cron · HTTP)
- Resource Requests & Limits (CPU · Memory · Quality of Service: Guaranteed · Burstable · BestEffort)
- Pod Affinity & Anti-affinity (preferredDuringScheduling · requiredDuringScheduling · topologyKey)
- Taints & Tolerations (NoSchedule · PreferNoSchedule · NoExecute · Node Isolation · GPU Nodes)
- Priority Classes (PriorityClass · preemption · globalDefault · System Critical · Scheduling)
- Pod Disruption Budgets — PDB (minAvailable · maxUnavailable · Voluntary Disruption · Rolling Updates)
- Topology Spread Constraints (maxSkew · topologyKey · whenUnsatisfiable · Even Pod Distribution)

---

## Kubernetes Advanced

- Helm (Charts · Templates · values.yaml · Release · Upgrade · Rollback · Hooks · Library Charts)
- Kustomize (base · overlays · patches · namePrefix · commonLabels · ConfigMapGenerator · Strategic Merge)
- ArgoCD (GitOps · App CRD · Sync · Health · ApplicationSet · RBAC · SSO · Image Updater)
- Flux (GitOps · Kustomization · HelmRelease · ImageAutomation · Notification Controller)
- Istio (Traffic Management · VirtualService · DestinationRule · mTLS · Observability · Gateway)
- Linkerd (Ultra-light · mTLS · Automatic · SMI · Multi-cluster · Extensions · Viz)
- Envoy Proxy (xDS API · Filters · Load Balancing · Health Checking · Tracing · Dynamic Config)
- Multi-cluster Kubernetes (Federation · Liqo · Submariner · Admiralty · Cluster API)
- Kubernetes Security Hardening (CIS Benchmark · kube-bench · Falco · Runtime Security · Network Policies)

---

## Infrastructure as Code

- IaC Concepts (Idempotency · Declarative vs Imperative · Drift Detection · Immutable Infrastructure · Desired State)
- Terraform (Providers · Resources · Data Sources · Variables · Outputs · Locals · Modules · State)
- Terraform State (Local · Remote · S3 Backend · Locking · state mv · state rm · import · Sensitive Values)
- Terraform Modules (Module Sources · Inputs · Outputs · Registry · Versioning · Nested Modules)
- Terraform Workspaces (Isolation · Environment Separation · Limitations · vs Directories)
- Terraform Cloud & Enterprise (Remote Runs · Policy as Code · Sentinel · Cost Estimation · VCS Integration)
- Terragrunt (DRY Terraform · Remote State · Dependencies · Hooks · Scaffold · Generate Blocks)
- Ansible (Agentless · Playbooks · Roles · Inventory · Tasks · Handlers · Variables · Vault · Modules)
- Ansible Playbooks (YAML Syntax · Play · Tasks · Notify · Conditionals · Loops · Tags · Become)
- Ansible Roles (defaults · vars · tasks · handlers · templates · files · Role Galaxy · Requirements)
- CloudFormation (Stacks · Templates · Parameters · Outputs · Nested Stacks · Change Sets · Drift · SAM)
- Pulumi (Multi-language IaC · TypeScript/Python/Go · State · Stacks · Config · Policy as Code)
- CDK — Cloud Development Kit (AWS CDK · L1/L2/L3 Constructs · cdk synth · cdk deploy · CDK Watch)
- Crossplane (K8s-native IaC · Compositions · XRDs · Providers · GitOps for Infra)

---

## Secrets & Environment Management

- Environment Management (Dev · Staging · Production · Feature Environments · Ephemeral Preview Envs)
- HashiCorp Vault (KV · Dynamic Secrets · PKI · AWS Auth · K8s Auth · Lease Renewal · Policies)
- AWS Secrets Manager (Rotation · Cross-account · Lambda Integration · SDK · IAM Policies)
- Azure Key Vault (Secrets · Keys · Certificates · Managed Identity · Soft Delete · Purge Protection)
- GCP Secret Manager (Versions · IAM · Automatic Replication · Regional · Audit Logging)
- External Secrets Operator (K8s Integration · SecretStore · ExternalSecret · ClusterSecretStore)
- Sealed Secrets (Bitnami · kubeseal · SealedSecret CRD · Controller · GitOps-friendly)
- SOPS (Secrets OPerationS · Age · GPG · KMS · .sops.yaml · Encrypted Values in Git)

---

## Monitoring & Observability

- Observability Pillars (Logs · Metrics · Traces · Profiles · SLOs · SLIs · SLAs · Error Budget)
- Prometheus (Metrics Format · Scraping · Labels · Relabeling · PromQL · Recording Rules · Alerting Rules)
- Grafana (Dashboards · Panels · Data Sources · Alerting · Annotations · Variables · Provisioning)
- Alertmanager (Routes · Receivers · Inhibition · Silences · PagerDuty · Slack · OpsGenie · Webhook)
- Thanos (Long-term Storage · Global Query · Sidecar · Store Gateway · Compactor · Ruler)
- VictoriaMetrics (High Performance · PromQL Compatible · vminsert · vmselect · vmstorage)
- Loki (Log Aggregation · LogQL · Labels · Promtail · Grafana Agent · S3 Backend · Chunk Storage)
- ELK Stack (Elasticsearch · Logstash · Kibana · Beats · OpenSearch · Index Management · ILM)
- Fluentd & Fluent Bit (Log Shipping · Parsers · Filters · Outputs · K8s Log Collection · Routing)
- Jaeger (Distributed Tracing · Spans · Traces · Sampling · Storage · UI · Agent · Collector)
- Zipkin (Tracing · Instrumentation · B3 Propagation · Storage · UI · Spring Sleuth)
- OpenTelemetry (OTel · SDK · Collector · OTLP Protocol · Auto-instrumentation · Vendor-neutral)
- APM Tools (Datadog APM · New Relic · Dynatrace · Scout APM · Elastic APM · Pyroscope Profiling)
- SLO Management (Burn Rate · Error Budget · SLO Policy · Toil Reduction · Google SRE Approach)

---

## DevSecOps & Security

- DevSecOps (Shift Left Security · Threat Modeling · Secure SDLC · OWASP SAMM · Supply Chain)
- SAST (Static Analysis · SonarQube · Semgrep · CodeQL · Bandit · ESLint Security · Checkmarx)
- DAST (Dynamic Testing · OWASP ZAP · Burp Suite · nikto · API Fuzzing · Nuclei)
- SCA — Dependency Scanning (Snyk · Dependabot · OWASP Dependency-Check · npm audit · trivy)
- Container Scanning (Trivy · Grype · Clair · Snyk Container · ECR Scanning · Harbor)
- SBOM (Software Bill of Materials · CycloneDX · SPDX · syft · grype · Supply Chain Security)
- CI/CD Security (Secrets in Pipelines · OIDC · Pinned Actions · Signed Images · Provenance · SLSA)
- Compliance (SOC2 · GDPR · HIPAA · PCI-DSS · ISO 27001 · FedRAMP · CIS Benchmarks)
- Zero Trust in DevOps (Identity-aware Proxy · mTLS · SPIFFE/SPIRE · BeyondCorp · Pod Identity)

---

## Reliability Engineering

- SRE Principles (Error Budgets · Toil · Reliability Targets · Incident Management · Postmortems)
- Chaos Engineering (Fault Injection · Resilience Testing · GameDays · Chaos Mesh · Litmus · Gremlin)
- Incident Management (Severity Levels · On-call · Runbooks · PagerDuty · Blameless Postmortem · RCA)
- Disaster Recovery (RTO · RPO · Backup Strategies · Runbooks · DR Testing · Cross-region Failover)
- Performance Testing (Load Testing · Stress Testing · k6 · Locust · JMeter · Gatling · Benchmarking)
- Runbooks & Playbooks (Operational Docs · Automation · Self-healing · Incident Checklists)
- On-call Best Practices (Escalation Policy · Rotation · Alert Fatigue · Actionable Alerts · Toil Tracking)
