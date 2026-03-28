# Research Context: Dynamic Digital Scheduling for Optimal Outfitting of Naval Ships

**PhD Candidate:** Tom Peter
**Supervisor:** Dr Ian Whitfield (University of Strathclyde)
**Industry Partner:** Dr Nabile Hifi (Shipyard)
**Last Updated:** March 2026

---

## Research Focus

**Title:** Dynamic Digital Scheduling for Optimal Outfitting of Naval Ships

### Preliminary Research Question
How do existing scheduling optimisation methodologies in a complex manufacturing environment address spatial constraints, resource uncertainty, and safety requirements, and what gap exists for their application to ship outfitting operations?

### Subsidiary Questions
1. **What** spatial optimisation methods exist for constraint manufacturing?
2. **How** does current scheduling handle resource uncertainty?
3. **What** safety-integrated scheduling exists?
4. **How** are digital twin and dynamic scheduling tools implemented?

---

## Critical Domain Understanding: Two Distinct Outfitting Phases

### Block Outfitting Domain (Pre-Launch)
- **Environment:** Shipyard environment, open spaces
- **Activities:** Block assembly and pre-outfitting
- **Spatial Context:** Yard-level spatial constraints, assembly sites
- **Equipment:** Platform vehicles, goliath cranes, moulding beds
- **Challenges:**
  - Inter-block coordination and assembly sequence
  - Yard-level spatial constraints and equipment position
  - Material handling bottleneck in high volume operation
  - Parallel work streams optimisation

### Post-Launch Outfitting Domain (After Launch)
- **Environment:** Confined spaces within launched vessel
- **Activities:** Equipment installation, multi-trade work coordination
- **Spatial Context:** Compartmentation constraints, narrow passages
- **Equipment:** Thousands of equipment items in confined space
- **Challenges:**
  - Limited access routes and narrow hatches
  - Multiple trade coordination through access points
  - Rework from design changes and resource scheduling
  - Safety-integrated task sequencing in confined spaces

### **CRITICAL INSIGHT: These are FUNDAMENTALLY DIFFERENT operational problems**
- Block outfitting = moving large blocks with vehicles across yard spaces
- Post-launch outfitting = coordinating workers/equipment through confined vessel compartments
- Methods designed for one domain cannot be directly transferred to the other

---

## Literature Distribution Analysis

**Total Papers Analyzed:** 210 (125 Journal, 85 Conference)

### **Distribution by Outfitting Phase:**
- **Block Outfitting (Pre-Launch):** 80% (~168 papers)
- **Post-Launch Outfitting:** 20% (~42 papers)

### **MAJOR GAP IDENTIFIED:**
The overwhelming focus on block outfitting reveals a significant research gap in post-launch outfitting scheduling methodologies.

---

## Preliminary Research Directions

### **Option 1: Pure Post-Launch Focus** ⭐ (Preferred)
**Focus:** Compartment scheduling for confined spaces
- Addresses the 80/20 imbalance
- Novel contribution to under-researched area
- Directly applicable to naval shipbuilding completion phase
- Unique constraints: narrow hatches, compartmentation, multi-trade coordination

### Option 2: Integrated Approach
**Focus:** Block to vessel transition
- Bridges pre-launch and post-launch phases
- More complex scope
- May dilute focus on the primary gap

---

## Cross-Theme Synthesis: Preliminary Gaps

### 1. **Theoretical Gap**
- **Integrated framework absence:** No unified framework addressing spatial constraints, resource uncertainty, and safety requirements together

### 2. **Methodological Gap**
- **Implementation disconnect:** Identified methods fail to translate safety and uncertainty constraints into their corresponding algorithm implementation
- **Block vs post-launch distinction ignored:** Most papers claim general "outfitting" applicability without acknowledging fundamental operational differences

### 3. **Practical Gap**
- **Lack of comprehensive validation:** Missing full-scale shipyard environment validation
- **Post-launch scheduling underserved:** Very limited literature on compartment-level scheduling in confined spaces

---

## Theme Classification (5 Themes Identified)

