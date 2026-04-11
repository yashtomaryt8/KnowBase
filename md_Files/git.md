# 4 Git & Version Control

---

## Git Internals & Core Concepts

- What is Git (Distributed VCS · History · Linus Torvalds · Why Git Won · Git vs SVN vs Mercurial)
- Git Object Model (Blob · Tree · Commit · Tag · Object Database · Content-addressable Storage)
- SHA-1 & SHA-256 (Hash-based Identity · Object Integrity · Collision Resistance · Transition)
- Git Index / Staging Area (Three-tree Architecture · Working Directory · Index · HEAD · git add)
- Packfiles (Delta Compression · .pack Files · .idx Files · git gc · Auto-packing · Loose Objects)
- Reflog (Local Safety Net · HEAD Reflog · Branch Reflog · Recovering Lost Commits · Expiry)
- Detached HEAD (What It Means · When It Happens · Creating Branch from Detached HEAD · Risks)
- Git References (Branches · Tags · HEAD · ORIG_HEAD · MERGE_HEAD · FETCH_HEAD · Packed-refs)
- Git Config (--system · --global · --local · user.name · user.email · core.editor · alias)
- .gitattributes (Line Endings · Diff · Merge Strategies · Binary Files · LFS Pointers)

---

## Core Git Operations

- git init (Bare Repos · Normal Repos · --initial-branch · Re-initialising)
- git clone (--depth · --shallow · --single-branch · --filter · Partial Clone · Bundle Clone)
- git add (Interactive Staging · -p Patch Mode · -u · -A · Staging Hunks · Intent to Add)
- git commit (--amend · --no-edit · --allow-empty · Signing Commits · GPG · Commit Messages)
- git status (Porcelain · --short · Ignored Files · Untracked Files · Tracking Info)
- git log (--oneline · --graph · --decorate · --follow · --all · Filtering · Custom Format)
- git diff (Staged vs Unstaged · Between Commits · Between Branches · --stat · --word-diff)
- git show (Commit Details · Blob Content · Tree Content · Tag Details)
- git stash (push · pop · apply · drop · list · --include-untracked · Partial Stash · Stash Branches)
- git reset (--soft · --mixed · --hard · Resetting Files · Resetting HEAD · Danger Zones)
- git restore (Restoring Working Tree · Unstaging · --source · Replaces checkout for Files)
- git clean (Untracked Files · -n Dry Run · -fd Dirs · -x Ignored · Interactive Mode)

---

## Branching & Merging

- Branches (Lightweight Pointer · Creating · Renaming · Deleting · Remote Tracking Branches · --track)
- Branching Strategies (Feature Branch · Release Branch · Hotfix · Long-lived vs Short-lived)
- Trunk-Based Development (Short-lived Branches · Feature Flags · CI Discipline · Scaled TBD)
- Git Flow (main · develop · feature · release · hotfix · vincent driessen · When to Use)
- GitHub Flow (main · feature · Pull Request · Review · Deploy · Simple but Powerful)
- GitLab Flow (Environment Branches · Production Branch · Upstream First · Release Branches)
- Merging (Fast-forward · Recursive · Ours · Theirs · Squash Merge · Merge Commit Message)
- Merge Conflicts (Conflict Markers · git mergetool · Manual Resolution · Ours vs Theirs Strategy)
- Rebasing (git rebase · Rebase onto · Interactive Rebase · Rebase vs Merge · Golden Rule)
- Interactive Rebase (pick · reword · edit · squash · fixup · drop · exec · break)
- Cherry-pick (Single Commits · Ranges · --no-commit · Conflict Resolution · Use Cases)
- git merge --no-ff (Explicit Merge Commits · History Clarity · vs Fast-forward · Team Policy)

---

## Remote Operations

- Remotes (git remote · add · remove · rename · set-url · -v · Multiple Remotes · Upstream)
- git fetch (vs pull · --all · --prune · --tags · FETCH_HEAD · Remote Tracking Updates)
- git pull (--rebase · --ff-only · Merge vs Rebase Strategy · pull.rebase config)
- git push (--force · --force-with-lease · --tags · --delete · Tracking Setup · Push Hooks)
- Tracking Branches (origin/main · Remote Tracking · Upstream Relationship · behind/ahead)
- Forking Workflow (Fork · Upstream · Sync Fork · Pull Request · Contributor Guidelines)
- git remote prune (Cleaning Stale Remote Refs · --dry-run · fetch --prune)

---

## Advanced Git

