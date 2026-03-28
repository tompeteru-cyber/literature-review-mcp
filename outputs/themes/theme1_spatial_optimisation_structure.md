# Theme 1: Spatial Optimisation & Outfitting Constraints
## Section 2.2 Structure

**Status:** Integration complete — v2 draft written
**Total Papers:** 40
**All 40 Integrated (v2):** Yes
**Word Count:** ~6,800 words
**Current Draft:** Section_2.2_Integrated_v2.md (Week 3, November 2025)
**Previous Draft:** Section_2.2_Supervisor_Ready_v1.md (13 papers, ~1,800 words)
**Draft Location:** C:\Users\Tompe\OneDrive - University of Strathclyde (1)\PhD Files\ALL DRAFT\2025\11 - Novemebr\Week 3\
**Narrative Findings Location:** C:\Users\Tompe\OneDrive - University of Strathclyde (1)\PhD Files\ALL DRAFT\2025\12 - December\Week 2 - 3\

---

## Section Structure

### 2.2.1 Introduction *(existing)*
- Establishes spatial scheduling as a distinctive problem class
- Introduces block geometry, workspace bottlenecks, and quay-side constraints
- Sets scope for the section

### 2.2.2 Mixed Integer Linear Programming Approaches *(existing — expanded)*
- **Narrative arc:** Mathematical rigour and optimality guarantees vs. severe scalability limits
- **Existing papers:**
  - Sikorra et al. (2015) — Paper 17 — MILP with machine scheduling, >20 blocks exceeds 24hrs
  - Basan et al. (2017) — Paper 6 — Hybrid MILP+DES, scalability degradation (0.02 to 75.44 days)
  - Han et al. (2024) — Paper 52 — FJSP-SSF with DAGs, only 4 jobs validated
- **New papers to integrate:**
  - Paper 39: Basan et al. (2017) — DES for multi-stage block assembly with sequencing heuristics
  - Paper 82: Wang, Hu & Zhang (2024) — Multi-DAG queueing model with GA for stochastic hull parts
  - Paper 86: Liu et al. (2012) — Hybrid DES with spatial optimisation for stochastic block arrivals
  - Paper 140: Li, Duan & Zhang (2021) — Integrated scheduling and layout for marine crankshaft production

### 2.2.3 Constraint Programming and Exact Decomposition Methods *(NEW)*
- **Narrative arc:** Direct response to MILP scalability limits — CP and B&B achieve industrial-scale tractability where MILP cannot
- **Papers:**
  - Paper 97: Pernas-Alvarez et al. (2025) — CP-based decomposition for FJSP, solves instances MILP cannot
  - Paper 114: Pernas-Alvarez & Crespo-Pereira (2023) — CP model, makespan 50 days shorter than MILP
  - Paper 137: Hu et al. (2015) — Branch & Bound for spatial RCPSP, 12-42% improvement over manual
  - Paper 185: Garcia & Rabadi (2013) — Exact and approximate methods for multi-area spatial scheduling

### 2.2.4 Heuristic and Rule-Based Approaches *(existing — expanded)*
- **Narrative arc:** Practical tractability at production scale, but greedy/myopic limitations
- **Existing papers:**
  - Koh et al. (2008) — Paper 13 — Configuration space, LCA policy, 69% utilisation
  - Zheng et al. (2008) — Paper 23 — BASS multi-objective, due date 63%->81%
  - Wang et al. (2023) — Paper 32 — Multi-rule GA selection, 58% winning rate
  - Hong et al. (2023) — Workforce + DP + knapsack, 85% utilisation
  - Wang et al. (2024) — Multi-DAG + queueing theory
  - Du et al. (2019) — Simulation-based fuzzy, Bottom-Left placement
  - Hu et al. (2018) — Paper 12 — Rule-based + Dijkstra, 20% reduction in movements
  - Tao et al. (2012) — Storage yard heuristic, 95% utilisation
- **New papers to integrate:**
  - Paper 88: Zheng et al. (2011) — Seven-strategy greedy, 6.4x on-time delivery improvement
  - Paper 121: Kwon & Lee (2015) — Two-stage diagonal-fill, 400 blocks in 73 seconds
  - Paper 174: Zhang & Chen (2012) — Two-stage spatial scheduling approach
  - Paper 133: Tao, Jiang & Zhen (2014) — Workforce assignment integrated with spatial scheduling
  - Paper 170: Tao, Jiang & Qu (2013) — Block location and sequencing for planar storage
  - Paper 180: Jiang et al. (2024) — Knowledge-based curved block construction scheduling