### Theme 1: Spatial Optimisation and Outfitting Constraints (Section 2.2)
- **Verified Papers:** 40 (from Table_2.1_Final_Unified.xlsx)
- **Outfitting Phase Breakdown:** 37 Pre-launch | 2 Post-launch | 1 N/A (facility layout)
- **Post-launch papers:** Jung, Jo, Lee (2008) - Quayside; Rose, Coenen (2015) - On-board outfitting
- **NOT IN COLLECTION (excluded from table):** Lee, Lee, Choi (1996); Caprace et al. (2013)
- **Solution Approach Distribution:** Hybrid (16), Metaheuristic (7), Exact (6), Heuristic (5), DSS (3), ML/AI (3)

#### Section 2.2 Subsection Structure (Thematic, following Whitfield 2003 / Li, Zhang, Bai 2025 style):
- **2.2.1 Introduction** - Spatiotemporal coupling, scale of modern modular construction, scope statement, justification for reviewing pre-launch literature (integrated into paragraph 4)
- **2.2.2 Spatial Representation and Problem Formulation** - How researchers model the spatial dimension: configuration space (polygon), rectangular bin packing, 3D bin packing (x-y-time), buffer/abstract capacity, grid/cellular automata, graph-based models. Evolution from 2D to 3D to emergent paradigms
- **2.2.3 Computational Tractability and Solution Scalability** - The central tension: MILP fails at 20 blocks, CP extends to 50, heuristics handle 1,000+, ML/AI adapts online. Methodological progression driven by scale requirements
- **2.2.4 Industrial Deployment and Practical Requirements** - Deployed systems (HYPOS at Hyundai, DSME interactive), simulation-based approaches at real shipyards, tension between academic optimality and industrial usability, storage yard management
- **2.2.5 Outfitting Phase Coverage and the Post-Launch Gap** - Critical analysis: 37/40 pre-launch, qualitative differences in post-launch constraints (access, compartment geometry, heterogeneous equipment), significance of the gap, justification for reviewing pre-launch literature reinforced
- **2.2.6 Synthesis** - Coherent progression from exact to learning-based, consistent assumption of bounded open surface, transferability question, research gap motivation
- **NOTE:** Dynamic scheduling content (formerly 2.2.5) was removed as it repeated papers already covered in 2.2.2-2.2.4 without adding a distinct analytical lens. Dynamic/stochastic aspects are noted where relevant within 2.2.3 (ML/AI methods) and 2.2.6 (synthesis)
- **Table 2.1** - 40 verified papers, 12 columns including Solution Approach AND Specific Method

- **Key Finding:** MILP and rule-based models address spatial layout and sequencing WITHOUT spatial-temporal adaptation in outfitting
- **Key Limitation:** Static optimization, yard-level focus, not process-aware schedulers
- **Critical Gap:** 37 of 40 papers address pre-launch stages only; post-launch compartment scheduling virtually unexplored

### Theme 2: Dynamic Resource Scheduling and Uncertainty
- **Finding:** DES and CONWIP models simulate flexible production but LACK spatial reasoning or adaptive outfitting
- **Limitation:** Fixed sequential processes, no real-time replanning

### Theme 3: Safety Integrated Dynamic Scheduling
- **Finding:** Safety and quality methods use probabilistic and laser-based tools but LACK integration with dynamic scheduling
- **Limitation:** Risk assessment without rescheduling capability

### Theme 4: Multi-stage Assembly and Outfitting Optimisation
- **Finding:** 3D CAD-linked AI and rule-based systems optimise assembly planning but LACK feedback integration from outfitting execution
- **Limitation:** Static planning, no real-time monitoring, isolated block planning

### Theme 5: Digital Scheduling and Dynamic Optimisation
- **Finding:** Digital platforms synchronise enterprise data but DON'T directly drive real-time outfitting rescheduling
- **Limitation:** Implementation complexity, legacy integration challenges, design-reality gap

---

## Paper Analysis Guidelines

### When Analyzing Papers, ALWAYS Identify:

1. **Outfitting Stage Classification:**
   - Block outfitting (pre-launch) ✓
   - Post-launch outfitting ✓
   - Both phases ✓
   - Not clearly specified ⚠️

