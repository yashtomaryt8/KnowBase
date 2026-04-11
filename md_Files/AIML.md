# 3 AI / ML Engineering

---

## Mathematics & Statistics Foundations

- Linear Algebra (Vectors · Matrices · Dot Product · Matrix Multiplication · Transpose · Inverse · Eigenvalues · Eigenvectors · SVD)
- Calculus for ML (Derivatives · Partial Derivatives · Chain Rule · Gradients · Jacobian · Hessian · Backprop Math)
- Probability & Statistics (Probability Distributions · Bayes Theorem · Expectation · Variance · MLE · MAP · Frequentist vs Bayesian)
- Information Theory (Entropy · Cross Entropy · KL Divergence · Mutual Information · Perplexity)
- Optimization Theory (Convex Optimization · Gradient Descent · Saddle Points · Loss Landscapes)

---

## Classical Machine Learning

- ML Fundamentals (Supervised · Unsupervised · Semi-supervised · Self-supervised · Reinforcement · Label Types)
- Bias-Variance Tradeoff (Underfitting · Overfitting · Regularization · Bias-Variance Decomposition)
- Feature Engineering (Scaling · Normalization · One-hot Encoding · Embeddings · Feature Selection · PCA)
- Linear Regression (OLS · Regularization · Ridge · Lasso · ElasticNet · Polynomial Regression)
- Logistic Regression (Binary · Multiclass · Sigmoid · Softmax · Decision Boundary)
- Decision Trees (Entropy · Gini · Splitting Criteria · Pruning · Depth · Leaf Size)
- Ensemble Methods (Bagging · Boosting · Random Forest · Gradient Boosting · XGBoost · LightGBM · CatBoost · Stacking)
- Support Vector Machines (Kernel Trick · RBF · Margin · C Parameter · SVR)
- K-Nearest Neighbors (Distance Metrics · k Selection · Curse of Dimensionality)
- Clustering (K-Means · DBSCAN · Hierarchical · GMM · Evaluation: Silhouette · Inertia)
- Dimensionality Reduction (PCA · t-SNE · UMAP · LDA · Autoencoders)
- Model Evaluation (Accuracy · Precision · Recall · F1 · AUC-ROC · PR Curve · Confusion Matrix · MAE · RMSE)
- Cross-validation (K-Fold · Stratified · Leave-One-Out · Time Series Split · Nested CV)
- Hyperparameter Tuning (Grid Search · Random Search · Bayesian Optimization · Optuna · Ray Tune)

---

## Deep Learning Foundations

- Neural Networks (Perceptron · MLP · Activation Functions · Forward Pass · Backward Pass · Depth vs Width)
- Activation Functions (ReLU · Leaky ReLU · GELU · Sigmoid · Tanh · Swish · SiLU · Mish)
- Loss Functions (MSE · MAE · Cross-entropy · Binary Cross-entropy · Huber · CTC · Contrastive)
- Backpropagation (Chain Rule · Computation Graphs · Gradient Flow · Vanishing Gradient · Exploding Gradient)
- Optimizers (SGD · Momentum · Nesterov · AdaGrad · RMSProp · Adam · AdamW · Lion · LAMB)
- Regularization (L1 · L2 · Dropout · DropConnect · Label Smoothing · Weight Decay · Gradient Clipping)
- Batch Normalization (LayerNorm · GroupNorm · InstanceNorm · RMSNorm · Pre-norm vs Post-norm)
- Initialization (Xavier · Kaiming · Orthogonal · Zero-mean Gaussian · Impact on Training)
- Learning Rate Scheduling (Cosine Annealing · Warmup · Step Decay · OneCycleLR · ReduceLROnPlateau)

---

## Convolutional Neural Networks (CNNs)