### 2.2.5 Meta-heuristic and Computational Spatial Optimisation *(NEW)*
- **Narrative arc:** Beyond greedy — searching the spatial solution space for higher-quality arrangements
- **Papers:**
  - Paper 90: Koh et al. (2011) — GA for shape-changing mega-blocks at floating-dock
  - Paper 130: Ahn & Kim (2022) — Spatial scheduling of mega-blocks
  - Paper 141: Zheng (2013) — Simulated annealing for platform layout
  - Paper 115: Zheng, Zhao & Zhao (2025) — MOGA-TS, 70% non-dominated solutions
  - Paper 93: Hu et al. (2019) — Guided Local Search for 2D-RCPSP
  - Paper 100: Li et al. (2025) — Surrogate-assisted cooperative evolution GP, ~38% improvement
  - Paper 91: Zhong et al. (2025) — Deep Q-Network RL for adaptive stockyard layout
  - Paper 148: Wang, Zhang & Hu (2024) — Q-Learning hyper-heuristic for sub-assembly
  - Paper 124: Chen, Lin & Yi (2023) — Cellular automata spatial modelling, 53.53% utilisation

### 2.2.6 Industrial Spatial Planning Systems *(NEW)*
- **Narrative arc:** Evidence of real-world deployment and impact — but all yard-level implementations
- **Papers:**
  - Paper 110: Park et al. (2002) — HYPOS at Hyundai, on-time 14%->75%
  - Paper 119: Ryu et al. (2008) — Interactive planning at Daewoo, 54/73 blocks in 45 mins
  - Paper 191: Finke et al. (2008) — Activity-based spatial scheduling tool
  - Paper 61: Tao et al. (2013) — MIP-based 2D bin packing for yard storage
  - Paper 189: Park & Seo (2009) — Block storage location assignment
  - Paper 206: Choi, Kim & Chung (2017) — Optimal shipyard facility layout

### 2.2.7 Critical Analysis: Yard-Level Scope and Compartment-Level Gaps *(existing — strengthened)*
- **Narrative arc:** 40-paper evidence base now overwhelmingly confirms yard-level focus
- Expanded with evidence from all new papers reinforcing:
  - Spatial models = 2D yard, not 3D ship interiors
  - Deterministic processing times assumed throughout
  - No multi-trade coordination in confined spaces
  - Only Rose & Coenen (2015) and Jung et al. (2008) approach post-launch

### 2.2.8 Synthesis *(existing — strengthened)*
- Methodological sophistication has increased (MILP -> CP -> meta-heuristics -> learning-based)
- Industrial systems show real impact at yard level
- Yet the fundamental gap persists: post-launch compartment-level outfitting remains unaddressed
- Links forward to Section 2.7

---

## Paper-to-Subsection Assignment Summary

| Subsection | Paper Numbers | Count |
|---|---|---|
| 2.2.2 MILP Approaches | 6, 17, 39, 52, 82, 86, 140 | 7 |
| 2.2.3 CP and Exact Decomposition (NEW) | 97, 114, 137, 185 | 4 |
| 2.2.4 Heuristic and Rule-Based | 7, 10, 12, 13, 23, 32 + 88, 121, 133, 170, 174, 180 | 12 |
| 2.2.5 Meta-heuristic and Computational (NEW) | 90, 91, 93, 100, 115, 124, 130, 141, 148 | 9 |
| 2.2.6 Industrial Systems (NEW) | 61, 110, 119, 189, 191, 206 | 6 |
| 2.2.7 Critical Analysis | Cross-references all 40 papers | — |
| 2.2.8 Synthesis | Cross-references all 40 papers | — |
| **Post-launch exceptions (referenced in 2.2.7)** | Jung 2008 (Paper 18), Rose & Coenen 2015 (Paper 73) | 2 |
| **Total** | | **40** |

---

## Overall Narrative Arc

1. **2.2.2** — Exact methods capture the mathematical structure but cannot scale
2. **2.2.3** — CP/B&B respond to MILP limits with industrial-scale tractability
3. **2.2.4** — Heuristics sacrifice optimality for practical speed at production scale
4. **2.2.5** — Meta-heuristics and learning methods search for better spatial solutions
5. **2.2.6** — Industrial systems demonstrate real-world deployment and measured impact
6. **2.2.7** — Despite all this sophistication, everything is yard-level — the post-launch gap is stark
7. **2.2.8** — Synthesis linking to the broader thesis argument