2. **Stage-Specific Limitations:**
   - Does the paper acknowledge block vs post-launch distinction?
   - Do claimed applications overstate transferability?
   - Are yard-level methods incorrectly generalized to post-launch contexts?

3. **Key Evidence Markers for Post-Launch:**
   - Keywords: "compartment", "confined space", "hatch", "access route", "multi-trade coordination", "on-board", "launched vessel", "fitting-out basin"
   - Context: Work AFTER launch, inside vessel spaces
   - Challenges: Access constraints, narrow passages, compartmentation

4. **Key Evidence Markers for Block Outfitting:**
   - Keywords: "block assembly", "yard", "assembly site", "platform vehicle", "goliath crane", "pre-outfitting", "on-unit", "on-block"
   - Context: Work BEFORE launch, in shipyard spaces
   - Challenges: Material handling, yard spatial layout, block movement

---

## Critical Limitation to Flag in Block Outfitting Papers

**Standard Limitation Template:**
> **Block outfitting focus limits post-launch applicability:** Methods address yard-level spatial constraints (large blocks, platform vehicles, assembly sites) which are fundamentally different from post-launch compartmentation constraints (confined spaces, narrow hatches, multi-trade coordination through access points). Transferability to post-launch outfitting requires significant methodological adaptation not addressed in this work.

---

## PETRA Framework (3-Tier Selection)

**Total Initial Papers:** 63,537
**After Tier 1 (Python Initial Filtering):** 44,389
**After Tier 2 (Python Advanced Relevance):** 15,334
**After Tier 3 (Python AHP Selection):** 210 final papers

### Tier 3 AHP Criteria Weights:
1. C1: Core Research Themes (19.6%)
2. C3: Methodology (11.1%)
3. C11: Uncertainty and Risk Management (11.1%)
4. C9: Outfitting Process Characteristics (10.4%)
5. C5: Research Focused Indicators (9.8%)
6. C2: Domain-Specific Terms (9.3%)
7. C10: Production Stage Classifications (7.7%)
8. C7: Constraints Categories (6.8%)
9. C4: Technical System Referenced (6.4%)
10. C8: Planning System Components (5.2%)
11. C6: Publication Quality (2.6%)

---

## Papers Currently Analyzed (Updated as work progresses)

### Completed Summaries:
1. Paper 6 - Hybrid simulation-based optimization (Basán et al. 2017) - **Block Outfitting**
2. Paper 7 - [Title TBD] - **Block Outfitting**
3. Paper 10 - [Title TBD] - **Block Outfitting**
4. Paper 13 - Improved spatial scheduling algorithm (Koh et al. 2008) - **Block Outfitting**
5. Paper 17 - Scheduling for assembly sites (Sikorra et al. 2015) - **Block Outfitting**
6. Paper 18 - Generating heuristic rule for quay assignment (Jung et al. 2008) - **Post-Launch Outfitting (Quayside)**
7. Paper 12 - Spatial scheduling based on rules (Hu et al. 2018) - **Block Outfitting**
8. Paper 23 - Multi-objective spatial scheduling (Zheng et al. 2008) - **Block Outfitting**
9. Paper 32 - Improved spatial scheduling for sub-assembly (Wang et al. 2023) - **Block Outfitting**

**Pattern:** 8/9 papers are Block Outfitting, 1/9 is Post-Launch (Jung et al. 2008 - Quayside)

### Post-Launch Papers Identified:
- Paper 18 - Jung, Jo, Lee (2008) - Quayside assignment - **Post-Launch**
- Paper 73 - Rose, Coenen (2015) - On-board outfitting, compartment graph - **Post-Launch**

---

## Key Takeaways for Future Analysis

1. ✅ **Always distinguish** block vs post-launch outfitting
2. ✅ **Be critical** of papers claiming general applicability
3. ✅ **Highlight** any rare post-launch focused papers
4. ✅ **Document limitations** regarding stage transferability
5. ✅ **Build evidence** for Option 1 (Pure Post-Launch Focus) viability

---

**This context should inform ALL future literature analysis and paper summaries.**
