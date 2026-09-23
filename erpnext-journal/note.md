Here is the complete summary of changes required for the manuscript based on the reviewer and editor annotations present in the document:

### 1\. Title Reformulation

  * **Reviewer D.1 Annotation:** Reformulate the paper title to be more concise and compact while retaining its core scope and main research contribution.

-----

### 2\. Abstract Section

  * **Reviewer B & Editor Annotations:**
      * Quantify key contributions by including explicit quantitative metrics (e.g., DB-to-Kafka latency, transaction latency, throughput in TPS, and consensus success rates).
      * Remove vague terms like "novel" or "customizable" unless explicitly defined.
      * End the abstract with a clear closing statement outlining the overall practical impact and contribution of the system.

-----

### 3\. Introduction & Literature Positioning

  * **Editor Comment 1 / Reviewers B, D.2, D.4 Annotation:**
      * Clarify the exact research gap addressed in the study, specifically highlighting the "Super-user Paradox" where administrative users can modify records and purge audit logs in open-source ERP systems.
      * Explicitly position this work against closely related prior systems (e.g., monolithic ERPs, custom HIS, SAP/Oracle).
      * Re-examine author and journal self-citations to ensure objective coverage and incorporate foundational literature to strengthen the theoretical background.

-----

### 4\. Methodology, Architecture & System Robustness

  * **Reviewers A & C.3 Annotation:**
      * Provide a detailed diagram showing how HR sub-modules (payroll, attendance, recruitment) integrate with the Frappe framework and the blockchain layer.
      * Add pseudocode or flowcharts detailing the event-driven Change Data Capture (CDC) pipeline and consumer execution logic.
      * Add a dedicated **Subsection 2.7 (System Robustness and Failure Recovery)** addressing:
          * Handling of Kafka consumer crashes and manual offset commits.
          * System recovery during temporary blockchain network unavailability.
          * At-least-once delivery semantics, record-ID-based idempotency, and replay safety.

-----

### 5\. Results & Comparative Performance

  * **Reviewers C.1, C.2, D.3 Annotation:**
      * Ensure all figures (Figures 1–5) and tables (Tables 1–6) are explicitly cited and explained in the text *before* they appear in the document.
      * Add a comparative baseline analysis (e.g., Table 7) benchmarking performance across three configurations:
        1.  Traditional Centralized ERP (ERPNext / MariaDB)
        2.  Monolithic On-Chain ERP (Odoo + Blockchain)
        3.  Proposed System (Frappe + CDC + Hyperledger Besu)
      * Discuss potential bottlenecks in detail, such as linear queue time accumulation during bulk operations.

-----

### 6\. Discussion, Compliance & Future Directions

  * **Reviewers C.4 & E Annotation:**
      * Expand the discussion to cover socio-technical and regulatory compliance, addressing GDPR mandates (e.g., "Right to be Forgotten" via on-chain hash anchoring vs. off-chain PII storage) and labor law auditability.
      * Discuss energy efficiency and sustainability trade-offs of IBFT 2.0 private consensus compared to public Proof-of-Work networks.
      * Outline concrete technical directions for future work, including transaction batching, Merkle-tree root aggregation, off-chain IPFS storage, and auditor verification portals.

-----

### 7\. References & Template Formatting

  * **Editor Comment 3 Annotation:**
      * Ensure all references strictly follow IEEE style, including complete volume, issue, page numbers, and DOIs.
      * Audit and remove unnecessary author and BEEI/IAES publisher self-citations.
      * Align the Acknowledgments, Funding Information, and CRediT Author Contributions sections with the standard BEEI journal template formatting.
