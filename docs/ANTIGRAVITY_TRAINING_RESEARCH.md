# Antigravity ML Training & Agentic Engineering Research

## Overview
This document synthesizes findings across official Antigravity documentation, Google Gemini agent guides, Kaggle 5-Day Agentic Engineering course materials, community GitHub repositories, and video references.

---

## Source Findings Matrix

| Source | Category | Accessed | Key Finding | Used in Workflow |
|---|---|---|---|---|
| `https://antigravity.google/` | Official Docs | Partial (Domain/IDE context) | Antigravity IDE built around agentic pair-programming, multi-turn tool calling, and background task management. | Architecture & workflow model |
| `https://www.antigravity.google/docs/cli/` | Official Docs | Verified | CLI operates with explicit workspace discovery, permissions, and tool orchestration. | Execution environment |
| `https://www.antigravity.google/docs/cli/reference/` | Official Docs | Verified | Real CLI commands: `/permissions`, `/tasks`, `/skills`, `/planning`, `/agents`, `/teamwork-preview`. `/goal` is not an official CLI command. | Skill and task invocation |
| `https://www.antigravity.google/docs/cli/features/` | Official Docs | Verified | Explicit permission modes (`request-review`, `always-proceed`, `strict`). Prompts cannot unilaterally bypass permission gates. | Permission compliance |
| `https://www.antigravity.google/docs/cli/commands/agents/` | Official Docs | Verified | Subagent invocation patterns and task isolation. Main agent must verify and reconcile subagent artifacts. | Subagent architecture |
| `https://www.antigravity.google/docs/skills` | Official Docs | Verified | Workspace skills reside under `.agents/skills/<skill-folder>/SKILL.md`. Global skills under `~/.gemini/config/skills/` (Antigravity 2.0). | Created `nayan-ml-training` skill |
| `https://www.antigravity.google/docs/cli/plugins/` | Official Docs | Verified | Namespaced bundles of skills, configurations, and hooks for modular workflows. | Customization root structure |
| `https://ai.google.dev/gemini-api/docs/agents` | Official Docs | Verified | Multi-turn function calling, tool use, structured grounding, and deterministic evaluation loops. | Pipeline design |
| `https://ai.google.dev/gemini-api/docs/antigravity-agent` | Official Docs | Verified | Direct tool integration for filesystem, process management, and model evaluation harnesses. | Tool usage & safety |
| `https://www.kaggle.com/learn-guide/5-day-agents-vibecoding` | Course Material | Verified | Focuses on agent skills as modular, portable `SKILL.md` packages; progressive disclosure; building evaluation harnesses over simple prompts. | Rigorous verification & audit gates |
| `https://github.com/kousen/gemini-training` | Technical Repo | Verified (GitHub API) | Demonstrates skill structuring, background execution, task handling, and verification scripts. | Dataset & training scripts |
| `https://www.youtube.com/watch?v=Zek0BnuhY1Q&t=137` | Video Reference | Partial (Metadata) | "Gemini CLI and Agent Workflows" overview. | Context on agent permissions |
| `https://www.youtube.com/watch?v=msd_APlIsRk&t=304` | Video Reference | Partial (Metadata) | "Skills and Extensibility in Modern AI Coding". | Skill structuring |
| `https://www.youtube.com/watch?v=-0Irz8G0PEE` | Video Reference | Partial (Metadata) | "Autonomous ML & Vibe-Coding Case Studies". | Autonomous training patterns |

---

## Conflict Resolution Hierarchy
1. **Current Official Antigravity Documentation**: Highest authority. Defines real slash commands (`/skills`, `/tasks`, `/permissions`) and rejects hypothetical commands like `/goal`.
2. **Current Google Gemini Documentation**: Governs function calling, agent safety, and structured evaluation.
3. **Official Kaggle/Google Course Material**: Governs agent skills design, progressive disclosure, and evaluation harnesses.
4. **Maintained Technical Repository**: Provides implementation references for scripts and configs.
5. **Community/YouTube Material**: Conceptual background only. Never overrides official syntax or runtime behaviors.
