# AI Systems Assignment

## Project Overview

This project implements AI-powered modules as part of the AI Systems Assignment. It provides a comprehensive dashboard to manage catalog categorization and B2B proposal generation.

### Objectives

- Automate catalog management (Module 1).
- Streamline B2B proposal generation (Module 2).
- Provide environmental impact insights (Module 3 - Architecture only).
- Enhance customer support via WhatsApp (Module 4 - Architecture only).

---

## Architecture Overview

The system follows a **Modular Clean Architecture** with a clear separation between AI logic and business logic.

### Core Components

- **`AIService`**: A generic wrapper around Google's Gemini-1.5-Flash model, handling structured JSON output generation, logging (to SQLite), and error handling.
- **`Database (SQLite)`**: A persistent storage layer for product analysis, B2B proposals, and AI transaction logs.
- **`Logger`**: A centralized Winston-based logging service for tracking system events.

### Modules Implemented

#### 1. AI Auto-Category & Tag Generator

- **Goal**: Reduce manual effort in product cataloging.
- **Implementation**: Analyzes product name, description, and materials to assign a primary category from a predefined list, suggest sub-categories, generate 5-10 SEO tags, and identify sustainability filters (e.g., plastic-free, vegan).
- **Storage**: Automatically stores the generated analysis in the `products` database table.
- **Location**: `src/modules/category-tag-generator/`

#### 2. AI B2B Proposal Generator

- **Goal**: Automate the creation of sustainable product proposals for corporate clients.
- **Implementation**: Takes a company name, budget, and sustainability goals to suggest a product mix, calculate a detailed budget breakdown (products, logistics, contingency), and provide an "Impact Positioning Summary."
- **Storage**: Automatically stores the generated proposal in the `proposals` database table.
- **Location**: `src/modules/b2b-proposal-generator/`

---

## AI Prompt Design Explanation

Our prompts are designed for **Structured Output Generation** using LLMs. Key design principles:

1. **Role-Based Persona**: Every prompt begins by assigning a specific persona (e.g., "Expert B2B Sustainable Commerce Consultant") to ground the AI's reasoning.
2. **Contextual Constraints**: We provide explicit constraints, such as predefined categories for Module 1 or budget limits for Module 2, to ensure the AI operates within business boundaries.
3. **Structured JSON Output**: Instead of free-form text, we enforce a JSON schema in the prompt and use the AI SDK's `responseMimeType: 'application/json'` to guarantee machine-readable outputs.
4. **Prompt & Response Logging**: Every AI interaction (prompt + JSON response) is logged in the `ai_logs` database table for auditability and future fine-tuning.

---

## Remaining Modules: Architecture Blueprints

### Module 3: AI Impact Reporting Generator

- **Architecture**: A hybrid system where deterministic business logic calculates raw metrics (plastic saved, carbon avoided, local sourcing impact) based on product data, and AI is used to craft a compelling, human-readable narrative.
- **Storage**: Reports are stored in the `OrderImpact` table, linked to the specific Order ID.
- **See**: `src/modules/impact-reporting/architecture.md` for details.

### Module 4: AI WhatsApp Support Bot

- **Architecture**: An event-driven system using webhooks to receive user messages. It uses AI for **Intent Discovery** (e.g., "Where is my order?"), **Information Synthesis** (combining real database order data with natural language responses), and **Escalation Logic** for refund or high-priority issues.
- **Logging**: All WhatsApp conversations are logged in the `ChatHistory` table.
- **See**: `src/modules/whatsapp-bot/architecture.md` for details.

---

## Setup & Running the Demo

### Prerequisites

- Node.js (v18+)
- NPM
- A Google Gemini API Key (Optional for running the code, but required for actual AI generation).

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root:
   ```env
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

### Running the Demo

The demo showcases both implemented modules with sample data.

```bash
npx ts-node src/index.ts
```

---

## Evaluation Criteria Alignment

- **Structured AI Outputs**: All modules return validated JSON objects.
- **Business Logic Grounding**: AI outputs are constrained by predefined lists and budget limits.
- **Clean Architecture**: Decoupled AI service, centralized logging, and modular structure.
- **Practical Usefulness**: Directly addresses manual bottlenecks in B2B/B2C commerce.
- **Creativity & Reasoning**: Uses advanced prompt engineering to synthesize complex proposals and impact filters.
