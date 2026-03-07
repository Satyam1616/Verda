# Module 4: AI WhatsApp Support Bot - Architecture Outline

## Objective

To provide automated, context-aware customer support for orders, returns, and FAQs via WhatsApp, integrating real business data and intelligent escalation.

## Requirements Coverage

1. **Order Status Queries**: AI retrieves real-time order data (Status, ETD, Tracking ID) from the `Orders` database using the customer's phone number or order ID.
2. **Return Policy Questions**: AI uses a Knowledge Base (or RAG) containing the official Rayeva Return & Refund Policy to answer specific questions accurately.
3. **Escalation (High-Priority/Refunds)**:
   - Automated detection of escalation triggers: Keywords (Refund, Faulty, Legal), Sentiment (High Anger), or Explicit Request ("Talk to Human").
   - Escalation creates a high-priority ticket in the `SupportQueue` table.
4. **Conversation Logging**:
   - Every message (User, AI reasoning, Final Response) is logged in the `ChatHistory` table.
   - Logs include a `SessionID` and `Timestamp` for auditability.

## Core Logic & Data Flow

1. **Webhook Handler**: Receives incoming JSON payload from WhatsApp API.
2. **Intent & Sentiment Discovery (AI Logic)**:
   - Identify: `Order Enquiry`, `Policy Question`, `Complaint`, `Escalation`.
3. **Data Retrieval (Business Logic)**:
   - For `Order Enquiry`: `DB.query("SELECT * FROM orders WHERE customer_id = ?", id)`.
4. **Contextual Response Generation (AI Logic)**:
   - Prompt: "Based on this Order Data: {data}, answer: '{user_query}'."
5. **Post-Process & Logging**: Store the interaction and send the message via the WhatsApp API.

## Key Components

- `WhatsAppGateway`: Handles incoming/outgoing messages.
- `SupportBrain`: AI service for intent classification and response crafting.
- `EscalationEngine`: Logic to flag and route high-priority issues.
- `DatabaseService`: For real-time order lookups and persistent logging.

## Prompt Design

"You are the Rayeva Support Specialist. Answer the user's question: '{query}' using the provided context: {context}.
If the user asks about a refund or is highly upset, provide a helpful initial response and state: 'I am escalating this to a senior representative for immediate attention.'"
