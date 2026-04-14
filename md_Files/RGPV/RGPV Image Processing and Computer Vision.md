# Computer Vision & Image Processing (CVIP)

---

## Unit I — Foundations, Image Processing & Morphology

- Basics of CVIP (Digital Image · Pixel · Resolution · Bit Depth · Color Channels · Spatial Domain · Frequency Domain · 2D Signal Processing)
- History of CVIP (1960s: NASA lunar images · 1970s: Medical imaging · 1980s: Industrial inspection · 1990s: Face detection · 2000s: Object recognition · 2010s: Deep Learning revolution · CNNs · ImageNet)
- Evolution of CVIP (Rule-based → Statistical → ML-based → Deep Learning · Classical CV → Modern CV · Hand-crafted features → Learned features)
- CV Models (Image Formation Model · Pinhole Camera · Perspective Projection · Lambertian Reflectance · Radiometric Model · Geometric Model · Probabilistic Model)
- Image Filtering (Linear Filtering · Convolution · Correlation · Low-pass · High-pass · Band-pass · Gaussian Filter · Mean Filter · Median Filter · Bilateral Filter · Sharpening)
- Image Representations (Spatial · Frequency: Fourier Transform · Wavelet · Pyramid · Scale Space · Graph-based · Histogram · Gradient · Descriptor)
- Image Statistics (Mean · Variance · Standard Deviation · Histogram · CDF · Joint Histogram · Entropy · Co-occurrence Matrix · GLCM · Cross-correlation)
- Recognition Methodology — Conditioning (Noise reduction · Contrast enhancement · Histogram equalization · Gamma correction · Normalization · Preprocessing pipeline)
- Recognition Methodology — Labeling (Pixel classification · Semantic labels · Connected component labels · Region tags · Class assignment)
- Recognition Methodology — Grouping (Clustering · Region growing · Superpixel formation · Perceptual grouping · Gestalt principles · Similarity · Proximity · Continuity)
- Recognition Methodology — Extracting (Feature extraction · Keypoint detection · Edge extraction · Contour tracing · Skeleton extraction · Descriptor computation)
- Recognition Methodology — Matching (Template matching · Feature matching · Graph matching · Structural matching · Nearest-neighbor · Metric learning)
- Morphological Image Processing — Introduction (Structuring Element · Origin · Binary morphology · Gray-level morphology · Set theory basis · Minkowski addition)
- Dilation (Set union · Expands objects · Fills holes · Bridging gaps · B⊕SE · Effect on binary/gray images · Applications: text boldening)
- Erosion (Set intersection · Shrinks objects · Removes noise · Removes thin protrusions · B⊖SE · Dual of dilation · Applications: noise removal)
- Opening (Erosion → Dilation · Removes small bright objects · Smooths contours · Preserves shape · B○SE = (B⊖SE)⊕SE · Idempotent operation)
- Closing (Dilation → Erosion · Fills small holes · Bridges narrow gaps · B•SE = (B⊕SE)⊖SE · Dual of opening · Preserves overall size)
- Hit-or-Miss Transformation (Detects specific patterns/shapes · Uses two SEs: foreground + background · B⊗(J,K) = (B⊖J) ∩ (B^c ⊖K) · Used for thinning/thickening)
- Morphological Algorithm — Binary Images (Boundary extraction · Region filling · Connected components · Convex hull · Thinning · Thickening · Pruning · Skeleton)
- Morphological Algorithm — Gray-Scale Images (Gray dilation · Gray erosion · Morphological gradient · Top-hat transform · Black-hat transform · Texture segmentation)
- Thinning (Iterative erosion preserving topology · Zhang-Suen algorithm · Medial axis extraction · Skeleton computation · Shape simplification)
- Thickening (Dual of thinning · Adds pixels while preserving topology · Expands skeleton · Fattening operation)
- Region Growing (Seed selection · Similarity criterion · Iterative neighbor addition · Homogeneity condition · Stop condition · Applications: medical image segmentation)
- Region Shrinking (Iterative pixel removal from region boundary · Shrinks to seed pixels · Opposite of region growing · Useful for shape analysis)

---

## Unit II — Image Representation, Segmentation & Edge Detection