- CNN Fundamentals (Convolution · Kernel · Stride · Padding · Feature Maps · Receptive Field)
- Pooling (Max Pooling · Average Pooling · Global Average Pooling · Spatial Pyramid Pooling)
- CNN Architectures (LeNet · AlexNet · VGG · ResNet · DenseNet · EfficientNet · MobileNet · ConvNeXt)
- Object Detection (YOLO · Faster R-CNN · SSD · DETR · Anchor Boxes · NMS · IoU · mAP)
- Semantic Segmentation (FCN · U-Net · DeepLab · Mask R-CNN · Panoptic Segmentation)
- Image Classification (ImageNet · Transfer Learning · Fine-tuning · Feature Extraction)
- Depthwise Separable Convolution (MobileNet Architecture · Efficiency · Parameter Reduction)

---

## Recurrent Neural Networks & Sequence Models

- RNN Fundamentals (Hidden State · Sequence Processing · BPTT · Vanishing Gradient Problem)
- LSTM (Cell State · Gates: Forget · Input · Output · Long-range Dependencies)
- GRU (Simplified LSTM · Reset Gate · Update Gate · When to Use)
- Bidirectional RNNs (Forward + Backward · Context from Both Directions · Applications)
- Sequence-to-Sequence (Encoder-Decoder · Machine Translation · Summarisation · Attention Mechanism)

---

## Transformers & Attention

- Transformers (Encoder · Decoder · Self-Attention · Multi-Head Attention · Positional Encoding · Residual Connections · Layer Normalization)
- Attention Mechanisms (Scaled Dot-Product · Cross Attention · Sparse Attention · Flash Attention · Linear Attention)
- Positional Encoding (Sinusoidal · Learned · RoPE · ALiBi · Relative Position Bias)
- BERT (Masked LM · NSP · Fine-tuning · [CLS] Token · WordPiece · Applications)
- GPT Family (Autoregressive · Decoder-only · Next Token Prediction · GPT-2 · GPT-3 · GPT-4)
- T5 (Text-to-Text · Unified Framework · Prefix LM · Instruction Tuning)
- Vision Transformers — ViT (Patch Embedding · CLS Token · Image Classification · DeiT · Swin)
- CLIP (Contrastive Language-Image Pretraining · Zero-shot Classification · Embeddings)

---

## Large Language Models

- LLMs (Architecture · Training Pipeline · Scaling Laws · Emergent Abilities · Inference Optimization)
- Pretraining (Datasets · Web Scraping · Data Filtering · Masked LM · Next Token Prediction · Data Quality)
- Tokenization (BPE · WordPiece · SentencePiece · Unigram · Token Limits · Vocabulary Construction · Special Tokens)
- Scaling Laws (Chinchilla · Compute Optimal · Data vs Parameters · Loss Prediction · Power Laws)
- Emergent Abilities (Chain-of-Thought · Instruction Following · In-context Learning · Phase Transitions)
- Fine-Tuning (Full Fine-Tuning · LoRA · QLoRA · PEFT · Instruction Tuning · Domain Adaptation · SFT)
- RLHF (Reward Models · Human Feedback Loops · PPO · DPO · RLAIF · Alignment Techniques · Constitutional AI)
- Context Windows (Context Length · Long Context Models · Position Interpolation · YaRN · LongRoPE)
- Quantization in LLMs (INT8 · INT4 · GPTQ · AWQ · GGUF · bitsandbytes · llama.cpp)

---

## Prompt Engineering

- Prompt Engineering (Zero-shot · Few-shot · Chain-of-Thought · ReAct · Tree of Thoughts · Self-Consistency)
- Prompt Templates (System Prompt · User Prompt · Assistant Prompt · Jinja2 Templates · LangChain PromptTemplate)
- Advanced Prompting (Meta-prompting · Prompt Chaining · Skeleton-of-Thought · Step-back Prompting)
- Structured Outputs (JSON Mode · Function Calling · Tool Calling APIs · Schema Enforcement · Instructor)
- Context Management (Context Windows · Token Limits · Sliding Window · Context Compression · Summarization)
- Prompt Injection (Attack Vectors · Indirect Injection · Defence Strategies · Prompt Firewalls)