- git bisect (Binary Search · start · good · bad · Automated Bisect · Finding Regression Commits)
- git blame (Line-by-line History · -L Range · --follow · Ignore Whitespace · Porcelain Format)
- git grep (Search in Working Tree · --cached Index · Committed Content · Regex · Context Lines)
- git worktrees (Multiple Working Trees · Parallel Branches · No Stash Needed · Linked Worktrees)
- Submodules (git submodule add · update · sync · foreach · Pitfalls · When to Use · Alternatives)
- Subtrees (git subtree add · pull · push · split · vs Submodules · Monorepo Strategy)
- Git LFS — Large File Storage (git-lfs · Track Patterns · Pointer Files · LFS Server · Bandwidth)
- Sparse Checkout (Partial Clone · --sparse · cone mode · .git/info/sparse-checkout · Monorepo)
- git filter-repo (Rewriting History · Removing Sensitive Data · Path Extraction · Migrate History)
- git bundle (Offline Transfer · Bundles as Backup · Incremental Bundles · air-gapped Repos)
- Signed Commits & Tags (GPG Setup · git config gpg.signingkey · Verified Badges · SSH Signing)
- git notes (Metadata without Changing Commits · Attaching Notes · Remote Sync · Use Cases)

---

## Collaboration & Code Review

- Pull Requests / Merge Requests (Templates · Reviewers · Labels · Assignees · Linked Issues · Draft PRs)
- Code Review Best Practices (Review Size · Feedback Tone · Nit vs Blocking · Approval Strategies)
- Commit Standards (Conventional Commits · type(scope): message · feat · fix · chore · BREAKING CHANGE)
- Commit Message Best Practices (Imperative Mood · 50/72 Rule · Body · Footer · Why not What)
- Branch Protection Rules (Required Reviews · Status Checks · Signed Commits · Linear History · Dismiss Stale)
- CODEOWNERS (Automatic Review Assignment · .github/CODEOWNERS · Glob Patterns · Team Owners)
- Semantic Versioning (MAJOR.MINOR.PATCH · Pre-release · Build Metadata · SemVer in Practice)

---

## Git Hooks

- Client-side Hooks (pre-commit · commit-msg · prepare-commit-msg · post-commit · pre-push · pre-rebase)
- Server-side Hooks (pre-receive · update · post-receive · Enforcing Policy · Rejecting Pushes)
- Husky (Git Hooks Management · .husky/ · package.json · lint-staged Integration · CI Parity)
- lint-staged (Staged Files Only · Fast Feedback · Run Linters · Formatters · Tests on Staged)
- commitlint (Enforce Conventional Commits · Config · CI Integration · Custom Rules)
- pre-commit Framework (Python-based · Multi-language · .pre-commit-config.yaml · Autoupdate)

---

## GitHub / GitLab / Bitbucket Features

- GitHub Features (Actions · Projects · Packages · Releases · Pages · Codespaces · Discussions)
- GitHub Actions Basics (Workflows · on · jobs · steps · uses · env · secrets · GITHUB_TOKEN)
- GitHub Releases (Tags · Release Notes · Assets · Draft Releases · Pre-releases · Changelogs)
- GitHub Packages (npm · Docker · Maven · NuGet · Authentication · Retention Policies)
- GitHub Codespaces (Dev Containers · devcontainer.json · Prebuilds · Secrets · Port Forwarding)
- GitLab Features (CI/CD · MR · Environments · Container Registry · Auto DevOps · Review Apps)
- Bitbucket Pipelines (bitbucket-pipelines.yml · Steps · Caches · Deployment Environments)
- Issue Tracking Integration (Closing Issues via Commits · Linked PRs · Project Boards · Milestones)

---

## Monorepo Strategy

- Monorepo vs Polyrepo (Tradeoffs · Dependency Management · Code Sharing · Refactoring · CI Cost)
- Turborepo (Task Pipelines · Remote Caching · Pruned Installs · Workspaces · turbo.json)
- Nx (Affected · Dependency Graph · Generators · Executors · Distributed Task Execution)
- Changesets (Versioning in Monorepos · Changelogs · Publish · Pre-release · GitHub Bot)
- PNPM Workspaces (Hoisting · Strict Mode · Catalogs · Link Packages · Filtering)
- Sparse Checkout for Monorepos (Partial Clone · Cone Mode · Large Repo Performance)

---

## Git in CI/CD

- Shallow Clones in CI (--depth 1 · --fetch-depth · Unshallowing · Speed vs History Tradeoff)
- Caching in CI (node_modules · pip · go modules · Cache Keys · Cache Invalidation)
- Git Secrets & Secret Scanning (git-secrets · truffleHog · GitLeaks · GitHub Secret Scanning)
- Automated Version Bumping (semantic-release · release-please · standard-version · Conventional Commits)
- Changelog Generation (auto-changelog · keep-a-changelog · Release Notes Automation · GitHub Releases)
- Protected Branches in CI (Status Checks · Required Pipelines · Merge Queues · Auto-merge)

---

## Troubleshooting & Recovery

- Recovering Lost Commits (git reflog · git fsck · ORIG_HEAD · Detached HEAD Recovery)
- Undoing Changes (revert vs reset · --soft vs --hard · Amending Pushed Commits · force push)
- Fixing Wrong Commits (amend · interactive rebase · filter-repo · Removing Secrets)
- Resolving Merge Conflicts (Conflict Markers · 3-way Merge · Ours/Theirs · Mergetool Setup)
- Git Corruption Recovery (fsck · prune · gc · Corrupt Objects · Clone as Recovery)
- Large Repo Performance (Partial Clone · Sparse Checkout · git gc · File System Monitor · GVFS)