- Representation Schemes (Chain code · Polygon approximation · Signatures · Skeletons · Boundary descriptors · Region descriptors · Quad-tree · Run-length encoding)
- Boundary Descriptors (Perimeter · Diameter · Major/Minor axis · Compactness · Eccentricity · Curvature · Bending energy · Fourier descriptors)
- Region Descriptors (Area · Centroid · Moments · Euler number · Elongation · Orientation · Convex hull · Bounding box · Topological descriptors)
- Thresholding (Global thresholding · Otsu's method · Adaptive thresholding · Local thresholding · Multi-level thresholding · Hysteresis thresholding · p-tile method)
- Image Segmentation (Pixel-based · Edge-based · Region-based · Graph-based · Clustering-based · Deep learning-based · Over-segmentation · Under-segmentation)
- Connected Component Labeling (4-connectivity · 8-connectivity · Two-pass algorithm · Union-Find · Blob analysis · Object counting · Blob statistics)
- Hierarchical Segmentation (Dendrogram · Agglomerative merging · Divisive splitting · SLIC superpixels · Ultrametric contour map · Hierarchical graph partition)
- Spatial Clustering (K-means · Mean-shift · DBSCAN · GMM · Spectral clustering · Feature space clustering · Color-based clustering)
- Split & Merge Segmentation (Quad-tree split · Homogeneity predicate · Merge adjacent similar regions · Bottom-up + top-down combination)
- Rule-Based Segmentation (Expert knowledge · Predefined rules · Domain-specific criteria · IF-THEN rules · Decision trees for pixel classification)
- Motion-Based Segmentation (Frame differencing · Optical flow · Background subtraction · MOG (Mixture of Gaussians) · Moving object detection · Temporal segmentation)
- Area Extraction — Concepts (Connected region · Blob · Foreground/background · Binary image analysis · Object delineation · Hole detection)
- Data Structures for Area Extraction (Run-length encoding · Border following · Contour list · Region adjacency graph · Quad-tree · Octree)
- Edge Detection (Gradient operators: Sobel · Prewitt · Roberts · Laplacian · LoG (Marr-Hildreth) · Canny edge detector — optimal 3-criteria)
- Line Linking (Edge pixel connectivity · Hysteresis · Gap filling · Contour following · Edge relaxation · Dynamic programming · Graph search)
- Hough Transform (Parametric space voting · Line: ρ=x·cosθ + y·sinθ · Circle detection · Ellipse detection · Generalized Hough · Accumulator array · Peak detection)
- Line Fitting (Least-squares line fitting · RANSAC · Total least squares · Orthogonal regression · Iterative fitting · Outlier rejection)
- Curve Fitting (Polynomial fitting · Spline fitting · B-spline · Bézier curve · Least-squares fitting · Parametric curves · Active contours / Snakes)
- Least-Square Fitting (Linear system Ax=b · Normal equations · Pseudo-inverse · Minimizing sum of squared residuals · Overdetermined systems · Error analysis)

---

## Unit III — Region Analysis, Spatial Moments & Structural Matching

- Region Properties (Area · Perimeter · Centroid · Bounding box · Convexity · Solidity · Elongation · Orientation · Euler number · Hole count)
- External Points (Convex hull · Extreme points: topmost, bottommost, leftmost, rightmost · Convex defects · Support points · Extremal points)
- Spatial Moments (Zero-order: area · First-order: centroid · Second-order: orientation and eccentricity · M_pq = ΣΣ x^p · y^q · f(x,y))
- Central Moments (Translation-invariant · μ_pq = ΣΣ (x-x̄)^p · (y-ȳ)^q · f(x,y) · Second-order → covariance matrix → orientation)
- Normalized Central Moments (Scale-invariant · η_pq = μ_pq / μ_00^(1+(p+q)/2) · Hu's 7 invariant moments: rotation+scale+translation invariant)
- Mixed Spatial Gray-Level Moments (Joint intensity-position moments · Texture characterization · φ_pq = ΣΣ x^p · y^q · I(x,y) · Gray-level distribution analysis)
- Boundary Analysis — Signature Properties (Distance signature: boundary-to-centroid distance vs angle · Slope signature · Curvature signature · Tangent angle · Periodic 1D representation)
- Shape Numbers (Chain code normalized · Smallest integer from cyclic rotations · First difference of chain code · Rotation-invariant shape descriptor · Order-n shape number)
- Distance Relational Approach (Relational distance · Structural similarity · String edit distance · Graph edit distance · Feature vector distance · Hamming · Mahalanobis)
- Ordered Structural Matching (Ordered sequence of primitives · String matching · Dynamic programming · Edit distance minimization · Sequence alignment)
- View Class Matching (Multiple views of object · View sphere · Aspect graph · View-dependent recognition · Best view selection · 3D-to-2D alignment)
- Models Database Organization (Indexing · Hashing · Inverted index · Geometric hashing · Feature-based retrieval · kd-tree · Ball tree · Approximate nearest neighbor)

---

## Unit IV — Facet Models, Perspective Geometry & Image Matching

- Facet Model Recognition (Piecewise polynomial approximation of image · Cubic facet model · Zero-crossing edge detection · Facet normal estimation · Surface orientation)
- Labeling Lines (Waltz filtering · Trihedral junctions · Arrow · Fork · T-junction · L-junction · Physical realizability constraints · Convex/Concave/Occluding edges)
- Understanding Line Drawings (Huffman-Clowes labeling · Constraint propagation · Scene interpretation from 2D drawings · Polyhedral scene analysis)
- Classification of Shapes by Edge Labeling (Convex vs concave · Occluding boundaries · Shadow boundaries · Crack edges · Crease edges · Junction catalog)
- Recognition of Shapes (Model-based recognition · Template matching · Geometric hashing · Pose estimation · Verification · Hypothesis-and-test)
- Consistent Labeling Problem (Constraint satisfaction · Arc consistency · Node consistency · Waltz algorithm · CSP formulation)
- Backtracking Algorithm (Depth-first search · Constraint checking · Pruning · Forward checking · Arc consistency maintenance · Chronological backtracking)
- Perspective Projection Geometry (Pinhole camera · Image plane · Focal length · Principal point · Camera matrix K · Projection: x = f·X/Z, y = f·Y/Z · Homogeneous coordinates)
- Inverse Perspective Projection (Depth ambiguity · Ray back-projection · Stereo for depth · Structure from Motion (SfM) · Homography · Essential matrix · Fundamental matrix)
- Photogrammetry — 2D to 3D (3D reconstruction · Triangulation · Stereo baseline · Disparity map · Depth from disparity · Epipolar geometry · Epipolar line · Rectification)
- Intensity Matching of 1D Signals (Cross-correlation · Normalized cross-correlation (NCC) · Sum of Absolute Differences (SAD) · Dynamic time warping · 1D signal alignment)
- Matching of 2D Images (SSD · NCC · Mutual information · Phase correlation · Template matching · Feature-based matching: SIFT, SURF, ORB · Homography estimation)
- Hierarchical Image Matching (Image pyramids · Coarse-to-fine strategy · Gaussian pyramid · Laplacian pyramid · Multi-scale matching · Reduces search space)
- 2D Object Representation (Binary silhouette · Contour · Medial axis · Polygon · Fourier descriptor · Moment-based · Part decomposition · Graph model)
- Global vs Local Features (Global: full image descriptor · HOG · Bag of Words · GIST · Local: keypoints — SIFT, SURF, ORB, AKAZE · Scale/rotation invariant · Repeatability)

---

## Unit V — Knowledge-Based Vision, Recognition & Deep Learning

- Knowledge Representation (Semantic networks · Production rules · Frames · Ontologies · First-order logic · Probabilistic graphical models · Scene graphs)
- Control Strategies (Bottom-up (data-driven) · Top-down (model-driven) · Blackboard architecture · Hypothesize-and-test · Beam search · A* search · Best-first)
- Information Integration (Sensor fusion · Bayesian integration · Dempster-Shafer theory · Multi-cue combination · Contextual reasoning · Scene-level constraints)
- Object Recognition — Hough Transform Methods (Circle Hough: (x-a)²+(y-b)²=r² · 3D parameter space · Generalized Hough for arbitrary shapes · Model-based voting · Gradient direction)
- Simple Object Recognition Methods (Template matching · Chamfer matching · Distance transform · Color histogram matching · Moment matching · Contour matching)
- Shape Correspondence (Point set matching · Thin Plate Splines (TPS) · ICP (Iterative Closest Point) · Shape context · Graph matching · Deformable matching)
- Shape Matching (Shape context descriptor · Turning function · Hausdorff distance · Edit distance on contours · Spectral shape analysis · Zernike moments)
- PCA — Principal Component Analysis (Dimensionality reduction · Eigenfaces · Covariance matrix · Eigenvectors · Explained variance · Whitening · Karhunen-Loève transform)
- PCA for Face Recognition (Eigenfaces (Turk & Pentland 1991) · Project face onto eigenspace · Recognition by nearest neighbor in eigenspace · Top-k eigenvectors)
- Feature Extraction (Hand-crafted: HOG · LBP · Haar · SIFT · SURF · Gabor · Learned: CNN features · Feature maps · Activation-based descriptors · Transfer learning)
- Neural Networks for Image Recognition (Perceptron · MLP · Backpropagation · Activation functions · CNNs: convolution + pooling + FC · LeNet · AlexNet · VGG · ResNet · Transfer learning)
- Machine Learning for Shape Recognition (SVM with kernel · Random Forest · Boosting (AdaBoost for face detection—Viola-Jones) · k-NN · Naive Bayes · Ensemble methods)
- Deep Learning Architectures (CNN · RNN/LSTM for video · GAN for image synthesis · VAE · U-Net for segmentation · YOLO/SSD/Faster R-CNN for detection · Vision Transformer (ViT))
- Evaluation Metrics (Accuracy · Precision · Recall · F1-score · IoU (Intersection over Union) · mAP (mean Average Precision) · ROC-AUC · Confusion matrix)

---