---

## Embeddings & Semantic Search

- Embeddings (Text · Sentence · Document · Image · Multimodal · Vector Space Representation · Dimensionality Reduction)
- Embedding Models (OpenAI text-embedding · E5 · BGE · Jina · Cohere · Sentence Transformers · MTEB Benchmark)
- Vector Similarity (Cosine Similarity · Dot Product · Euclidean Distance · Manhattan Distance · Jaccard)
- Semantic Search (Embedding Search · Hybrid Search · BM25 + Vector · Ranking Models · Reranking)
- Bi-encoder vs Cross-encoder (Speed vs Quality · Two-stage Retrieval · Reranking Pipeline)
- Vector Databases (Pinecone · Chroma · FAISS · Weaviate · Milvus · Qdrant · pgvector · OpenSearch)
- Indexing Algorithms (HNSW · IVF · PQ · Flat · ScaNN · DiskANN · Recall vs Latency Tradeoff)
- Approximate Nearest Neighbour — ANN (HNSW · LSH · Tree-based · GPU Acceleration · Benchmarks)

---

## RAG — Retrieval Augmented Generation

- RAG Architecture (Retriever · Generator · Context Injection · Query Expansion · Answer Synthesis)
- Chunking Strategies (Fixed-size · Sliding Window · Semantic · Sentence-based · Recursive · Agentic)
- Document Processing (PDF · HTML · CSV · DOCX · Markdown · Tables · Code · Images)
- Retrieval (Dense Retrieval · Sparse Retrieval · Hybrid · Multi-query · HyDE · Query Rewriting)
- Reranking (Cross-encoder · Cohere Rerank · BGE Reranker · LLM Reranking · Colbert)
- Context Injection (Context Formatting · Token Limits · Compression · LLMLingua · Lost in the Middle Problem)
- Metadata Filtering (Structured Filters · Date Range · Source · Category · Pre-filtering vs Post-filtering)
- Evaluation (RAGAS · ARES · Context Relevance · Faithfulness · Answer Relevance · Groundedness)
- Advanced RAG (Agentic RAG · Self-RAG · Corrective RAG · Modular RAG · Speculative RAG)
- Multi-modal RAG (Image + Text · ColPali · Vision Encoders · Unified Embedding Space)

---

## AI Agents

- AI Agents (Agent Architecture · Planning · Tool Usage · Memory · Reflection · Autonomous Loops)
- Agent Planning (Task Decomposition · Goal-Oriented Planning · Replanning · Execution Chains · MCTS)
- Agent Memory (Short-term · Long-term · Episodic · Semantic · Procedural · Memory Consolidation)
- Tool Use (Function Calling · Tool Definitions · Tool Selection · Parallel Tool Use · Tool Results)
- ReAct Pattern (Reasoning + Acting · Thought · Action · Observation · Scratchpad · Iterations)
- Agent Evaluation (Trajectory · Success Rate · Tool Accuracy · Hallucination Rate · Efficiency)
- Multi-Agent Systems (Coordination · Communication Protocols · Swarm Intelligence · Role-Based Agents)
- Agent Frameworks (LangChain · LangGraph · LlamaIndex · CrewAI · AutoGPT · Semantic Kernel · Haystack · Autogen)
- AI Protocols (MCP · A2A Protocol · Tool Protocols · Function Calling APIs · Interoperability Standards)
- Agent Security (Prompt Injection · Tool Misuse · Sandboxing · Least Privilege · Monitoring)
- Agentic Workflows (DAG Execution · Conditional Branching · Parallelism · Human-in-the-loop · Callbacks)

---

## Memory Systems

- Memory Systems (Short-Term · Long-Term · Vector Memory · Episodic Memory · Knowledge Graph Memory)
- Working Memory in LLMs (Context Window as Memory · Attention Over Context · KV Cache)
- External Memory (Vector Store · SQL · Knowledge Graph · File System · Memory Modules)
- Memory Retrieval (Similarity Search · Recency Weighting · Importance Scoring · Forgetting Curves)
- Knowledge Representation (Knowledge Graphs · Ontologies · Semantic Networks · Neo4j · RDF)

---

## Multimodal AI

- Multimodal Models (Text + Image + Audio + Video · Cross-Modal Learning · Unified Encoders)
- Vision-Language Models (CLIP · LLaVA · GPT-4V · Gemini · BLIP-2 · Florence · Moondream)
- Image Generation (Stable Diffusion · DALL-E · Midjourney · Flux · ControlNet · LoRA for Diffusion)
- Diffusion Models (DDPM · DDIM · Score Matching · Latent Diffusion · Classifier-Free Guidance · CFG Scale)
- Speech AI (Whisper · Speech-to-Text · Text-to-Speech · Voice Cloning · Audio Embeddings · Diarization)
- Video Understanding (Video LLMs · Temporal Modelling · Action Recognition · Video Captioning)
- Computer Vision (Image Classification · Object Detection · Segmentation · OCR · Depth Estimation)

---

## Training Infrastructure & MLOps

- AI Data Pipelines (Data Collection · Cleaning · Labeling · Augmentation · Feature Engineering · Versioning)
- Data Versioning (DVC · Git LFS · Dataset Tracking · Experiment Tracking · Data Cards)
- Experiment Tracking (MLflow · Weights & Biases · Neptune · ClearML · Comet · TensorBoard)
- Training Frameworks (PyTorch · TensorFlow · JAX · Hugging Face Trainer · Lightning · Deepspeed · FSDP)
- Distributed Training (Data Parallelism · Model Parallelism · Pipeline Parallelism · ZeRO · Tensor Parallelism)
- AI Infrastructure (GPU: A100 · H100 · RTX · TPU · Spot Instances · Multi-node · NCCL · InfiniBand)
- Hyperparameter Optimization (Optuna · Ray Tune · Ax · NAS · Population-Based Training)
- AutoML (AutoSklearn · H2O AutoML · NAS · Feature AutoML · Automated Pipelines)
- Neural Architecture Search (DARTS · Evolution · Reinforcement-based · Efficient NAS)

---

## Inference & Optimization

- Inference Optimization (Quantization · Distillation · Pruning · Caching · Speculative Decoding)
- Quantization (INT8 · INT4 · FP16 · BF16 · Post-training · QAT · GPTQ · AWQ · GGUF)
- Knowledge Distillation (Teacher-Student · Soft Labels · Intermediate Layers · TinyBERT)
- Pruning (Magnitude Pruning · Structured · Unstructured · Gradual Pruning · Lottery Ticket)
- KV Cache (Attention Cache · Prefix Caching · Paged Attention · Flash Attention · Memory Efficiency)
- Speculative Decoding (Draft Model · Target Model · Acceptance Rate · Speed Gains)
- Batching Strategies (Dynamic Batching · Continuous Batching · Offline Batching · vLLM)
- Model Serving (REST APIs · gRPC · Triton Inference Server · TorchServe · FastAPI · BentoML)
- vLLM (PagedAttention · Throughput · OpenAI-compatible · Multi-GPU · Quantization Support)
- Ollama (Local LLMs · GGUF · Model Library · REST API · GPU Offloading)

---

## AI Evaluation

- AI Evaluation (Benchmarking · Hallucination Detection · Ground Truth Testing · Human Eval)
- Automatic Metrics (BLEU · ROUGE · BERTScore · METEOR · BLEURT · SacreBLEU)
- LLM Evaluation (MMLU · HellaSwag · ARC · GSM8K · HumanEval · MBPP · LiveCodeBench)
- RAG Evaluation (RAGAS · ARES · Context Precision · Recall · Faithfulness · Answer Correctness)
- Safety Evaluation (TruthfulQA · HarmBench · WildGuard · Refusal Testing · Jailbreak Benchmarks)
- Human Evaluation (Preference Studies · A/B Testing · Annotation Guidelines · IRR · Elo Rating)
- Evaluation Pipelines (Automated · LLM-as-Judge · Custom Rubrics · Regression Testing)

---

## AI Observability & Safety

- AI Observability (Prompt Monitoring · Token Tracking · Latency · Drift Detection · Logging · LangSmith)
- AI Safety (Guardrails · Prompt Injection · Jailbreak Prevention · Content Moderation · NeMo Guardrails)
- AI Alignment (Constitutional AI · RLHF · DPO · Bias Mitigation · Value Learning · Red Teaming)
- Fairness & Bias (Statistical Parity · Equal Opportunity · Disparate Impact · Debiasing · Audit Tools)
- Privacy in AI (Data Privacy · PII Redaction · Federated Learning · Differential Privacy · GDPR for AI)
- AI Cost Optimization (Token Usage · Prompt Caching · Model Selection · Batching · Semantic Caching)
- Hallucination Mitigation (Grounding · Citations · Confidence Scores · Self-consistency · RAG)
- Responsible AI (Model Cards · Datasheets · Impact Assessment · Accountability · Transparency)

---

## AI Deployment

- AI CI/CD (Model Versioning · Continuous Training · Continuous Evaluation · Deployment Automation)
- Model Registry (MLflow Registry · Hugging Face Hub · SageMaker · Vertex AI Registry · Versioning)
- AI Deployment Patterns (Microservices · Serverless AI · Edge AI · Batch Inference · Streaming)
- Edge AI (TFLite · ONNX · CoreML · TensorRT · WebAssembly · On-device Models · Mobile AI)
- Serverless AI (AWS Lambda · Cloud Functions · Replicate · Modal · HF Inference Endpoints)
- On-device AI (Apple Neural Engine · Android NNAPI · Qualcomm AI Stack · Browser WASM)
- Federated Learning (Horizontal · Vertical · FedAvg · Differential Privacy · PySyft · Flower)
- Synthetic Data Generation (GAN · Diffusion · LLM-based · Data Augmentation · Privacy-preserving)

---

## Open Source LLM Ecosystem

- Hugging Face (Transformers · Datasets · Hub · Spaces · Inference API · PEFT · TRL · Accelerate)
- LLaMA Family (LLaMA 2 · LLaMA 3 · Code Llama · Mistral · Mixtral · Phi · Gemma · Qwen)
- Fine-tuning Open Models (LoRA · QLoRA · Full Fine-tune · Axolotl · LLaMA-Factory · Unsloth)
- Ollama (Local Inference · GGUF Format · Model Library · Multimodal · Embedding)
- vLLM (Production Serving · PagedAttention · OpenAI API Compatibility · Batch Processing)
- llama.cpp (CPU Inference · Quantization · GGUF · Metal / CUDA · Python Bindings)
- ONNX Runtime (Cross-platform · Optimization · Hardware Accelerators · Model Export)

---

## AI Applications

- Chatbot & Assistant Systems (Conversational Memory · Multi-turn · Persona · Safety Filters · UI)
- Coding Agents (GitHub Copilot · Cursor · Claude Code · Code Generation · Debugging · Testing)
- Search & QA Systems (Open-domain QA · Closed-domain · Multi-hop Reasoning · Factuality)
- Recommendation Systems (Collaborative Filtering · Content-based · Two-tower Models · LLM-enhanced)
- Document Intelligence (IDP · Table Extraction · Form Parsing · PDF Understanding · LayoutLM)
- AI Workflow Automation (Zapier-like AI · n8n · LangGraph Workflows · Human-in-the-loop)
- AI Product Design (UX for AI · Streaming UI · Progressive Disclosure · Trust Indicators · Failure Modes)
- Foundation Models (GPT-4 · Claude · Gemini · Mistral · Command R+ · API Integration Patterns)
